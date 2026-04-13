import { Controller, Get } from '@nestjs/common';
import { MultiRoadmapProgressDto } from '../types';
import { ProgressService } from '../progress/progress.service';

@Controller('users')
export class UsersController {
	constructor(private readonly progressService: ProgressService) {}

	@Get('progress')
	async getProgress(): Promise<MultiRoadmapProgressDto> {
		const userId = await this.progressService.getDemoUserId();
		return this.progressService.getUserMultiRoadmapProgress(userId);
	}
}
