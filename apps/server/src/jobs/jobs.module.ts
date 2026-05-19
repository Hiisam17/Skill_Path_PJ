import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { AiModule } from '../ai/ai.module';
import { ProgressModule } from '../progress/progress.module';

/**
 * Module for job market features including AI-powered gap analysis.
 * Imports AiModule for Claude integration and ProgressModule for user ID resolution.
 */
@Module({
  imports: [AiModule, ProgressModule],
  providers: [JobsService],
  controllers: [JobsController],
})
export class JobsModule {}
