import { Injectable } from '@nestjs/common';
import { ProgressDto, UserSkillProgressDto } from '../types';
import { PrismaService } from '../prisma/prisma.service';

/**
 * ProgressService tracks user's skill completion and learning progress
 * Manages skill completion records and calculates overall progress statistics
 */
@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Mark a skill as completed by the user
   * Records completion timestamp and updates skill status to COMPLETED
   * Prevents duplicate completions using upsert pattern
   *
   * @param userId - UUID of authenticated user
   * @param skillId - UUID of the skill being marked as complete
   * @returns UserSkillProgressDto with updated completion record
   * @throws NotFoundException if user or skill not found
   *
   * Example:
   * const progress = await progressService.completeSkill('user-id', 'skill-id')
   * // Returns: { id: 'progress-id', userId: '...', skillId: '...', status: 'COMPLETED', completedAt: 2024-03-23T... }
   */
  async completeSkill(
    userId: string,
    skillId: string,
  ): Promise<UserSkillProgressDto> {
    // TODO: Implement skill completion logic
    // 1. Use Prisma upsert: update if exists, create if doesn't
    // 2. Prevent duplicate completion records via unique constraint @@unique([userId, skillId])
    // 3. Set status = COMPLETED and completedAt = current timestamp
    // 4. Return updated progress record
    throw new Error('Not implemented');
  }

  /**
   * Calculate user's overall progress for their current roadmap
   * Aggregates completion statistics and calculates percentage completion
   * Used to display progress bar and motivation indicators
   *
   * @param userId - UUID of authenticated user
   * @returns ProgressDto with completion statistics
   *
   * Example:
   * const progress = await progressService.getUserProgress('user-id')
   * // Returns: { completedSkills: 3, totalSkills: 6, percentage: 50 }
   */
  async getUserProgress(userId: string): Promise<ProgressDto> {
    // TODO: Implement progress calculation
    // 1. Get user's current roadmap
    // 2. Count total skills in that roadmap
    // 3. Count user's completed skills (status = COMPLETED)
    // 4. Calculate percentage = (completedSkills / totalSkills) * 100
    // 5. Return progress summary with all statistics
    throw new Error('Not implemented');
  }
}
