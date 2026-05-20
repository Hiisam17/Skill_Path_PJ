import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';

describe('JobsController', () => {
  const jobsService = {
    importFromAdzuna: jest.fn(),
    findAll: jest.fn(),
  };

  let controller: JobsController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new JobsController(jobsService as unknown as JobsService);
  });

  it('imports jobs from Adzuna', async () => {
    jobsService.importFromAdzuna.mockResolvedValue({
      imported: 1,
      updated: 0,
      totalFetched: 1,
    });

    await expect(
      controller.importFromAdzuna({
        query: 'react developer',
        country: 'gb',
        location: 'London',
        resultsPerPage: 20,
        page: 1,
      }),
    ).resolves.toEqual({ imported: 1, updated: 0, totalFetched: 1 });
  });

  it('returns jobs list', async () => {
    jobsService.findAll.mockResolvedValue([
      { id: 'job-1', title: 'React Developer', source: 'ADZUNA' },
    ]);

    await expect(
      controller.findAll({ query: 'react', source: 'ADZUNA', limit: '10' }),
    ).resolves.toHaveLength(1);
  });
});
