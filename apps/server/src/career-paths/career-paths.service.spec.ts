import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { CareerPathsService } from './career-paths.service';

describe('CareerPathsService', () => {
  let service: CareerPathsService;

  const mockPrisma = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CareerPathsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CareerPathsService>(CareerPathsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
