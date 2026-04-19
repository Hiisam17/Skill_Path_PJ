import { Controller, Post, Body, InternalServerErrorException, Logger } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(private readonly aiService: AiService) {}

  @Post('analyze-gap')
  async analyzeGap(@Body('jobId') jobId: string) {
    this.logger.log(`Nhận request phân tích cho Job ID: ${jobId}`);

    // ---------------------------------------------------------
    // BƯỚC 1: MOCK DỮ LIỆU CỦA DEV 1 (Vì Task D3 chưa xong)
    // Sau này bạn sẽ thay bằng: await this.prisma.jobTemplate.findUnique(...)
    // ---------------------------------------------------------
    const mockJob = {
      id: jobId,
      jdText: "We are looking for a Frontend Developer. Must have deep knowledge of HTML, CSS, JavaScript and React. Familiarity with Git is required.",
      preAnalyzedGaps: ["html", "css", "javascript", "react", "git"] // Lưới an toàn của Dev 1
    };

    const mockValidNodeIds = ["html", "css", "javascript", "react", "nodejs", "git", "docker"];

    // ---------------------------------------------------------
    // BƯỚC 2: GỌI XUỐNG AI SERVICE (Task A2)
    // ---------------------------------------------------------
    try {
      // Gọi hàm AI bạn đã viết ở file ai.service.ts
      const gapNodeIds = await this.aiService.analyzeJobDescription(
        mockJob.jdText, 
        mockValidNodeIds
      );

      // ---------------------------------------------------------
      // BƯỚC 3: TRẢ VỀ ĐÚNG HỢP ĐỒNG (CONTRACT) CHO DEV 3
      // ---------------------------------------------------------
      return {
        gapNodeIds: gapNodeIds,
        source: "ai"
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Lỗi khi gọi AI, kích hoạt Fallback: ${errorMessage}`);
      
      // ---------------------------------------------------------
      // FALLBACK: Trả về kết quả phân tích sẵn có của Dev 1 nếu AI lỗi/timeout
      // ---------------------------------------------------------
      return {
        gapNodeIds: mockJob.preAnalyzedGaps,
        source: "fallback"
      };
    }
  }
}