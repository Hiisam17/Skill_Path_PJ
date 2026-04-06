import { Controller, Get, Param } from '@nestjs/common';
import { SkillDto } from '../types';
import { SkillsService } from './skills.service';
import { ProgressService } from '../progress/progress.service';

@Controller('roadmaps')
export class SkillsController {
  constructor(
    private readonly skillsService: SkillsService,
    private readonly progressService: ProgressService,
  ) {}

  @Get(':roadmapId/skills')
  // TODO: add @UseGuards(JwtAuthGuard) when Dev A merges
  async getSkillsByRoadmap(
    @Param('roadmapId') roadmapId: string,
  ): Promise<SkillDto[]> {
    const userId = await this.progressService.getDemoUserId();
    // TODO: get userId from @Request() req.user.id after Dev A merges
    return this.skillsService.findSkillsByRoadmap(roadmapId, userId);
  }
}
