import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdzunaClient } from './adzuna.client';

describe('AdzunaClient', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('throws when Adzuna env variables are missing', async () => {
    const config = {
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as ConfigService;
    const client = new AdzunaClient(config);

    await expect(client.searchJobs({ query: 'react' })).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  it('calls Adzuna search API with required credentials and params', async () => {
    const config = {
      get: jest.fn((key: string) => {
        if (key === 'ADZUNA_APP_ID') return 'app-id';
        if (key === 'ADZUNA_APP_KEY') return 'app-key';
        if (key === 'ADZUNA_COUNTRY') return 'gb';
        return undefined;
      }),
    } as unknown as ConfigService;

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ results: [] }),
    } as unknown as Response);

    const client = new AdzunaClient(config);
    await client.searchJobs({
      query: 'react developer',
      location: 'London',
      page: 1,
      resultsPerPage: 20,
    });

    const calledUrl = new URL((global.fetch as jest.Mock).mock.calls[0][0]);
    expect(calledUrl.pathname).toBe('/v1/api/jobs/gb/search/1');
    expect(calledUrl.searchParams.get('app_id')).toBe('app-id');
    expect(calledUrl.searchParams.get('app_key')).toBe('app-key');
    expect(calledUrl.searchParams.get('what')).toBe('react developer');
    expect(calledUrl.searchParams.get('where')).toBe('London');
    expect(calledUrl.searchParams.get('sort_by')).toBe('date');
  });
});
