import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * PrismaModule - Global infrastructure module for database access
 * Provides PrismaService as a global singleton, accessible from all modules
 * without requiring explicit imports in each module
 *
 * Usage:
 * - Import PrismaModule in AppModule with @Global() decorator
 * - Inject PrismaService in any service: constructor(private prisma: PrismaService) {}
 * - Access Prisma client: this.prisma.user.findUnique(), this.prisma.skill.findMany(), etc.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
