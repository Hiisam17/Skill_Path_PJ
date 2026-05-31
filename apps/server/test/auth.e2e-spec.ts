import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthService } from '../src/auth/auth.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  const mockAuthService = {
    register: jest
      .fn()
      .mockResolvedValue({ message: 'Success', user: { id: '1' } }),
    login: jest
      .fn()
      .mockResolvedValue({ access_token: 'token', user: { id: '1' } }),
  };

  const mockPrismaService = {
    progressStatus: { upsert: jest.fn().mockResolvedValue({ id: 1 }) },
    roadmap: { findFirst: jest.fn().mockResolvedValue({ id: 1 }) },
    profile: { findFirst: jest.fn().mockResolvedValue({ userId: '1' }) },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AuthService)
      .useValue(mockAuthService)
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/auth/register', () => {
    it('should return 201 on successful registration (Happy Path)', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password',
          fullName: 'Test',
        })
        .expect(201)
        .expect({ message: 'Success', user: { id: '1' } });
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 201 on successful login (Happy Path)', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password' })
        .expect(201)
        .expect({ access_token: 'token', user: { id: '1' } });
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return 401 if no token provided (Edge case)', () => {
      return request(app.getHttpServer()).get('/api/auth/me').expect(401);
    });

    // Note: Testing successful /me would require a real JWT or complex mock of JwtAuthGuard.
  });
});
