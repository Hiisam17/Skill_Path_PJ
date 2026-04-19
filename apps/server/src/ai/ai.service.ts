import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private readonly genAI: GoogleGenerativeAI;
  private readonly logger = new Logger(AiService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Phân tích JD và đối chiếu với Roadmap
   */
  async analyzeJobDescription(jdText: string, validNodeIds: string[]): Promise<string[]> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = this.buildPrompt(jdText, validNodeIds);

      this.logger.log('Sending request to Gemini...');
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse kết quả trả về từ dạng string JSON array sang mảng thực tế
      // Làm sạch text (loại bỏ markdown block nếu model lỡ trả về)
      const cleanText = text.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanText);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Gemini API Error: ${errorMessage}`);
      throw new InternalServerErrorException('Failed to analyze JD with AI');
    }
  }

  private buildPrompt(jdText: string, validNodeIds: string[]): string {
    return `
    Bạn là một chuyên gia phân tích kỹ năng IT.
    Nhiệm vụ của bạn là đối chiếu Mô tả công việc (JD) với Lộ trình học tập (Roadmap) và tìm ra những kỹ năng (Node IDs) mà ứng viên CẦN PHẢI HỌC để đáp ứng JD này.

    [DANH SÁCH NODE ID CHO PHÉP (TỪ ROADMAP)]
    ${validNodeIds.join(', ')}

    [MÔ TẢ CÔNG VIỆC (JD)]
    ${jdText}

    [YÊU CẦU BẮT BUỘC - TUÂN THỦ TUYỆT ĐỐI]
    1. CHỈ ĐƯỢC CHỌN các ID có mặt chính xác trong [DANH SÁCH NODE ID CHO PHÉP]. TUYỆT ĐỐI KHÔNG tự bịa ra ID mới.
    2. CHỈ TRẢ VỀ một mảng JSON thuần túy chứa các ID (JSON Array). 
    3. KHÔNG giải thích, KHÔNG chào hỏi, KHÔNG bọc bằng thẻ markdown.

    [VÍ DỤ KẾT QUẢ MONG MUỐN CHUẨN XÁC]
    ["html", "css", "javascript", "react"]
    `;
  }
}