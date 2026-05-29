import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('SkillsController (e2e)', () => {
  let app: INestApplication;
  const mockPrisma = {
    profile: {
      findFirst: jest.fn().mockResolvedValue({ userId: 'demo-user' }),
      findUnique: jest.fn().mockResolvedValue({ userId: 'demo-user' }),
    },
    roadmapSkill: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    skill: {
      findUnique: jest.fn().mockResolvedValue({
        id: 1,
        name: 'Skill 1',
        resources: [],
        userProgress: []
      }),
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

  describe('GET /api/roadmaps/:roadmapId/skills', () => {
    it('should return 200 and skills array (Happy Path)', async () => {
      return request(app.getHttpServer())
        .get('/api/roadmaps/1/skills')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('GET /api/roadmaps/:id/detail', () => {
    it('should return 200 and skill detail (Happy Path)', async () => {
      return request(app.getHttpServer())
        .get('/api/roadmaps/1/detail')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('title');
        });
    });

    it('should return 404 if skill missing (Edge case)', async () => {
      mockPrisma.skill.findUnique.mockResolvedValueOnce(null);
      return request(app.getHttpServer())
        .get('/api/roadmaps/999/detail')
        .expect(404);
    });
  });
});
