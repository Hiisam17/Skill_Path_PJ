import { Controller, Get } from '@nestjs/common';
import { ProgressDto } from '../types';
import { ProgressService } from '../progress/progress.service';

@Controller('users')
export class UsersController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('progress')
  async getProgress(): Promise<ProgressDto> {
    const userId = await this.progressService.getDemoUserId();
    return this.progressService.getUserProgress(userId);
  }
}
