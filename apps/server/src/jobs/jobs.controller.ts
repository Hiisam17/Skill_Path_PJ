import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { ProgressService } from '../progress/progress.service';

/**
 * DTO for the analyze-gap request body.
 */
interface AnalyzeGapDto {
  jobId: number;
}

/**
 * Controller for job-related API endpoints.
 * Provides AI-powered skill gap analysis for authenticated users.
 */
@Controller('jobs')
export class JobsController {
  private readonly logger = new Logger(JobsController.name);

  constructor(
    private readonly jobsService: JobsService,
    private readonly progressService: ProgressService,
  ) {}

  /**
   * POST /api/jobs/analyze-gap
   * Analyzes the skill gap between a job's requirements and the user's skills.
   *
   * @param body - { jobId: number }
   * @returns { requiredSkillIds, gapSkillIds, matchScore, summary, isNewUser }
   */
  @Post('analyze-gap')
  async analyzeGap(@Body() body: AnalyzeGapDto) {
    try {
      if (!body.jobId) {
        throw new HttpException(
          { message: 'jobId is required' },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Use getDemoUserId() pattern consistent with other controllers
      const userId = await this.progressService.getDemoUserId();

      this.logger.log(
        `Gap analysis request: jobId=${body.jobId}, userId=${userId}`,
      );

      const result = await this.jobsService.analyzeGap(body.jobId, userId);

      return {
        requiredSkillIds: result.requiredSkillIds,
        gapSkillIds: result.gapSkillIds,
        matchScore: result.matchScore,
        summary: result.summary,
        isNewUser: result.isNewUser,
      };
    } catch (error: any) {
      // Re-throw NestJS HTTP exceptions as-is
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `Gap analysis failed: ${error.message}`,
        error.stack,
      );

      throw new HttpException(
        {
          message: 'AI gap analysis failed',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
