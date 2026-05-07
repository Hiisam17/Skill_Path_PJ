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
 * ProgressService theo dõi việc hoàn thành kỹ năng và tiến độ học tập của người dùng.
 * Quản lý các bản ghi hoàn thành kỹ năng và tính toán số liệu thống kê tiến độ tổng thể.
 */
@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Đảm bảo một trạng thái tiến độ tồn tại trong Database (ví dụ: COMPLETED, IN_PROGRESS).
   */
  private async ensureProgressStatus(name: string): Promise<number> {
    const status = await this.prisma.progressStatus.upsert({
      where: { name },
      update: {},
      create: { name },
      select: { id: true },
    });

    return status.id;
  }

  /**
   * Ánh xạ tên trạng thái từ Database sang Enum được sử dụng trong mã nguồn.
   */
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

  /**
   * Lấy ID người dùng dùng thử (Demo).
   * Ưu tiên lấy từ biến môi trường DEMO_USER_ID, nếu không có sẽ lấy profile mới nhất.
   */
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
        'Không tìm thấy Profile nào trong Database. Vui lòng thiết lập DEMO_USER_ID hoặc chạy seed.',
      );
    }

    return profile.userId;
  }

  /**
   * Đánh dấu một kỹ năng đã hoàn thành bởi người dùng.
   * Ghi lại thời gian hoàn thành và cập nhật trạng thái thành COMPLETED.
   * Sử dụng pattern "upsert" để tránh trùng lặp bản ghi.
   *
   * @param userId - ID người dùng.
   * @param skillId - ID số của kỹ năng.
   * @returns Đối tượng UserSkillProgressDto chứa kết quả cập nhật.
   */
  async completeSkill(
    userId: string,
    skillId: number,
  ): Promise<UserSkillProgressDto> {
    if (!Number.isInteger(skillId) || skillId <= 0) {
      throw new NotFoundException(`Skill ${skillId} not found`);
    }

    const skill = await this.prisma.skill.findUnique({
      where: { id: skillId },
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
          skillId,
        },
      },
      update: {
        statusId: completedStatusId,
        completedAt: new Date(),
      },
      create: {
        userId,
        skillId,
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
   * Tính toán tiến độ tổng thể của người dùng cho lộ trình hiện tại của họ.
   * Thống kê số kỹ năng đã xong so với tổng số kỹ năng để ra phần trăm %.
   * Dùng cho thanh tiến độ và các chỉ báo động lực trên UI.
   *
   * @param userId - ID người dùng.
   * @returns ProgressDto chứa các số liệu thống kê hoàn thành.
   */
  async getUserProgress(userId: string): Promise<ProgressDto> {
    const completedStatusId = await this.ensureProgressStatus('COMPLETED');

    const completedSkills = await this.prisma.userSkillProgress.count({
      where: {
        userId,
        statusId: completedStatusId,
      },
    });

    const userRoadmap = await this.prisma.userRoadmap.findFirst({
      where: { userId: userId },
    });

    let totalSkills = 6; 

    if (userRoadmap) {
      const skillsInRoadmap = await this.prisma.roadmapSkill.count({
        where: {
          section: { roadmapId: userRoadmap.roadmapId }
        },
      });
      totalSkills = skillsInRoadmap > 0 ? skillsInRoadmap : totalSkills;
    } else {
      const firstRoadmap = await this.prisma.roadmap.findFirst();
      if (firstRoadmap) {
        const skillsInRoadmap = await this.prisma.roadmapSkill.count({
          where: {
            section: { roadmapId: firstRoadmap.id }
          },
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
   * Tính toán tiến độ của người dùng trên TẤT CẢ các lộ trình họ tham gia.
   * Trả về chi tiết từng lộ trình và thống kê tổng hợp.
   *
   * @param userId - ID người dùng.
   * @returns MultiRoadmapProgressDto chứa tiến độ tổng và chi tiết theo lộ trình.
   */
  async getUserMultiRoadmapProgress(
    userId: string,
  ): Promise<MultiRoadmapProgressDto> {
    const completedStatusId = await this.ensureProgressStatus('COMPLETED');

    // Find all roadmaps the user is enrolled in
    let userRoadmaps = await this.prisma.userRoadmap.findMany({
      where: { userId },
      include: {
        roadmap: {
          select: { id: true, title: true },
        },
      },
    });

    // Fallback: if user has no enrolled roadmaps, grab all system roadmaps
    if (userRoadmaps.length === 0) {
      const systemRoadmaps = await this.prisma.roadmap.findMany({
        where: { userId: null },
        select: { id: true, title: true },
        orderBy: { id: 'asc' },
      });

      // Build virtual entries so the loop below works uniformly
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
      // Count total skills in this roadmap (via sections)
      const totalSkills = await this.prisma.roadmapSkill.count({
        where: {
          section: { roadmapId: ur.roadmap.id },
        },
      });

      // Get all skill IDs in this roadmap
      const roadmapSkills = await this.prisma.roadmapSkill.findMany({
        where: {
          section: { roadmapId: ur.roadmap.id },
        },
        select: { skillId: true },
      });

      const skillIds = roadmapSkills
        .map((rs) => rs.skillId)
        .filter((id): id is number => id !== null);

      // Count how many of these skills the user has completed
      const completedSkills =
        skillIds.length > 0
          ? await this.prisma.userSkillProgress.count({
              where: {
                userId,
                skillId: { in: skillIds },
                statusId: completedStatusId,
              },
            })
          : 0;

      const safeTotalSkills = totalSkills > 0 ? totalSkills : 1;
      const percentage = Math.round(
        (completedSkills / safeTotalSkills) * 100,
      );

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

  async getCompletedStatusId(): Promise<number> {
    return this.ensureProgressStatus('COMPLETED');
  }

  /**
   * Đồng bộ hóa phần trăm tiến độ cho một người dùng và lộ trình cụ thể.
   * Tính toán lại dựa trên số kỹ năng đã xong so với tổng số kỹ năng của lộ trình đó.
   */
  async syncRoadmapProgressPercentage(
    userId: string,
    roadmapId: number,
  ): Promise<void> {
    const completedStatusId = await this.getCompletedStatusId();

    // 1. Get all skill IDs in this roadmap
    const roadmapSkills = await this.prisma.roadmapSkill.findMany({
      where: {
        section: { roadmapId },
      },
      select: { skillId: true },
    });

    const skillIds = roadmapSkills
      .map((rs) => rs.skillId)
      .filter((id): id is number => id !== null);

    if (skillIds.length === 0) return;

    // 2. Count completed
    const completedCount = await this.prisma.userSkillProgress.count({
      where: {
        userId,
        skillId: { in: skillIds },
        statusId: completedStatusId,
      },
    });

    // 3. Update UserRoadmap record
    const percentage = (completedCount / skillIds.length) * 100;

    await this.prisma.userRoadmap.upsert({
      where: {
        userId_roadmapId: { userId, roadmapId },
      },
      update: {
        progressPercentage: percentage,
      },
      create: {
        userId,
        roadmapId,
        progressPercentage: percentage,
        currentStepOrder: 1,
      },
    });
  }
}
