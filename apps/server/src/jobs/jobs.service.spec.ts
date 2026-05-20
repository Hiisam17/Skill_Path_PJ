import { JobsService } from './jobs.service';
import { AdzunaClient } from './adzuna.client';
import { PrismaService } from '../prisma/prisma.service';

describe('JobsService', () => {
  const adzunaClient = {
    searchJobs: jest.fn(),
  };

  const prisma = {
    job: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      findMany: jest.fn(),
    },
  };

  let service: JobsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new JobsService(
      prisma as unknown as PrismaService,
      adzunaClient as unknown as AdzunaClient,
    );
  });

  it('imports Adzuna jobs into database', async () => {
    adzunaClient.searchJobs.mockResolvedValue({
      results: [
        {
          id: 'adzuna-1',
          title: 'React Developer',
          company: { display_name: 'Acme' },
          location: { display_name: 'London' },
          description: 'Build UI',
          redirect_url: 'https://example.com/job',
          created: '2026-05-16T00:00:00Z',
        },
      ],
    });
    prisma.job.findUnique.mockResolvedValue(null);
    prisma.job.upsert.mockResolvedValue({});

    const result = await service.importFromAdzuna({ query: 'react' });

    expect(result).toEqual({ imported: 1, updated: 0, totalFetched: 1 });
    expect(prisma.job.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          source_externalId: {
            source: 'ADZUNA',
            externalId: 'adzuna-1',
          },
        },
      }),
    );
  });

  it('does not count duplicate imports as new records', async () => {
    adzunaClient.searchJobs.mockResolvedValue({
      results: [{ id: 'adzuna-1', title: 'React Developer' }],
    });
    prisma.job.findUnique.mockResolvedValue({ id: 'existing-job-id' });
    prisma.job.upsert.mockResolvedValue({});

    const result = await service.importFromAdzuna({ query: 'react' });

    expect(result).toEqual({ imported: 0, updated: 1, totalFetched: 1 });
    expect(prisma.job.upsert).toHaveBeenCalledTimes(1);
  });

  it('returns jobs from database', async () => {
    prisma.job.findMany.mockResolvedValue([
      { id: 'job-1', title: 'React Developer', source: 'ADZUNA' },
    ]);

    const result = await service.findAll({
      query: 'react',
      source: 'ADZUNA',
      limit: '10',
    });

    expect(result).toHaveLength(1);
    expect(prisma.job.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 10,
      }),
    );
  });
});
