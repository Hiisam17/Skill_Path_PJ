import { Controller, Param, Post } from '@nestjs/common';
import { UserSkillProgressDto } from '../types';
import { ProgressService } from './progress.service';

@Controller('skills')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post(':skillId/complete')
  async completeSkill(
    @Param('skillId') skillId: string,
  ): Promise<UserSkillProgressDto> {
    const userId = await this.progressService.getDemoUserId();
    return this.progressService.completeSkill(userId, skillId);
  }
}
