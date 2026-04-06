import { Injectable, NotFoundException } from '@nestjs/common';
import { RoadmapDto } from '../types';
import { PrismaService } from '../prisma/prisma.service';

/**
 * RoadmapsService manages learning roadmaps at different difficulty levels
 * Each roadmap contains a curated sequence of skills to learn for a specific career path
 */
@Injectable()
export class RoadmapsService {
  constructor(private readonly prisma: PrismaService) {}

  private toLevel(title: string): string {
    const normalized = title.toLowerCase();
    if (normalized.includes('advanced')) return '3';
    if (normalized.includes('intermediate')) return '2';
    return '1';
  }

  private toDto(roadmap: { id: number; careerPathId: number | null; title: string }): RoadmapDto {
    return {
      id: String(roadmap.id),
      careerPathId: roadmap.careerPathId === null ? '' : String(roadmap.careerPathId),
      level: this.toLevel(roadmap.title),
    };
  }

  async findAll(): Promise<RoadmapDto[]> {
    const roadmaps = await this.prisma.roadmap.findMany({
      orderBy: [{ careerPathId: 'asc' }, { id: 'asc' }],
    });

    return roadmaps.map((roadmap) => this.toDto(roadmap));
  }

  /**
   * Find roadmap by its unique identifier
   * Retrieves roadmap details including associated skills and career path reference
   *
   * @param roadmapId - UUID of the roadmap to retrieve
   * @returns RoadmapDto containing roadmap metadata
   * @throws NotFoundException if roadmap not found
   *
   * Example:
   * const roadmap = await roadmapsService.findById('roadmap-uuid')
   * // Returns: { id: 'uuid', careerPathId: 'path-id', level: 'beginner' }
   */
  async findById(roadmapId: string): Promise<RoadmapDto> {
    const roadmapIdNumber = Number(roadmapId);
    if (!Number.isInteger(roadmapIdNumber) || roadmapIdNumber <= 0) {
      throw new NotFoundException(`Roadmap ${roadmapId} not found`);
    }

    const roadmap = await this.prisma.roadmap.findUnique({
      where: { id: roadmapIdNumber },
    });

    if (!roadmap) {
      throw new NotFoundException(`Roadmap ${roadmapId} not found`);
    }

    return this.toDto(roadmap);
  }

  /**
   * Find all roadmaps for a specific career path
   * Returns roadmaps at different difficulty levels (beginner, intermediate, advanced)
   * Users can progress through levels as they complete skills
   *
   * @param careerPathId - INT of the career path
   * @returns Array of RoadmapDto objects at different levels for this career path
   *
   * Example:
   * const roadmaps = await roadmapsService.findByCareerPath('backend-path-id')
   * // Returns: [
   * //   { id: '1', careerPathId: 'path-id', level: 'beginner' },
   * //   { id: '2', careerPathId: 'path-id', level: 'intermediate' },
   * // ]
   */
  async findByCareerPath(careerPathId: string): Promise<RoadmapDto[]> {
    const careerPathIdNumber = Number(careerPathId);
    if (!Number.isInteger(careerPathIdNumber) || careerPathIdNumber <= 0) {
      return [];
    }

    const roadmaps = await this.prisma.roadmap.findMany({
      where: { careerPathId: careerPathIdNumber },
      orderBy: { id: 'asc' },
    });

    return roadmaps.map((roadmap) => this.toDto(roadmap));
  }

  /**
   * Retrieve all careers (id and name) for the public career list
   * Returns an array of objects shaped as { id, name }
   */
  async findAllCareerPaths(): Promise<{ id: number; name: string }[]> {
    const careerPaths = await this.prisma.careerPath.findMany({ select: { id: true, name: true } });
    return careerPaths.map((c) => ({ id: c.id, name: c.name }));
  }

  /**
   * Get published system roadmaps for a given career id
   * System roadmaps are identified by `userId == null` and `isPublished == true`
   * Returns selected fields: id, title, description
   */
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
      throw new NotFoundException('No roadmaps found for this career');
    }

    return roadmaps.map((r) => ({ id: r.id, title: r.title, description: r.description }));
  }
}
