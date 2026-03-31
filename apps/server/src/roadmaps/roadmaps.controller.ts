import { Controller, Get } from '@nestjs/common';
import { RoadmapsService } from './roadmaps.service';

@Controller()
export class RoadmapsController {
	constructor(private readonly roadmapsService: RoadmapsService) {}

	// Public endpoint: GET /career-paths
	@Get('career-paths')
	async getCareerPaths() {
		return this.roadmapsService.findAllCareers();
	}
}
