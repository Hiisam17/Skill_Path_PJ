import { Controller, Param, Post, Get, Patch, Delete, Body, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
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
) {}

  /**
   * [PATCH] /progress/skills/:skillId
   * Cập nhật trạng thái tiến độ cho một kỹ năng
   */
  @Patch('skills/:skillId')
  async updateSkillStatus(
    @Param('skillId', ParseIntPipe) skillId: number,
    @Body('statusId', ParseIntPipe) statusId: number,
  ) {
    const userId = await this.progressService.getDemoUserId();
    return this.progressService.updateSkillStatus(userId, skillId, statusId);
  }

  /**
   * [DELETE] /progress/skills/:skillId
   * Reset trạng thái tiến độ cho một kỹ năng
   */
  @Delete('skills/:skillId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resetSkillStatus(
    @Param('skillId', ParseIntPipe) skillId: number,
  ) {
    const userId = await this.progressService.getDemoUserId();
    await this.progressService.resetSkillStatus(userId, skillId);
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