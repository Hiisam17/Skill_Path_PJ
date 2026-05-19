import { Controller, Get, Post, Body } from '@nestjs/common';
import type { MultiRoadmapProgressDto, SelectRoadmapDto } from '../types';
import { ProgressService } from '../progress/progress.service';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
	constructor(
		private readonly progressService: ProgressService,
		private readonly usersService: UsersService
	) {}

	@Get('progress')
	async getProgress(): Promise<MultiRoadmapProgressDto> {
		const userId = await this.progressService.getDemoUserId();
		return this.progressService.getUserMultiRoadmapProgress(userId);
	}

	@Post('select-roadmap')
	async selectRoadmap(@Body() dto: SelectRoadmapDto): Promise<{ roadmapId: number; roadmapTitle: string }> {
		const userId = await this.progressService.getDemoUserId();
		const roadmap = await this.usersService.selectRoadmap(userId, dto);
		return { roadmapId: roadmap.id, roadmapTitle: roadmap.title };
	}
}
