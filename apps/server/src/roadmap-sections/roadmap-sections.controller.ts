import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { RoadmapSectionsService } from './roadmap-sections.service';

/**
 * Controller handling HTTP requests for roadmap sections.
 * Exposes endpoints to retrieve detailed information about specific roadmap sections.
 */
@Controller('roadmap-sections')
export class RoadmapSectionsController {
  constructor(private readonly sectionsService: RoadmapSectionsService) {}

  /**
   * Retrieves detailed information for a specific roadmap section.
   *
   * @param id - The unique identifier of the roadmap section.
   * @returns A promise that resolves to the detailed section data, including resources.
   */
  @Get(':id/detail')
  getDetail(@Param('id', ParseIntPipe) id: number) {
    return this.sectionsService.getDetail(id);
  }
}