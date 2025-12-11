export interface IMealPlan {
    id: string;
    patient_id: string;
    nutritionist_id?: string;
    week_start_date: string;
    plan_data: any; // JSONB
    created_at?: Date;
    updated_at?: Date;
}

export interface IMealPlansRepository {
    create(plan: Partial<IMealPlan>): Promise<IMealPlan>;
    findAll(filters?: { patientId?: string; nutritionistId?: string }): Promise<IMealPlan[]>;
    findById(id: string): Promise<IMealPlan | null>;
    update(id: string, plan: Partial<IMealPlan>): Promise<IMealPlan>;
    delete(id: string): Promise<void>;
}

export class CreateMealPlanDto {
    patientId: string;
    weekStartDate: string;
    planData: Record<string, any>;
}

export class UpdateMealPlanDto {
    weekStartDate?: string;
    planData?: Record<string, any>;
}
