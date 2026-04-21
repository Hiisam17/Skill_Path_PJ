import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Request as ExpressRequest } from 'express';
/**
 * Handles authentication endpoints for user registration, login, and token verification.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Registers a new user account.
   *
   * @param body - User registration details.
   * @returns The created user data and a success message.
   */
  @Post('register')
  async register(@Body() body: { email: string; password: string; fullName?: string }) {
    return this.authService.register(body.email, body.password, body.fullName);
  }

  /**
   * Authenticates a user and returns a JWT access token.
   *
   * @param body - User login credentials.
   * @returns An object containing the access token and user info.
   */
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  /**
   * Returns the authenticated user's profile.
   * Requires a valid JWT Bearer token.
   *
   * @param req - The express request with injected user payload.
   * @returns The verified user data from the JWT.
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req: ExpressRequest & { user: any }) {
    return {
      message: 'Token is valid',
      user: req.user,
    };
  }
}