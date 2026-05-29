import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MilestonesService {
  private readonly logger = new Logger(MilestonesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * BƯỚC 2: Logic xử lý Streak
   * Cập nhật hoạt động và tính toán chuỗi ngày tham gia
   */
  async updateUserActivity(userId: string) {
    try {
      const profile = await this.prisma.profile.findUnique({
        where: { userId },
      });

      if (!profile) throw new NotFoundException('User profile not found');

      const now = new Date();
      const lastActivity = profile.lastActivityAt;

      // Nếu là lần đầu tiên hoạt động
      if (!lastActivity) {
        return await this.prisma.profile.update({
          where: { userId },
          data: {
            currentStreak: 1,
            longestStreak: 1,
            lastActivityAt: now,
          },
        });
      }

      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfYesterday = new Date(startOfToday);
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);
      
      const startOfLastActivity = new Date(
        lastActivity.getFullYear(),
        lastActivity.getMonth(),
        lastActivity.getDate(),
      );

      let updatedProfile;

      // 1. Cùng ngày: Bỏ qua
      if (startOfLastActivity.getTime() === startOfToday.getTime()) {
        updatedProfile = profile;
      } 
      // 2. Ngày kế tiếp: Tăng streak
      else if (startOfLastActivity.getTime() === startOfYesterday.getTime()) {
        const newStreak = (profile.currentStreak || 0) + 1;
        const newLongest = Math.max(profile.longestStreak || 0, newStreak);
        
        updatedProfile = await this.prisma.profile.update({
          where: { userId },
          data: {
            currentStreak: newStreak,
            longestStreak: newLongest,
            lastActivityAt: now,
          },
        });
      } 
      // 3. Quá 1 ngày: Reset về 1
      else {
        updatedProfile = await this.prisma.profile.update({
          where: { userId },
          data: {
            currentStreak: 1,
            lastActivityAt: now,
          },
        });
      }

      // Sau khi cập nhật streak, kiểm tra xem có unlock được milestone nào không
      await this.checkAndUnlockMilestones(userId);
      
      return updatedProfile;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error updating activity for user ${userId}: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * BƯỚC 3: Logic xử lý Milestones
   * Kiểm tra và mở khóa huy hiệu mới
   */
  async checkAndUnlockMilestones(userId: string) {
    try {
      const profile = await this.prisma.profile.findUnique({
        where: { userId },
        include: {
          skillProgress: { where: { status: { name: 'Completed' } } },
          userMilestones: true,
        },
      });

      if (!profile) return;

      // Lấy tất cả milestones chưa được mở khóa
      const unlockedIds = profile.userMilestones.map((um) => um.milestoneId);
      const availableMilestones = await this.prisma.milestone.findMany({
        where: {
          id: { notIn: unlockedIds },
        },
      });

      const newUnlocks = [];

      for (const milestone of availableMilestones) {
        const criteria = milestone.criteria as any;
        if (!criteria) continue;

        let isEligible = false;

        // Logic kiểm tra dựa trên criteria (Ví dụ: { type: 'streak', value: 7 })
        if (criteria.type === 'streak' && profile.currentStreak >= criteria.value) {
          isEligible = true;
        } 
        else if (criteria.type === 'skills' && profile.skillProgress.length >= criteria.value) {
          isEligible = true;
        }

        if (isEligible) {
          newUnlocks.push(
            this.prisma.userMilestone.create({
              data: {
                userId,
                milestoneId: milestone.id,
              },
            }),
          );
        }
      }

      if (newUnlocks.length > 0) {
        await Promise.all(newUnlocks);
        this.logger.log(`Unlocked ${newUnlocks.length} new milestones for user ${userId}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error checking milestones for user ${userId}: ${errorMessage}`);
    }
  }

  /**
   * BƯỚC 4: Lấy dữ liệu Dashboard
   */
  async getDashboardStats(userId: string) {
    try {
      const profile = await this.prisma.profile.findUnique({
        where: { userId },
        include: {
          userMilestones: {
            include: { milestone: true },
          },
        },
      });

      if (!profile) throw new NotFoundException('Profile not found');

      return {
        streakData: {
          currentStreak: profile.currentStreak,
          longestStreak: profile.longestStreak,
          lastActivityAt: profile.lastActivityAt,
        },
        unlockedMilestones: profile.userMilestones.map(um => um.milestone),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error getting dashboard stats for user ${userId}: ${errorMessage}`);
      throw error;
    }
  }


}
