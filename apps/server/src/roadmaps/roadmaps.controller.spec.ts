import { Test, TestingModule } from '@nestjs/testing';
import { RoadmapsController } from './roadmaps.controller';
import { RoadmapsService } from './roadmaps.service';
import { ProgressService } from '../progress/progress.service';

describe('RoadmapsController', () => {
  let controller: RoadmapsController;
  let roadmapsService: RoadmapsService;
  let progressService: ProgressService;

  let mockRoadmapsService: {
    findAllCareerPaths: jest.Mock;
    getSystemRoadmapsByCareerPath: jest.Mock;
    findAll: jest.Mock;
    findByCareerPath: jest.Mock;
    getRoadmapFlow: jest.Mock;
    findByTitle: jest.Mock;
  };

  let mockProgressService: {
    getDemoUserId: jest.Mock;
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

    mockProgressService = {
      getDemoUserId: jest.fn().mockResolvedValue('demo-id'),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoadmapsController],
      providers: [
        {
          provide: RoadmapsService,
          useValue: mockRoadmapsService,
        },
        {
          provide: ProgressService,
          useValue: mockProgressService,
        },
      ],
    }).compile();

    controller = module.get<RoadmapsController>(RoadmapsController);
    roadmapsService = module.get<RoadmapsService>(RoadmapsService);
    progressService = module.get<ProgressService>(ProgressService);
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
    it('should fetch demo user ID and call roadmapsService.getRoadmapFlow', async () => {
      await controller.getRoadmapFlow('javascript');
      expect(progressService.getDemoUserId).toHaveBeenCalled();
      expect(roadmapsService.getRoadmapFlow).toHaveBeenCalledWith('javascript', 'demo-id');
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
