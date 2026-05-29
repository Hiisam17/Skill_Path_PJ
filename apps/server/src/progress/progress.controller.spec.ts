import { Test, TestingModule } from '@nestjs/testing';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { ProgressQueueService } from './progress-queue.service';
import { jest } from '@jest/globals';
describe('ProgressController', () => {
  let controller: ProgressController;

  // 1. Tạo mock giả lập cho ProgressService
  const mockProgressService = {
    completeSkill: jest.fn(),
    getUserProgress: jest.fn(),
  };

  const mockProgressQueueService = {
    enqueueProgress: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgressController],
      // 2. Khai báo provider bằng bản mock
      providers: [
        { provide: ProgressService, useValue: mockProgressService },
        { provide: ProgressQueueService, useValue: mockProgressQueueService },
      ],
    }).compile();

    controller = module.get<ProgressController>(ProgressController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
