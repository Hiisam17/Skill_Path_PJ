import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { RoadmapDto } from '../types';
import { RoadmapsService } from './roadmaps.service';
import { CareerResponseDto } from './dto/career-response.dto';
import { RoadmapSummaryResponseDto } from './dto/roadmap-summary-response.dto';

@Controller()
export class RoadmapsController {
	constructor(private readonly roadmapsService: RoadmapsService) { }

	// ==========================================
	// NHÁNH 1: API CHO CAREER PATHS
	// ==========================================

	// Public endpoint: GET /career-paths
	@Get('career-paths')
	async getCareerPaths(): Promise<CareerResponseDto[]> {
		return this.roadmapsService.findAllCareerPaths();
	}

	// Public endpoint: GET /career-paths/:careerId/roadmaps
	@Get('career-paths/:careerId/roadmaps')
	async getRoadmapsByCareer(
		@Param('careerId', ParseIntPipe) careerId: number,
	): Promise<RoadmapSummaryResponseDto[]> {
		return this.roadmapsService.getSystemRoadmapsByCareerPath(careerId);
	}

	// ==========================================
	// NHÁNH 2: API CHO ROADMAPS
	// ==========================================

	@Get('roadmaps')
	async findAll(): Promise<RoadmapDto[]> {
		return this.roadmapsService.findAll();
	}

	@Get('roadmaps/career-path/:careerPathId')
	async findByCareerPath(
		@Param('careerPathId', ParseIntPipe) careerPathId: number,
	): Promise<RoadmapDto[]> {
		return this.roadmapsService.findByCareerPath(careerPathId);
	}
	@Get('roadmaps/:roadmapId/flow')
	async getRoadmapFlow(
		@Param('roadmapId', ParseIntPipe) roadmapId: number,
	) {
		return this.roadmapsService.getRoadmapFlow(roadmapId);
	}

	@Get('roadmaps/:roadmapId')
	async findById(
		@Param('roadmapId', ParseIntPipe) roadmapId: number,
	): Promise<RoadmapDto> {
		return this.roadmapsService.findById(roadmapId);
	}
}