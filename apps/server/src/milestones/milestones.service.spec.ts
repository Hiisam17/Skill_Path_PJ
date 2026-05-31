import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MilestonesService } from './milestones.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MilestonesService', () => {
  let service: MilestonesService;

  const mockPrismaService = {
    profile: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    milestone: {
      findMany: jest.fn(),
    },
    userMilestone: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-05-31T08:00:00.000Z'));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MilestonesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MilestonesService>(MilestonesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateUserActivity', () => {
    it('should initialize streak for first activity', async () => {
      mockPrismaService.profile.findUnique.mockResolvedValue({
        userId: 'u1',
        lastActivityAt: null,
      });
      mockPrismaService.profile.update.mockResolvedValue({
        currentStreak: 1,
        longestStreak: 1,
      });

      const result = await service.updateUserActivity('u1');

      expect(result).toEqual({ currentStreak: 1, longestStreak: 1 });
      expect(mockPrismaService.profile.update).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        data: {
          currentStreak: 1,
          longestStreak: 1,
          lastActivityAt: new Date('2026-05-31T08:00:00.000Z'),
        },
      });
    });

    it('should leave streak unchanged for activity on the same day', async () => {
      const profile = {
        userId: 'u1',
        currentStreak: 3,
        longestStreak: 5,
        lastActivityAt: new Date('2026-05-31T01:00:00.000Z'),
      };
      mockPrismaService.profile.findUnique
        .mockResolvedValueOnce(profile)
        .mockResolvedValueOnce({
          ...profile,
          skillProgress: [],
          userMilestones: [],
        });
      mockPrismaService.milestone.findMany.mockResolvedValue([]);

      const result = await service.updateUserActivity('u1');

      expect(result).toBe(profile);
      expect(mockPrismaService.profile.update).not.toHaveBeenCalled();
    });

    it('should increment streak for activity on the next day', async () => {
      mockPrismaService.profile.findUnique
        .mockResolvedValueOnce({
          userId: 'u1',
          currentStreak: 3,
          longestStreak: 3,
          lastActivityAt: new Date('2026-05-30T03:00:00.000Z'),
        })
        .mockResolvedValueOnce({
          userId: 'u1',
          currentStreak: 4,
          skillProgress: [],
          userMilestones: [],
        });
      mockPrismaService.profile.update.mockResolvedValue({
        currentStreak: 4,
        longestStreak: 4,
      });
      mockPrismaService.milestone.findMany.mockResolvedValue([]);

      const result = await service.updateUserActivity('u1');

      expect(result).toEqual({ currentStreak: 4, longestStreak: 4 });
      expect(mockPrismaService.profile.update).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        data: {
          currentStreak: 4,
          longestStreak: 4,
          lastActivityAt: new Date('2026-05-31T08:00:00.000Z'),
        },
      });
    });

    it('should reset streak after a missed day', async () => {
      mockPrismaService.profile.findUnique
        .mockResolvedValueOnce({
          userId: 'u1',
          currentStreak: 8,
          longestStreak: 10,
          lastActivityAt: new Date('2026-05-20T03:00:00.000Z'),
        })
        .mockResolvedValueOnce({
          userId: 'u1',
          currentStreak: 1,
          skillProgress: [],
          userMilestones: [],
        });
      mockPrismaService.profile.update.mockResolvedValue({
        currentStreak: 1,
        longestStreak: 10,
      });
      mockPrismaService.milestone.findMany.mockResolvedValue([]);

      await service.updateUserActivity('u1');

      expect(mockPrismaService.profile.update).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        data: {
          currentStreak: 1,
          lastActivityAt: new Date('2026-05-31T08:00:00.000Z'),
        },
      });
    });

    it('should throw NotFoundException when profile does not exist', async () => {
      mockPrismaService.profile.findUnique.mockResolvedValue(null);

      await expect(service.updateUserActivity('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('checkAndUnlockMilestones', () => {
    it('should return without doing work when profile is missing', async () => {
      mockPrismaService.profile.findUnique.mockResolvedValue(null);

      await service.checkAndUnlockMilestones('missing');

      expect(mockPrismaService.milestone.findMany).not.toHaveBeenCalled();
    });

    it('should unlock eligible streak and skill milestones', async () => {
      mockPrismaService.profile.findUnique.mockResolvedValue({
        userId: 'u1',
        currentStreak: 7,
        skillProgress: [{ id: 1 }, { id: 2 }, { id: 3 }],
        userMilestones: [{ milestoneId: 99 }],
      });
      mockPrismaService.milestone.findMany.mockResolvedValue([
        { id: 1, criteria: { type: 'streak', value: 7 } },
        { id: 2, criteria: { type: 'skills', value: 3 } },
        { id: 3, criteria: { type: 'skills', value: 10 } },
        { id: 4, criteria: null },
      ]);
      mockPrismaService.userMilestone.create.mockResolvedValue({});

      await service.checkAndUnlockMilestones('u1');

      expect(mockPrismaService.milestone.findMany).toHaveBeenCalledWith({
        where: { id: { notIn: [99] } },
      });
      expect(mockPrismaService.userMilestone.create).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.userMilestone.create).toHaveBeenCalledWith({
        data: { userId: 'u1', milestoneId: 1 },
      });
      expect(mockPrismaService.userMilestone.create).toHaveBeenCalledWith({
        data: { userId: 'u1', milestoneId: 2 },
      });
    });

    it('should not unlock milestones when criteria are not met', async () => {
      mockPrismaService.profile.findUnique.mockResolvedValue({
        userId: 'u1',
        currentStreak: 2,
        skillProgress: [],
        userMilestones: [],
      });
      mockPrismaService.milestone.findMany.mockResolvedValue([
        { id: 1, criteria: { type: 'streak', value: 7 } },
      ]);

      await service.checkAndUnlockMilestones('u1');

      expect(mockPrismaService.userMilestone.create).not.toHaveBeenCalled();
    });

    it('should swallow milestone unlock errors after logging them', async () => {
      mockPrismaService.profile.findUnique.mockRejectedValue(
        new Error('database down'),
      );

      await expect(
        service.checkAndUnlockMilestones('u1'),
      ).resolves.not.toThrow();
    });
  });

  describe('getDashboardStats', () => {
    it('should return streak and unlocked milestone data', async () => {
      mockPrismaService.profile.findUnique.mockResolvedValue({
        currentStreak: 5,
        longestStreak: 9,
        lastActivityAt: new Date('2026-05-30T00:00:00.000Z'),
        userMilestones: [
          { milestone: { id: 1, name: '7 day streak' } },
          { milestone: { id: 2, name: '3 skills' } },
        ],
      });

      const result = await service.getDashboardStats('u1');

      expect(result).toEqual({
        streakData: {
          currentStreak: 5,
          longestStreak: 9,
          lastActivityAt: new Date('2026-05-30T00:00:00.000Z'),
        },
        unlockedMilestones: [
          { id: 1, name: '7 day streak' },
          { id: 2, name: '3 skills' },
        ],
      });
    });

    it('should throw NotFoundException when dashboard profile is missing', async () => {
      mockPrismaService.profile.findUnique.mockResolvedValue(null);

      await expect(service.getDashboardStats('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
