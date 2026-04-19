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
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = this.buildPrompt(jdText, validNodeIds);

      this.logger.log('Sending request to Gemini (with 10s timeout)...');

      // 1. Tạo Promise Timeout 10 giây
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Gemini API Timeout (10 seconds)')), 10000);
      });

      // 2. Tạo Promise Call AI
      const apiPromise = model.generateContent(prompt).then(async (result) => {
        const response = await result.response;
        return response.text();
      });

      // 3. Race - Lấy kết quả của cái nào xong trước
      const text = await Promise.race([apiPromise, timeoutPromise]);

      // 4. Parse output với độ chính xác và chịu lỗi cao
      return this.parseAiResponse(text);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Gemini API Error: ${errorMessage}`);
      throw new InternalServerErrorException(errorMessage);
    }
  }

  /**
   * Trích xuất chắc chắn mảng JSON từ văn bản dù AI có trả về markdown hay văn bản thừa
   */
  private parseAiResponse(text: string): string[] {
    try {
      // Dùng Regex lấy chính xác chuỗi từ '[' đến ']'
      const match = text.match(/\[(.*?)\]/s);
      
      if (!match) {
        throw new Error('Không tìm thấy JSON Array trong response');
      }

      // Xây dựng lại mảng từ chuỗi Regex đã match
      const arrayString = '[' + match[1] + ']';
      const parsed = JSON.parse(arrayString);

      if (!Array.isArray(parsed)) {
        throw new Error('Kết quả trích xuất được không phải là mảng Array');
      }

      // Đảm bảo trả về mảng các ID string chuẩn
      return parsed.map((item) => String(item).trim());
    } catch (parseError) {
      this.logger.error(`Parser Error. Raw AI Response:\n${text}`);
      throw new Error('AI Output Parsing Failed');
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