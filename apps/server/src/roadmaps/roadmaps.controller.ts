import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { RoadmapDto } from '../types';
import { RoadmapsService } from './roadmaps.service';
import { CareerResponseDto } from './dto/career-response.dto';
import { RoadmapSummaryResponseDto } from './dto/roadmap-summary-response.dto';

@Controller()
export class RoadmapsController {
	constructor(private readonly roadmapsService: RoadmapsService) {}

	@Get('roadmaps')
	async findAll(): Promise<RoadmapDto[]> {
		return this.roadmapsService.findAll();
	}

	@Get('roadmaps/career-path/:careerPathId')
	async findByCareerPath(
		@Param('careerPathId') careerPathId: string,
	): Promise<RoadmapDto[]> {
		return this.roadmapsService.findByCareerPath(careerPathId);
	}

	@Get('roadmaps/:roadmapId')
	async findById(@Param('roadmapId') roadmapId: string): Promise<RoadmapDto> {
		return this.roadmapsService.findById(roadmapId);
	}

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
