import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) { }

  // Nhiệm vụ 1: Đánh dấu hoàn thành skill
  async completeSkill(userId: string, skillId: number) {

    const completedStatus = await this.prisma.progressStatus.findUnique({
      where: { name: 'COMPLETED' }
    });

    if (!completedStatus) {
      throw new Error('COMPLETED status not found in database');
    }

    const progress = await this.prisma.userSkillProgress.upsert({
      where: {
        userId_skillId: {
          userId: userId,
          skillId: skillId,
        },
      },
      update: {
        statusId: completedStatus.id,
        completedAt: new Date(),
      },
      create: {
        userId: userId,
        skillId: skillId,
        statusId: completedStatus.id,
        completedAt: new Date(),
      },
    });

    return { status: 'COMPLETED' };
  }

  // Nhiệm vụ 2: Lấy thông tin tiến độ
  async getUserProgress(userId: string) {
    const completedStatus = await this.prisma.progressStatus.findUnique({
      where: { name: 'COMPLETED' }
    });

    // 1. Đếm số skill đã hoàn thành của user
    let completedSkills = 0;
    if (completedStatus) {
      completedSkills = await this.prisma.userSkillProgress.count({
        where: {
          userId: userId,
          statusId: completedStatus.id,
        },
      });
    }

    // 2. Tìm tổng số skill trong roadmap
    const userRoadmap = await this.prisma.userRoadmap.findFirst({
      where: { userId: userId },
    });

    let totalSkills = 6; // Mặc định là 6 skills theo yêu cầu MVP

    if (userRoadmap) {
      // Đếm tất cả các skill thuộc cùng lộ trình đó
      const skillsInRoadmap = await this.prisma.roadmapSkill.count({
        where: {
          section: { roadmapId: userRoadmap.roadmapId }
        },
      });
      totalSkills = skillsInRoadmap > 0 ? skillsInRoadmap : totalSkills;
    } else {
      // Nếu user chưa học gì, tìm roadmap đầu tiên trong DB để lấy tổng số skill
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

    // 3. Tính toán phần trăm (dạng thập phân như 0.33)
    const percentage = totalSkills === 0 ? 0 : Math.round((completedSkills / totalSkills) * 100) / 100;

    return { completedSkills, totalSkills, percentage };
  }
}
