import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { SkillDto } from '../types';
import { SkillsService } from './skills.service';
import { ProgressService } from '../progress/progress.service';

/**
 * Controller for skill-related endpoints scoped under roadmaps.
 * Provides skill listing and detail retrieval.
 *
 * NOTE: Uses demo user ID as a temporary measure until auth guard integration.
 */
@Controller('roadmaps')
export class SkillsController {
  constructor(
    private readonly skillsService: SkillsService,
    private readonly progressService: ProgressService,
  ) { }

  // TODO(auth): Replace demo user with @UseGuards(JwtAuthGuard) and @Request() req.user.id.
  @Get(':roadmapId/skills')
  async getSkillsByRoadmap(
    @Param('roadmapId', ParseIntPipe) roadmapId: number,
  ): Promise<SkillDto[]> {
    const userId = await this.progressService.getDemoUserId();
    return this.skillsService.findSkillsByRoadmap(roadmapId, userId);
  }
  @Get(':id/detail')
  async getSkillDetail(@Param('id', ParseIntPipe) id: number) {
    const userId = await this.progressService.getDemoUserId();
    return this.skillsService.getSkillDetail(id, userId);
  }
}
