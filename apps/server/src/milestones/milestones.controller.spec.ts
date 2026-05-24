import { Test, TestingModule } from '@nestjs/testing';
import { MilestonesController } from './milestones.controller';
import { MilestonesService } from './milestones.service';

describe('MilestonesController', () => {
  let controller: MilestonesController;
  const mockMilestonesService = {
    getDashboardStats: jest.fn(),
    updateUserActivity: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MilestonesController],
      providers: [
        {
          provide: MilestonesService,
          useValue: mockMilestonesService,
        },
      ],
    }).compile();

    controller = module.get<MilestonesController>(MilestonesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
