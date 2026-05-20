import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdzunaClient, type AdzunaJobResult } from './adzuna.client';
import type { ImportAdzunaJobsDto } from './dto/import-adzuna-jobs.dto';

export interface GetJobsParams {
  query?: string;
  source?: string;
  limit?: string;
}

export interface ImportResult {
  imported: number;
  updated: number;
  totalFetched: number;
}

@Injectable()
export class JobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adzunaClient: AdzunaClient,
  ) {}

  async importFromAdzuna(dto: ImportAdzunaJobsDto): Promise<ImportResult> {
    const response = await this.adzunaClient.searchJobs(dto);
    const results = response.results ?? [];

    let imported = 0;
    let updated = 0;

    for (const result of results) {
      if (!result.id || !result.title) continue;

      const existing = await this.prisma.job.findUnique({
        where: {
          source_externalId: {
            source: 'ADZUNA',
            externalId: result.id,
          },
        },
        select: { id: true },
      });

      // Lưu job theo khóa ngoài của Adzuna để import lặp lại chỉ cập nhật, không tạo bản ghi trùng.
      await this.prisma.job.upsert({
        where: {
          source_externalId: {
            source: 'ADZUNA',
            externalId: result.id,
          },
        },
        create: this.toJobCreateInput(result),
        update: this.toJobUpdateInput(result),
      });

      if (existing) updated += 1;
      else imported += 1;
    }

    return {
      imported,
      updated,
      totalFetched: results.length,
    };
  }

  async findAll(params: GetJobsParams) {
    const limit = Math.min(this.toPositiveInt(params.limit, 20), 100);
    const query = params.query?.trim();
    const source = params.source?.trim();

    return this.prisma.job.findMany({
      where: {
        ...(source ? { source } : {}),
        ...(query
          ? {
              OR: [
                { title: { contains: query, mode: 'insensitive' as const } },
                { company: { contains: query, mode: 'insensitive' as const } },
                {
                  description: {
                    contains: query,
                    mode: 'insensitive' as const,
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: [{ postedAt: 'desc' }, { crawledAt: 'desc' }],
      take: limit,
    });
  }

  private toJobCreateInput(result: AdzunaJobResult) {
    return {
      externalId: result.id!,
      source: 'ADZUNA',
      title: result.title!,
      company: result.company?.display_name ?? null,
      location: result.location?.display_name ?? null,
      description: result.description ?? null,
      url: result.redirect_url ?? null,
      postedAt: this.toDateOrNull(result.created),
      crawledAt: new Date(),
    };
  }

  private toJobUpdateInput(result: AdzunaJobResult) {
    return {
      title: result.title!,
      company: result.company?.display_name ?? null,
      location: result.location?.display_name ?? null,
      description: result.description ?? null,
      url: result.redirect_url ?? null,
      postedAt: this.toDateOrNull(result.created),
      crawledAt: new Date(),
    };
  }

  private toDateOrNull(value?: string): Date | null {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private toPositiveInt(value: string | undefined, fallback: number): number {
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }
}
