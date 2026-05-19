import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ProgressService } from '../progress/progress.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;
  let progressService: ProgressService;

  const mockUsersService = {
    selectRoadmap: jest.fn(),
  };

  const mockProgressService = {
    getDemoUserId: jest.fn().mockResolvedValue('demo-id'),
    getUserMultiRoadmapProgress: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: ProgressService,
          useValue: mockProgressService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
    progressService = module.get<ProgressService>(ProgressService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProgress', () => {
    it('should fetch progress for demo user', async () => {
      await controller.getProgress();
      expect(progressService.getDemoUserId).toHaveBeenCalled();
      expect(progressService.getUserMultiRoadmapProgress).toHaveBeenCalledWith('demo-id');
    });
  });

  describe('selectRoadmap', () => {
    it('should call usersService.selectRoadmap and return the selected roadmap title', async () => {
      const dto = { careerPathId: '1' };
      mockUsersService.selectRoadmap.mockResolvedValue({ id: 10, title: 'Roadmap 1' });

      const result = await controller.selectRoadmap(dto);

      expect(result).toEqual({ roadmapId: 10, roadmapTitle: 'Roadmap 1' });
      expect(usersService.selectRoadmap).toHaveBeenCalledWith('demo-id', dto);
    });
  });
});
