import { Test, TestingModule } from '@nestjs/testing';
import { RoadmapsController } from './roadmaps.controller';
import { RoadmapsService } from './roadmaps.service';
import { ProgressService } from '../progress/progress.service';

describe('RoadmapsController', () => {
  let controller: RoadmapsController;
  let roadmapsService: RoadmapsService;
  let progressService: ProgressService;

  const mockRoadmapsService = {
    findAllCareerPaths: jest.fn(),
    getSystemRoadmapsByCareerPath: jest.fn(),
    findAll: jest.fn(),
    findByCareerPath: jest.fn(),
    getRoadmapFlow: jest.fn(),
    findById: jest.fn(),
  };

  const mockProgressService = {
    getDemoUserId: jest.fn().mockResolvedValue('demo-id'),
  };

  beforeEach(async () => {
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
      await controller.getRoadmapFlow(1);
      expect(progressService.getDemoUserId).toHaveBeenCalled();
      expect(roadmapsService.getRoadmapFlow).toHaveBeenCalledWith(1, 'demo-id');
    });
  });
});
