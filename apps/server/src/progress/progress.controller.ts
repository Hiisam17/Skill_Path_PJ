import { Controller, Param, Post, Get, ParseIntPipe,HttpCode, HttpStatus } from '@nestjs/common';
import { 
  UserSkillProgressDto, 
  ProgressDto, 
  MultiRoadmapProgressDto 
} from '../types';
import { ProgressService } from './progress.service';
import { ProgressQueueService } from './progress-queue.service';

@Controller('progress')
export class ProgressController {
  constructor(
	private readonly progressService: ProgressService,
	private readonly progressQueue: ProgressQueueService
) {}

  /**
   * [POST] /progress/skills/:skillId/complete
   * Đánh dấu hoàn thành một kỹ năng (Skill) cho User hiện tại
   */
  @Post('skills/:skillId/complete')
  @HttpCode(HttpStatus.ACCEPTED)
  async completeSkill(
    @Param('skillId', ParseIntPipe) skillId: number,
  ) {
    const userId = await this.progressService.getDemoUserId();
    
    // Đẩy vào RAM rồi báo thành công luôn, Frontend không phải chờ DB I/O
    this.progressQueue.enqueueProgress(userId, skillId);
    
    return { 
      message: 'Progress recorded locally and scheduled for sync.',
      status: 'QUEUED'
    };
  }

  /**
   * [GET] /progress/current
   * Lấy tổng quan tiến độ học tập của Roadmap hiện tại (hoặc Roadmap mặc định)
   */
  @Get('current')
  async getUserProgress(): Promise<ProgressDto> {
    const userId = await this.progressService.getDemoUserId();
    return this.progressService.getUserProgress(userId);
  }

  /**
   * [GET] /progress/all
   * Lấy chi tiết tiến độ học tập của tất cả các Roadmaps mà User đang tham gia
   */
  @Get('all')
  async getUserMultiRoadmapProgress(): Promise<MultiRoadmapProgressDto> {
    const userId = await this.progressService.getDemoUserId();
    return this.progressService.getUserMultiRoadmapProgress(userId);
  }
}