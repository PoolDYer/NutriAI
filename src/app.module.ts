import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { ConversationsController } from './conversations/conversations.controller';
import { MealPlansController } from './meal-plans/meal-plans.controller';
import { MealPlansService } from './meal-plans/meal-plans.service';
import { SupabaseMealPlansRepository } from './meal-plans/repositories/supabase-meal-plans.repository';
import { AiService } from './ai/ai.service';
import { SupabaseClient, createClient } from '@supabase/supabase-js';

// Define a simple provider for SupabaseClient
const SupabaseProvider = {
    provide: SupabaseClient,
    useFactory: () => {
        return createClient(
            'https://vbobpybekjauvtrllmep.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZib2JweWJla2phdXZ0cmxsbWVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTMyMDkxNywiZXhwIjoyMDgwODk2OTE3fQ.hub0JMa4bxXCwCd_1iPK2FWbn8nmkUI33Z-UzUBSD-4'
        );
    },
};

@Module({
    imports: [],
    controllers: [
        AuthController,
        ConversationsController,
        MealPlansController
    ],
    providers: [
        SupabaseProvider,
        AiService,
        MealPlansService,
        {
            provide: 'IMealPlansRepository',
            useClass: SupabaseMealPlansRepository
        }
    ],
})
export class AppModule { }
