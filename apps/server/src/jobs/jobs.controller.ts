import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import type { Job } from '@prisma/client';
import type { ImportAdzunaJobsDto } from './dto/import-adzuna-jobs.dto';
import type { ImportResult } from './jobs.service';
import { JobsService } from './jobs.service';

interface GetJobsQuery {
  query?: string;
  source?: string;
  limit?: string;
}

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post('import/adzuna')
  importFromAdzuna(@Body() body: ImportAdzunaJobsDto): Promise<ImportResult> {
    return this.jobsService.importFromAdzuna(body);
  }

  @Get()
  findAll(@Query() query: GetJobsQuery): Promise<Job[]> {
    return this.jobsService.findAll(query);
  }
}
