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
   * Store user's selected roadmap choice
   * Creates association between user and their chosen roadmap for learning tracking
   *
   * @param userId - UUID of authenticated user
   * @param selectRoadmapDto - Contains careerPathId to associate with user
   * @returns Selected roadmap id and title for frontend navigation
   * @throws NotFoundException if user or careerPath not found
   *
   * Example:
   * await usersService.selectRoadmap('user-id', { careerPathId: '1' })
   */
  async selectRoadmap(
    userId: string,
    selectRoadmapDto: SelectRoadmapDto,
  ): Promise<{ id: number; title: string }> {
    const careerPathId = parseInt(selectRoadmapDto.careerPathId);
    if (isNaN(careerPathId)) throw new Error('Invalid careerPathId');

    const roadmaps = await this.prisma.roadmap.findMany({
      where: {
        careerPathId,
        userId: null,
      },
      orderBy: { id: 'asc' },
      take: 1,
    });

    if (roadmaps.length === 0) {
      throw new Error('No roadmap found for this career path');
    }

    const roadmap = roadmaps[0];
    const roadmapId = roadmap.id;

    // Create tracking record if it doesn't exist
    await this.prisma.userRoadmap.upsert({
      where: {
        userId_roadmapId: {
          userId: userId,
          roadmapId: roadmapId,
        }
      },
      update: {},
      create: {
        userId: userId,
        roadmapId: roadmapId,
        currentStepOrder: 1,
        progressPercentage: 0,
      }
    });

    return { id: roadmap.id, title: roadmap.title };
  }


  /**
   * Update user profile information
   *
   * @param userId - UUID of authenticated user
   * @param updateProfileDto - Contains profile fields to update
   * @returns Updated profile
   */
  async updateProfile(
    userId: string,
    updateProfileDto: {
      fullName?: string;
      avatarUrl?: string;
      bio?: string;
      githubLink?: string;
    },
  ) {
    const data: {
      fullName?: string | null;
      avatarUrl?: string | null;
      bio?: string | null;
      githubLink?: string | null;
      updatedAt: Date;
      isDeleted: boolean;
    } = {
      updatedAt: new Date(),
      isDeleted: false,
    };

    if (updateProfileDto.fullName !== undefined) data.fullName = updateProfileDto.fullName.trim() || null;
    if (updateProfileDto.avatarUrl !== undefined) data.avatarUrl = updateProfileDto.avatarUrl.trim() || null;
    if (updateProfileDto.bio !== undefined) data.bio = updateProfileDto.bio.trim() || null;
    if (updateProfileDto.githubLink !== undefined) data.githubLink = updateProfileDto.githubLink.trim() || null;

    return this.prisma.profile.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    });
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
