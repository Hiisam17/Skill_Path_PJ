import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { ProgressService } from '../src/progress/progress.service';
import { UsersService } from '../src/users/users.service';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  
  const mockProgressService = {
    getDemoUserId: jest.fn().mockResolvedValue('demo-user-id'),
    getUserMultiRoadmapProgress: jest.fn().mockResolvedValue({ 
      overall: { completedSkills: 0, totalSkills: 0, percentage: 0 }, 
      roadmaps: [] 
    }),
  };

  const mockUsersService = {
    selectRoadmap: jest.fn().mockResolvedValue(101),
  };

  const mockPrismaService = {
    progressStatus: { upsert: jest.fn().mockResolvedValue({ id: 1 }) },
    roadmap: { findFirst: jest.fn().mockResolvedValue({ id: 1 }) },
    profile: { findFirst: jest.fn().mockResolvedValue({ userId: '1' }) }
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ProgressService)
      .useValue(mockProgressService)
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
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

  describe('GET /api/users/progress', () => {
    it('should return 200 and multi-roadmap progress (Happy Path)', () => {
      return request(app.getHttpServer())
        .get('/api/users/progress')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('roadmaps');
          expect(res.body).toHaveProperty('overall');
        });
    });
  });

  describe('POST /api/users/select-roadmap', () => {
    it('should return 201 and the selected roadmapId (Happy Path)', () => {
      return request(app.getHttpServer())
        .post('/api/users/select-roadmap')
        .send({ careerPathId: '1' })
        .expect(201)
        .expect({ roadmapId: 101 });
    });
  });
});
