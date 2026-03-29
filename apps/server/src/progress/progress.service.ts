import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  // Nhiệm vụ 1: Đánh dấu hoàn thành skill
  async completeSkill(userId: string, skillId: string) {
    const progress = await this.prisma.userSkillProgress.upsert({
      where: {
        // Prisma tự động tạo composite key dựa trên @@unique([userId, skillId])
        userId_skillId: {
          userId: userId,
          skillId: skillId,
        },
      },
      update: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
      create: {
        userId: userId,
        skillId: skillId,
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    return { status: progress.status };
  }

  // Nhiệm vụ 2: Lấy thông tin tiến độ
  async getUserProgress(userId: string) {
    // 1. Đếm số skill đã hoàn thành của user
    const completedSkills = await this.prisma.userSkillProgress.count({
      where: {
        userId: userId,
        status: 'COMPLETED',
      },
    });

    // 2. Tìm tổng số skill trong roadmap
    // Tìm một skill bất kỳ mà user đã tương tác để suy ra roadmap hiện tại
    const firstProgress = await this.prisma.userSkillProgress.findFirst({
      where: { userId: userId },
      include: { skill: true },
    });

    let totalSkills = 6; // Mặc định là 6 skills theo yêu cầu MVP

    if (firstProgress && firstProgress.skill) {
      // Đếm tất cả các skill thuộc cùng lộ trình đó
      totalSkills = await this.prisma.skill.count({
        where: { roadmapId: firstProgress.skill.roadmapId },
      });
    } else {
      // Nếu user chưa học gì, tìm roadmap đầu tiên trong DB để lấy tổng số skill
      const firstRoadmap = await this.prisma.roadmap.findFirst();
      if (firstRoadmap) {
        totalSkills = await this.prisma.skill.count({
          where: { roadmapId: firstRoadmap.id },
        });
      }
    }

    // 3. Tính toán phần trăm (dạng thập phân như 0.33)
    const percentage = totalSkills === 0 ? 0 : Math.round((completedSkills / totalSkills) * 100) / 100;

    return { completedSkills, totalSkills, percentage };
  }
}
