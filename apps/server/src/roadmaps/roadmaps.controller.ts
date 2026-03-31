import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { RoadmapsService } from './roadmaps.service';
import { CareerResponseDto } from './dto/career-response.dto';
import { RoadmapSummaryResponseDto } from './dto/roadmap-summary-response.dto';

@Controller()
export class RoadmapsController {
	constructor(private readonly roadmapsService: RoadmapsService) {}

	// Public endpoint: GET /career-paths
	@Get('career-paths')
	async getCareerPaths(): Promise<CareerResponseDto[]> {
		return this.roadmapsService.findAllCareerPaths();
	}

	// Public endpoint: GET /career-paths/:careerId/roadmaps
	@Get('career-paths/:careerId/roadmaps')
	async getRoadmapsByCareer(
		@Param('careerId', ParseIntPipe) careerPathId: number,
	): Promise<RoadmapSummaryResponseDto[]> {
		return this.roadmapsService.getSystemRoadmapsByCareerPath(careerPathId);
	}
}
