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

  private toDto(roadmap: {
    id: number;
    careerPathId: number | null;
    title: string;
  }): RoadmapDto {
    return {
      id: String(roadmap.id),
      careerPathId:
        roadmap.careerPathId === null ? '' : String(roadmap.careerPathId),
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
   * @param careerPathId - UUID of the career path
   * @returns Array of RoadmapDto objects at different levels for this career path
   *
   * Example:
   * const roadmaps = await roadmapsService.findByCareerPath('backend-path-id')
   * // Returns: [
   * //   { id: 'uuid1', careerPathId: 'path-id', level: 'beginner' },
   * //   { id: 'uuid2', careerPathId: 'path-id', level: 'intermediate' },
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
}
