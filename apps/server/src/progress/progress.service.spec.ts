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
    it('should upsert and return COMPLETED status ID', async () => {
      mockPrismaService.progressStatus.upsert.mockResolvedValue({ id: 1 });
      const id = await service.getCompletedStatusId();
      expect(id).toBe(1);
      expect(mockPrismaService.progressStatus.upsert).toHaveBeenCalledWith(expect.objectContaining({
        where: { name: 'COMPLETED' }
      }));
    });

    it('should use cache on subsequent calls', async () => {
      mockPrismaService.progressStatus.upsert.mockResolvedValue({ id: 1 });
      await service.getCompletedStatusId();
      await service.getCompletedStatusId();
      expect(mockPrismaService.progressStatus.upsert).toHaveBeenCalledTimes(1);
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
      mockPrismaService.profile.findUnique.mockResolvedValue({ userId: 'user-123' });
      const id = await service.getDemoUserId();
      expect(id).toBe('user-123');
    });

    it('should create profile if env var is set but not in DB', async () => {
      process.env.DEMO_USER_ID = 'new-user';
      mockPrismaService.profile.findUnique.mockResolvedValue(null);
      mockPrismaService.profile.create.mockResolvedValue({ userId: 'new-user' });
      const id = await service.getDemoUserId();
      expect(id).toBe('new-user');
      expect(mockPrismaService.profile.create).toHaveBeenCalled();
    });

    it('should fallback to most recent profile if no env var', async () => {
      delete process.env.DEMO_USER_ID;
      mockPrismaService.profile.findFirst.mockResolvedValue({ userId: 'fallback-user' });
      const id = await service.getDemoUserId();
      expect(id).toBe('fallback-user');
      expect(mockPrismaService.profile.findFirst).toHaveBeenCalledWith(expect.objectContaining({
        orderBy: { updatedAt: 'desc' }
      }));
    });

    it('should throw NotFoundException if no profile found', async () => {
      delete process.env.DEMO_USER_ID;
      mockPrismaService.profile.findFirst.mockResolvedValue(null);
      await expect(service.getDemoUserId()).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateSkillStatus', () => {
    it('should update roadmap skill status successfully (Happy Path)', async () => {
      mockPrismaService.roadmapSkill.findUnique.mockResolvedValue({ id: 10 });
      mockPrismaService.progressStatus.upsert.mockResolvedValue({ id: 1 }); // Completed ID
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
      mockPrismaService.roadmapSkill.findUnique.mockResolvedValue({ id: 10 });
      mockPrismaService.progressStatus.upsert.mockResolvedValue({ id: 1 });
      mockPrismaService.userSkillProgress.upsert.mockResolvedValue({
        id: 1, userId: 'u1', roadmapSkillId: 10,
        status: { name: 'IN_PROGRESS' }, completedAt: null,
      });

      await service.updateSkillStatus('u1', 10, 2);
      expect(mockPrismaService.userSkillProgress.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId_roadmapSkillId: { userId: 'u1', roadmapSkillId: 10 } },
        })
      );
    });

    it('should throw NotFoundException if roadmapSkill does not exist', async () => {
      mockPrismaService.roadmapSkill.findUnique.mockResolvedValue(null);
      await expect(service.updateSkillStatus('u1', 99, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('resetSkillStatus', () => {
    it('should call delete with userId_roadmapSkillId unique key', async () => {
      mockPrismaService.userSkillProgress.delete.mockResolvedValue({});
      await service.resetSkillStatus('u1', 10);
      expect(mockPrismaService.userSkillProgress.delete).toHaveBeenCalledWith({
        where: { userId_roadmapSkillId: { userId: 'u1', roadmapSkillId: 10 } }
      });
    });

    it('should handle deletion error silently (Edge case)', async () => {
      mockPrismaService.userSkillProgress.delete.mockRejectedValue(new Error('Record not found'));
      await expect(service.resetSkillStatus('u1', 10)).resolves.not.toThrow();
    });
  });

  describe('getUserProgress', () => {
    it('should calculate percentage based on user roadmap enrollment', async () => {
      mockPrismaService.progressStatus.upsert.mockResolvedValue({ id: 1 });
      mockPrismaService.userSkillProgress.count.mockResolvedValue(5);
      mockPrismaService.userRoadmap.findFirst.mockResolvedValue({ roadmapId: 100 });
      mockPrismaService.roadmapSkill.count.mockResolvedValue(10);

      const res = await service.getUserProgress('u1');
      expect(res.percentage).toBe(50);
      expect(res.totalSkills).toBe(10);
      expect(res.completedSkills).toBe(5);
    });

    it('should fallback to first system roadmap if user has no enrollment', async () => {
      mockPrismaService.progressStatus.upsert.mockResolvedValue({ id: 1 });
      mockPrismaService.userSkillProgress.count.mockResolvedValue(2);
      mockPrismaService.userRoadmap.findFirst.mockResolvedValue(null);
      mockPrismaService.roadmap.findFirst.mockResolvedValue({ id: 200 });
      mockPrismaService.roadmapSkill.count.mockResolvedValue(4);

      const res = await service.getUserProgress('u1');
      expect(res.percentage).toBe(50);
      expect(res.totalSkills).toBe(4);
    });

    it('should return 0 percentage if no skills found', async () => {
      mockPrismaService.progressStatus.upsert.mockResolvedValue({ id: 1 });
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
      mockPrismaService.progressStatus.upsert.mockResolvedValue({ id: 1 });
      mockPrismaService.roadmapSkill.count.mockResolvedValue(10);
      // Trả về id thay vì skillId
      mockPrismaService.roadmapSkill.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      mockPrismaService.userSkillProgress.count.mockResolvedValue(5);

      await service.syncRoadmapProgressPercentage('u1', 100);

      // Đảm bảo đếm progress qua roadmapSkillId
      expect(mockPrismaService.userSkillProgress.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            roadmapSkillId: { in: [1, 2] },
          }),
        })
      );
      expect(mockPrismaService.userRoadmap.updateMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { userId: 'u1', roadmapId: 100 },
        data: { progressPercentage: 50 }
      }));
    });

    it('should stop early if roadmap has no skills', async () => {
      mockPrismaService.roadmapSkill.count.mockResolvedValue(0);
      await service.syncRoadmapProgressPercentage('u1', 100);
      expect(mockPrismaService.userRoadmap.updateMany).not.toHaveBeenCalled();
    });
  });

  describe('getUserMultiRoadmapProgress', () => {
    it('should return breakdown using roadmapSkillIds for enrolled roadmaps', async () => {
      mockPrismaService.progressStatus.upsert.mockResolvedValue({ id: 1 });
      mockPrismaService.userRoadmap.findMany.mockResolvedValue([
        { roadmapId: 1, roadmap: { id: 1, title: 'R1' } }
      ]);
      mockPrismaService.roadmapSkill.count.mockResolvedValue(10);
      mockPrismaService.roadmapSkill.findMany.mockResolvedValue([{ id: 5 }, { id: 6 }]);
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
        })
      );
    });

    it('should fallback to all system roadmaps if user has no enrollments', async () => {
      mockPrismaService.progressStatus.upsert.mockResolvedValue({ id: 1 });
      mockPrismaService.userRoadmap.findMany.mockResolvedValue([]);
      mockPrismaService.roadmap.findMany.mockResolvedValue([
        { id: 2, title: 'System Roadmap' }
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
