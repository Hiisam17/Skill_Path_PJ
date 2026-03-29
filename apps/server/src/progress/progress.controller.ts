import { Controller, Post, Get, Param } from '@nestjs/common';
import { ProgressService } from './progress.service';

@Controller()
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('skills/:id/complete')
  async completeSkill(@Param('id') skillId: string) {
    // TODO: Sau này Dev A làm xong Auth, thay mockUserId bằng req.user.id
    const mockUserId = '7e123c4a-4b02-4273-abf8-f9ab0770c5ea';
    return this.progressService.completeSkill(mockUserId, skillId);
  }

  @Get('users/progress')
  async getUserProgress() {
    // TODO: Tương tự, sẽ dùng req.user.id từ Auth token
    const mockUserId = '7e123c4a-4b02-4273-abf8-f9ab0770c5ea';
    return this.progressService.getUserProgress(mockUserId);
  }
}
