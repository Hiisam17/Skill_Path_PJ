import { Test, TestingModule } from '@nestjs/testing';
import { MilestonesService } from './milestones.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MilestonesService', () => {
  let service: MilestonesService;
  const mockPrismaService = {
    profile: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    milestone: {
      findMany: jest.fn(),
    },
    userMilestone: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MilestonesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MilestonesService>(MilestonesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
