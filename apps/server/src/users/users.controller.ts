import { Controller, Get, Post, Body, Patch, UseGuards, Request } from '@nestjs/common';
import type { MultiRoadmapProgressDto, SelectRoadmapDto } from '../types';
import { ProgressService } from '../progress/progress.service';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
	constructor(
		private readonly progressService: ProgressService,
		private readonly usersService: UsersService
	) {}

	@Get('progress')
	async getProgress(@Request() req: ExpressRequest & { user: any }): Promise<MultiRoadmapProgressDto> {
		const userId = req.user.id;
		return this.progressService.getUserMultiRoadmapProgress(userId);
	}

	@Post('select-roadmap')
	async selectRoadmap(
		@Body() dto: SelectRoadmapDto,
		@Request() req: ExpressRequest & { user: any },
	): Promise<{ roadmapId: number; roadmapTitle: string }> {
		const userId = req.user.id;
		const roadmap = await this.usersService.selectRoadmap(userId, dto);
		return { roadmapId: roadmap.id, roadmapTitle: roadmap.title };
	}

	@Patch('profile')
	async updateProfile(
		@Body() body: { fullName?: string; avatarUrl?: string; bio?: string; githubLink?: string },
		@Request() req: ExpressRequest & { user: any },
	) {
		return this.usersService.updateProfile(req.user.id, body);
	}
}
