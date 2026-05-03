import { Test, TestingModule } from '@nestjs/testing';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';
import { ProgressService } from '../progress/progress.service';

describe('SkillsController', () => {
  let controller: SkillsController;
  let skillsService: SkillsService;
  let progressService: ProgressService;

  const mockSkillsService = {
    findSkillsByRoadmap: jest.fn(),
    getSkillDetail: jest.fn(),
  };

  const mockProgressService = {
    getDemoUserId: jest.fn().mockResolvedValue('demo-id'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SkillsController],
      providers: [
        {
          provide: SkillsService,
          useValue: mockSkillsService,
        },
        {
          provide: ProgressService,
          useValue: mockProgressService,
        },
      ],
    }).compile();

    controller = module.get<SkillsController>(SkillsController);
    skillsService = module.get<SkillsService>(SkillsService);
    progressService = module.get<ProgressService>(ProgressService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSkillsByRoadmap', () => {
    it('should fetch demo user ID and call skillsService.findSkillsByRoadmap', async () => {
      await controller.getSkillsByRoadmap(1);
      expect(progressService.getDemoUserId).toHaveBeenCalled();
      expect(skillsService.findSkillsByRoadmap).toHaveBeenCalledWith(1, 'demo-id');
    });
  });

  describe('getSkillDetail', () => {
    it('should fetch demo user ID and call skillsService.getSkillDetail', async () => {
      await controller.getSkillDetail(10);
      expect(progressService.getDemoUserId).toHaveBeenCalled();
      expect(skillsService.getSkillDetail).toHaveBeenCalledWith(10, 'demo-id');
    });
  });
});
