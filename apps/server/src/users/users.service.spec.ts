import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    roadmap: {
      findMany: jest.fn(),
    },
    userRoadmap: {
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('selectRoadmap', () => {
    const userId = 'user-123';
    const careerPathId = '1';

    it('should successfully associate user with a system roadmap (Happy Path)', async () => {
      mockPrismaService.roadmap.findMany.mockResolvedValue([{ id: 10, title: 'Roadmap 1' }]);
      mockPrismaService.userRoadmap.upsert.mockResolvedValue({});

      const result = await service.selectRoadmap(userId, { careerPathId });

      expect(result).toEqual({ id: 10, title: 'Roadmap 1' });
      expect(prisma.roadmap.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { careerPathId: 1, userId: null },
        orderBy: { id: 'asc' },
        take: 1,
      }));
      expect(prisma.userRoadmap.upsert).toHaveBeenCalledWith(expect.objectContaining({
        where: { userId_roadmapId: { userId, roadmapId: 10 } }
      }));
    });

    it('should throw error if careerPathId is not a number (Edge case)', async () => {
      await expect(service.selectRoadmap(userId, { careerPathId: 'invalid' }))
        .rejects.toThrow('Invalid careerPathId');
    });

    it('should throw error if no system roadmap found for career path (Edge case)', async () => {
      mockPrismaService.roadmap.findMany.mockResolvedValue([]);
      await expect(service.selectRoadmap(userId, { careerPathId }))
        .rejects.toThrow('No roadmap found for this career path');
    });
  });

  describe('getSelectedRoadmap', () => {
    it('should throw "Not implemented" error', async () => {
      await expect(service.getSelectedRoadmap('u1')).rejects.toThrow('Not implemented');
    });
  });
});
