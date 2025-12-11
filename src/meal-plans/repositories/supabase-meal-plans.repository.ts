// src/meal-plans/repositories/supabase-meal-plans.repository.ts
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IMealPlansRepository } from '../interfaces_dtos'; // keeping in one file for brevity in this env
import { IMealPlan } from '../interfaces_dtos';

@Injectable()
export class SupabaseMealPlansRepository implements IMealPlansRepository {
    private supabase: SupabaseClient;

    constructor() {
        this.supabase = createClient(
            'https://vbobpybekjauvtrllmep.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZib2JweWJla2phdXZ0cmxsbWVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTMyMDkxNywiZXhwIjoyMDgwODk2OTE3fQ.hub0JMa4bxXCwCd_1iPK2FWbn8nmkUI33Z-UzUBSD-4'
        );
    }

    async create(plan: Partial<IMealPlan>): Promise<IMealPlan> {
        const { data, error } = await this.supabase
            .from('meal_plans')
            .insert(plan)
            .select()
            .single();

        if (error) throw new InternalServerErrorException(error.message);
        return data;
    }

    async findAll(filters?: { patientId?: string; nutritionistId?: string }): Promise<IMealPlan[]> {
        let query = this.supabase.from('meal_plans').select('*');

        if (filters?.patientId) query = query.eq('patient_id', filters.patientId);
        if (filters?.nutritionistId) query = query.eq('nutritionist_id', filters.nutritionistId);

        const { data, error } = await query;
        if (error) throw new InternalServerErrorException(error.message);
        return data || [];
    }

    async findById(id: string): Promise<IMealPlan | null> {
        const { data, error } = await this.supabase
            .from('meal_plans')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw new InternalServerErrorException(error.message);
        return data;
    }

    async update(id: string, plan: Partial<IMealPlan>): Promise<IMealPlan> {
        const { data, error } = await this.supabase
            .from('meal_plans')
            .update(plan)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new InternalServerErrorException(error.message);
        return data;
    }

    async delete(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('meal_plans')
            .delete()
            .eq('id', id);

        if (error) throw new InternalServerErrorException(error.message);
    }
}
