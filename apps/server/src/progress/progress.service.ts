import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ProgressDto,
  UserSkillProgressDto,
  UserSkillStatus,
  MultiRoadmapProgressDto,
  RoadmapProgressDto,
} from '../types';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Tracks user skill completion and calculates learning progress.
 * Manages skill completion records and aggregates roadmap statistics.
 * Progress is now keyed by roadmapSkillId (RoadmapSkill.id) instead of skillId.
 */
@Injectable()
export class ProgressService {
  // 1. Khai báo biến lưu cache trên RAM (In-memory cache)
  private completedStatusIdCache: number | null = null;

  constructor(private readonly prisma: PrismaService) { }

  /** * Retrieves the ID for 'COMPLETED' status. 
   * Uses in-memory caching to prevent redundant DB queries (Fixes N+1 Query).
   */
  public async getCompletedStatusId(): Promise<number> {
    if (this.completedStatusIdCache !== null) {
      return this.completedStatusIdCache;
    }

    const status = await this.prisma.progressStatus.upsert({
      where: { name: 'COMPLETED' },
      update: {},
      create: { name: 'COMPLETED' },
      select: { id: true },
    });

    this.completedStatusIdCache = status.id;
    return status.id;
  }

  /** Maps a raw status name string to the UserSkillStatus enum. */
  private mapStatusNameToEnum(statusName?: string | null): UserSkillStatus {
    const normalized = (statusName ?? '').trim().toUpperCase();
    if (normalized === 'COMPLETED' || normalized === 'DONE') {
      return UserSkillStatus.COMPLETED;
    }
    if (normalized === 'IN_PROGRESS' || normalized === 'IN PROGRESS') {
      return UserSkillStatus.IN_PROGRESS;
    }
    if (normalized === 'SKIPPED') {
      return UserSkillStatus.SKIPPED;
    }
    return UserSkillStatus.NOT_STARTED;
  }

  /**
   * Resolves a demo user ID for development/testing.
   * Prefers DEMO_USER_ID env var, falls back to the most recently updated profile.
   *
   * @throws NotFoundException if no profile exists in the database.
   */
  async getDemoUserId(): Promise<string> {
    const preferredUserId = process.env.DEMO_USER_ID;

    if (preferredUserId) {
      const byId = await this.prisma.profile.findUnique({
        where: { userId: preferredUserId },
        select: { userId: true },
      });

      if (byId) return byId.userId;

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
   * Updates the status of a roadmap skill entry for the given user.
   * Uses upsert to create or update the progress record.
   *
   * @param userId - UUID of the user.
   * @param roadmapSkillId - ID of the RoadmapSkill (junction table row).
   * @param statusId - ID of the new status.
   * @returns Updated skill progress record.
   */
  async updateSkillStatus(
    userId: string,
    roadmapSkillId: number,
    statusId: number,
  ): Promise<UserSkillProgressDto> {
    const roadmapSkill = await this.prisma.roadmapSkill.findUnique({
      where: { id: roadmapSkillId },
    });

    if (!roadmapSkill) {
      throw new NotFoundException(`RoadmapSkill ${roadmapSkillId} not found`);
    }

    const completedStatusId = await this.getCompletedStatusId();

    const progress = await this.prisma.userSkillProgress.upsert({
      where: {
        userId_roadmapSkillId: {
          userId,
          roadmapSkillId,
        },
      },
      update: {
        statusId,
        skillId: roadmapSkill.skillId,
        completedAt: statusId === completedStatusId ? new Date() : null,
        updatedAt: new Date(),
      },
      create: {
        userId,
        roadmapSkillId,
        skillId: roadmapSkill.skillId,
        statusId,
        completedAt: statusId === completedStatusId ? new Date() : null,
        updatedAt: new Date(),
      },
      include: {
        status: { select: { name: true } },
      },
    });

    return {
      id: String(progress.id),
      userId: progress.userId,
      roadmapSkillId: String(progress.roadmapSkillId),
      status: this.mapStatusNameToEnum(progress.status?.name),
      completedAt: progress.completedAt,
    };
  }

  /**
   * Resets (removes) the progress of a roadmap skill for the given user.
   *
   * @param userId - UUID of the user.
   * @param roadmapSkillId - ID of the RoadmapSkill.
   */
  async resetSkillStatus(userId: string, roadmapSkillId: number): Promise<void> {
    await this.prisma.userSkillProgress.delete({
      where: {
        userId_roadmapSkillId: {
          userId,
          roadmapSkillId,
        },
      },
    }).catch(() => {
      // Ignore if not found
    });
  }

  /**
   * Calculates the user's overall progress for their current roadmap.
   *
   * @param userId - UUID of the user.
   * @returns Aggregated completion statistics including percentage.
   */
  async getUserProgress(userId: string): Promise<ProgressDto> {
    const completedStatusId = await this.getCompletedStatusId();

    const completedSkills = await this.prisma.userSkillProgress.count({
      where: { userId, statusId: completedStatusId },
    });

    const userRoadmap = await this.prisma.userRoadmap.findFirst({
      where: { userId: userId },
    });

    let totalSkills = 0;

    if (userRoadmap) {
      const skillsInRoadmap = await this.prisma.roadmapSkill.count({
        where: { section: { roadmapId: userRoadmap.roadmapId } },
      });
      totalSkills = skillsInRoadmap > 0 ? skillsInRoadmap : totalSkills;
    } else {
      const firstRoadmap = await this.prisma.roadmap.findFirst();
      if (firstRoadmap) {
        const skillsInRoadmap = await this.prisma.roadmapSkill.count({
          where: { section: { roadmapId: firstRoadmap.id } },
        });
        totalSkills = skillsInRoadmap > 0 ? skillsInRoadmap : totalSkills;
      }
    }

    const percentage =
      totalSkills === 0 ? 0 : Math.round((completedSkills / totalSkills) * 100);

    return {
      completedSkills,
      totalSkills,
      percentage,
    };
  }

  /**
   * Tính toán và cập nhật trực tiếp progressPercentage vào bảng UserRoadmap.
   * LƯU Ý: Hàm này chỉ nên được gọi SAU KHI hệ thống đã flush dữ liệu tiến độ từ RAM xuống DB chính thức.
   * @param userId - UUID của user
   * @param roadmapId - ID của Roadmap cần đồng bộ tiến độ
   */
  async syncRoadmapProgressPercentage(userId: string, roadmapId: number): Promise<void> {
    const completedStatusId = await this.getCompletedStatusId();
    const totalSkills = await this.prisma.roadmapSkill.count({
      where: {
        section: { roadmapId: roadmapId },
      },
    });

    if (totalSkills === 0) return;

    // Lấy tất cả roadmapSkill IDs thuộc roadmap này
    const roadmapSkills = await this.prisma.roadmapSkill.findMany({
      where: { section: { roadmapId: roadmapId } },
      select: { id: true },
    });

    const roadmapSkillIds = roadmapSkills.map((rs) => rs.id);

    // Đếm số RoadmapSkill mà user đã COMPLETED
    const completedSkills = await this.prisma.userSkillProgress.count({
      where: {
        userId: userId,
        roadmapSkillId: { in: roadmapSkillIds },
        statusId: completedStatusId,
      },
    });

    const progressPercentage = Math.round((completedSkills / totalSkills) * 100);

    await this.prisma.userRoadmap.updateMany({
      where: {
        userId: userId,
        roadmapId: roadmapId,
      },
      data: {
        progressPercentage: progressPercentage,
      },
    });
  }

  /**
   * Calculates the user's progress across all enrolled roadmaps.
   * Falls back to system roadmaps if the user has no enrollments.
   *
   * @param userId - UUID of the user.
   * @returns Per-roadmap breakdown and aggregated overall statistics.
   */
  async getUserMultiRoadmapProgress(
    userId: string,
  ): Promise<MultiRoadmapProgressDto> {
    const completedStatusId = await this.getCompletedStatusId();

    let userRoadmaps = await this.prisma.userRoadmap.findMany({
      where: { userId },
      include: {
        roadmap: { select: { id: true, title: true } },
      },
    });

    // Fallback: use all system roadmaps if user has no enrollments.
    if (userRoadmaps.length === 0) {
      const systemRoadmaps = await this.prisma.roadmap.findMany({
        where: { userId: null },
        select: { id: true, title: true },
        orderBy: { id: 'asc' },
      });

      userRoadmaps = systemRoadmaps.map((r) => ({
        id: 0,
        userId,
        roadmapId: r.id,
        currentStepOrder: null,
        progressPercentage: null,
        startedAt: null,
        completedAt: null,
        roadmap: r,
      }));
    }

    const roadmapResults: RoadmapProgressDto[] = [];
    let overallCompleted = 0;
    let overallTotal = 0;

    for (const ur of userRoadmaps) {
      const totalSkills = await this.prisma.roadmapSkill.count({
        where: { section: { roadmapId: ur.roadmap.id } },
      });

      // Lấy roadmapSkill IDs thay vì skillIds
      const roadmapSkills = await this.prisma.roadmapSkill.findMany({
        where: { section: { roadmapId: ur.roadmap.id } },
        select: { id: true },
      });

      const roadmapSkillIds = roadmapSkills.map((rs) => rs.id);

      const completedSkills =
        roadmapSkillIds.length > 0
          ? await this.prisma.userSkillProgress.count({
            where: {
              userId,
              roadmapSkillId: { in: roadmapSkillIds },
              statusId: completedStatusId,
            },
          })
          : 0;

      const safeTotalSkills = totalSkills > 0 ? totalSkills : 1;
      const percentage = Math.round((completedSkills / safeTotalSkills) * 100);

      roadmapResults.push({
        roadmapId: String(ur.roadmap.id),
        roadmapName: ur.roadmap.title,
        completedSkills,
        totalSkills: safeTotalSkills,
        percentage,
      });

      overallCompleted += completedSkills;
      overallTotal += safeTotalSkills;
    }

    const overallPercentage =
      overallTotal === 0
        ? 0
        : Math.round((overallCompleted / overallTotal) * 100);

    return {
      overall: {
        completedSkills: overallCompleted,
        totalSkills: overallTotal,
        percentage: overallPercentage,
      },
      roadmaps: roadmapResults,
    };
  }
}