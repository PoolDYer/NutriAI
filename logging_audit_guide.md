# Logging & Audit Guide for NutriAI

## 1. Application Logging (Winston/Pino)

We recommend **Winston** for its flexibility with transports (Console, File, External Services).

### Setup
`npm install winston nest-winston`

### Configuration
Create a `logger.config.ts`:
```typescript
import { transports, format } from 'winston';

export const loggerOptions = {
  transports: [
    new transports.Console({
      format: format.combine(
        format.timestamp(),
        format.colorize(),
        format.printf(({ timestamp, level, message, context }) => {
          return `${timestamp} [${context}] ${level}: ${message}`;
        }),
      ),
    }),
    // Add File transport for production errors
    new transports.File({ filename: 'error.log', level: 'error' }),
  ],
};
```

### Usage in Services
```typescript
private readonly logger = new Logger(MyService.name);
// ...
this.logger.log('Action performed successfully');
this.logger.error('Something failed', error.stack);
```

### Alerting on 5xx Errors
Use an interceptor to catch 500 errors and count them. If count > threshold in timeframe, trigger alert (email/slack).
```typescript
@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Check if 500... log to monitoring service (Sentry/Datadog)
    super.catch(exception, host);
  }
}
```

## 2. Audit Logs (Database)

We use the `audit_logs` table created in our SQL schema.

### When to Log
*   Creation/Deletion of critical resources (Conversations, Meal Plans).
*   Role changes.
*   Security events (Login failures - optional).

### Implementation
Create a shared `AuditService`:

```typescript
@Injectable()
export class AuditService {
  constructor(private supabase: SupabaseClient) {}

  async log(userId: string, action: string, tableName: string, recordId: string, changes?: any) {
    // Fire and forget (don't await to avoid blocking response)
    this.supabase.from('audit_logs').insert({
      user_id: userId,
      action,
      table_name: tableName,
      record_id: recordId,
      changes
    }).then(({ error }) => {
      if (error) console.error('Failed to write audit log', error);
    });
  }
}
```

### Example Usage
In `MealPlansService.create`:
```typescript
const plan = await this.repo.create(dto);
this.auditService.log(currentUser.id, 'CREATE', 'meal_plans', plan.id, dto);
```
