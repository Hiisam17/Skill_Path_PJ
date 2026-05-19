import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('RoadmapsController (e2e)', () => {
  let app: INestApplication;
  const mockPrisma = {
    roadmap: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue({
        id: 1,
        title: 'Roadmap 1',
        careerPathId: 10,
        sections: []
      }),
    },
    careerPath: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    progressStatus: {
      upsert: jest.fn().mockResolvedValue({ id: 1 }),
    },
    profile: {
      findFirst: jest.fn().mockResolvedValue({ userId: 'demo-user' }),
      findUnique: jest.fn().mockResolvedValue({ userId: 'demo-user' }),
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

  describe('GET /api/roadmaps', () => {
    it('should return 200 and roadmaps array (Happy Path)', async () => {
      return request(app.getHttpServer())
        .get('/api/roadmaps')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('GET /api/roadmaps/:title', () => {
    it('should return 200 and roadmap object (Happy Path)', async () => {
      return request(app.getHttpServer())
        .get('/api/roadmaps/Roadmap%201')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
        });
    });

    it('should return 404 if roadmap invalid (Edge case)', async () => {
      mockPrisma.roadmap.findUnique.mockResolvedValueOnce(null);
      return request(app.getHttpServer())
        .get('/api/roadmaps/missing')
        .expect(404);
    });
  });

  describe('GET /api/roadmaps/:title/flow', () => {
    it('should return 200 and flow design (Happy Path)', async () => {
      return request(app.getHttpServer())
        .get('/api/roadmaps/Roadmap%201/flow')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('nodes');
          expect(res.body).toHaveProperty('edges');
        });
    });
  });
});
