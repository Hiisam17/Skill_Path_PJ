import { Injectable } from '@nestjs/common';
import { CareerPathDto } from '../types';
import { PrismaService } from '../prisma/prisma.service';

/**
 * CareerPathsService manages available career tracks and learning paths
 * Provides career options for users to choose from during onboarding
 */
@Injectable()
export class CareerPathsService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Retrieves all system roadmaps available for user selection.
   *
   * @returns Array of CareerPathDto objects sorted alphabetically by title.
   */
  async findAll(): Promise<CareerPathDto[]> {
    const roadmaps = await this.prisma.roadmap.findMany({
      where: { userId: null }, // Only system roadmaps
      orderBy: { title: 'asc' },
    });

    return roadmaps.map((roadmap) => ({
      id: String(roadmap.id),
      name: roadmap.title,
      description: roadmap.description ?? '',
    }));
  }
}
