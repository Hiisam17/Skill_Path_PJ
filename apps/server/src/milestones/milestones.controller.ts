import { Controller, Get, Param, Post, UseFilters, ParseIntPipe } from '@nestjs/common';
import { MilestonesService } from './milestones.service';

@Controller('dashboard')
export class MilestonesController {
  constructor(private readonly milestonesService: MilestonesService) {}

  /**
   * API Endpoint lấy dữ liệu tổng hợp cho Dashboard
   * GET /dashboard/stats/:userId
   */
  @Get('stats/:userId')
  async getDashboardStats(@Param('userId') userId: string) {
    return await this.milestonesService.getDashboardStats(userId);
  }

  /**
   * API Endpoint cập nhật hoạt động người dùng (dùng khi login hoặc làm task)
   * POST /dashboard/activity/:userId
   */
  @Post('activity/:userId')
  async updateActivity(@Param('userId') userId: string) {
    return await this.milestonesService.updateUserActivity(userId);
  }

}
