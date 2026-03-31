import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { UserDto } from '../types';

/**
 * JWT Authentication Guard
 * Protects routes by validating JWT token from Authorization header
 * Attaches decoded user information to request object
 *
 * Usage in controller:
 * @UseGuards(JwtAuthGuard)
 * @Get('profile')
 * getProfile(@Request() req: Request & { user: UserDto }) {
 *   return req.user;
 * }
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Authorization token is missing');
    }

    const user = await this.authService.validateToken(token);

    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Attach user to request object for use in controllers
    (request as any).user = user;

    return true;
  }

  /**
   * Extract JWT token from Authorization header
   * Expected format: "Bearer <token>"
   *
   * @param request - Express request object
   * @returns Token string or undefined if not present
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return undefined;
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException(
        'Invalid authorization header format. Expected: Bearer <token>',
      );
    }

    return parts[1];
  }
}
