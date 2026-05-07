import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

/**
 * AiService chịu trách nhiệm tương tác với Google Gemini AI.
 * Dùng để phân tích Job Description (JD) và gợi ý các kỹ năng cần học.
 */
@Injectable()
export class AiService {
  private readonly genAI: GoogleGenerativeAI;
  private readonly logger = new Logger(AiService.name);

  constructor(private configService: ConfigService) {
    // Khởi tạo Gemini AI với API Key từ file môi trường (.env)
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Phân tích JD và đối chiếu với Roadmap để tìm ra các kỹ năng còn thiếu (gap skills).
   * 
   * @param jdText Nội dung văn bản của Job Description.
   * @param validNodeIds Danh sách các ID kỹ năng hợp lệ (từ Roadmap) để AI chọn lựa.
   * @returns Mảng các ID kỹ năng mà ứng viên cần học.
   */
  async analyzeJobDescription(jdText: string, validNodeIds: string[]): Promise<string[]> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const prompt = this.buildPrompt(jdText, validNodeIds);

      this.logger.log('Đang gửi yêu cầu phân tích tới Gemini (timeout 10s)...');

      // 1. Tạo Promise Timeout 10 giây để tránh treo ứng dụng nếu AI phản hồi chậm
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Gemini API Timeout (10 seconds)')), 10000);
      });

      // 2. Tạo Promise gọi API AI thực tế
      const apiPromise = model.generateContent(prompt).then(async (result) => {
        const response = await result.response;
        return response.text();
      });

      // 3. Race - Chạy đua giữa API và Timeout, cái nào xong trước thì lấy cái đó
      const text = await Promise.race([apiPromise, timeoutPromise]);

      // 4. Parse (phân tách) kết quả từ văn bản thô của AI sang mảng JSON
      return this.parseAiResponse(text);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Lỗi Gemini API: ${errorMessage}`);
      throw new InternalServerErrorException(errorMessage);
    }
  }

  /**
   * Trích xuất mảng JSON từ phản hồi của AI.
   * AI đôi khi trả về thêm các đoạn văn bản giải thích hoặc thẻ markdown (```json ... ```), 
   * hàm này sẽ dùng Regex để lấy đúng phần mảng [].
   * 
   * @param text Văn bản thô phản hồi từ AI.
   */
  private parseAiResponse(text: string): string[] {
    try {
      // Sử dụng Regex để tìm chuỗi nằm giữa cặp dấu ngoặc vuông [ ... ]
      const match = text.match(/\[(.*?)\]/s);

      if (!match) {
        throw new Error('Không tìm thấy định dạng mảng JSON trong phản hồi của AI');
      }

      // Xây dựng lại chuỗi mảng và parse sang mảng JavaScript
      const arrayString = '[' + match[1] + ']';
      const parsed = JSON.parse(arrayString);

      if (!Array.isArray(parsed)) {
        throw new Error('Kết quả trích xuất được không phải là một mảng (Array)');
      }

      // Chuẩn hóa: ép kiểu về string và xóa khoảng trắng dư thừa
      return parsed.map((item) => String(item).trim());
    } catch (parseError) {
      this.logger.error(`Lỗi khi phân tích kết quả AI. Nội dung thô:\n${text}`);
      throw new Error('Không thể xử lý định dạng đầu ra của AI');
    }
  }

  /**
   * Xây dựng Prompt gửi cho AI. 
   * Cung cấp ngữ cảnh là một chuyên gia phân tích kỹ năng và các quy tắc nghiêm ngặt.
   */
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
