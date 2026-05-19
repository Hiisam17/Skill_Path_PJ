import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { RoadmapDto } from '../types';
import { RoadmapsService } from './roadmaps.service';
import { CareerResponseDto } from './dto/career-response.dto';
import { RoadmapSummaryResponseDto } from './dto/roadmap-summary-response.dto';
import { ProgressService } from '../progress/progress.service';

/**
 * Unified controller for career path and roadmap endpoints.
 * Serves both public career browsing and authenticated roadmap consumption.
 */
@Controller()
export class RoadmapsController {
	constructor(
		private readonly roadmapsService: RoadmapsService,
		private readonly progressService: ProgressService,
	) { }

	/** Lists all available career paths. */
	@Get('career-paths')
	async getCareerPaths(): Promise<CareerResponseDto[]> {
		return this.roadmapsService.findAllCareerPaths();
	}

	/** Lists published system roadmaps for a given career path. */
	@Get('career-paths/:careerId/roadmaps')
	async getRoadmapsByCareer(
		@Param('careerId', ParseIntPipe) careerId: number,
	): Promise<RoadmapSummaryResponseDto[]> {
		return this.roadmapsService.getSystemRoadmapsByCareerPath(careerId);
	}

	/** Lists all roadmaps in the system. */
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
	@Get('roadmaps/:title/flow')
	async getRoadmapFlow(
		@Param('title') roadmapTitle: string,
	) {
		const userId = await this.progressService.getDemoUserId();
		return this.roadmapsService.getRoadmapFlow(roadmapTitle, userId);
	}

	@Get('roadmaps/:title')
	async findByTitle(
		@Param('title') title: string,
	): Promise<RoadmapDto> {
		return this.roadmapsService.findByTitle(title);
	}
}
