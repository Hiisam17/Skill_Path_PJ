import { Test, TestingModule } from '@nestjs/testing';
import { ProgressQueueService } from './progress-queue.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProgressService } from './progress.service';
import { Logger } from '@nestjs/common';

describe('ProgressQueueService', () => {
  let service: ProgressQueueService;
  let prisma: PrismaService;
  let progressService: ProgressService;

  const mockPrismaService = {
    userSkillProgress: {
      createMany: jest.fn(),
    },
    roadmapSkill: {
      findMany: jest.fn(),
    },
  };

  const mockProgressService = {
    getCompletedStatusId: jest.fn().mockResolvedValue(1),
    syncRoadmapProgressPercentage: jest.fn().mockResolvedValue(undefined),
  };

  // Mock logger to avoid noisy output during tests
  jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
  jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressQueueService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ProgressService,
          useValue: mockProgressService,
        },
      ],
    }).compile();

    service = module.get<ProgressQueueService>(ProgressQueueService);
    prisma = module.get<PrismaService>(PrismaService);
    progressService = module.get<ProgressService>(ProgressService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    (service as any).cacheQueue.clear();
  });

  describe('enqueueProgress', () => {
    it('should add items to the internal cache queue', () => {
      service.enqueueProgress('user1', 10);
      expect((service as any).cacheQueue.size).toBe(1);
      expect((service as any).cacheQueue.get('user1:10')).toEqual({ userId: 'user1', roadmapSkillId: 10 });
    });

    it('should overwrite existing entry for same user and roadmapSkill (Deduplication)', () => {
      service.enqueueProgress('user1', 10);
      service.enqueueProgress('user1', 10);
      expect((service as any).cacheQueue.size).toBe(1);
    });
  });

  describe('flushQueueToDatabase', () => {
    it('should stop early if queue is empty', async () => {
      await service.flushQueueToDatabase();
      expect(mockPrismaService.userSkillProgress.createMany).not.toHaveBeenCalled();
    });

    it('should process queue items and sync roadmap percentages', async () => {
      service.enqueueProgress('user1', 10);
      mockPrismaService.roadmapSkill.findMany.mockResolvedValue([
        { section: { roadmapId: 1 } }
      ]);

      await service.flushQueueToDatabase();

      expect(mockPrismaService.userSkillProgress.createMany).toHaveBeenCalled();
      expect(mockProgressService.syncRoadmapProgressPercentage).toHaveBeenCalledWith('user1', 1);
      expect((service as any).cacheQueue.size).toBe(0);
    });

    it('should handle errors during flushing', async () => {
      service.enqueueProgress('user1', 10);
      mockPrismaService.userSkillProgress.createMany.mockRejectedValue(new Error('DB Error'));

      await expect(service.flushQueueToDatabase()).resolves.not.toThrow();
      // Even if it fails, queue should be cleared in current implementation (or retried)
    });
  });
});
