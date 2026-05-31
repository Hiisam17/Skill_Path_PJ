import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AiGapService } from '../src/ai/ai-gap.service';
import { ProgressService } from '../src/progress/progress.service';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { mockJwtAuthGuard } from './mock-auth.guard';

describe('JobsController (e2e)', () => {
  let app: INestApplication;

  const mockPrisma = {
    job: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    userSkillProgress: {
      findMany: jest.fn(),
    },
    progressStatus: {
      findFirst: jest.fn().mockResolvedValue({ id: 1 }),
    },
    profile: {
      findFirst: jest.fn().mockResolvedValue({ userId: 'demo-user-id' }),
      findUnique: jest.fn().mockResolvedValue({ userId: 'demo-user-id' }),
    },
  };

  const mockAiGapService = {
    analyzeGap: jest.fn(),
    parseJd: jest.fn(),
    analyzeJobJD: jest.fn(),
  };

  const mockProgressService = {
    getCompletedStatusId: jest.fn().mockResolvedValue(1),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .overrideProvider(AiGapService)
      .useValue(mockAiGapService)
      .overrideProvider(ProgressService)
      .useValue(mockProgressService)
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockProgressService.getCompletedStatusId.mockResolvedValue(1);
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/jobs should return jobs from the database layer', async () => {
    mockPrisma.job.findMany.mockResolvedValue([
      { id: 1, title: 'Frontend Developer', company: 'Tech Co' },
    ]);

    await request(app.getHttpServer())
      .get('/api/jobs')
      .expect(200)
      .expect((res) => {
        expect(res.body[0]).toMatchObject({
          id: 1,
          title: 'Frontend Developer',
        });
      });

    expect(mockPrisma.job.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
    });
  });

  it('GET /api/jobs/trends should aggregate persisted job skills', async () => {
    mockPrisma.job.findMany.mockResolvedValue([
      {
        skills: ['React', 'TypeScript'],
        createdAt: new Date(),
      },
    ]);

    await request(app.getHttpServer())
      .get('/api/jobs/trends?periodDays=30&limit=2')
      .expect(200)
      .expect((res) => {
        expect(res.body.topSkills).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ name: 'React' }),
            expect.objectContaining({ name: 'TypeScript' }),
          ]),
        );
      });
  });

  it('POST /api/jobs/analyze-gap should compare job and user progress through services', async () => {
    mockPrisma.job.findUnique.mockResolvedValue({
      id: 1,
      title: 'React Developer',
      company: 'Tech Co',
      description: 'React and TypeScript',
      requirements: 'React',
    });
    mockPrisma.userSkillProgress.findMany.mockResolvedValue([
      {
        roadmapSkill: {
          skill: { nodeId: 'react', name: 'React', description: null },
        },
      },
    ]);
    mockAiGapService.analyzeGap.mockResolvedValue({
      requiredSkillIds: ['react'],
      gapSkillIds: [],
      matchScore: 100,
      summary: 'Good match',
    });

    await request(app.getHttpServer())
      .post('/api/jobs/analyze-gap')
      .send({ jobId: 1 })
      .expect(201)
      .expect((res) => {
        expect(res.body).toMatchObject({
          requiredSkillIds: ['react'],
          gapSkillIds: [],
          matchScore: 100,
          isNewUser: false,
        });
      });
  });

  it('POST /api/jobs/analyze-gap should return 400 without jobId', async () => {
    await request(app.getHttpServer())
      .post('/api/jobs/analyze-gap')
      .send({})
      .expect(400);
  });

  it('POST /api/jobs/parse-jd should parse raw JD text', async () => {
    mockPrisma.userSkillProgress.findMany.mockResolvedValue([]);
    mockAiGapService.parseJd.mockResolvedValue({
      requiredSkillIds: ['node'],
      gapSkillIds: ['node'],
      matchScore: 0,
      summary: 'Need backend skills',
      roadmapType: 'backend',
    });

    await request(app.getHttpServer())
      .post('/api/jobs/parse-jd')
      .send({
        rawJdText: 'Backend role requiring Node.js and databases. '.repeat(2),
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toMatchObject({
          roadmapType: 'backend',
          roadmapPath: '/roadmaps/Backend',
          isNewUser: true,
        });
      });
  });

  it('POST /api/jobs/analyze-jd should include roadmap path from persisted job', async () => {
    mockPrisma.job.findUnique.mockResolvedValue({
      roadmapPath: '/roadmaps/Frontend',
    });
    mockAiGapService.analyzeJobJD.mockResolvedValue({
      seniority: 'junior',
      mustHave: ['React'],
    });

    await request(app.getHttpServer())
      .post('/api/jobs/analyze-jd')
      .send({ jobId: 1 })
      .expect(201)
      .expect((res) => {
        expect(res.body).toMatchObject({
          seniority: 'junior',
          roadmapPath: '/roadmaps/Frontend',
        });
      });
  });

  it('POST /api/jobs/analyze-jd should return 404 for unknown jobs', async () => {
    mockPrisma.job.findUnique.mockResolvedValue(null);

    await request(app.getHttpServer())
      .post('/api/jobs/analyze-jd')
      .send({ jobId: 404 })
      .expect(404);
  });
});
