import { Controller, Get, Post, Body, Patch, UseGuards, Request } from '@nestjs/common';
import type { MultiRoadmapProgressDto, SelectRoadmapDto } from '../types';
import { ProgressService } from '../progress/progress.service';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';

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
	async selectRoadmap(@Body() dto: SelectRoadmapDto): Promise<{ roadmapId: number }> {
		const userId = await this.progressService.getDemoUserId();
		const roadmapId = await this.usersService.selectRoadmap(userId, dto);
		return { roadmapId };
	}

	@UseGuards(JwtAuthGuard)
	@Patch('profile')
	async updateProfile(
		@Request() req: ExpressRequest & { user: any },
		@Body() dto: {
			fullName?: string;
			avatarUrl?: string;
			bio?: string;
			githubLink?: string;
		}
	) {
		const userId = req.user.id;
		return this.usersService.updateProfile(userId, dto);
	}
}
