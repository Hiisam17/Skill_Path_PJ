import { Injectable } from '@nestjs/common';
import { SkillDto } from '../types';
import { PrismaService } from '../prisma/prisma.service';

/**
 * SkillsService manages individual skills within roadmaps
 * Provides skill listings with user progress tracking and learning resources
 */
@Injectable()
export class SkillsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieve all skills in a roadmap with user's progress status
   * Returns ordered list of skills user should learn, with current completion status
   * Skills maintain a specific order (orderIndex) for progressive learning
   *
   * @param roadmapId - UUID of the roadmap to fetch skills from
   * @param userId - UUID of authenticated user (to fetch their progress status)
   * @returns Array of SkillDto objects ordered by orderIndex with user's completion status
   *
   * Example:
   * const skills = await skillsService.findByRoadmap('roadmap-id', 'user-id')
   * // Returns: [
   * //   { id: 'uuid1', roadmapId: '...', name: 'Git', description: '...', orderIndex: 1, status: 'COMPLETED' },
   * //   { id: 'uuid2', roadmapId: '...', name: 'Linux', description: '...', orderIndex: 2, status: 'NOT_STARTED' },
   * // ]
   */
  async findByRoadmap(roadmapId: string, userId: string): Promise<SkillDto[]> {
    // TODO: Implement skills retrieval with user progress
    // 1. Query all skills for given roadmap ordered by orderIndex
    // 2. LEFT JOIN with UserSkillProgress for current user
    // 3. Include user's completion status (NOT_STARTED, IN_PROGRESS, COMPLETED)
    // 4. Return skills with status information for frontend display
    throw new Error('Not implemented');
  }
}
