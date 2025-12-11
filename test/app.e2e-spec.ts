import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { SupabaseClient } from '@supabase/supabase-js';

// Mock Supabase Client
const mockSupabase = {
    auth: {
        signInWithPassword: jest.fn().mockResolvedValue({
            data: { session: { access_token: 'fake-jwt-token' }, user: { id: 'user-123' } },
            error: null,
        }),
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    single: jest.fn(),
    eq: jest.fn().mockReturnThis(),
};

// Fixtures
const loginPayload = { email: 'test@example.com', password: 'Password123' };
const createConvPayload = { patientId: 'user-123' };
const messagePayload = { content: 'Hello NutriAI' };

describe('AppController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(SupabaseClient) // Assuming SupabaseClient is provided via DI
            .useValue(mockSupabase)
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('/auth/login (POST)', () => {
        it('should return access token on valid credentials', () => {
            return request(app.getHttpServer())
                .post('/auth/login')
                .send(loginPayload)
                .expect(201) // or 200 depending on implementation
                .expect((res) => {
                    expect(res.body).toHaveProperty('accessToken');
                    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
                        email: loginPayload.email,
                        password: loginPayload.password,
                    });
                });
        });
    });

    describe('/conversations (POST)', () => {
        it('should create conversation when authenticated', () => {
            // Mock insert response
            mockSupabase.single.mockResolvedValueOnce({
                data: { id: 'conv-123', patient_id: 'user-123' },
                error: null,
            });

            return request(app.getHttpServer())
                .post('/conversations')
                .set('Authorization', 'Bearer fake-jwt-token')
                .send(createConvPayload)
                .expect(201)
                .expect((res) => {
                    expect(res.body.id).toBe('conv-123');
                });
        });

        it('should fail with 401 if no token provided', () => {
            return request(app.getHttpServer())
                .post('/conversations')
                .send(createConvPayload)
                .expect(401);
        });
    });

    describe('/conversations/:id/messages (POST)', () => {
        it('should create message', () => {
            mockSupabase.single.mockResolvedValueOnce({
                data: { id: 'msg-456', content: 'Hello NutriAI', conversation_id: 'conv-123' },
                error: null,
            });

            return request(app.getHttpServer())
                .post('/conversations/conv-123/messages')
                .set('Authorization', 'Bearer fake-jwt-token')
                .send(messagePayload)
                .expect(201)
                .expect((res) => {
                    expect(res.body.content).toBe('Hello NutriAI');
                });
        });
    });
});
