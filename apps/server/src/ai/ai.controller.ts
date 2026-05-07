import { Controller, Post, Body, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { AiService } from './ai.service';
import { MOCK_JOBS } from '../data/mockGaps';

/**
 * AiController cung cấp các API liên quan đến trí tuệ nhân tạo.
 * Hiện tại hỗ trợ phân tích khoảng cách kỹ năng (Gap Analysis) dựa trên Job ID.
 */
@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(private readonly aiService: AiService) {}

  /**
   * API phân tích khoảng cách kỹ năng.
   * Nhận vào jobId, tìm JD tương ứng và gửi cho AI để biết ứng viên cần học thêm gì.
   * Có cơ chế Fallback (dự phòng) nếu AI gặp lỗi.
   * 
   * @param jobId ID của công việc cần phân tích.
   */
  @Post('analyze-gap')
  async analyzeGap(@Body('jobId') jobId: string) {
    this.logger.log(`Nhận request phân tích cho Job ID: ${jobId}`);

    // ---------------------------------------------------------
    // BƯỚC 1: TÌM JOB TRONG MOCK DATA THEO ID TỪ FRONTEND
    // ---------------------------------------------------------
    const job = MOCK_JOBS.find(j => j.id === jobId);

    if (!job) {
      throw new NotFoundException(`Không tìm thấy Job với ID: ${jobId}`);
    }

    // Gộp description (mô tả) và requirements (yêu cầu) lại thành một văn bản JD hoàn chỉnh
    const fullJdText = `
      Description:
      ${job.description}
      
      Requirements:
      ${job.requirements}
    `;

    // Danh sách các ID kỹ năng mẫu (thực tế sẽ lấy từ Database Roadmap)
    const mockValidNodeIds = [
      "ASP.NET", "React", ".NET", "C#", "SQL", "Java", "Maven", "Spring Boot", 
      "Relational Databases", "Go", "AWS", "Software Testing", "Ruby", 
      "Ruby on Rails", "PostgreSQL", "REST", "Node.js", "Express", "Git"
    ];

    // ---------------------------------------------------------
    // BƯỚC 2: GỌI SERVICE XỬ LÝ VỚI AI
    // ---------------------------------------------------------
    try {
      const gapNodeIds = await this.aiService.analyzeJobDescription(
        fullJdText, 
        mockValidNodeIds
      );

      // Trả về kết quả từ AI thành công
      return {
        gapNodeIds: gapNodeIds,
        source: "ai"
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Lỗi khi gọi AI, kích hoạt cơ chế dự phòng (Fallback): ${errorMessage}`);
      
      // ---------------------------------------------------------
      // FALLBACK: Trả về mảng gapNodes đã được định nghĩa sẵn trong mock data
      // ---------------------------------------------------------
      return {
        gapNodeIds: job.gapNodes,
        source: "fallback"
      };
    }
  }
}