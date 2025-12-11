import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IMealPlansRepository, IMealPlan, CreateMealPlanDto, UpdateMealPlanDto } from './interfaces_dtos';

@Injectable()
export class MealPlansService {
    constructor(
        @Inject('IMealPlansRepository') private repository: IMealPlansRepository
    ) { }

    async create(dto: CreateMealPlanDto): Promise<IMealPlan> {
        return this.repository.create({
            patient_id: dto.patientId,
            week_start_date: dto.weekStartDate,
            plan_data: dto.planData
        });
    }

    async findAll(patientId?: string): Promise<IMealPlan[]> {
        return this.repository.findAll({ patientId });
    }

    async findOne(id: string): Promise<IMealPlan> {
        const plan = await this.repository.findById(id);
        if (!plan) throw new NotFoundException(`Meal plan with ID ${id} not found`);
        return plan;
    }

    async update(id: string, dto: UpdateMealPlanDto): Promise<IMealPlan> {
        // Verify existence
        await this.findOne(id);

        return this.repository.update(id, {
            week_start_date: dto.weekStartDate,
            plan_data: dto.planData,
            updated_at: new Date()
        } as any);
    }

    async remove(id: string): Promise<void> {
        await this.findOne(id);
        return this.repository.delete(id);
    }
}
