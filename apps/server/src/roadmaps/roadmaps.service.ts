import { Injectable } from '@nestjs/common';
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
    // TODO: Implement roadmaps retrieval by career path
    // 1. Query all roadmaps for given career path ID
    // 2. Order by level (beginner → intermediate → advanced)
    // 3. Return array of roadmap metadata
    throw new Error('Not implemented');
  }
}
