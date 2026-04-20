import { Injectable, NotFoundException } from '@nestjs/common';
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
   */
  async findSkillsByRoadmap(
    roadmapId: number,
    userId: string,
  ): Promise<SkillDto[]> {

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
   * Retrieves skill details with associated active learning resources.
   *
   * @param id - The skill ID.
   * @returns An object containing skill title, description, and formatted resources.
   * @throws NotFoundException if the skill does not exist.
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

    if (!skill) throw new NotFoundException('Skill not found');

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