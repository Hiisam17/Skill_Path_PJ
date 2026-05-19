import { Test, TestingModule } from '@nestjs/testing';
import { SkillsService } from './skills.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { UserSkillStatus } from '../types';

describe('SkillsService', () => {
  let service: SkillsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    roadmapSkill: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    skill: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SkillsService>(SkillsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('findSkillsByRoadmap', () => {
    it('should return skills with progress status (Happy Path)', async () => {
      mockPrismaService.roadmapSkill.findMany.mockResolvedValue([
        {
          id: 1,
          skill: {
            id: 10,
            name: 'Skill A',
            description: 'Desc A',
          },
          userProgress: [{ status: { name: 'COMPLETED' } }]
        }
      ]);

      const res = await service.findSkillsByRoadmap(1, 'u1');
      expect(res).toHaveLength(1);
      expect(res[0].status).toBe(UserSkillStatus.COMPLETED);
      expect(res[0].id).toBe("10");
    });

    it('should return empty array if no skills found', async () => {
      mockPrismaService.roadmapSkill.findMany.mockResolvedValue([]);
      const res = await service.findSkillsByRoadmap(1, 'u1');
      expect(res).toEqual([]);
    });
  });

  describe('getSkillDetail', () => {
    it('should return full skill detail including resources (Happy Path)', async () => {
      mockPrismaService.roadmapSkill.findUnique.mockResolvedValue({
        id: 10,
        skill: {
          id: 100,
          name: 'Skill A',
          description: 'Desc A',
        },
        resources: [
          { id: 1000, title: 'Video A', url: 'v.com', resourceType: { name: 'video' } }
        ],
        userProgress: [{ statusId: 2, status: { name: 'IN_PROGRESS' } }],
      });

      const res = await service.getSkillDetail(10, 'u1');
      expect(res.title).toBe('Skill A');
      expect(res.status).toBe(UserSkillStatus.IN_PROGRESS);
      expect(res.resources[0].type).toBe('video');
    });

    it('should remove duplicate resources by id', async () => {
      mockPrismaService.roadmapSkill.findUnique.mockResolvedValue({
        id: 10,
        skill: {
          id: 100,
          name: 'Skill A',
          description: 'Desc A',
          resources: [],
        },
        resources: [
          { id: 1000, title: 'Video A', url: 'v.com', resourceType: { name: 'video' } },
          { id: 1000, title: 'Video A duplicate', url: 'v.com', resourceType: { name: 'video' } },
          { id: 1001, title: 'Article A', url: 'a.com', resourceType: { name: 'article' } },
        ],
        userProgress: [{ statusId: 2, status: { name: 'IN_PROGRESS' } }],
      });

      const res = await service.getSkillDetail(10, 'u1');
      expect(res.resources).toHaveLength(2);
      expect(res.resources.map(resource => resource.id)).toEqual([1000, 1001]);
    });

    it('should prefer roadmap skill resources over duplicate skill resources', async () => {
      mockPrismaService.roadmapSkill.findUnique.mockResolvedValue({
        id: 10,
        skill: {
          id: 100,
          name: 'Skill A',
          description: 'Desc A',
          resources: [
            { id: 2000, title: 'Generic JS Guide', url: ' https://docs.example.com/js ', resourceType: { name: 'article' } },
            { id: 2001, title: 'Generic Practice', url: 'https://practice.example.com/js', resourceType: { name: 'course' } },
          ],
        },
        resources: [
          { id: 1000, title: 'Roadmap JS Guide', url: 'https://docs.example.com/js', resourceType: { name: 'article' } },
        ],
        userProgress: [{ statusId: 2, status: { name: 'IN_PROGRESS' } }],
      });

      const res = await service.getSkillDetail(10, 'u1');
      expect(res.resources).toHaveLength(2);
      expect(res.resources.map(resource => resource.id)).toEqual([1000, 2001]);
    });

    it('should throw NotFoundException if roadmapSkill invalid (Edge case)', async () => {
      mockPrismaService.roadmapSkill.findUnique.mockResolvedValue(null);
      await expect(service.getSkillDetail(999, 'u1')).rejects.toThrow(NotFoundException);
    });
  });
});
