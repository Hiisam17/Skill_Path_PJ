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
        { id: 1, title: 'Roadmap 1', careerPathId: 10 },
      ]);
      const res = await service.findAll();
      expect(res).toHaveLength(1);
      expect(res[0].id).toBe('1');
    });

    it('should infer roadmap levels from titles', async () => {
      mockPrismaService.roadmap.findMany.mockResolvedValue([
        { id: 1, title: 'Frontend Beginner', careerPathId: 10 },
        { id: 2, title: 'Backend Intermediate', careerPathId: 10 },
        { id: 3, title: 'DevOps Advanced', careerPathId: 20 },
      ]);

      const res = await service.findAll();

      expect(res.map((roadmap) => roadmap.level)).toEqual(['1', '2', '3']);
    });

    it('should map null careerPathId to an empty string', async () => {
      mockPrismaService.roadmap.findMany.mockResolvedValue([
        { id: 1, title: 'System Roadmap', careerPathId: null },
      ]);

      const res = await service.findAll();

      expect(res[0].careerPathId).toBe('');
    });
  });

  describe('findByTitle', () => {
    it('should return roadmap by title (Happy Path)', async () => {
      mockPrismaService.roadmap.findUnique.mockResolvedValue({
        id: 1,
        title: 'Roadmap 1',
        careerPathId: 10,
      });
      const res = await service.findByTitle('Roadmap 1');
      expect(res.id).toBe('1');
      expect(prisma.roadmap.findUnique).toHaveBeenCalledWith({
        where: { title: 'Roadmap 1' },
      });
    });

    it('should throw NotFoundException if roadmap missing (Edge case)', async () => {
      mockPrismaService.roadmap.findUnique.mockResolvedValue(null);
      await expect(service.findByTitle('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByCareerPath', () => {
    it('should return roadmaps for the selected career path ordered by ID', async () => {
      mockPrismaService.roadmap.findMany.mockResolvedValue([
        { id: 7, title: 'Backend Intermediate', careerPathId: 2 },
      ]);

      const res = await service.findByCareerPath(2);

      expect(res).toEqual([{ id: '7', careerPathId: '2', level: '2' }]);
      expect(prisma.roadmap.findMany).toHaveBeenCalledWith({
        where: { careerPathId: 2 },
        orderBy: { id: 'asc' },
      });
    });
  });

  describe('findAllCareerPaths', () => {
    it('should return career path summaries', async () => {
      mockPrismaService.careerPath.findMany.mockResolvedValue([
        { id: 1, name: 'Frontend', description: 'Client apps' },
      ]);

      const res = await service.findAllCareerPaths();

      expect(res).toEqual([
        { id: 1, name: 'Frontend', description: 'Client apps' },
      ]);
      expect(prisma.careerPath.findMany).toHaveBeenCalledWith({
        select: { id: true, name: true, description: true },
      });
    });
  });

  describe('getSystemRoadmapsByCareerPath', () => {
    it('should return published system roadmaps for a career path', async () => {
      mockPrismaService.roadmap.findMany.mockResolvedValue([
        { id: 1, title: 'Frontend Beginner', description: 'Start here' },
      ]);

      const res = await service.getSystemRoadmapsByCareerPath(1);

      expect(res).toEqual([
        { id: 1, title: 'Frontend Beginner', description: 'Start here' },
      ]);
      expect(prisma.roadmap.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            careerPathId: 1,
            userId: null,
            isPublished: true,
          },
        }),
      );
    });

    it('should throw NotFoundException when no published system roadmap exists', async () => {
      mockPrismaService.roadmap.findMany.mockResolvedValue([]);

      await expect(service.getSystemRoadmapsByCareerPath(404)).rejects.toThrow(
        NotFoundException,
      );
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
                userProgress: [],
              },
            ],
          },
        ],
      });

      const res = await service.getRoadmapFlow('Roadmap 1', 'u1');
      expect(prisma.roadmap.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { title: 'Roadmap 1' },
        }),
      );
      expect(res.nodes).toHaveLength(2); // 1 section + 1 skill
      expect(res.nodes[1].id).toBe('100'); // RoadmapSkill ID
      expect(res.nodes[1].data.roadmapSkillId).toBe(100);
      expect(res.edges).toHaveLength(1);
      expect(res.edges[0].target).toBe('100');
    });

    it('should connect multiple sections and map completed progress to skill node data', async () => {
      mockPrismaService.roadmap.findUnique.mockResolvedValue({
        id: 1,
        title: 'Roadmap 1',
        sections: [
          {
            id: 10,
            title: 'Section 1',
            sortOrder: 1,
            skills: [],
          },
          {
            id: 20,
            title: 'Section 2',
            sortOrder: 2,
            skills: [
              {
                id: 200,
                isOptional: true,
                labelType: 'OPTIONAL',
                skill: { id: 2001, name: 'Skill 2' },
                userProgress: [{ statusId: 1, status: { name: 'Completed' } }],
              },
            ],
          },
        ],
      });

      const res = await service.getRoadmapFlow('Roadmap 1', 'u1');

      expect(res.edges).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            source: 'section-10',
            target: 'section-20',
          }),
          expect.objectContaining({
            source: 'section-20',
            target: '200',
          }),
        ]),
      );
      expect(res.nodes.find((node) => node.id === '200')?.data).toEqual(
        expect.objectContaining({
          isOptional: true,
          isCompleted: true,
          statusId: 1,
          roadmapSkillId: 200,
          labelType: 'OPTIONAL',
        }),
      );
    });

    it('should throw NotFoundException when roadmap flow title is missing', async () => {
      mockPrismaService.roadmap.findUnique.mockResolvedValue(null);

      await expect(service.getRoadmapFlow('Missing', 'u1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
