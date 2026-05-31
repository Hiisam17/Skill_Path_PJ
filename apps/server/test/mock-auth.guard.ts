import { ExecutionContext } from '@nestjs/common';

interface MockAuthRequest {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const mockJwtAuthGuard = {
  canActivate: (context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<MockAuthRequest>();
    request.user = {
      id: 'demo-user-id',
      email: 'demo@example.com',
      role: 'authenticated',
    };
    return true;
  },
};
