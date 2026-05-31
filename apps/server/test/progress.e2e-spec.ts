import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { mockJwtAuthGuard } from './mock-auth.guard';

describe('ProgressController (e2e)', () => {
  let app: INestApplication;
  const mockPrisma = {
    progressStatus: {
      findFirst: jest.fn().mockResolvedValue({ id: 1 }),
      findUnique: jest.fn().mockResolvedValue({ name: 'COMPLETED' }),
      create: jest.fn().mockResolvedValue({ id: 1 }),
    },
    profile: {
      findFirst: jest.fn().mockResolvedValue({ userId: 'demo-user-id' }),
      findUnique: jest.fn().mockResolvedValue({ userId: 'demo-user-id' }),
    },
    skill: {
      findUnique: jest.fn().mockResolvedValue({ id: 1 }),
    },
    userSkillProgress: {
      findFirst: jest.fn().mockResolvedValue(null),
      upsert: jest.fn().mockResolvedValue({
        id: 101,
        userId: 'demo-user-id',
        roadmapSkillId: 1,
        skillId: 1,
        status: { name: 'COMPLETED' },
        completedAt: new Date(),
      }),
      update: jest.fn(),
      delete: jest.fn().mockResolvedValue({ id: 101 }),
      count: jest.fn().mockResolvedValue(5),
    },
    userRoadmap: {
      findFirst: jest.fn().mockResolvedValue({ roadmapId: 1 }),
      findMany: jest.fn().mockResolvedValue([
        {
          roadmapId: 1,
          roadmap: { id: 1, title: 'Roadmap 1' },
        },
      ]),
    },
    roadmapSkill: {
      findUnique: jest.fn().mockResolvedValue({
        id: 1,
        skillId: 1,
      }),
      count: jest.fn().mockResolvedValue(10),
      findMany: jest.fn().mockResolvedValue([{ id: 1, skillId: 1 }]),
    },
    roadmap: {
      findFirst: jest.fn().mockResolvedValue({ id: 1 }),
      findMany: jest.fn().mockResolvedValue([{ id: 1, title: 'Roadmap 1' }]),
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    // Based on the app.module.ts and other tests, prefix is api
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('PATCH /api/progress/skills/:skillId', () => {
    it('should return 200 and updated progress (Happy Path)', async () => {
      return request(app.getHttpServer())
        .patch('/api/progress/skills/1')
        .send({ statusId: 1 })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body.roadmapSkillId).toBe('1');
        });
    });

    it('should return 400 for invalid skillId (Edge case)', async () => {
      return request(app.getHttpServer())
        .patch('/api/progress/skills/abc')
        .send({ statusId: 1 })
        .expect(400);
    });

    it('should return 400 for missing statusId (Edge case)', async () => {
      return request(app.getHttpServer())
        .patch('/api/progress/skills/1')
        .send({})
        .expect(400);
    });

    it('should return 404 if skill not found in database (Edge case)', async () => {
      mockPrisma.roadmapSkill.findUnique.mockResolvedValueOnce(null);
      return request(app.getHttpServer())
        .patch('/api/progress/skills/999')
        .send({ statusId: 1 })
        .expect(404);
    });
  });

  describe('DELETE /api/progress/skills/:skillId', () => {
    it('should return 204 on successful reset (Happy Path)', async () => {
      return request(app.getHttpServer())
        .delete('/api/progress/skills/1')
        .expect(204);
    });

    it('should return 400 for invalid skillId format', async () => {
      return request(app.getHttpServer())
        .delete('/api/progress/skills/invalid')
        .expect(400);
    });
  });

  describe('GET /api/progress/current', () => {
    it('should return 200 and progress summary (Happy Path)', async () => {
      return request(app.getHttpServer())
        .get('/api/progress/current')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('percentage');
          expect(res.body.percentage).toBe(50);
          expect(res.body.totalSkills).toBe(10);
        });
    });

    it('should return 200 with zero progress if no roadmap can be resolved', async () => {
      mockPrisma.userSkillProgress.count.mockResolvedValueOnce(0);
      mockPrisma.userRoadmap.findFirst.mockResolvedValueOnce(null);
      mockPrisma.roadmap.findFirst.mockResolvedValueOnce(null);

      return request(app.getHttpServer())
        .get('/api/progress/current')
        .expect(200)
        .expect((res) => {
          expect(res.body.completedSkills).toBe(0);
          expect(res.body.totalSkills).toBe(0);
          expect(res.body.percentage).toBe(0);
        });
    });
  });

  describe('GET /api/progress/all', () => {
    it('should return 200 and multi-roadmap progress breakdown (Happy Path)', async () => {
      return request(app.getHttpServer())
        .get('/api/progress/all')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('overall');
          expect(res.body).toHaveProperty('roadmaps');
          expect(Array.isArray(res.body.roadmaps)).toBe(true);
        });
    });
  });
});
