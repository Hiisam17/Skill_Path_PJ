import { Injectable } from '@nestjs/common';
import { SkillDto, UserSkillStatus } from '../types';
import { PrismaService } from '../prisma/prisma.service';

/**
 * SkillsService manages individual skills within roadmaps
 * Provides skill listings with user progress tracking and learning resources
 */
@Injectable()
export class SkillsService {
  constructor(private readonly prisma: PrismaService) {}

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
   * Retrieve all skills in a roadmap with user's progress status
   * Returns ordered list of skills user should learn, with current completion status
   * Skills maintain a specific order (orderIndex) for progressive learning
   *
   * @param roadmapId - UUID of the roadmap to fetch skills from
   * @param userId - UUID of authenticated user (to fetch their progress status)
   * @returns Array of SkillDto objects ordered by orderIndex with user's completion status
   *
   * Example:
   * const skills = await skillsService.findByRoadmap('roadmap-id', 'user-id')
   * // Returns: [
   * //   { id: 'uuid1', roadmapId: '...', name: 'Git', description: '...', orderIndex: 1, status: 'COMPLETED' },
   * //   { id: 'uuid2', roadmapId: '...', name: 'Linux', description: '...', orderIndex: 2, status: 'NOT_STARTED' },
   * // ]
   */
  async findSkillsByRoadmap(
    roadmapId: string,
    userId: string,
  ): Promise<SkillDto[]> {
    const roadmapIdNumber = Number(roadmapId);
    if (!Number.isInteger(roadmapIdNumber) || roadmapIdNumber <= 0) {
      return [];
    }

    const roadmapSkills = await this.prisma.roadmapSkill.findMany({
      where: {
        section: {
          roadmapId: roadmapIdNumber,
        },
        skillId: { not: null },
      },
      orderBy: [{ sectionId: 'asc' }, { stepNumber: 'asc' }],
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
      .filter((roadmapSkill) => roadmapSkill.skill)
      .map((roadmapSkill) => {
        const skill = roadmapSkill.skill!;
        const progressStatusName = skill.userProgress[0]?.status?.name;

        return {
          id: String(skill.id),
          roadmapId: String(roadmapIdNumber),
          name: skill.name,
          description: skill.description ?? '',
          orderIndex: roadmapSkill.stepNumber,
          status: this.mapProgressStatus(progressStatusName),
        };
      });
  }

  async findByRoadmap(roadmapId: string, userId: string): Promise<SkillDto[]> {
    return this.findSkillsByRoadmap(roadmapId, userId);
  }
}
