import { Controller, Get, Param, ParseIntPipe, Request, UseGuards } from '@nestjs/common';
import { SkillDto } from '../types';
import { SkillsService } from './skills.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';

/**
 * Controller for skill-related endpoints scoped under roadmaps.
 * Provides skill listing and detail retrieval.
 *
 * NOTE: Uses demo user ID as a temporary measure until auth guard integration.
 */
@Controller('roadmaps')
@UseGuards(JwtAuthGuard)
export class SkillsController {
  constructor(
    private readonly skillsService: SkillsService,
  ) { }

  @Get(':roadmapId/skills')
  async getSkillsByRoadmap(
    @Param('roadmapId', ParseIntPipe) roadmapId: number,
    @Request() req: ExpressRequest & { user: any },
  ): Promise<SkillDto[]> {
    const userId = req.user.id;
    return this.skillsService.findSkillsByRoadmap(roadmapId, userId);
  }
  @Get(':id/detail')
  async getSkillDetail(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: ExpressRequest & { user: any },
  ) {
    const userId = req.user.id;
    return this.skillsService.getSkillDetail(id, userId);
  }
}
