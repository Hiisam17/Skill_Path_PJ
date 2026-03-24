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
   * Retrieve all available career paths for user selection
   * Returns complete list of career tracks (Backend Developer, Frontend Developer, etc.)
   * These paths serve as starting points for users to select their learning roadmap
   *
   * @returns Array of CareerPathDto objects sorted by creation date or custom order
   *
   * Example:
   * const paths = await careerPathsService.findAll()
   * // Returns: [
   * //   { id: 'uuid1', name: 'Backend Developer', description: '...' },
   * //   { id: 'uuid2', name: 'Frontend Developer', description: '...' },
   * // ]
   */
  async findAll(): Promise<CareerPathDto[]> {
    // TODO: Implement career path retrieval
    // 1. Query all career paths from database
    // 2. Order by name or custom display order
    // 3. Map results to CareerPathDto with id, name, description
    // 4. Ensure descriptions are user-friendly and motivational
    throw new Error('Not implemented');
  }
}
