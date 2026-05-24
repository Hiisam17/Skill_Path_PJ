import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ProgressService } from '../progress/progress.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;
  let progressService: ProgressService;
  const req = { user: { id: 'user-id' } } as any;

  const mockUsersService = {
    selectRoadmap: jest.fn(),
    updateProfile: jest.fn(),
  };

  const mockProgressService = {
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
    it('should fetch progress for the authenticated user', async () => {
      await controller.getProgress(req);
      expect(progressService.getUserMultiRoadmapProgress).toHaveBeenCalledWith('user-id');
    });
  });

  describe('selectRoadmap', () => {
    it('should call usersService.selectRoadmap and return the selected roadmap title', async () => {
      const dto = { careerPathId: '1' };
      mockUsersService.selectRoadmap.mockResolvedValue({ id: 10, title: 'Roadmap 1' });

      const result = await controller.selectRoadmap(dto, req);

      expect(result).toEqual({ roadmapId: 10, roadmapTitle: 'Roadmap 1' });
      expect(usersService.selectRoadmap).toHaveBeenCalledWith('user-id', dto);
    });
  });

  describe('updateProfile', () => {
    it('should call usersService.updateProfile for the authenticated user', async () => {
      const dto = { fullName: 'Test User' };
      mockUsersService.updateProfile.mockResolvedValue({ userId: 'user-id', ...dto });

      const result = await controller.updateProfile(dto, req);

      expect(result).toEqual({ userId: 'user-id', ...dto });
      expect(usersService.updateProfile).toHaveBeenCalledWith('user-id', dto);
    });
  });
});
