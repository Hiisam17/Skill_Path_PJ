import { Injectable, NotFoundException } from '@nestjs/common';
import { SkillDto, UserSkillStatus } from '../types';
import { PrismaService } from '../prisma/prisma.service';

/**
 * SkillsService quản lý các kỹ năng riêng lẻ trong lộ trình.
 * Cung cấp danh sách kỹ năng cùng với theo dõi tiến độ người dùng và tài nguyên học tập.
 */
@Injectable()
export class SkillsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ánh xạ trạng thái tiến độ từ Database sang Enum.
   */
  private mapProgressStatus(statusName?: string | null): UserSkillStatus {
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
   * Lấy tất cả các kỹ năng trong một lộ trình cùng với trạng thái tiến độ của người dùng.
   * Trả về danh sách các kỹ năng được sắp xếp kèm theo trạng thái hoàn thành hiện tại.
   * 
   * @param roadmapId - ID của lộ trình.
   * @param userId - ID của người dùng.
   */
  async findSkillsByRoadmap(
    roadmapId: number,
    userId: string,
  ): Promise<SkillDto[]> {
    // Truy vấn các kỹ năng thuộc các Section của Roadmap này
    const roadmapSkills = await this.prisma.roadmapSkill.findMany({
      where: {
        section: {
          roadmapId: roadmapId,
        },
        skillId: { not: null },
      },
      orderBy: [{ sectionId: 'asc' }, { id: 'asc' }],
      include: {
        skill: {
          include: {
            userProgress: {
              where: { userId },
              include: {
                status: {
                  select: { name: true },
                },
              },
              take: 1,
            },
          },
        },
      },
    });

    return roadmapSkills
      .filter((roadmapSkill) => roadmapSkill.skill !== null) 
      .map((roadmapSkill) => {
        const skill = roadmapSkill.skill!; 
        const progressStatusName = skill.userProgress[0]?.status?.name;

        return {
          id: String(skill.id),
          roadmapId: String(roadmapId),
          name: skill.name,
          description: skill.description ?? '',
          orderIndex: roadmapSkill.id, 
          status: this.mapProgressStatus(progressStatusName),
        };
      });
  }

  async findByRoadmap(roadmapId: number, userId: string): Promise<SkillDto[]> {
    return this.findSkillsByRoadmap(roadmapId, userId);
  }

  /**
   * Lấy chi tiết của một kỹ năng kèm theo các tài nguyên học tập (link, video, v.v.).
   *
   * @param id - ID của kỹ năng.
   * @returns Đối tượng chứa tiêu đề, mô tả và danh sách tài nguyên.
   * @throws NotFoundException nếu kỹ năng không tồn tại.
   */
  async getSkillDetail(id: number) {
    const skill = await this.prisma.skill.findUnique({
      where: { id },
      include: {
        resources: {
          where: { isActive: true },
          include: { resourceType: true },
        },
      },
    });

    if (!skill) throw new NotFoundException('Không tìm thấy kỹ năng tương ứng');

    return {
      title: skill.name,
      content: skill.description || '',
      resources: skill.resources.map(res => ({
        id: res.id,
        type: res.resourceType?.name || 'link',
        title: res.title,
        url: res.url,
      }))
    };
  }
}