import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Request as ExpressRequest } from 'express';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // API Đăng ký: POST /api/auth/register
  @Post('register')
  async register(@Body() body: { email: string; password: string; fullName?: string }) {
    return this.authService.register(body.email, body.password, body.fullName);
  }

  // API Đăng nhập: POST /api/auth/login
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  // API Test Token (Yêu cầu phải có Token mới gọi được)
  // GET /api/auth/me
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req: ExpressRequest & { user: any }) { 
    return {
      message: 'Token hợp lệ!',
      user: req.user,
    };
  }
}