import {
    Controller,
    Post,
    Body,
    BadRequestException,
    UnauthorizedException,
    Res
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Response } from 'express';

// DTOs
class RegisterDto {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
}

class LoginDto {
    email: string;
    password: string;
}

class RefreshTokenDto {
    refreshToken: string;
}

@Controller('auth')
export class AuthController {
    private supabase: SupabaseClient;

    constructor() {
        this.supabase = createClient(
            'https://vbobpybekjauvtrllmep.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZib2JweWJla2phdXZ0cmxsbWVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTMyMDkxNywiZXhwIjoyMDgwODk2OTE3fQ.hub0JMa4bxXCwCd_1iPK2FWbn8nmkUI33Z-UzUBSD-4'
        );
    }

    private validatePassword(password: string): boolean {
        // Min 8 chars, at least 1 letter and 1 number
        const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        return regex.test(password);
    }

    @Post('register')
    async register(@Body() dto: RegisterDto) {
        if (!dto.email || !dto.password) {
            throw new BadRequestException('Email and password are required');
        }

        if (!this.validatePassword(dto.password)) {
            throw new BadRequestException('Password must be at least 8 characters long and contain at least one letter and one number');
        }

        // Register with Supabase Auth
        const { data: authData, error: authError } = await this.supabase.auth.signUp({
            email: dto.email,
            password: dto.password,
            options: {
                data: {
                    first_name: dto.firstName,
                    last_name: dto.lastName
                    // role: 'patient' // Default role, or handled by trigger
                }
            }
        });

        if (authError) throw new BadRequestException(authError.message);

        return {
            message: 'Registration successful. Please check your email to verify your account.',
            user: authData.user
        };
    }

    @Post('login')
    async login(@Body() dto: LoginDto) {
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email: dto.email,
            password: dto.password
        });

        if (error) throw new UnauthorizedException(error.message);

        return {
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            user: data.user
        };
    }

    @Post('refresh')
    async refresh(@Body() dto: RefreshTokenDto) {
        if (!dto.refreshToken) throw new BadRequestException('Refresh token is required');

        const { data, error } = await this.supabase.auth.refreshSession({
            refresh_token: dto.refreshToken
        });

        if (error) throw new UnauthorizedException('Invalid refresh token');

        return {
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token
        };
    }

    @Post('verify-email') // Usually handled by Supabase link, but here's a placeholder if needing code
    async verifyEmail(@Body() body: { email: string, token: string }) {
        const { data, error } = await this.supabase.auth.verifyOtp({
            email: body.email,
            token: body.token,
            type: 'signup'
        });

        if (error) throw new BadRequestException(error.message);
        return { message: 'Email verified' };
    }
}
