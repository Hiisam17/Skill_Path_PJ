import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

/**
 * PrismaService - Wraps PrismaClient with NestJS lifecycle hooks
 * Handles database connection initialization and cleanup
 * Provides singleton access to Prisma ORM throughout the application
 *
 * Usage in services:
 * - constructor(private readonly prisma: PrismaService) {}
 * - Access models: this.prisma.user.findUnique(), this.prisma.skill.create(), etc.
 */
@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, Prisma.LogLevel>
  implements OnModuleInit, OnModuleDestroy
{
  private logger = new Logger(PrismaService.name);

  constructor() {
    super();
  }

  /**
   * Connect to database when module initializes
   * Called automatically by NestJS after dependency injection setup
   */
  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Database connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  /**
   * Disconnect from database when module is destroyed
   * Ensures graceful shutdown with proper resource cleanup
   */
  async onModuleDestroy(): Promise<void> {
    try {
      await this.$disconnect();
      this.logger.log('Database disconnected successfully');
    } catch (error) {
      this.logger.error('Failed to disconnect from database', error);
    }
  }
}
