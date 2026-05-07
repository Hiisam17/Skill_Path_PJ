import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('CareerPathsController (e2e)', () => {
  let app: INestApplication;
  const mockPrisma = {
    careerPath: {
      findMany: jest.fn().mockResolvedValue([
        { id: 1, name: 'Backend Developer', description: 'Server-side management' }
      ]),
    },
    // Mock profile and others to avoid app initialization issues
    profile: {
      findFirst: jest.fn().mockResolvedValue({ userId: 'demo-user' }),
      findUnique: jest.fn().mockResolvedValue({ userId: 'demo-user' }),
    },
    progressStatus: {
      upsert: jest.fn().mockResolvedValue({ id: 1 }),
    }
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/career-paths', () => {
    it('should return 200 and available career paths (Happy Path)', async () => {
      return request(app.getHttpServer())
        .get('/api/career-paths')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('name');
          expect(res.body[0].name).toBe('Backend Developer');
        });
    });
  });
});
