import { Controller, Post, Get, Param } from '@nestjs/common';
import { ProgressService } from './progress.service';

// Bỏ chữ 'progress' trong @Controller() đi để bạn có thể tự định nghĩa 
// endpoint chính xác theo như API Contract yêu cầu.
@Controller() 
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  // Nhiệm vụ 1: Đánh dấu hoàn thành skill
  // Endpoint: POST /skills/:id/complete
  @Post('skills/:id/complete')
  async completeSkill(@Param('id') skillId: string) {
    // Tạm thời trả về Mock Data đúng chuẩn API Contract
    // Sau khi có DB và Auth thì sẽ thay bằng:
    // return this.progressService.completeSkill(userId, skillId);
    
    return { status: 'COMPLETED' };
  }

  // Nhiệm vụ 2: Lấy thông tin tiến độ của user
  // Endpoint: GET /users/progress
  @Get('users/progress')
  async getUserProgress() {
    // Tạm thời trả về Mock Data đúng chuẩn API Contract
    // Sau khi có DB và Auth thì sẽ thay bằng: 
    // return this.progressService.getUserProgress(userId);
    
    return { completedSkills: 2, totalSkills: 6, percentage: 0.33 };
  }
}