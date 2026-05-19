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

  private getResourceDedupKey(resource: {
    title: string;
    url: string | null;
    resourceType?: { name: string } | null;
  }): string {
    const normalizedUrl = resource.url?.trim().toLowerCase();
    if (normalizedUrl) {
      return `url:${normalizedUrl}`;
    }

    const normalizedTitle = resource.title.trim().toLowerCase();
    const normalizedType = resource.resourceType?.name?.trim().toLowerCase() || '';
    return `title:${normalizedTitle}|type:${normalizedType}`;
  }

  private deduplicateResources<T extends {
    id: number;
    title: string;
    url: string | null;
    resourceType?: { name: string } | null;
  }>(resources: T[]): T[] {
    const seenIds = new Set<number>();
    const seenKeys = new Set<string>();

    return resources.filter((resource) => {
      const key = this.getResourceDedupKey(resource);

      if (seenIds.has(resource.id) || seenKeys.has(key)) {
        return false;
      }

      seenIds.add(resource.id);
      seenKeys.add(key);
      return true;
    });
  }

  private mapProgressStatus(statusName?: string | null): UserSkillStatus {
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
        skill: true,
        userProgress: {
          where: { userId },
          include: {
            status: { select: { name: true } },
          },
          take: 1,
        },
      },
    });

    return roadmapSkills
      .filter((roadmapSkill) => roadmapSkill.skill !== null)
      .map((roadmapSkill) => {
        const skill = roadmapSkill.skill!;
        const progressStatusName = roadmapSkill.userProgress[0]?.status?.name;

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
  async getSkillDetail(roadmapSkillId: number, userId: string) {
    const roadmapSkill = await this.prisma.roadmapSkill.findUnique({
      where: { id: roadmapSkillId },
      include: {
        skill: {
          include: {
            resources: {
              where: { isActive: true },
              include: { resourceType: true },
            },
          },
        },
        resources: {
          where: { isActive: true },
          include: { resourceType: true },
        },
        userProgress: {
          where: { userId },
          include: {
            status: { select: { id: true, name: true } },
          },
          take: 1,
        },
      },
    });

    if (!roadmapSkill) throw new NotFoundException('Roadmap skill not found');

    const skill = roadmapSkill.skill;
    if (!skill) throw new NotFoundException('Skill not found');

    const progress = roadmapSkill.userProgress[0];
    const resources = this.deduplicateResources([
      ...roadmapSkill.resources,
      ...(skill.resources || []),
    ]);

    return {
      title: skill.name,
      content: skill.description || '',
      statusId: progress?.statusId || null,
      status: this.mapProgressStatus(progress?.status?.name),
      resources: resources.map(res => ({
        id: res.id,
        type: res.resourceType?.name || 'link',
        title: res.title,
        url: res.url,
      }))
    };
  }
}
