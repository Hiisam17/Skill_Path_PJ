import { Test, TestingModule } from '@nestjs/testing';
import { RoadmapsController } from './roadmaps.controller';
import { RoadmapsService } from './roadmaps.service';

describe('RoadmapsController', () => {
  let controller: RoadmapsController;
  let roadmapsService: RoadmapsService;
  const req = { user: { id: 'user-id' } } as any;

  let mockRoadmapsService: {
    findAllCareerPaths: jest.Mock;
    getSystemRoadmapsByCareerPath: jest.Mock;
    findAll: jest.Mock;
    findByCareerPath: jest.Mock;
    getRoadmapFlow: jest.Mock;
    findByTitle: jest.Mock;
  };

  beforeEach(async () => {
    mockRoadmapsService = {
      findAllCareerPaths: jest.fn().mockResolvedValue([]),
      getSystemRoadmapsByCareerPath: jest.fn(),
      findAll: jest.fn(),
      findByCareerPath: jest.fn(),
      getRoadmapFlow: jest.fn().mockResolvedValue({}),
      findByTitle: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoadmapsController],
      providers: [
        {
          provide: RoadmapsService,
          useValue: mockRoadmapsService,
        },
      ],
    }).compile();

    controller = module.get<RoadmapsController>(RoadmapsController);
    roadmapsService = module.get<RoadmapsService>(RoadmapsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCareerPaths', () => {
    it('should call roadmapsService.findAllCareerPaths', async () => {
      await controller.getCareerPaths();
      expect(roadmapsService.findAllCareerPaths).toHaveBeenCalled();
    });
  });

  describe('getRoadmapFlow', () => {
    it('should call roadmapsService.getRoadmapFlow for the authenticated user', async () => {
      await controller.getRoadmapFlow('javascript', req);
      expect(roadmapsService.getRoadmapFlow).toHaveBeenCalledWith('javascript', 'user-id');
    });
  });

  describe('findByTitle', () => {
    it('should call roadmapsService.findByTitle with the route title', async () => {
      const roadmap = { id: '1', careerPathId: '10', level: '1' };
      mockRoadmapsService.findByTitle.mockResolvedValue(roadmap);

      const result = await controller.findByTitle('javascript');

      expect(result).toBe(roadmap);
      expect(roadmapsService.findByTitle).toHaveBeenCalledWith('javascript');
    });
  });
});
