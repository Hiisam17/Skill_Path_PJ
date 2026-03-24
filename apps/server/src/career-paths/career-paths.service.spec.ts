import { Test, TestingModule } from '@nestjs/testing';
import { CareerPathsService } from './career-paths.service';

describe('CareerPathsService', () => {
  let service: CareerPathsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CareerPathsService],
    }).compile();

    service = module.get<CareerPathsService>(CareerPathsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
