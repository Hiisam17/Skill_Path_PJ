import { Controller, Param, Post, Get, ParseIntPipe } from '@nestjs/common';
import { UserSkillProgressDto } from '../types';
import { ProgressService } from './progress.service';

@Controller('skills')
export class ProgressController {
	constructor(private readonly progressService: ProgressService) {}

	@Post(':skillId/complete')
	async completeSkill(
		@Param('skillId', ParseIntPipe) skillId: number,
	): Promise<UserSkillProgressDto> {
		const userId = await this.progressService.getDemoUserId();
		return this.progressService.completeSkill(userId, skillId);
	}

	@Get('users/progress')
	async getUserProgress() {
		const userId = await this.progressService.getDemoUserId();
		return this.progressService.getUserProgress(userId);
	}
}
