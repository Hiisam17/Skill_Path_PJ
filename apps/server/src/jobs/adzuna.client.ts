import {
  BadGatewayException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ImportAdzunaJobsDto } from './dto/import-adzuna-jobs.dto';

export interface AdzunaJobResult {
  id?: string;
  title?: string;
  description?: string;
  redirect_url?: string;
  company?: { display_name?: string };
  location?: { display_name?: string };
  created?: string;
}

export interface AdzunaSearchResponse {
  count?: number;
  results?: AdzunaJobResult[];
}

@Injectable()
export class AdzunaClient {
  private readonly baseUrl = 'https://api.adzuna.com/v1/api';

  constructor(private readonly configService: ConfigService) {}

  async searchJobs(params: ImportAdzunaJobsDto): Promise<AdzunaSearchResponse> {
    const appId = this.configService.get<string>('ADZUNA_APP_ID');
    const appKey = this.configService.get<string>('ADZUNA_APP_KEY');

    if (!appId || !appKey) {
      throw new ServiceUnavailableException(
        'Missing Adzuna configuration: ADZUNA_APP_ID and ADZUNA_APP_KEY are required',
      );
    }

    const country = this.normalizeCountry(
      params.country ??
        this.configService.get<string>('ADZUNA_COUNTRY') ??
        'gb',
    );
    const page = this.toPositiveInt(params.page, 1);
    const resultsPerPage = Math.min(
      this.toPositiveInt(params.resultsPerPage, 20),
      50,
    );

    const url = new URL(`${this.baseUrl}/jobs/${country}/search/${page}`);
    url.searchParams.set('app_id', appId);
    url.searchParams.set('app_key', appKey);
    url.searchParams.set('results_per_page', String(resultsPerPage));
    url.searchParams.set('sort_by', 'date');

    if (params.query?.trim()) url.searchParams.set('what', params.query.trim());
    if (params.location?.trim()) {
      url.searchParams.set('where', params.location.trim());
    }

    try {
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new BadGatewayException(
          `Adzuna request failed with status ${response.status}`,
        );
      }

      return (await response.json()) as AdzunaSearchResponse;
    } catch (error) {
      if (error instanceof BadGatewayException) throw error;
      throw new BadGatewayException('Failed to fetch jobs from Adzuna');
    }
  }

  private normalizeCountry(country: string): string {
    return (
      country
        .trim()
        .toLowerCase()
        .replace(/[^a-z]/g, '') || 'gb'
    );
  }

  private toPositiveInt(value: number | undefined, fallback: number): number {
    return Number.isFinite(value) && Number(value) > 0
      ? Number(value)
      : fallback;
  }
}
