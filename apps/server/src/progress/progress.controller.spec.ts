import { Test, TestingModule } from '@nestjs/testing';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';

describe('ProgressController', () => {
  let controller: ProgressController;

  // 1. Tạo mock giả lập cho ProgressService
  const mockProgressService = {
    completeSkill: jest.fn(),
    getUserProgress: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgressController],
      // 2. Khai báo provider bằng bản mock
      providers: [
        { provide: ProgressService, useValue: mockProgressService }
      ],
    }).compile();

    controller = module.get<ProgressController>(ProgressController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});