import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Service responsible for managing roadmap section data.
 * Interacts with the database to retrieve section details and related resources.
 */
@Injectable()
export class RoadmapSectionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Retrieves a roadmap section along with its active resources.
   *
   * @param id - The unique identifier of the roadmap section.
   * @returns An object containing the section title, content description, and formatted resources.
   * @throws NotFoundException if the section ID does not exist in the database.
   */
  async getDetail(id: number) {
    const section = await this.prisma.roadmapSection.findUnique({
      where: { id },
      include: {
        skills: {
          include: {
            skill: {
              include: {
                resources: {
                  where: { isActive: true },
                  include: { resourceType: true },
                },
              },
            },
          },
        },
      },
    });

    if (!section) throw new NotFoundException('Section not Found');

    const allResources = section.skills.flatMap((rs) =>
      rs.skill?.resources.map((res) => ({
        id: res.id,
        type: res.resourceType?.name || 'link',
        title: res.title,
        url: res.url,
      })) ?? [],
    );

    return {
      title: section.title,
      content: section.description || '',
      resources: allResources,
    };
  }
}
