import { Test, TestingModule } from '@nestjs/testing';
import { CareerPathsController } from './career-paths.controller';
import { CareerPathsService } from './career-paths.service';

describe('CareerPathsController', () => {
  let controller: CareerPathsController;
  let service: CareerPathsService;

  const mockCareerPathsService = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CareerPathsController],
      providers: [
        {
          provide: CareerPathsService,
          useValue: mockCareerPathsService,
        },
      ],
    }).compile();

    controller = module.get<CareerPathsController>(CareerPathsController);
    service = module.get<CareerPathsService>(CareerPathsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call careerPathsService.findAll', async () => {
      await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
    });
  });
});
