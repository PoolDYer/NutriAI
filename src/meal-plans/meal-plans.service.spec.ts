import { Test, TestingModule } from '@nestjs/testing';
import { MealPlansService } from './meal-plans.service';
import { IMealPlansRepository } from './interfaces_dtos';

const mockRepository: Partial<IMealPlansRepository> = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
};

describe('MealPlansService', () => {
    let service: MealPlansService;
    let repository: IMealPlansRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MealPlansService,
                {
                    provide: 'IMealPlansRepository',
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<MealPlansService>(MealPlansService);
        repository = module.get<IMealPlansRepository>('IMealPlansRepository');
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create a meal plan', async () => {
        const dto = { patientId: '123', weekStartDate: '2023-01-01', planData: {} };
        const expectedResult = { id: '1', ...dto, created_at: new Date() } as any;

        (repository.create as jest.Mock).mockResolvedValue(expectedResult);

        const result = await service.create(dto);
        expect(result).toEqual(expectedResult);
        expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
            patient_id: dto.patientId
        }));
    });

    it('should find all meal plans', async () => {
        (repository.findAll as jest.Mock).mockResolvedValue([]);
        await service.findAll();
        expect(repository.findAll).toHaveBeenCalled();
    });
});
