import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { MealPlansService } from './meal-plans.service';
import { CreateMealPlanDto, UpdateMealPlanDto } from './interfaces_dtos';

@Controller('meal-plans')
export class MealPlansController {
    constructor(private readonly mealPlansService: MealPlansService) { }

    @Post()
    create(@Body() createMealPlanDto: CreateMealPlanDto) {
        return this.mealPlansService.create(createMealPlanDto);
    }

    @Get()
    findAll(@Query('patientId') patientId?: string) {
        return this.mealPlansService.findAll(patientId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.mealPlansService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateMealPlanDto: UpdateMealPlanDto) {
        return this.mealPlansService.update(id, updateMealPlanDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.mealPlansService.remove(id);
    }
}
