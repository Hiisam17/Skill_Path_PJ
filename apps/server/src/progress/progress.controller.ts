import { Controller, Param, Post, Get, Patch, Delete, Body, ParseIntPipe, HttpCode, HttpStatus, HttpException, Logger } from '@nestjs/common';
import { 
  UserSkillProgressDto, 
  ProgressDto, 
  MultiRoadmapProgressDto 
} from '../types';
import { ProgressService } from './progress.service';
import { ProgressQueueService } from './progress-queue.service';

/** DTO cho mỗi item trong batch sync request */
interface BatchSyncItem {
  roadmapSkillId: number;
  statusId: number | null;
  changedAt?: string;
}

@Controller('progress')
export class ProgressController {
  private readonly logger = new Logger(ProgressController.name);

  constructor(
	private readonly progressService: ProgressService,
	private readonly progressQueueService: ProgressQueueService,
) {}

  /**
   * [POST] /progress/batch-sync
   * Nhận danh sách thay đổi tiến độ từ Frontend (Background Batch Sync).
   * Frontend gom các thay đổi vào localStorage mỗi 60 giây rồi gửi hàng loạt.
   *
   * Body: { items: BatchSyncItem[] }
   * - Nếu statusId là null → reset (xóa) progress cho roadmapSkillId đó.
   * - Nếu statusId có giá trị → upsert trạng thái mới.
   */
  @Post('batch-sync')
  async batchSyncProgress(
    @Body('items') items: BatchSyncItem[],
  ) {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return { synced: 0, message: 'No items to sync' };
    }

    const userId = await this.progressService.getDemoUserId();
    let syncedCount = 0;
    let errorCount = 0;

    this.logger.log(
      `[BatchSync] 📥 Nhận ${items.length} thay đổi tiến độ từ Frontend (userId: ${userId})`,
    );

    for (const item of items) {
      try {
        if (item.statusId === null) {
          // RESET: xóa progress
          await this.progressService.resetSkillStatus(userId, item.roadmapSkillId);
        } else {
          // UPSERT: cập nhật hoặc tạo mới
          await this.progressService.updateSkillStatus(
            userId,
            item.roadmapSkillId,
            item.statusId,
          );
        }

        // Đẩy vào ProgressQueueService để tính lại % ở cycle tiếp theo
        this.progressQueueService.enqueueProgress(userId, item.roadmapSkillId);

        syncedCount++;
      } catch (error: any) {
        errorCount++;
        this.logger.warn(
          `[BatchSync] ⚠️ Lỗi sync roadmapSkillId=${item.roadmapSkillId}: ${error.message}`,
        );
      }
    }

    this.logger.log(
      `[BatchSync] ✅ Hoàn tất: ${syncedCount} thành công, ${errorCount} lỗi.`,
    );

    return {
      synced: syncedCount,
      errors: errorCount,
      total: items.length,
    };
  }

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