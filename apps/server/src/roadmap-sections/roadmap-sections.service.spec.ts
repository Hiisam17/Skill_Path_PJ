import { Test, TestingModule } from '@nestjs/testing';
import { RoadmapSectionsService } from './roadmap-sections.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('RoadmapSectionsService', () => {
  let service: RoadmapSectionsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    roadmapSection: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoadmapSectionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RoadmapSectionsService>(RoadmapSectionsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('getDetail', () => {
    it('should return section details with formatted resources (Happy Path)', async () => {
      mockPrismaService.roadmapSection.findUnique.mockResolvedValue({
        id: 1,
        title: 'Section 1',
        description: 'Desc 1',
        resources: [
          { id: 10, title: 'Res 1', url: 'url1', resourceType: { name: 'article' } }
        ]
      });

      const res = await service.getDetail(1);
      expect(res.title).toBe('Section 1');
      expect(res.resources[0].type).toBe('article');
    });

    it('should remove duplicate resources by id', async () => {
      mockPrismaService.roadmapSection.findUnique.mockResolvedValue({
        id: 1,
        title: 'Section 1',
        description: 'Desc 1',
        resources: [
          { id: 10, title: 'Res 1', url: 'url1', resourceType: { name: 'article' } },
          { id: 10, title: 'Res 1 duplicate', url: 'url1', resourceType: { name: 'article' } },
          { id: 11, title: 'Res 2', url: 'url2', resourceType: { name: 'video' } },
        ]
      });

      const res = await service.getDetail(1);
      expect(res.resources).toHaveLength(2);
      expect(res.resources.map(resource => resource.id)).toEqual([10, 11]);
    });

    it('should throw NotFoundException if section missing (Edge case)', async () => {
      mockPrismaService.roadmapSection.findUnique.mockResolvedValue(null);
      await expect(service.getDetail(99)).rejects.toThrow(NotFoundException);
    });
  });
});
