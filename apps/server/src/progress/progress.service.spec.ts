import { Test, TestingModule } from '@nestjs/testing';
import { ProgressService } from './progress.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { UserSkillStatus } from '../types';

describe('ProgressService', () => {
  let service: ProgressService;
  let prisma: PrismaService;

  const mockPrismaService = {
    progressStatus: {
      upsert: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    profile: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    roadmapSkill: {
      findUnique: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
    userSkillProgress: {
      findFirst: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    userRoadmap: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    roadmap: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProgressService>(ProgressService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Use type casting to access private cache for reset
    (service as any).completedStatusIdCache = null;
  });

  describe('getCompletedStatusId', () => {
    it('should return an existing COMPLETED-compatible status ID', async () => {
      mockPrismaService.progressStatus.findFirst.mockResolvedValue({ id: 1 });
      const id = await service.getCompletedStatusId();
      expect(id).toBe(1);
      expect(mockPrismaService.progressStatus.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            name: { in: expect.arrayContaining(['COMPLETED', 'Completed']) },
          },
        }),
      );
    });

    it('should use cache on subsequent calls', async () => {
      mockPrismaService.progressStatus.findFirst.mockResolvedValue({ id: 1 });
      await service.getCompletedStatusId();
      await service.getCompletedStatusId();
      expect(mockPrismaService.progressStatus.findFirst).toHaveBeenCalledTimes(
        1,
      );
    });
  });

  describe('getDemoUserId', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it('should return env var if it exists in DB', async () => {
      process.env.DEMO_USER_ID = 'user-123';
      mockPrismaService.profile.findUnique.mockResolvedValue({
        userId: 'user-123',
      });
      const id = await service.getDemoUserId();
      expect(id).toBe('user-123');
    });

    it('should create profile if env var is set but not in DB', async () => {
      process.env.DEMO_USER_ID = 'new-user';
      mockPrismaService.profile.findUnique.mockResolvedValue(null);
      mockPrismaService.profile.create.mockResolvedValue({
        userId: 'new-user',
      });
      const id = await service.getDemoUserId();
      expect(id).toBe('new-user');
      expect(mockPrismaService.profile.create).toHaveBeenCalled();
    });

    it('should fallback to most recent profile if no env var', async () => {
      delete process.env.DEMO_USER_ID;
      mockPrismaService.profile.findFirst.mockResolvedValue({
        userId: 'fallback-user',
      });
      const id = await service.getDemoUserId();
      expect(id).toBe('fallback-user');
      expect(mockPrismaService.profile.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { updatedAt: 'desc' },
        }),
      );
    });

    it('should throw NotFoundException if no profile found', async () => {
      delete process.env.DEMO_USER_ID;
      mockPrismaService.profile.findFirst.mockResolvedValue(null);
      await expect(service.getDemoUserId()).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateSkillStatus', () => {
    it('should update roadmap skill status successfully (Happy Path)', async () => {
      mockPrismaService.roadmapSkill.findUnique.mockResolvedValue({
        id: 10,
        skillId: 5,
      });
      mockPrismaService.progressStatus.findUnique.mockResolvedValue({
        name: 'COMPLETED',
      });
      mockPrismaService.userSkillProgress.findFirst.mockResolvedValue(null);
      mockPrismaService.userSkillProgress.upsert.mockResolvedValue({
        id: 1,
        userId: 'u1',
        roadmapSkillId: 10,
        status: { name: 'COMPLETED' },
        completedAt: new Date(),
      });

      const result = await service.updateSkillStatus('u1', 10, 1);
      expect(result.status).toBe(UserSkillStatus.COMPLETED);
      expect(result.userId).toBe('u1');
      expect(result.roadmapSkillId).toBe('10');
    });

    it('should use correct unique key userId_roadmapSkillId when upserting', async () => {
      mockPrismaService.roadmapSkill.findUnique.mockResolvedValue({
        id: 10,
        skillId: 5,
      });
      mockPrismaService.progressStatus.findUnique.mockResolvedValue({
        name: 'IN_PROGRESS',
      });
      mockPrismaService.userSkillProgress.findFirst.mockResolvedValue(null);
      mockPrismaService.userSkillProgress.upsert.mockResolvedValue({
        id: 1,
        userId: 'u1',
        roadmapSkillId: 10,
        status: { name: 'IN_PROGRESS' },
        completedAt: null,
      });

      await service.updateSkillStatus('u1', 10, 2);
      expect(mockPrismaService.userSkillProgress.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId_roadmapSkillId: { userId: 'u1', roadmapSkillId: 10 },
          },
        }),
      );
    });

    it('should update existing progress by skillId for legacy DB uniqueness', async () => {
      mockPrismaService.roadmapSkill.findUnique.mockResolvedValue({
        id: 10,
        skillId: 5,
      });
      mockPrismaService.progressStatus.findUnique.mockResolvedValue({
        name: 'IN_PROGRESS',
      });
      mockPrismaService.userSkillProgress.findFirst.mockResolvedValue({
        id: 1,
        userId: 'u1',
        roadmapSkillId: 9,
        skillId: 5,
        status: { name: 'COMPLETED' },
        completedAt: new Date(),
      });
      mockPrismaService.userSkillProgress.update.mockResolvedValue({
        id: 1,
        userId: 'u1',
        roadmapSkillId: 10,
        skillId: 5,
        status: { name: 'IN_PROGRESS' },
        completedAt: null,
      });

      const result = await service.updateSkillStatus('u1', 10, 2);

      expect(result.status).toBe(UserSkillStatus.IN_PROGRESS);
      expect(mockPrismaService.userSkillProgress.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: expect.objectContaining({
            roadmapSkillId: 10,
            skillId: 5,
            statusId: 2,
          }),
        }),
      );
      expect(mockPrismaService.userSkillProgress.upsert).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if roadmapSkill does not exist', async () => {
      mockPrismaService.roadmapSkill.findUnique.mockResolvedValue(null);
      await expect(service.updateSkillStatus('u1', 99, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('resetSkillStatus', () => {
    it('should call delete with userId_roadmapSkillId unique key', async () => {
      mockPrismaService.userSkillProgress.delete.mockResolvedValue({});
      await service.resetSkillStatus('u1', 10);
      expect(mockPrismaService.userSkillProgress.delete).toHaveBeenCalledWith({
        where: { userId_roadmapSkillId: { userId: 'u1', roadmapSkillId: 10 } },
      });
    });

    it('should handle deletion error silently (Edge case)', async () => {
      mockPrismaService.userSkillProgress.delete.mockRejectedValue(
        new Error('Record not found'),
      );
      await expect(service.resetSkillStatus('u1', 10)).resolves.not.toThrow();
    });
  });

  describe('getUserProgress', () => {
    it('should calculate percentage based on user roadmap enrollment', async () => {
      mockPrismaService.progressStatus.findFirst.mockResolvedValue({ id: 1 });
      mockPrismaService.userSkillProgress.count.mockResolvedValue(5);
      mockPrismaService.userRoadmap.findFirst.mockResolvedValue({
        roadmapId: 100,
      });
      mockPrismaService.roadmapSkill.count.mockResolvedValue(10);
      mockPrismaService.roadmapSkill.findMany.mockResolvedValue([
        { id: 101 },
        { id: 102 },
        { id: 103 },
      ]);

      const res = await service.getUserProgress('u1');
      expect(res.percentage).toBe(50);
      expect(res.totalSkills).toBe(10);
      expect(res.completedSkills).toBe(5);
      expect(mockPrismaService.userSkillProgress.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'u1',
            roadmapSkillId: { in: [101, 102, 103] },
          }),
        }),
      );
    });

    it('should return 0% when user has not completed any skill in the selected roadmap', async () => {
      mockPrismaService.progressStatus.findFirst.mockResolvedValue({ id: 1 });
      mockPrismaService.userRoadmap.findFirst.mockResolvedValue({
        roadmapId: 100,
      });
      mockPrismaService.roadmapSkill.count.mockResolvedValue(8);
      mockPrismaService.roadmapSkill.findMany.mockResolvedValue([
        { id: 101 },
        { id: 102 },
      ]);
      mockPrismaService.userSkillProgress.count.mockResolvedValue(0);

      const res = await service.getUserProgress('u1');

      expect(res).toEqual({
        completedSkills: 0,
        totalSkills: 8,
        percentage: 0,
      });
    });

    it('should return 100% when user completed all skills in the selected roadmap', async () => {
      mockPrismaService.progressStatus.findFirst.mockResolvedValue({ id: 1 });
      mockPrismaService.userRoadmap.findFirst.mockResolvedValue({
        roadmapId: 100,
      });
      mockPrismaService.roadmapSkill.count.mockResolvedValue(3);
      mockPrismaService.roadmapSkill.findMany.mockResolvedValue([
        { id: 101 },
        { id: 102 },
        { id: 103 },
      ]);
      mockPrismaService.userSkillProgress.count.mockResolvedValue(3);

      const res = await service.getUserProgress('u1');

      expect(res.percentage).toBe(100);
      expect(res.completedSkills).toBe(3);
      expect(res.totalSkills).toBe(3);
    });

    it('should not count completed skills from other roadmaps into current roadmap progress', async () => {
      mockPrismaService.progressStatus.findFirst.mockResolvedValue({ id: 1 });
      mockPrismaService.userRoadmap.findFirst.mockResolvedValue({
        roadmapId: 10,
      });
      mockPrismaService.roadmapSkill.count.mockResolvedValue(4);
      mockPrismaService.roadmapSkill.findMany.mockResolvedValue([
        { id: 11 },
        { id: 12 },
      ]);
      mockPrismaService.userSkillProgress.count.mockResolvedValue(1);

      const res = await service.getUserProgress('u1');

      expect(res.percentage).toBe(25);
      expect(mockPrismaService.userSkillProgress.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            roadmapSkillId: { in: [11, 12] },
          }),
        }),
      );
    });

    it('should fallback to first system roadmap if user has no enrollment', async () => {
      mockPrismaService.progressStatus.findFirst.mockResolvedValue({ id: 1 });
      mockPrismaService.userSkillProgress.count.mockResolvedValue(2);
      mockPrismaService.userRoadmap.findFirst.mockResolvedValue(null);
      mockPrismaService.roadmap.findFirst.mockResolvedValue({ id: 200 });
      mockPrismaService.roadmapSkill.count.mockResolvedValue(4);
      mockPrismaService.roadmapSkill.findMany.mockResolvedValue([
        { id: 201 },
        { id: 202 },
      ]);

      const res = await service.getUserProgress('u1');
      expect(res.percentage).toBe(50);
      expect(res.totalSkills).toBe(4);
    });

    it('should return 0 percentage if no skills found', async () => {
      mockPrismaService.progressStatus.findFirst.mockResolvedValue({ id: 1 });
      mockPrismaService.userSkillProgress.count.mockResolvedValue(0);
      mockPrismaService.userRoadmap.findFirst.mockResolvedValue(null);
      mockPrismaService.roadmap.findFirst.mockResolvedValue(null);

      const res = await service.getUserProgress('u1');
      expect(res.percentage).toBe(0);
      expect(res.totalSkills).toBe(0);
    });
  });

  describe('syncRoadmapProgressPercentage', () => {
    it('should calculate and update progressPercentage using roadmapSkillIds', async () => {
      mockPrismaService.progressStatus.findFirst.mockResolvedValue({ id: 1 });
      mockPrismaService.roadmapSkill.count.mockResolvedValue(10);
      // Trả về id thay vì skillId
      mockPrismaService.roadmapSkill.findMany.mockResolvedValue([
        { id: 1 },
        { id: 2 },
      ]);
      mockPrismaService.userSkillProgress.count.mockResolvedValue(5);

      await service.syncRoadmapProgressPercentage('u1', 100);

      // Đảm bảo đếm progress qua roadmapSkillId
      expect(mockPrismaService.userSkillProgress.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            roadmapSkillId: { in: [1, 2] },
          }),
        }),
      );
      expect(mockPrismaService.userRoadmap.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'u1', roadmapId: 100 },
          data: { progressPercentage: 50 },
        }),
      );
    });

    it('should stop early if roadmap has no skills', async () => {
      mockPrismaService.roadmapSkill.count.mockResolvedValue(0);
      await service.syncRoadmapProgressPercentage('u1', 100);
      expect(mockPrismaService.userRoadmap.updateMany).not.toHaveBeenCalled();
    });
  });

  describe('getUserMultiRoadmapProgress', () => {
    it('should return breakdown using roadmapSkillIds for enrolled roadmaps', async () => {
      mockPrismaService.progressStatus.findFirst.mockResolvedValue({ id: 1 });
      mockPrismaService.userRoadmap.findMany.mockResolvedValue([
        { roadmapId: 1, roadmap: { id: 1, title: 'R1' } },
      ]);
      mockPrismaService.roadmapSkill.count.mockResolvedValue(10);
      mockPrismaService.roadmapSkill.findMany.mockResolvedValue([
        { id: 5 },
        { id: 6 },
      ]);
      mockPrismaService.userSkillProgress.count.mockResolvedValue(2);

      const res = await service.getUserMultiRoadmapProgress('u1');
      expect(res.roadmaps[0].percentage).toBe(20);
      expect(res.overall.percentage).toBe(20);
      // Đảm bảo sử dụng roadmapSkillId
      expect(mockPrismaService.userSkillProgress.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            roadmapSkillId: { in: [5, 6] },
          }),
        }),
      );
    });

    it('should group progress by each enrolled roadmap and keep overall totals accurate', async () => {
      mockPrismaService.progressStatus.findFirst.mockResolvedValue({ id: 1 });
      mockPrismaService.userRoadmap.findMany.mockResolvedValue([
        { roadmapId: 1, roadmap: { id: 1, title: 'Frontend Developer' } },
        { roadmapId: 2, roadmap: { id: 2, title: 'Backend Developer' } },
      ]);
      mockPrismaService.roadmapSkill.count
        .mockResolvedValueOnce(4)
        .mockResolvedValueOnce(6);
      mockPrismaService.roadmapSkill.findMany
        .mockResolvedValueOnce([{ id: 11 }, { id: 12 }, { id: 13 }, { id: 14 }])
        .mockResolvedValueOnce([
          { id: 21 },
          { id: 22 },
          { id: 23 },
          { id: 24 },
          { id: 25 },
          { id: 26 },
        ]);
      mockPrismaService.userSkillProgress.count
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(3);

      const res = await service.getUserMultiRoadmapProgress('u1');

      expect(res.roadmaps).toEqual([
        {
          roadmapId: '1',
          roadmapName: 'Frontend Developer',
          completedSkills: 2,
          totalSkills: 4,
          percentage: 50,
        },
        {
          roadmapId: '2',
          roadmapName: 'Backend Developer',
          completedSkills: 3,
          totalSkills: 6,
          percentage: 50,
        },
      ]);
      expect(res.overall).toEqual({
        completedSkills: 5,
        totalSkills: 10,
        percentage: 50,
      });
      expect(mockPrismaService.userSkillProgress.count).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          where: expect.objectContaining({
            roadmapSkillId: { in: [11, 12, 13, 14] },
          }),
        }),
      );
      expect(mockPrismaService.userSkillProgress.count).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          where: expect.objectContaining({
            roadmapSkillId: { in: [21, 22, 23, 24, 25, 26] },
          }),
        }),
      );
    });

    it('should fallback to all system roadmaps if user has no enrollments', async () => {
      mockPrismaService.progressStatus.findFirst.mockResolvedValue({ id: 1 });
      mockPrismaService.userRoadmap.findMany.mockResolvedValue([]);
      mockPrismaService.roadmap.findMany.mockResolvedValue([
        { id: 2, title: 'System Roadmap' },
      ]);
      mockPrismaService.roadmapSkill.count.mockResolvedValue(5);
      mockPrismaService.roadmapSkill.findMany.mockResolvedValue([]);
      mockPrismaService.userSkillProgress.count.mockResolvedValue(0);

      const res = await service.getUserMultiRoadmapProgress('u1');
      expect(res.roadmaps).toHaveLength(1);
      expect(res.roadmaps[0].roadmapName).toBe('System Roadmap');
    });
  });
});
