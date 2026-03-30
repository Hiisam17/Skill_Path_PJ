import { Controller, Get, Param } from '@nestjs/common';
import { RoadmapDto } from '../types';
import { RoadmapsService } from './roadmaps.service';

@Controller('roadmaps')
export class RoadmapsController {
  constructor(private readonly roadmapsService: RoadmapsService) {}

  @Get()
  async findAll(): Promise<RoadmapDto[]> {
    return this.roadmapsService.findAll();
  }

  @Get('career-path/:careerPathId')
  async findByCareerPath(
    @Param('careerPathId') careerPathId: string,
  ): Promise<RoadmapDto[]> {
    return this.roadmapsService.findByCareerPath(careerPathId);
  }

  @Get(':roadmapId')
  async findById(@Param('roadmapId') roadmapId: string): Promise<RoadmapDto> {
    return this.roadmapsService.findById(roadmapId);
  }
}
