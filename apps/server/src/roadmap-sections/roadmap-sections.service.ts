import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoadmapSectionsService {
  constructor(private prisma: PrismaService) {}

  async getDetail(id: number) {
    const section = await this.prisma.roadmapSection.findUnique({
      where: { id },
      include: {
        resources: {
          where: { isActive: true }, 
          include: { resourceType: true }, 
        },
      },
    });
    
    if (!section) throw new NotFoundException('Section not Found');

    return {
      title: section.title,
      content: section.description || '',
      resources: section.resources.map(res => ({
        id: res.id,
        type: res.resourceType?.name || 'link',
        title: res.title,
        url: res.url,
      }))
    };
  }
}
