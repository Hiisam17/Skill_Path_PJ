import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthResponseDto, LoginDto, UserDto } from '../types';
import { PrismaService } from '../prisma/prisma.service';

/**
 * AuthService handles user authentication and authorization
 * Manages login credentials, JWT token generation, and password verification
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Authenticate user with email and password
   * Validates credentials against stored hashed password and generates JWT token
   *
   * @param loginDto - Contains email and password from login request
   * @returns AuthResponseDto with JWT token and user information
   * @throws NotFoundException if user email not found
   * @throws BadRequestException if password is incorrect
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // 1. Find user by email
    const user = await (this.prisma as any).user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    // 2. Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid email or password');
    }

    // 3. Generate JWT token
    const token = this.generateToken({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    });

    // 4. Return token and user information
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
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
    const payload = {
      sub: user.id,
      email: user.email,
    };

    return this.jwtService.sign(payload);
  }

  /**
   * Verify JWT token and extract user information
   * Used by JwtAuthGuard to validate request tokens
   *
   * @param token - JWT token string (without 'Bearer ' prefix)
   * @returns Decoded token payload with user id and email
   */
  async validateToken(token: string): Promise<UserDto | null> {
    try {
      const payload = this.jwtService.verify(token);

      const user = await (this.prisma as any).user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      };
    } catch {
      return null;
    }
  }
}
