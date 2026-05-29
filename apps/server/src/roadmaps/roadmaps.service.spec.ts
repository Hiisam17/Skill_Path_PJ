import { Test, TestingModule } from '@nestjs/testing';
import { RoadmapsService } from './roadmaps.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('RoadmapsService', () => {
  let service: RoadmapsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    roadmap: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    careerPath: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoadmapsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RoadmapsService>(RoadmapsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('findAll', () => {
    it('should return all roadmaps (Happy Path)', async () => {
      mockPrismaService.roadmap.findMany.mockResolvedValue([
        { id: 1, title: 'Roadmap 1', careerPathId: 10 }
      ]);
      const res = await service.findAll();
      expect(res).toHaveLength(1);
      expect(res[0].id).toBe("1");
    });
  });

  describe('findByTitle', () => {
    it('should return roadmap by title (Happy Path)', async () => {
      mockPrismaService.roadmap.findUnique.mockResolvedValue({ id: 1, title: 'Roadmap 1', careerPathId: 10 });
      const res = await service.findByTitle('Roadmap 1');
      expect(res.id).toBe("1");
      expect(prisma.roadmap.findUnique).toHaveBeenCalledWith({ where: { title: 'Roadmap 1' } });
    });

    it('should throw NotFoundException if roadmap missing (Edge case)', async () => {
      mockPrismaService.roadmap.findUnique.mockResolvedValue(null);
      await expect(service.findByTitle('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getRoadmapFlow', () => {
    it('should transform roadmap to React Flow format (Happy Path)', async () => {
      mockPrismaService.roadmap.findUnique.mockResolvedValue({
        id: 1,
        title: 'Roadmap 1',
        sections: [
          {
            id: 10,
            title: 'Section 1',
            sortOrder: 1,
            skills: [
              {
                id: 100,
                isOptional: false,
                skill: { id: 1001, name: 'Skill 1' },
                userProgress: []
              }
            ]
          }
        ]
      });

      const res = await service.getRoadmapFlow('Roadmap 1', 'u1');
      expect(prisma.roadmap.findUnique).toHaveBeenCalledWith(expect.objectContaining({
        where: { title: 'Roadmap 1' },
      }));
      expect(res.nodes).toHaveLength(2); // 1 section + 1 skill
      expect(res.nodes[1].id).toBe("100"); // RoadmapSkill ID
      expect(res.nodes[1].data.roadmapSkillId).toBe(100);
      expect(res.edges).toHaveLength(1);
      expect(res.edges[0].target).toBe("100");
    });
  });
});
