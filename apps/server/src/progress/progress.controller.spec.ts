import { BadRequestException, HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { ProgressQueueService } from './progress-queue.service';
import { UserSkillStatus } from '../types';

describe('ProgressController', () => {
  let controller: ProgressController;

  const mockProgressService = {
    getStatusId: jest.fn(),
    updateSkillStatus: jest.fn(),
    resetSkillStatus: jest.fn(),
    getUserProgress: jest.fn(),
    getUserMultiRoadmapProgress: jest.fn(),
  };

  const mockProgressQueueService = {
    enqueueProgress: jest.fn(),
  };

  const request = { user: { id: 'user-1' } } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgressController],
      providers: [
        { provide: ProgressService, useValue: mockProgressService },
        { provide: ProgressQueueService, useValue: mockProgressQueueService },
      ],
    }).compile();

    controller = module.get<ProgressController>(ProgressController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('batchSyncProgress', () => {
    it('should return early for an empty sync list', async () => {
      await expect(controller.batchSyncProgress([], request)).resolves.toEqual({
        synced: 0,
        message: 'No items to sync',
      });
    });

    it('should sync status enum and enqueue progress recalculation', async () => {
      mockProgressService.getStatusId.mockResolvedValue(1);
      mockProgressService.updateSkillStatus.mockResolvedValue({});

      const result = await controller.batchSyncProgress(
        [{ roadmapSkillId: 10, status: UserSkillStatus.COMPLETED }],
        request,
      );

      expect(result).toEqual({ synced: 1, errors: 0, total: 1 });
      expect(mockProgressService.getStatusId).toHaveBeenCalledWith(
        UserSkillStatus.COMPLETED,
      );
      expect(mockProgressService.updateSkillStatus).toHaveBeenCalledWith(
        'user-1',
        10,
        1,
      );
      expect(mockProgressQueueService.enqueueProgress).toHaveBeenCalledWith(
        'user-1',
        10,
      );
    });

    it('should sync a direct statusId when no status enum is provided', async () => {
      mockProgressService.updateSkillStatus.mockResolvedValue({});

      const result = await controller.batchSyncProgress(
        [{ roadmapSkillId: 11, statusId: 2 }],
        request,
      );

      expect(result.synced).toBe(1);
      expect(mockProgressService.updateSkillStatus).toHaveBeenCalledWith(
        'user-1',
        11,
        2,
      );
    });

    it('should reset progress when status is null', async () => {
      mockProgressService.resetSkillStatus.mockResolvedValue(undefined);

      const result = await controller.batchSyncProgress(
        [{ roadmapSkillId: 12, status: null }],
        request,
      );

      expect(result.synced).toBe(1);
      expect(mockProgressService.resetSkillStatus).toHaveBeenCalledWith(
        'user-1',
        12,
      );
    });

    it('should count item-level errors without failing the full batch', async () => {
      mockProgressService.updateSkillStatus.mockRejectedValue(
        new Error('bad item'),
      );

      const result = await controller.batchSyncProgress(
        [{ roadmapSkillId: 13, statusId: 1 }],
        request,
      );

      expect(result).toEqual({ synced: 0, errors: 1, total: 1 });
      expect(mockProgressQueueService.enqueueProgress).not.toHaveBeenCalled();
    });
  });

  describe('updateSkillStatus', () => {
    it('should update one skill using a status enum', async () => {
      mockProgressService.getStatusId.mockResolvedValue(1);
      mockProgressService.updateSkillStatus.mockResolvedValue({
        roadmapSkillId: '10',
        status: UserSkillStatus.COMPLETED,
      });

      const result = await controller.updateSkillStatus(
        10,
        UserSkillStatus.COMPLETED,
        undefined,
        request,
      );

      expect(result.status).toBe(UserSkillStatus.COMPLETED);
      expect(mockProgressQueueService.enqueueProgress).toHaveBeenCalledWith(
        'user-1',
        10,
      );
    });

    it('should update one skill using a numeric statusId', async () => {
      mockProgressService.updateSkillStatus.mockResolvedValue({
        roadmapSkillId: '10',
        status: UserSkillStatus.IN_PROGRESS,
      });

      const result = await controller.updateSkillStatus(
        10,
        undefined,
        2,
        request,
      );

      expect(result.status).toBe(UserSkillStatus.IN_PROGRESS);
      expect(mockProgressService.updateSkillStatus).toHaveBeenCalledWith(
        'user-1',
        10,
        2,
      );
    });

    it('should reject a missing status', async () => {
      await expect(
        controller.updateSkillStatus(10, undefined, undefined, request),
      ).rejects.toThrow(BadRequestException);
    });

    it('should rethrow known HTTP exceptions', async () => {
      const error = new BadRequestException('bad status');
      mockProgressService.updateSkillStatus.mockRejectedValue(error);

      await expect(
        controller.updateSkillStatus(10, undefined, 1, request),
      ).rejects.toBe(error);
    });

    it('should wrap unexpected errors as HTTP 500', async () => {
      mockProgressService.updateSkillStatus.mockRejectedValue(
        new Error('database down'),
      );

      await expect(
        controller.updateSkillStatus(10, undefined, 1, request),
      ).rejects.toBeInstanceOf(HttpException);
    });
  });

  it('should reset a skill status and enqueue progress recalculation', async () => {
    mockProgressService.resetSkillStatus.mockResolvedValue(undefined);

    await controller.resetSkillStatus(10, request);

    expect(mockProgressService.resetSkillStatus).toHaveBeenCalledWith(
      'user-1',
      10,
    );
    expect(mockProgressQueueService.enqueueProgress).toHaveBeenCalledWith(
      'user-1',
      10,
    );
  });

  it('should return current user progress', async () => {
    mockProgressService.getUserProgress.mockResolvedValue({
      completedSkills: 2,
      totalSkills: 4,
      percentage: 50,
    });

    await expect(controller.getUserProgress(request)).resolves.toEqual({
      completedSkills: 2,
      totalSkills: 4,
      percentage: 50,
    });
  });

  it('should return multi-roadmap progress', async () => {
    mockProgressService.getUserMultiRoadmapProgress.mockResolvedValue({
      overall: { completedSkills: 2, totalSkills: 4, percentage: 50 },
      roadmaps: [],
    });

    await expect(
      controller.getUserMultiRoadmapProgress(request),
    ).resolves.toEqual({
      overall: { completedSkills: 2, totalSkills: 4, percentage: 50 },
      roadmaps: [],
    });
  });
});
