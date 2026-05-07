import { Controller, Param, Post, Get, Patch, Delete, Body, ParseIntPipe, HttpCode, HttpStatus, HttpException } from '@nestjs/common';
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
   * [PATCH] /progress/skills/:roadmapSkillId
   * Cập nhật trạng thái tiến độ cho một kỹ năng theo roadmapSkillId
   */
  @Patch('skills/:roadmapSkillId')
  async updateSkillStatus(
    @Param('roadmapSkillId', ParseIntPipe) roadmapSkillId: number,
    @Body('statusId', ParseIntPipe) statusId: number,
  ) {
    try {
      const userId = await this.progressService.getDemoUserId();
      return await this.progressService.updateSkillStatus(userId, roadmapSkillId, statusId);
    } catch (error: any) {
      throw new HttpException(
        { message: 'Custom Error Details', error: error.message, stack: error.stack },
        500,
      );
    }
  }

  /**
   * [DELETE] /progress/skills/:roadmapSkillId
   * Reset trạng thái tiến độ cho một kỹ năng theo roadmapSkillId
   */
  @Delete('skills/:roadmapSkillId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resetSkillStatus(
    @Param('roadmapSkillId', ParseIntPipe) roadmapSkillId: number,
  ) {
    const userId = await this.progressService.getDemoUserId();
    await this.progressService.resetSkillStatus(userId, roadmapSkillId);
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