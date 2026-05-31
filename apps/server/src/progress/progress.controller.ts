import {
  Controller,
  Param,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  HttpException,
  Logger,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import {
  UserSkillProgressDto,
  ProgressDto,
  MultiRoadmapProgressDto,
  UserSkillStatus,
} from '../types';
import { ProgressService } from './progress.service';
import { ProgressQueueService } from './progress-queue.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';

/** DTO cho mỗi item trong batch sync request */
interface BatchSyncItem {
  roadmapSkillId: number;
  status?: UserSkillStatus | null;
  statusId?: number | null;
  changedAt?: string;
}

interface AuthenticatedUser {
  id: string;
}

type AuthenticatedRequest = ExpressRequest & { user: AuthenticatedUser };

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function getErrorStack(error: unknown): string | undefined {
  return error instanceof Error ? error.stack : undefined;
}

@Controller('progress')
@UseGuards(JwtAuthGuard)
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
    @Request() req: AuthenticatedRequest,
  ) {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return { synced: 0, message: 'No items to sync' };
    }

    const userId = req.user.id;
    let syncedCount = 0;
    let errorCount = 0;

    this.logger.log(
      `[BatchSync] 📥 Nhận ${items.length} thay đổi tiến độ từ Frontend (userId: ${userId})`,
    );

    for (const item of items) {
      try {
        if (item.status === null || item.statusId === null) {
          // RESET: xóa progress
          await this.progressService.resetSkillStatus(
            userId,
            item.roadmapSkillId,
          );
        } else {
          // UPSERT: cập nhật hoặc tạo mới
          const statusId = item.status
            ? await this.progressService.getStatusId(item.status)
            : item.statusId;

          if (!statusId) {
            throw new Error('Missing status for progress item');
          }

          await this.progressService.updateSkillStatus(
            userId,
            item.roadmapSkillId,
            statusId,
          );
        }

        // Đẩy vào ProgressQueueService để tính lại % ở cycle tiếp theo
        this.progressQueueService.enqueueProgress(userId, item.roadmapSkillId);

        syncedCount++;
      } catch (error: unknown) {
        errorCount++;
        this.logger.warn(
          `[BatchSync] ⚠️ Lỗi sync roadmapSkillId=${item.roadmapSkillId}: ${getErrorMessage(error)}`,
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
    @Body('status') status: UserSkillStatus | undefined,
    @Body('statusId') statusId: number | undefined,
    @Request() req: AuthenticatedRequest,
  ): Promise<UserSkillProgressDto> {
    try {
      const userId = req.user.id;
      const resolvedStatusId = status
        ? await this.progressService.getStatusId(status)
        : Number(statusId);

      if (!resolvedStatusId || Number.isNaN(resolvedStatusId)) {
        throw new BadRequestException('Missing or invalid status');
      }

      const result = await this.progressService.updateSkillStatus(
        userId,
        roadmapSkillId,
        resolvedStatusId,
      );
      this.progressQueueService.enqueueProgress(userId, roadmapSkillId);
      return result;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          message: 'Custom Error Details',
          error: getErrorMessage(error),
          stack: getErrorStack(error),
        },
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
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    await this.progressService.resetSkillStatus(userId, roadmapSkillId);
    this.progressQueueService.enqueueProgress(userId, roadmapSkillId);
  }

  /**
   * [GET] /progress/current
   * Lấy tổng quan tiến độ học tập của Roadmap hiện tại (hoặc Roadmap mặc định)
   */
  @Get('current')
  async getUserProgress(
    @Request() req: AuthenticatedRequest,
  ): Promise<ProgressDto> {
    const userId = req.user.id;
    return this.progressService.getUserProgress(userId);
  }

  /**
   * [GET] /progress/all
   * Lấy chi tiết tiến độ học tập của tất cả các Roadmaps mà User đang tham gia
   */
  @Get('all')
  async getUserMultiRoadmapProgress(
    @Request() req: AuthenticatedRequest,
  ): Promise<MultiRoadmapProgressDto> {
    const userId = req.user.id;
    return this.progressService.getUserMultiRoadmapProgress(userId);
  }
}
