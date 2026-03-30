/* eslint-disable @typescript-eslint/require-await, @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { RoadmapDto, SelectRoadmapDto } from '../types';
import { PrismaService } from '../prisma/prisma.service';

/**
 * UsersService manages user profiles and user-specific roadmap selections
 * Handles user onboarding and career path tracking
 */
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Store user's selected career path and roadmap choice
   * Creates association between user and their chosen roadmap for learning tracking
   *
   * @param userId - UUID of authenticated user
   * @param selectRoadmapDto - Contains careerPathId to associate with user
   * @returns void
   * @throws NotFoundException if user or careerPath not found
   *
   * Example:
   * await usersService.selectRoadmap('user-id', { careerPathId: 'backend-path-id' })
   */
  async selectRoadmap(
    userId: string,
    selectRoadmapDto: SelectRoadmapDto,
  ): Promise<void> {
    // TODO: Implement roadmap selection logic
    // 1. Verify user exists in database
    // 2. Verify careerPath exists and get its beginner level roadmap
    // 3. Associate roadmap with user (store in user context or session)
    // 4. Could store in a user_roadmap junction table if persistence needed
    throw new Error('Not implemented');
  }

  /**
   * Retrieve the user's currently selected roadmap
   * Returns the roadmap the user is actively working through
   *
   * @param userId - UUID of authenticated user
   * @returns RoadmapDto with current roadmap details or null if not set
   *
   * Example:
   * const roadmap = await usersService.getSelectedRoadmap('user-id')
   * // Returns: { id: 'roadmap-id', careerPathId: 'path-id', level: 'beginner' }
   */
  async getSelectedRoadmap(userId: string): Promise<RoadmapDto | null> {
    // TODO: Implement roadmap retrieval logic
    // 1. Query database for user's selected roadmap
    // 2. Return roadmap record or null if not set
    // 3. Include careerpath metadata for frontend navigation
    throw new Error('Not implemented');
  }
}
