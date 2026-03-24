import { Test, TestingModule } from '@nestjs/testing';
import { CareerPathsController } from './career-paths.controller';

describe('CareerPathsController', () => {
  let controller: CareerPathsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CareerPathsController],
    }).compile();

    controller = module.get<CareerPathsController>(CareerPathsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
