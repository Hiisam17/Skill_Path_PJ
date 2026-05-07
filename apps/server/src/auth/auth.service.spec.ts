import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase to isolate AuthService from external network calls
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockReturnValue({
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
    },
  }),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let supabaseMock: any;

  const mockPrismaService = {
    profile: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    // In order to let createClient be called in constructor
    process.env.SUPABASE_URL = 'http://localhost:54321';
    process.env.SUPABASE_KEY = 'mock-key';

    supabaseMock = (createClient as jest.Mock)();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const email = 'test@example.com';
    const password = 'password123';
    const name = 'Test User';

    it('should successfully register a user and sync profile (Happy Path)', async () => {
      supabaseMock.auth.signUp.mockResolvedValue({
        data: { user: { id: 'supabase-id' } },
        error: null,
      });
      mockPrismaService.profile.create.mockResolvedValue({});

      const result = await service.register(email, password, name);

      expect(result.message).toBe('Registration successful!');
      expect(supabaseMock.auth.signUp).toHaveBeenCalledWith({ email, password });
      expect(prisma.profile.create).toHaveBeenCalledWith({
        data: { userId: 'supabase-id', fullName: name },
      });
    });

    it('should throw BadRequestException if Supabase signUp fails (Edge case)', async () => {
      supabaseMock.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid email' },
      });

      await expect(service.register(email, password)).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException if DB profile sync fails (Edge case)', async () => {
      supabaseMock.auth.signUp.mockResolvedValue({
        data: { user: { id: 'id' } },
        error: null,
      });
      mockPrismaService.profile.create.mockRejectedValue(new Error('DB Error'));

      await expect(service.register(email, password)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('login', () => {
    const email = 'test@example.com';
    const password = 'password123';

    it('should successfully login and return access token (Happy Path)', async () => {
      supabaseMock.auth.signInWithPassword.mockResolvedValue({
        data: { session: { access_token: 'token' }, user: { id: 'id' } },
        error: null,
      });

      const result = await service.login(email, password);

      expect(result.access_token).toBe('token');
      expect(supabaseMock.auth.signInWithPassword).toHaveBeenCalledWith({ email, password });
    });

    it('should throw UnauthorizedException if credentials invalid (Edge case)', async () => {
      supabaseMock.auth.signInWithPassword.mockResolvedValue({
        data: { session: null },
        error: { message: 'Invalid login credentials' },
      });

      await expect(service.login(email, password)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw InternalServerErrorException if no session is returned', async () => {
      supabaseMock.auth.signInWithPassword.mockResolvedValue({
        data: { session: null, user: { id: 'id' } },
        error: null,
      });

      await expect(service.login(email, password)).rejects.toThrow(InternalServerErrorException);
    });
  });
});
