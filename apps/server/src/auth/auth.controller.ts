import { Controller, Post, Body } from '@nestjs/common';
import type { LoginDto, AuthResponseDto } from '../types';
import { AuthService } from './auth.service';

/**
 * Authentication controller handling user login and auth-related endpoints
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * User login endpoint
   * Authenticates user with email and password, returns JWT token
   *
   * @param loginDto - Login credentials (email and password)
   * @returns AuthResponseDto with JWT token and user information
   *
   * @example
   * POST /auth/login
   * Content-Type: application/json
   *
   * {
   *   "email": "test@example.com",
   *   "password": "password123"
   * }
   *
   * Response (200 OK):
   * {
   *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   *   "user": {
   *     "id": "550e8400-e29b-41d4-a716-446655440000",
   *     "email": "test@example.com",
   *     "createdAt": "2026-03-26T10:00:00Z"
   *   }
   * }
   */
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }
}
