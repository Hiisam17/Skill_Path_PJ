import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoadmapDto } from '../types';

/**
 * Service for managing roadmaps and career paths.
 * Provides CRUD operations and React Flow data transformation.
 */
@Injectable()
export class RoadmapsService {
  constructor(private readonly prisma: PrismaService) { }

  /** Infers difficulty level from a roadmap title string. */
  private toLevel(title: string): string {
    const normalized = title.toLowerCase();
    if (normalized.includes('advanced')) return '3';
    if (normalized.includes('intermediate')) return '2';
    return '1';
  }

  /** Maps a raw Prisma roadmap record to the public DTO shape. */
  private toDto(roadmap: { id: number; careerPathId: number | null; title: string }): RoadmapDto {
    return {
      id: String(roadmap.id),
      careerPathId: roadmap.careerPathId === null ? '' : String(roadmap.careerPathId),
      level: this.toLevel(roadmap.title),
    };
  }

  /** Retrieves all roadmaps ordered by career path. */
  async findAll(): Promise<RoadmapDto[]> {
    const roadmaps = await this.prisma.roadmap.findMany({
      orderBy: [{ careerPathId: 'asc' }, { id: 'asc' }],
    });
    return roadmaps.map((roadmap) => this.toDto(roadmap));
  }

  /**
   * Finds a single roadmap by its ID.
   *
   * @throws NotFoundException if the roadmap does not exist.
   */
  async findById(roadmapId: number): Promise<RoadmapDto> {
    const roadmap = await this.prisma.roadmap.findUnique({
      where: { id: roadmapId },
    });

    if (!roadmap) {
      throw new NotFoundException(`Roadmap ${roadmapId} not found`);
    }

    return this.toDto(roadmap);
  }

  async findByCareerPath(careerPathId: number): Promise<RoadmapDto[]> {
    const roadmaps = await this.prisma.roadmap.findMany({
      where: { careerPathId },
      orderBy: { id: 'asc' },
    });
    return roadmaps.map((roadmap) => this.toDto(roadmap));
  }

  async findAllCareerPaths(): Promise<{ id: number; name: string; description: string | null }[]> {
    const careerPaths = await this.prisma.careerPath.findMany({
      select: { id: true, name: true, description: true }
    });
    return careerPaths.map((c) => ({ id: c.id, name: c.name, description: c.description }));
  }

  async getSystemRoadmapsByCareerPath(careerPathId: number): Promise<{ id: number; title: string; description: string | null }[]> {
    const roadmaps = await this.prisma.roadmap.findMany({
      where: {
        careerPathId: careerPathId,
        userId: null,
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        description: true,
      },
      orderBy: { id: 'asc' },
    });

    if (!roadmaps || roadmaps.length === 0) {
      throw new NotFoundException('No system roadmaps found for this career path');
    }

    return roadmaps;
  }

  /**
   * Transforms a roadmap into React Flow nodes and edges for frontend visualization.
   * Sections become primary nodes connected vertically; skills branch out from each section.
   */
  async getRoadmapFlow(roadmapId: number) {
    const roadmap = await this.prisma.roadmap.findUnique({
      where: { id: roadmapId },
      include: {
        sections: {
          orderBy: { sortOrder: 'asc' },
          include: { skills: { include: { skill: true } } },
        },
      },
    });

    if (!roadmap) {
      throw new NotFoundException(`Roadmap ${roadmapId} not found`);
    }

    const nodes: any[] = [];
    const edges: any[] = [];

    roadmap.sections.forEach((section, index) => {
      const sectionNodeId = `section-${section.id}`;

      nodes.push({
        id: sectionNodeId,
        type: 'sectionNode',
        data: { label: section.title, sortOrder: section.sortOrder },
        position: { x: 0, y: 0 },
      });

      if (index > 0) {
        const prevSectionId = `section-${roadmap.sections[index - 1].id}`;
        edges.push({
          id: `edge-sec-${prevSectionId}-to-${sectionNodeId}`,
          source: prevSectionId,
          target: sectionNodeId,
          type: 'smoothstep',
          animated: true,
        });
      }

      section.skills.forEach((rs) => {
        const skillNodeId = `skill-${rs.id}`;

        nodes.push({
          id: skillNodeId,
          type: 'skillNode',
          data: { name: rs.skill?.name || 'Unknown Skill', isOptional: rs.isOptional },
          position: { x: 0, y: 0 },
        });

        edges.push({
          id: `edge-${sectionNodeId}-to-${skillNodeId}`,
          source: sectionNodeId,
          target: skillNodeId,
          type: 'default',
        });
      });
    });

    return { nodes, edges };
  }
}