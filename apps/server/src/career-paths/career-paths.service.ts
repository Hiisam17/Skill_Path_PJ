import { Injectable } from '@nestjs/common';
import { CareerPathDto } from '../types';
import { PrismaService } from '../prisma/prisma.service';

/**
 * CareerPathsService manages available career tracks and learning paths
 * Provides career options for users to choose from during onboarding
 */
@Injectable()
export class CareerPathsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves all career paths available for user selection.
   *
   * @returns Array of CareerPathDto objects sorted alphabetically by name.
   */
  async findAll(): Promise<CareerPathDto[]> {
    const careerPaths = await this.prisma.careerPath.findMany({
      orderBy: { name: 'asc' },
    });

    return careerPaths.map((careerPath) => ({
      id: String(careerPath.id),
      name: careerPath.name,
      description: careerPath.description ?? '',
    }));
  }
}
