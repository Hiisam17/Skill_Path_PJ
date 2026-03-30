import { Controller, Post, Get, Param, ParseIntPipe } from '@nestjs/common'; // Thêm ParseIntPipe
import { ProgressService } from './progress.service';

@Controller()
export class ProgressController {
  constructor(private readonly progressService: ProgressService) { }

  @Post('skills/:id/complete')
  // Thêm ParseIntPipe vào đây để ép kiểu về number
  async completeSkill(@Param('id', ParseIntPipe) skillId: number) {

    const mockUserId = '01cbcd3c-05c8-46cf-b807-4b913656ca4b';

    return this.progressService.completeSkill(mockUserId, skillId);
  }

  @Get('users/progress')
  async getUserProgress() {
    // Nhớ dán cùng một UUID vào đây luôn nhé
    const mockUserId = '01cbcd3c-05c8-46cf-b807-4b913656ca4b';
    return this.progressService.getUserProgress(mockUserId);
  }
}