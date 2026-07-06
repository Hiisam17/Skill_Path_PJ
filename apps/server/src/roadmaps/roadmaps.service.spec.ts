import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { RoadmapsService } from './roadmaps.service';

describe('RoadmapsService', () => {
  let service: RoadmapsService;

  const mockPrisma = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoadmapsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<RoadmapsService>(RoadmapsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
