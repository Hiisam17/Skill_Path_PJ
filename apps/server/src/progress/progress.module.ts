import { Module } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { ProgressQueueService } from './progress-queue.service';

@Module({
  providers: [ProgressService, ProgressQueueService],
  controllers: [ProgressController],
  exports: [ProgressService, ProgressQueueService],
})
export class ProgressModule { }
