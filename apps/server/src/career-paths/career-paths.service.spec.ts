import { Test, TestingModule } from '@nestjs/testing';
import { CareerPathsService } from './career-paths.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CareerPathsService', () => {
  let service: CareerPathsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    roadmap: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CareerPathsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CareerPathsService>(CareerPathsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all career paths sorted by name (Happy Path)', async () => {
      const mockResult = [
        { id: 1, name: 'Backend Developer', description: 'Logic & database' },
        { id: 2, name: 'Frontend Developer', description: 'Interface & experience' },
      ];
      mockPrismaService.roadmap.findMany.mockResolvedValue(
        mockResult.map((careerPath) => ({
          id: careerPath.id,
          title: careerPath.name,
          description: careerPath.description,
        })),
      );

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Backend Developer');
      expect(result[1].id).toBe("2");
      expect(mockPrismaService.roadmap.findMany).toHaveBeenCalledWith({
        where: { userId: null },
        orderBy: { title: 'asc' },
      });
    });

    it('should return an empty array if no records found', async () => {
      mockPrismaService.roadmap.findMany.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });

    it('should map null description to empty string', async () => {
      mockPrismaService.roadmap.findMany.mockResolvedValue([
        { id: 3, title: 'DevOps', description: null }
      ]);
      const result = await service.findAll();
      expect(result[0].description).toBe('');
    });
  });
});
