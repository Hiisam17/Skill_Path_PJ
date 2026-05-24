import { Test, TestingModule } from '@nestjs/testing';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';

describe('SkillsController', () => {
  let controller: SkillsController;
  let skillsService: SkillsService;
  const req = { user: { id: 'user-id' } } as any;

  const mockSkillsService = {
    findSkillsByRoadmap: jest.fn(),
    getSkillDetail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SkillsController],
      providers: [
        {
          provide: SkillsService,
          useValue: mockSkillsService,
        },
      ],
    }).compile();

    controller = module.get<SkillsController>(SkillsController);
    skillsService = module.get<SkillsService>(SkillsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSkillsByRoadmap', () => {
    it('should call skillsService.findSkillsByRoadmap for the authenticated user', async () => {
      await controller.getSkillsByRoadmap(1, req);
      expect(skillsService.findSkillsByRoadmap).toHaveBeenCalledWith(1, 'user-id');
    });
  });

  describe('getSkillDetail', () => {
    it('should call skillsService.getSkillDetail for the authenticated user', async () => {
      await controller.getSkillDetail(10, req);
      expect(skillsService.getSkillDetail).toHaveBeenCalledWith(10, 'user-id');
    });
  });
});
