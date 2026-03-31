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
    // TODO: Implement roadmap retrieval by ID
    // 1. Query database for roadmap with given ID
    // 2. Include associated career path information
    // 3. Return road map with all metadata
    throw new Error('Not implemented');
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
    // TODO: Implement roadmaps retrieval by career path
    // 1. Query all roadmaps for given career path ID
    // 2. Order by level (beginner → intermediate → advanced)
    // 3. Return array of roadmap metadata
    throw new Error('Not implemented');
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
