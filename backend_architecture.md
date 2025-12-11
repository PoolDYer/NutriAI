# Backend Architecture: SOLID Principles in NutriAI

This document outlines how the **SOLID** design principles are applied to the NutriAI backend to ensure a scalable, maintainable, and testable architecture.

## 1. Single Responsibility Principle (SRP)
**Definition:** A class should have one, and only one, reason to change.
**Application:** We separate concerns into distinct layers: Controllers (HTTP handling), Services (Business Logic), and Repositories (Data Access).

*   `AuthController`: Only handles HTTP requests, validation DTOs, and sending responses.
*   `AuthService`: Contains the logic for registering, logging in, and verifying users.
*   `UserRepository`: Only interacts with the Supabase `users` table.

## 2. Open/Closed Principle (OCP)
**Definition:** Software entities should be open for extension, but closed for modification.
**Application:** We use interfaces for our services and repositories. If we want to add a new authentication method (e.g., OAuth) or a new database provider, we implement the interface without modifying the existing consumer code.

```typescript
// Interface for notification
interface INotificationService {
  send(to: string, message: string): Promise<void>;
}

// Implementations
class EmailService implements INotificationService { ... }
class SMSService implements INotificationService { ... }

// Usage in AuthService (Closed for modification, open for extension via DI)
class AuthService {
  constructor(private notifier: INotificationService) {}
}
```

## 3. Liskov Substitution Principle (LSP)
**Definition:** Objects of a superclass shall be replaceable with objects of its subclasses without breaking the application.
**Application:** Our Repository interfaces ensure that any implementation (e.g., `SupabaseMealPlanRepository` or `MockMealPlanRepository`) behaves consistently.

```typescript
interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<T>;
}

// Both Real and Mock repositories MUST return null if not found, 
// and NEVER throw an exception for a "not found" case if the contract says so.
```

## 4. Interface Segregation Principle (ISP)
**Definition:** Clients should not be forced to depend upon interfaces that they do not use.
**Application:** Instead of a massive `IUserService` that handles auth, profile management, and billing, we split them.

```typescript
// Bad
interface IBigUserService {
  login(): void;
  updateProfile(): void;
  processPayment(): void;
}

// Good
interface IAuthOps { login(): void; }
interface IProfileOps { updateProfile(): void; }
```

## 5. Dependency Inversion Principle (DIP)
**Definition:** High-level modules should not depend on low-level modules. Both should depend on abstractions.
**Application:** Our Controllers (High Level) do not import `SupabaseRepository` (Low Level) directly. They import `IMealPlanRepository`. This allows us to inject any storage mechanism (Supabase, Postgres, InMemory) during testing.

### Dependency Graph
`Controller` -> `IService` <- `ServiceImplementation` -> `IRepository` <- `RepositoryImplementation`

## Architecture Diagram (Text)

[Client Request] 
      ⬇
[MealPlansController] --(depends on)--> [IMealPlanService]
                                              ⬆
                                      [MealPlanService] --(depends on)--> [IMealPlanRepository]
                                                                                ⬆
                                                                        [SupabaseMealPlanRepository]
                                                                                ⬇
                                                                        [Supabase Client / Database]

## Unit Testing Example (Jest)

```typescript
// meal-plans.service.spec.ts
import { MealPlansService } from './meal-plans.service';
import { IMealPlanRepository } from './interfaces/meal-plan.repository';

// Mock Repository
const mockRepo: jest.Mocked<IMealPlanRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  // ... other methods
};

describe('MealPlansService', () => {
  let service: MealPlansService;

  beforeEach(() => {
    service = new MealPlansService(mockRepo);
  });

  it('should create a meal plan', async () => {
    const plan = { userId: '123', items: [] };
    mockRepo.create.mockResolvedValue({ id: 'abc', ...plan });

    const result = await service.createMealPlan(plan);
    
    expect(mockRepo.create).toHaveBeenCalledWith(plan);
    expect(result.id).toBe('abc');
  });
});
```
