import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { ProgressService } from './progress.service';

@Injectable()
export class ProgressQueueService {
  private readonly logger = new Logger(ProgressQueueService.name);

  // Sử dụng Map để lưu trữ. 
  // Key là dạng "userId:roadmapSkillId" để tự động ghi đè (chống spam click)
  private cacheQueue = new Map<string, { userId: string; roadmapSkillId: number }>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly progressService: ProgressService,
  ) {}

  /**
   * Đẩy tiến độ vào RAM. Hàm này trả về ngay lập tức (Non-blocking).
   */
  enqueueProgress(userId: string, roadmapSkillId: number): void {
    const key = `${userId}:${roadmapSkillId}`;
    this.cacheQueue.set(key, { userId, roadmapSkillId });
  }

  /**
   * Cron Job chạy mỗi 30 giây để đẩy dữ liệu từ RAM xuống DB.
   * Bạn có thể đổi thành EVERY_10_SECONDS hoặc EVERY_MINUTE tùy nhu cầu.
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  async flushQueueToDatabase() {
    if (this.cacheQueue.size === 0) return;

    // 1. Copy queue hiện tại và làm sạch (clear) queue gốc ngay lập tức 
    // để không chặn (block) các request mới đang bay vào.
    const batch = new Map(this.cacheQueue);
    this.cacheQueue.clear();

    this.logger.log(`Bắt đầu đồng bộ ${batch.size} bản ghi tiến độ xuống DB...`);

    const records = Array.from(batch.values());

    try {
      const completedStatusId = await this.progressService.getCompletedStatusId();
      const uniqueRoadmapSkillIds = [...new Set(records.map(r => r.roadmapSkillId))];

      const affectedRoadmapSkills = await this.prisma.roadmapSkill.findMany({
        where: { id: { in: uniqueRoadmapSkillIds } },
        select: { id: true, skillId: true, section: { select: { roadmapId: true } } },
      });

      await this.prisma.userSkillProgress.createMany({
        data: records.map((record) => {
          const rs = affectedRoadmapSkills.find(r => r.id === record.roadmapSkillId);
          return {
            userId: record.userId,
            roadmapSkillId: record.roadmapSkillId,
            skillId: rs?.skillId || null,
            statusId: completedStatusId,
            completedAt: new Date(),
          };
        }),
        skipDuplicates: true, 
      });

      // Lấy danh sách các roadmapId cần update (loại bỏ null và trùng lặp)
      const affectedRoadmapIds = [...new Set(
        affectedRoadmapSkills
          .map((rs) => rs.section?.roadmapId)
          .filter((id): id is number => id !== null && id !== undefined)
      )];

      // 4. Gọi hàm tính lại % (hàm chúng ta đã viết ở bước trước)
      // Chạy song song (Promise.all) để tăng tốc
      const uniqueUserIds = [...new Set(records.map(r => r.userId))];
      
      const syncPromises = [];
      for (const userId of uniqueUserIds) {
        for (const roadmapId of affectedRoadmapIds) {
           syncPromises.push(
             this.progressService.syncRoadmapProgressPercentage(userId, roadmapId)
           );
        }
      }
      await Promise.all(syncPromises);

      this.logger.log(`Đồng bộ thành công! Đã cập nhật % cho ${syncPromises.length} cặp User-Roadmap.`);

    } catch (error) {
      this.logger.error('Lỗi khi flush tiến độ xuống DB', error);
      // Nâng cao: Nếu lỗi, có thể nhét (set) lại dữ liệu vào cacheQueue để chạy lại ở cycle sau.
    }
  }
}