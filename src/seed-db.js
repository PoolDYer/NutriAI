const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vbobpybekjauvtrllmep.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZib2JweWJla2phdXZ0cmxsbWVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTMyMDkxNywiZXhwIjoyMDgwODk2OTE3fQ.hub0JMa4bxXCwCd_1iPK2FWbn8nmkUI33Z-UzUBSD-4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    try {
        console.log('🌱 Seeding database...');

        const testUser = {
            id: '99999999-9999-9999-9999-999999999999',
            email: 'demo-user@example.com',
            role: 'patient',
            created_at: new Date().toISOString()
        };

        const { error: userError } = await supabase.from('users').upsert(testUser);
        if (userError) throw userError;
        console.log('✅ User seeded:', testUser.email);

        const { data: conv, error: convError } = await supabase
            .from('conversations')
            .upsert({
                patient_id: testUser.id,
                status: 'active',
                started_at: new Date().toISOString()
            })
            .select()
            .single();

        if (convError) throw convError;
        console.log('✅ Conversation seeded:', conv.id);

    } catch (err) {
        console.error('❌ Seed failed:', err);
    }
}

seed();
