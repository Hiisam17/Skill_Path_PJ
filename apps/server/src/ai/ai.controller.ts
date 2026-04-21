import { Controller, Post, Body, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { AiService } from './ai.service';
import { MOCK_JOBS } from '../data/mockGaps';

@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(private readonly aiService: AiService) {}

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

    // Gộp description và requirements lại thành một đoạn JD hoàn chỉnh cho AI
    const fullJdText = `
      Description:
      ${job.description}
      
      Requirements:
      ${job.requirements}
    `;

    // Tạm thời mock danh sách Valid Node IDs bao quát các kỹ năng trong mockGaps.ts
    const mockValidNodeIds = [
      "ASP.NET", "React", ".NET", "C#", "SQL", "Java", "Maven", "Spring Boot", 
      "Relational Databases", "Go", "AWS", "Software Testing", "Ruby", 
      "Ruby on Rails", "PostgreSQL", "REST", "Node.js", "Express", "Git"
    ];

    // ---------------------------------------------------------
    // BƯỚC 2: GỌI XUỐNG AI SERVICE
    // ---------------------------------------------------------
    try {
      const gapNodeIds = await this.aiService.analyzeJobDescription(
        fullJdText, 
        mockValidNodeIds
      );

      // Trả về đúng Contract cho Dev 3
      return {
        gapNodeIds: gapNodeIds,
        source: "ai"
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Lỗi khi gọi AI, kích hoạt Fallback: ${errorMessage}`);
      
      // ---------------------------------------------------------
      // FALLBACK: Lấy mảng gapNodes được chuẩn bị sẵn từ mock data
      // ---------------------------------------------------------
      return {
        gapNodeIds: job.gapNodes,
        source: "fallback"
      };
    }
  }
}