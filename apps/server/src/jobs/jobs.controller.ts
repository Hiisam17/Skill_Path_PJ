import {
  Controller,
  Post,
  Get,
  Body,
  HttpException,
  HttpStatus,
  Logger,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';

import { IsString, MinLength } from 'class-validator';

class ParseJdDto {
  @IsString()
  @MinLength(50, { message: 'JD text must be at least 50 characters' })
  rawJdText!: string;
}

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
  ) {}

  /**
   * GET /api/jobs
   * Retrieves all jobs.
   */
  @Get()
  async findAll() {
    return this.jobsService.findAll();
  }

  /**
   * POST /api/jobs/analyze-gap
   * Analyzes the skill gap between a job's requirements and the user's skills.
   *
   * @param body - { jobId: number }
   * @returns { requiredSkillIds, gapSkillIds, matchScore, summary, isNewUser }
   */
  @Post('analyze-gap')
  @UseGuards(JwtAuthGuard)
  async analyzeGap(
    @Body() body: AnalyzeGapDto,
    @Request() req: ExpressRequest & { user: any },
  ) {
    try {
      if (!body.jobId) {
        throw new HttpException(
          { message: 'jobId is required' },
          HttpStatus.BAD_REQUEST,
        );
      }

      const userId = req.user.id;

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

  /**
   * POST /api/jobs/parse-jd
   * Parses an arbitrary JD to find skill gaps and roadmap type.
   */
  @Post('parse-jd')
  @UseGuards(JwtAuthGuard)
  async parseJd(
    @Body() body: ParseJdDto,
    @Request() req: ExpressRequest & { user: any },
  ) {
    try {
      const userId = req.user.id;
      this.logger.log(`JD Parse request: userId=${userId}`);

      const result = await this.jobsService.parseJd(body.rawJdText, userId);

      return {
        requiredSkillIds: result.requiredSkillIds,
        gapSkillIds: result.gapSkillIds,
        matchScore: result.matchScore,
        summary: result.summary,
        roadmapType: result.roadmapType,
        roadmapPath: result.roadmapPath,
        isNewUser: result.isNewUser,
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(`JD Parse failed: ${error.message}`, error.stack);

      throw new HttpException(
        { message: 'AI JD parsing failed', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /api/jobs/analyze-jd
   * Analyzes a job description deeply using AI (seniority, must-have, nice-to-have, AI advice).
   */
  @Post('analyze-jd')
  @UseGuards(JwtAuthGuard)
  async analyzeJobJD(
    @Body() body: AnalyzeGapDto,
  ) {
    try {
      if (!body.jobId) {
        throw new HttpException(
          { message: 'jobId is required' },
          HttpStatus.BAD_REQUEST,
        );
      }
      this.logger.log(`Job deep analysis request: jobId=${body.jobId}`);
      return await this.jobsService.analyzeJobJD(body.jobId);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(
        `Job deep analysis failed: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        {
          message: 'AI job analysis failed',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
