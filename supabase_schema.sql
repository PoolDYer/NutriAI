-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ROLES ENUM (Optional, but using CHECK constraint as requested)
-- Valid roles: 'admin', 'nutritionist', 'patient'

-- 1. USERS TABLE
-- Extending Supabase auth.users or acting as the main public user table
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'nutritionist', 'patient')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PROFILES TABLE
-- Stores detailed user information
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    age INT,
    sex TEXT,
    weight_kg NUMERIC(5,2),
    height_cm NUMERIC(5,2),
    activity_level TEXT,
    allergies TEXT[], -- Array of strings
    medical_conditions TEXT[],
    goals TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ASSIGNMENTS TABLE (Implied for Nutritionist-Patient relationship)
CREATE TABLE public.assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nutritionist_id UUID NOT NULL REFERENCES public.users(id),
    patient_id UUID NOT NULL REFERENCES public.profiles(id), -- Linking to profile/user
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    active BOOLEAN DEFAULT TRUE,
    CONSTRAINT unique_active_assignment UNIQUE (nutritionist_id, patient_id) -- Prevent duplicate active assignments
);

-- 4. CONVERSATIONS TABLE
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.users(id),
    nutritionist_id UUID REFERENCES public.users(id), -- Optional if handled by AI initially
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'active'
);

-- 5. MESSAGES TABLE
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.users(id),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb, -- Using JSONB for better performance/indexing in Postgres
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. MEAL PLANS TABLE
CREATE TABLE public.meal_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.users(id),
    nutritionist_id UUID REFERENCES public.users(id), -- Author
    week_start_date DATE NOT NULL,
    plan_data JSONB NOT NULL, -- Structured meal plan
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. ASSESSMENTS TABLE
CREATE TABLE public.assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.users(id),
    date_recorded TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    weight_current NUMERIC(5,2),
    waist_circumference NUMERIC(5,2),
    notes TEXT,
    metrics JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. AUDIT LOGS
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    changes JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at);
CREATE INDEX idx_conversations_patient_id ON public.conversations(patient_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_meal_plans_patient_id ON public.meal_plans(patient_id);
CREATE INDEX idx_assessments_patient_id ON public.assessments(patient_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_assignments_nutritionist_id ON public.assignments(nutritionist_id);
CREATE INDEX idx_assignments_patient_id ON public.assignments(patient_id);

-- ROW LEVEL SECURITY (RLS)
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- HELPER FUNCTIONS FOR AUTH
-- Check if current user is admin
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user is nutritionist
CREATE OR REPLACE FUNCTION is_nutritionist() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'nutritionist'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is assigned to nutritionist
CREATE OR REPLACE FUNCTION is_assigned_to_me(target_patient_id UUID) 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.assignments 
    WHERE nutritionist_id = auth.uid() 
    AND patient_id = target_patient_id 
    AND active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- POLICIES

-- 1. USERS Policies
-- Admin can view all
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (is_admin());

-- Users can view their own record
CREATE POLICY "Users can view own record" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- 2. PROFILES Policies
-- Admin view all
CREATE POLICY "Admins view all profiles" ON public.profiles
    FOR ALL USING (is_admin());

-- Patient view/edit own
CREATE POLICY "Patients view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Patients update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Nutritionist view assigned profiles
CREATE POLICY "Nutritionists view assigned profiles" ON public.profiles
    FOR SELECT USING (is_nutritionist() AND is_assigned_to_me(id));

-- 3. CONVERSATIONS Policies
-- Patient view own
CREATE POLICY "Patients view own conversations" ON public.conversations
    FOR SELECT USING (auth.uid() = patient_id);

-- Nutritionist view assigned
CREATE POLICY "Nutritionists view assigned conversations" ON public.conversations
    FOR SELECT USING (is_nutritionist() AND is_assigned_to_me(patient_id));

-- 4. MESSAGES Policies
-- Patient view own conversation messages
CREATE POLICY "Patients view messages in own conversations" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE id = conversation_id AND patient_id = auth.uid()
        )
    );

-- Patient send messages to own conversations
CREATE POLICY "Patients insert messages in own conversations" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE id = conversation_id AND patient_id = auth.uid()
        )
    );

-- Nutritionist view messages (assigned)
CREATE POLICY "Nutritionists view assigned messages" ON public.messages
    FOR SELECT USING (
        is_nutritionist() AND 
        EXISTS (
            SELECT 1 FROM public.conversations c
            JOIN public.assignments a ON c.patient_id = a.patient_id
            WHERE c.id = messages.conversation_id AND a.nutritionist_id = auth.uid()
        )
    );

-- 5. MEAL PLANS Policies
-- Patient read own
CREATE POLICY "Patients view own meal plans" ON public.meal_plans
    FOR SELECT USING (patient_id = auth.uid());

-- Nutritionist read/write assigned
CREATE POLICY "Nutritionists manage assigned meal plans" ON public.meal_plans
    FOR ALL USING (is_nutritionist() AND is_assigned_to_me(patient_id));

-- 6. ASSESSMENTS Policies
-- Same as meal plans
CREATE POLICY "Patients view own assessments" ON public.assessments
    FOR SELECT USING (patient_id = auth.uid());
CREATE POLICY "Nutritionists manage assigned assessments" ON public.assessments
    FOR ALL USING (is_nutritionist() AND is_assigned_to_me(patient_id));

-- 7. AUDIT LOGS Policies
-- Admins read all
CREATE POLICY "Admins view audit logs" ON public.audit_logs
    FOR SELECT USING (is_admin());
-- Users view own logs (optional, usually internal)
CREATE POLICY "Users view own audit logs" ON public.audit_logs
    FOR SELECT USING (user_id = auth.uid());
