import { HttpException } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';

describe('JobsController', () => {
  let controller: JobsController;

  const mockJobsService = {
    findAll: jest.fn(),
    getMarketTrends: jest.fn(),
    analyzeGap: jest.fn(),
    parseJd: jest.fn(),
    analyzeJobJD: jest.fn(),
  };

  const request = { user: { id: 'user-1' } } as any;

  beforeEach(() => {
    controller = new JobsController(mockJobsService as unknown as JobsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should list jobs', async () => {
    mockJobsService.findAll.mockResolvedValue([{ id: 1 }]);

    await expect(controller.findAll()).resolves.toEqual([{ id: 1 }]);
    expect(mockJobsService.findAll).toHaveBeenCalledWith();
  });

  it('should pass parsed market trend query values to the service', async () => {
    mockJobsService.getMarketTrends.mockResolvedValue({ topSkills: [] });

    await controller.getMarketTrends('45', '5');

    expect(mockJobsService.getMarketTrends).toHaveBeenCalledWith(45, 5);
  });

  it('should pass undefined trend params when query values are absent', async () => {
    mockJobsService.getMarketTrends.mockResolvedValue({ topSkills: [] });

    await controller.getMarketTrends();

    expect(mockJobsService.getMarketTrends).toHaveBeenCalledWith(
      undefined,
      undefined,
    );
  });

  it('should analyze job gap for the authenticated user', async () => {
    mockJobsService.analyzeGap.mockResolvedValue({
      requiredSkillIds: ['react'],
      gapSkillIds: [],
      matchScore: 100,
      summary: 'Good match',
      isNewUser: false,
    });

    const result = await controller.analyzeGap({ jobId: 1 }, request);

    expect(result).toEqual({
      requiredSkillIds: ['react'],
      gapSkillIds: [],
      matchScore: 100,
      summary: 'Good match',
      isNewUser: false,
    });
    expect(mockJobsService.analyzeGap).toHaveBeenCalledWith(1, 'user-1');
  });

  it('should reject gap analysis without a jobId', async () => {
    await expect(
      controller.analyzeGap({ jobId: 0 }, request),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('should wrap unexpected gap analysis errors as HTTP 500', async () => {
    mockJobsService.analyzeGap.mockRejectedValue(new Error('AI failed'));

    await expect(
      controller.analyzeGap({ jobId: 1 }, request),
    ).rejects.toMatchObject({
      status: 500,
      response: expect.objectContaining({
        message: 'AI gap analysis failed',
        error: 'AI failed',
      }),
    });
  });

  it('should rethrow HTTP exceptions from gap analysis', async () => {
    const httpError = new HttpException('missing', 404);
    mockJobsService.analyzeGap.mockRejectedValue(httpError);

    await expect(controller.analyzeGap({ jobId: 1 }, request)).rejects.toBe(
      httpError,
    );
  });

  it('should parse a custom JD for the authenticated user', async () => {
    mockJobsService.parseJd.mockResolvedValue({
      requiredSkillIds: ['node'],
      gapSkillIds: ['node'],
      matchScore: 0,
      summary: 'Need backend skills',
      roadmapType: 'backend',
      roadmapPath: '/roadmaps/Backend',
      isNewUser: true,
    });

    const result = await controller.parseJd(
      { rawJdText: 'A'.repeat(80) },
      request,
    );

    expect(result.roadmapPath).toBe('/roadmaps/Backend');
    expect(mockJobsService.parseJd).toHaveBeenCalledWith(
      'A'.repeat(80),
      'user-1',
    );
  });

  it('should rethrow HTTP exceptions from JD parsing', async () => {
    const httpError = new HttpException('bad jd', 400);
    mockJobsService.parseJd.mockRejectedValue(httpError);

    await expect(
      controller.parseJd({ rawJdText: 'short' }, request),
    ).rejects.toBe(httpError);
  });

  it('should wrap unexpected JD parsing errors as HTTP 500', async () => {
    mockJobsService.parseJd.mockRejectedValue(new Error('parser unavailable'));

    await expect(
      controller.parseJd({ rawJdText: 'A'.repeat(80) }, request),
    ).rejects.toMatchObject({
      status: 500,
      response: expect.objectContaining({
        message: 'AI JD parsing failed',
        error: 'parser unavailable',
      }),
    });
  });

  it('should analyze a stored job JD', async () => {
    mockJobsService.analyzeJobJD.mockResolvedValue({
      seniority: 'junior',
      roadmapPath: '/roadmaps/Frontend',
    });

    const result = await controller.analyzeJobJD({ jobId: 7 });

    expect(result).toEqual({
      seniority: 'junior',
      roadmapPath: '/roadmaps/Frontend',
    });
    expect(mockJobsService.analyzeJobJD).toHaveBeenCalledWith(7);
  });

  it('should reject deep JD analysis without a jobId', async () => {
    await expect(controller.analyzeJobJD({ jobId: 0 })).rejects.toMatchObject({
      status: 400,
    });
  });

  it('should rethrow HTTP exceptions from deep JD analysis', async () => {
    const httpError = new HttpException('missing', 404);
    mockJobsService.analyzeJobJD.mockRejectedValue(httpError);

    await expect(controller.analyzeJobJD({ jobId: 7 })).rejects.toBe(httpError);
  });

  it('should wrap unexpected deep JD analysis errors as HTTP 500', async () => {
    mockJobsService.analyzeJobJD.mockRejectedValue(new Error('model failed'));

    await expect(controller.analyzeJobJD({ jobId: 7 })).rejects.toMatchObject({
      status: 500,
      response: expect.objectContaining({
        message: 'AI job analysis failed',
        error: 'model failed',
      }),
    });
  });
});
