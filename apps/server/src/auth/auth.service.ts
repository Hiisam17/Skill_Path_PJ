/* eslint-disable @typescript-eslint/require-await, @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { AuthResponseDto, LoginDto, UserDto } from '../types';
import { PrismaService } from '../prisma/prisma.service';

/**
 * AuthService handles user authentication and authorization
 * Manages login credentials, JWT token generation, and password verification
 */
@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Authenticate user with email and password
   * Validates credentials against stored hashed password and generates JWT token
   *
   * @param loginDto - Contains email and password from login request
   * @returns AuthResponseDto with JWT token and user information
   * @throws NotFoundException if user email not found
   * @throws BadRequestException if password is incorrect
   *
   * Example:
   * const response = await authService.login({ email: 'user@example.com', password: 'pass123' })
   * // Returns: { token: 'eyJhbGc...', user: { id: 'uuid', email: 'user@example.com', ... } }
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // TODO: Implement authentication logic
    // 1. Find user by email in database
    // 2. Verify password using bcrypt.compare()
    // 3. Generate JWT token with user id and email
    // 4. Return token and user information
    throw new Error('Not implemented');
  }

  /**
   * Generate JWT token for authenticated user
   * Creates signed token with configurable expiry time
   *
   * @param user - User DTO containing id and email
   * @returns Signed JWT token string
   *
   * @internal Used internally by login() - not exposed as direct endpoint
   */
  private generateToken(user: UserDto): string {
    // TODO: Implement JWT token generation
    // 1. Sign token with user payload (id, email)
    // 2. Set expiry time from environment variables (default: 7 days)
    // 3. Return signed token
    throw new Error('Not implemented');
  }
}
