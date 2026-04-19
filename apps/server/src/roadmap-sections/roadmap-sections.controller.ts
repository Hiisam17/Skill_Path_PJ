import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { RoadmapSectionsService } from './roadmap-sections.service';

@Controller('roadmap-sections')
export class RoadmapSectionsController {
  constructor(private readonly sectionsService: RoadmapSectionsService) {}

  @Get(':id/detail')
  getDetail(@Param('id', ParseIntPipe) id: number) {
    return this.sectionsService.getDetail(id);
  }
}