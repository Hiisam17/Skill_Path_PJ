import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  it('should return the authenticated user', () => {
    const user = { id: 'user-1' };

    expect(guard.handleRequest(null, user, null, null)).toBe(user);
  });

  it('should throw the original auth error', () => {
    const error = new Error('strategy failed');

    expect(() => guard.handleRequest(error, null, null, null)).toThrow(error);
  });

  it('should throw UnauthorizedException when user is missing', () => {
    expect(() =>
      guard.handleRequest(null, null, { message: 'jwt expired' }, null),
    ).toThrow(UnauthorizedException);
  });

  it('should include fallback auth info when no message exists', () => {
    expect(() =>
      guard.handleRequest(null, null, 'missing token', null),
    ).toThrow('Unauthorized: missing token');
  });
});
