import { Controller, Get, Param } from '@nestjs/common';
import { SkillDto } from '../types';
import { SkillsService } from './skills.service';

@Controller('roadmaps')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get(':roadmapId/skills')
  // TODO: add @UseGuards(JwtAuthGuard) when Dev A merges
  async getSkillsByRoadmap(
    @Param('roadmapId') roadmapId: string,
  ): Promise<SkillDto[]> {
    const userId = 'test-user-id';
    // TODO: get userId from @Request() req.user.id after Dev A merges
    return this.skillsService.findSkillsByRoadmap(roadmapId, userId);
  }
}
