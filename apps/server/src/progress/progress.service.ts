import { Injectable, NotFoundException } from '@nestjs/common';
import { ProgressDto, UserSkillProgressDto, UserSkillStatus } from '../types';
import { PrismaService } from '../prisma/prisma.service';

/**
 * ProgressService tracks user's skill completion and learning progress
 * Manages skill completion records and calculates overall progress statistics
 */
@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureProgressStatus(name: string): Promise<number> {
    const status = await this.prisma.progressStatus.upsert({
      where: { name },
      update: {},
      create: { name },
      select: { id: true },
    });

    return status.id;
  }

  private mapStatusNameToEnum(statusName?: string | null): UserSkillStatus {
    const normalized = (statusName ?? '').trim().toUpperCase();
    if (normalized === 'COMPLETED' || normalized === 'DONE') {
      return UserSkillStatus.COMPLETED;
    }
    if (normalized === 'IN_PROGRESS' || normalized === 'IN PROGRESS') {
      return UserSkillStatus.IN_PROGRESS;
    }
    return UserSkillStatus.NOT_STARTED;
  }

  async getDemoUserId(): Promise<string> {
    const preferredUserId = process.env.DEMO_USER_ID;

    if (preferredUserId) {
      const byId = await this.prisma.profile.findUnique({
        where: { userId: preferredUserId },
        select: { userId: true },
      });

      if (byId) {
        return byId.userId;
      }

      const created = await this.prisma.profile.create({
        data: {
          userId: preferredUserId,
          fullName: 'Demo User',
          isDeleted: false,
        },
        select: { userId: true },
      });

      return created.userId;
    }

    const profile = await this.prisma.profile.findFirst({
      where: { isDeleted: false },
      orderBy: { updatedAt: 'desc' },
      select: { userId: true },
    });

    if (!profile) {
      throw new NotFoundException(
        'No profile found in database. Set DEMO_USER_ID in apps/server/.env or run seed.',
      );
    }

    return profile.userId;
  }

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
    const skillIdNumber = Number(skillId);
    if (!Number.isInteger(skillIdNumber) || skillIdNumber <= 0) {
      throw new NotFoundException(`Skill ${skillId} not found`);
    }

    const skill = await this.prisma.skill.findUnique({
      where: { id: skillIdNumber },
      select: { id: true },
    });

    if (!skill) {
      throw new NotFoundException(`Skill ${skillId} not found`);
    }

    const completedStatusId = await this.ensureProgressStatus('COMPLETED');

    const progress = await this.prisma.userSkillProgress.upsert({
      where: {
        userId_skillId: {
          userId,
          skillId: skillIdNumber,
        },
      },
      update: {
        statusId: completedStatusId,
        completedAt: new Date(),
      },
      create: {
        userId,
        skillId: skillIdNumber,
        statusId: completedStatusId,
        completedAt: new Date(),
      },
      include: {
        status: {
          select: { name: true },
        },
      },
    });

    return {
      id: String(progress.id),
      userId: progress.userId,
      skillId: String(progress.skillId),
      status: this.mapStatusNameToEnum(progress.status?.name),
      completedAt: progress.completedAt,
    };
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
    const totalSkills = await this.prisma.skill.count();

    const completedStatusId = await this.ensureProgressStatus('COMPLETED');

    const completedSkills = await this.prisma.userSkillProgress.count({
      where: {
        userId,
        statusId: completedStatusId,
      },
    });

    const percentage =
      totalSkills === 0 ? 0 : Math.round((completedSkills / totalSkills) * 100);

    return {
      completedSkills,
      totalSkills,
      percentage,
    };
  }
}
