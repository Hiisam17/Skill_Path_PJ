import { ConfigService } from '@nestjs/config';
import { passportJwtSecret } from 'jwks-rsa';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import { JwtStrategy } from './jwt.strategy';

jest.mock('jwks-rsa', () => ({
  passportJwtSecret: jest.fn(() =>
    jest.fn((_request, _token, done) => done(null, 'jwks-secret')),
  ),
}));

jest.mock('jsonwebtoken', () => ({
  decode: jest.fn(),
}));

describe('JwtStrategy', () => {
  const configService = {
    get: jest.fn((key: string) => {
      const values: Record<string, string> = {
        SUPABASE_URL: 'https://example.supabase.co',
        JWT_SECRET: 'hs-secret',
      };
      return values[key];
    }),
  };
  const prisma = {
    profile: {
      upsert: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function createStrategy() {
    return new JwtStrategy(
      configService as unknown as ConfigService,
      prisma as unknown as PrismaService,
    ) as any;
  }

  it('should configure JWKS using the Supabase URL', () => {
    createStrategy();

    expect(passportJwtSecret).toHaveBeenCalledWith(
      expect.objectContaining({
        jwksUri: 'https://example.supabase.co/auth/v1/.well-known/jwks.json',
      }),
    );
  });

  it('should use local JWT secret for HS-signed tokens', async () => {
    (jwt.decode as jest.Mock).mockReturnValue({ header: { alg: 'HS256' } });
    const strategy = createStrategy();

    await expect(
      new Promise((resolve, reject) => {
        strategy._secretOrKeyProvider({}, 'token', (error, secret) => {
          if (error) reject(error);
          else resolve(secret);
        });
      }),
    ).resolves.toBe('hs-secret');
  });

  it('should error for HS tokens when no local secret is configured', async () => {
    (jwt.decode as jest.Mock).mockReturnValue({ header: { alg: 'HS256' } });
    configService.get.mockReturnValueOnce('https://example.supabase.co');
    configService.get.mockReturnValueOnce(undefined);
    configService.get.mockReturnValueOnce(undefined);
    const strategy = new JwtStrategy(
      configService as unknown as ConfigService,
      prisma as unknown as PrismaService,
    ) as any;

    await expect(
      new Promise((resolve, reject) => {
        strategy._secretOrKeyProvider({}, 'token', (error, secret) => {
          if (error) reject(error);
          else resolve(secret);
        });
      }),
    ).rejects.toThrow('JWT_SECRET or SUPABASE_JWT_SECRET is required');
  });

  it('should delegate non-HS tokens to JWKS provider', async () => {
    (jwt.decode as jest.Mock).mockReturnValue({ header: { alg: 'RS256' } });
    const strategy = createStrategy();

    await expect(
      new Promise((resolve, reject) => {
        strategy._secretOrKeyProvider({}, 'token', (error, secret) => {
          if (error) reject(error);
          else resolve(secret);
        });
      }),
    ).resolves.toBe('jwks-secret');
  });

  it('should upsert a profile and return normalized user fields', async () => {
    prisma.profile.upsert.mockResolvedValue({
      fullName: 'Jane Doe',
      avatarUrl: 'avatar.png',
      bio: 'Engineer',
      githubLink: 'https://github.com/jane',
    });
    const strategy = createStrategy();

    const user = await strategy.validate({
      sub: 'user-1',
      email: 'jane@example.com',
      role: 'authenticated',
      user_metadata: { full_name: 'Jane Doe', avatar_url: 'avatar.png' },
    });

    expect(user).toEqual({
      id: 'user-1',
      email: 'jane@example.com',
      role: 'authenticated',
      fullName: 'Jane Doe',
      avatarUrl: 'avatar.png',
      bio: 'Engineer',
      githubLink: 'https://github.com/jane',
    });
    expect(prisma.profile.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          userId: 'user-1',
          fullName: 'Jane Doe',
          avatarUrl: 'avatar.png',
          isDeleted: false,
        }),
      }),
    );
  });

  it('should fallback to alternate metadata field names', async () => {
    prisma.profile.upsert.mockResolvedValue({
      fullName: null,
      avatarUrl: null,
      bio: null,
      githubLink: null,
    });
    const strategy = createStrategy();

    await strategy.validate({
      sub: 'user-2',
      email: 'alt@example.com',
      user_metadata: { name: 'Alt Name', picture: 'pic.png' },
    });

    expect(prisma.profile.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          fullName: 'Alt Name',
          avatarUrl: 'pic.png',
        }),
      }),
    );
  });

  it('should rethrow profile persistence errors', async () => {
    prisma.profile.upsert.mockRejectedValue(new Error('db failed'));
    const strategy = createStrategy();

    await expect(
      strategy.validate({ sub: 'user-1', email: 'jane@example.com' }),
    ).rejects.toThrow('db failed');
  });
});
