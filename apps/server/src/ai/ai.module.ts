import { Module } from '@nestjs/common';
import { AiGapService } from './ai-gap.service';

/**
 * Module providing AI-powered services.
 * Exports AiGapService for use by other modules (e.g., JobsModule).
 */
@Module({
  providers: [AiGapService],
  exports: [AiGapService],
})
export class AiModule {}
