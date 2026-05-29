import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiGapService } from '../ai/ai-gap.service';
import { ProgressService } from '../progress/progress.service';

describe('JobsService', () => {
  let service: JobsService;

  const mockPrismaService = {
    job: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    userSkillProgress: {
      findMany: jest.fn(),
    },
  };
  const mockAiGapService = {
    analyzeGap: jest.fn(),
    parseJd: jest.fn(),
    analyzeJobJD: jest.fn(),
  };
  const mockProgressService = {
    getCompletedStatusId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: AiGapService,
          useValue: mockAiGapService,
        },
        {
          provide: ProgressService,
          useValue: mockProgressService,
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('getMarketTrends', () => {
    it('should aggregate top skills from the recent period', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-05-27T00:00:00.000Z'));
      mockPrismaService.job.findMany.mockResolvedValue([
        {
          skills: ['TypeScript', 'React', 'TypeScript'],
          createdAt: new Date('2026-05-26T00:00:00.000Z'),
        },
        {
          skills: ['TypeScript', 'NodeJS'],
          createdAt: new Date('2026-05-20T00:00:00.000Z'),
        },
        {
          skills: ['React'],
          createdAt: new Date('2026-04-25T00:00:00.000Z'),
        },
      ]);

      const result = await service.getMarketTrends(30, 2);

      expect(result.basis).toBe('recent_period');
      expect(result.periodDays).toBe(30);
      expect(result.topSkills).toEqual([
        expect.objectContaining({
          name: 'TypeScript',
          currentCount: 2,
          previousCount: 0,
          growthPct: null,
          trend: 'new',
        }),
        expect.objectContaining({
          name: 'NodeJS',
          currentCount: 1,
          previousCount: 0,
          trend: 'new',
        }),
      ]);
      expect(result.sparkline).toHaveLength(30);
    });

    it('should fallback to all jobs when no jobs exist in the recent period', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-05-27T00:00:00.000Z'));
      mockPrismaService.job.findMany.mockResolvedValue([
        {
          skills: ['Java', 'Spring'],
          createdAt: new Date('2025-01-01T00:00:00.000Z'),
        },
        {
          skills: ['Java', 'SQL'],
          createdAt: new Date('2025-01-02T00:00:00.000Z'),
        },
      ]);

      const result = await service.getMarketTrends(30, 3);

      expect(result.basis).toBe('all_time_fallback');
      expect(result.topSkills[0]).toEqual(
        expect.objectContaining({
          name: 'Java',
          currentCount: 2,
          trend: 'new',
        }),
      );
      expect(result.sparkline).toEqual([
        { date: '2025-01-01', jobCount: 1 },
        { date: '2025-01-02', jobCount: 1 },
      ]);
    });
  });

  describe('findAll', () => {
    it('should list jobs ordered by newest first', async () => {
      mockPrismaService.job.findMany.mockResolvedValue([]);

      await service.findAll();

      expect(mockPrismaService.job.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('analyzeGap', () => {
    it('should compare job requirements with unique completed user skills', async () => {
      mockPrismaService.job.findUnique.mockResolvedValue({
        id: 1,
        title: 'React Developer',
        company: 'Tech Co',
        description:
          'We are looking for React, TypeScript, REST API, Git, and modern JavaScript.',
        requirements: 'React, TypeScript, REST API, Git, JavaScript',
      });
      mockProgressService.getCompletedStatusId.mockResolvedValue(10);
      mockPrismaService.userSkillProgress.findMany.mockResolvedValue([
        {
          roadmapSkill: {
            skill: { nodeId: 'react', name: 'React', description: null },
          },
        },
        {
          roadmapSkill: {
            skill: { nodeId: 'react', name: 'React', description: null },
          },
        },
        {
          roadmapSkill: {
            skill: {
              nodeId: 'javascript',
              name: 'JavaScript',
              description: null,
            },
          },
        },
      ]);
      mockAiGapService.analyzeGap.mockResolvedValue({
        requiredSkillIds: [
          'react',
          'typescript',
          'rest-api',
          'git',
          'javascript',
        ],
        gapSkillIds: ['typescript', 'rest-api', 'git'],
        matchScore: 40,
        summary: 'User cần bổ sung TypeScript, REST API và Git.',
      });

      const result = await service.analyzeGap(1, 'user-1');

      expect(result).toEqual({
        requiredSkillIds: [
          'react',
          'typescript',
          'rest-api',
          'git',
          'javascript',
        ],
        gapSkillIds: ['typescript', 'rest-api', 'git'],
        matchScore: 40,
        summary: 'User cần bổ sung TypeScript, REST API và Git.',
        isNewUser: false,
      });
      expect(mockAiGapService.analyzeGap).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'React Developer' }),
        [
          { nodeId: 'react', name: 'React', description: null },
          { nodeId: 'javascript', name: 'JavaScript', description: null },
        ],
      );
    });

    it('should mark every required skill as a gap for a new user', async () => {
      mockPrismaService.job.findUnique.mockResolvedValue({
        id: 1,
        title: 'React Developer',
        company: 'Tech Co',
        description: 'React and TypeScript',
        requirements: null,
      });
      mockProgressService.getCompletedStatusId.mockResolvedValue(10);
      mockPrismaService.userSkillProgress.findMany.mockResolvedValue([]);
      mockAiGapService.analyzeGap.mockResolvedValue({
        requiredSkillIds: ['react', 'typescript'],
        gapSkillIds: ['react', 'typescript'],
        matchScore: 0,
        summary: 'User chưa có skill phù hợp.',
      });

      const result = await service.analyzeGap(1, 'new-user');

      expect(result.isNewUser).toBe(true);
      expect(result.gapSkillIds).toEqual(['react', 'typescript']);
      expect(mockAiGapService.analyzeGap).toHaveBeenCalledWith(
        expect.any(Object),
        [],
      );
    });

    it('should throw NotFoundException for an invalid jobId', async () => {
      mockPrismaService.job.findUnique.mockResolvedValue(null);

      await expect(service.analyzeGap(999, 'user-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockAiGapService.analyzeGap).not.toHaveBeenCalled();
    });
  });

  describe('parseJd', () => {
    it('should reject too-short job descriptions before calling AI', async () => {
      await expect(service.parseJd('React', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(mockAiGapService.parseJd).not.toHaveBeenCalled();
    });
  });

  describe('analyzeJobJD', () => {
    it('should throw NotFoundException for an invalid jobId', async () => {
      mockPrismaService.job.findUnique.mockResolvedValue(null);

      await expect(service.analyzeJobJD(404)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockAiGapService.analyzeJobJD).not.toHaveBeenCalled();
    });
  });
});
