import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiGapService, GapAnalysisResult } from '../ai/ai-gap.service';
import { ProgressService } from '../progress/progress.service';

/**
 * Extended gap analysis response that includes the isNewUser flag.
 */
export interface GapAnalysisResponse extends GapAnalysisResult {
  isNewUser: boolean;
}

export type MarketTrendDirection = 'up' | 'down' | 'flat' | 'new';
export type MarketTrendBasis = 'recent_period' | 'all_time_fallback';

export interface MarketTrendSkillDto {
  name: string;
  currentCount: number;
  previousCount: number;
  growthPct: number | null;
  demandShare: number;
  trend: MarketTrendDirection;
}

export interface MarketTrendSparklinePointDto {
  date: string;
  jobCount: number;
}

export interface MarketTrendsDto {
  generatedAt: string;
  periodDays: number;
  basis: MarketTrendBasis;
  topSkills: MarketTrendSkillDto[];
  sparkline: MarketTrendSparklinePointDto[];
}

type TrendJob = {
  skills: string[];
  createdAt: Date | null;
};

type ScoredMarketTrendSkillDto = MarketTrendSkillDto & {
  score: number;
};

/**
 * Service handling job-related business logic.
 * Orchestrates gap analysis by fetching job & user data, then delegating to AiGapService.
 */
@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiGapService: AiGapService,
    private readonly progressService: ProgressService,
  ) {}

  /**
   * Retrieves all jobs from the database.
   */
  async findAll() {
    return this.prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Builds market demand signals from persisted jobs.
   * This currently aggregates the local jobs table, but the response contract is
   * intentionally source-agnostic so a future scheduled Adzuna sync or snapshot
   * table can feed the same dashboard without frontend changes.
   */
  async getMarketTrends(periodDays = 30, limit = 3): Promise<MarketTrendsDto> {
    const safePeriodDays = this.clampInteger(periodDays, 7, 180);
    const safeLimit = this.clampInteger(limit, 1, 10);
    const now = new Date();
    const currentStart = this.addDays(now, -safePeriodDays);
    const previousStart = this.addDays(currentStart, -safePeriodDays);

    const jobs = await this.prisma.job.findMany({
      select: {
        skills: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const currentPeriodJobs = jobs.filter((job) => {
      return (
        !!job.createdAt && job.createdAt >= currentStart && job.createdAt <= now
      );
    });
    const previousPeriodJobs = jobs.filter((job) => {
      return (
        !!job.createdAt &&
        job.createdAt >= previousStart &&
        job.createdAt < currentStart
      );
    });

    const basis: MarketTrendBasis =
      currentPeriodJobs.length > 0 ? 'recent_period' : 'all_time_fallback';
    const trendSourceJobs =
      basis === 'recent_period' ? currentPeriodJobs : jobs;
    const previousSourceJobs =
      basis === 'recent_period' ? previousPeriodJobs : [];

    const currentCounts = this.countSkills(trendSourceJobs);
    const previousCounts = this.countSkills(previousSourceJobs);
    const totalSkillMentions = Array.from(currentCounts.values()).reduce(
      (sum, count) => sum + count,
      0,
    );

    const scoredSkills: ScoredMarketTrendSkillDto[] = Array.from(
      currentCounts.entries(),
    )
      .map(([name, currentCount]) => {
        const previousCount = previousCounts.get(name) ?? 0;
        const growthPct =
          previousCount === 0
            ? null
            : Math.round(
                ((currentCount - previousCount) / previousCount) * 1000,
              ) / 10;
        const demandShare =
          totalSkillMentions === 0
            ? 0
            : Math.round((currentCount / totalSkillMentions) * 1000) / 10;

        return {
          name,
          currentCount,
          previousCount,
          growthPct,
          demandShare,
          trend: this.getTrendDirection(currentCount, previousCount, growthPct),
          score: currentCount * 10 + (growthPct ?? 0),
        };
      })
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.name.localeCompare(b.name);
      })
      .slice(0, safeLimit);

    const topSkills = scoredSkills.map((skill) => ({
      name: skill.name,
      currentCount: skill.currentCount,
      previousCount: skill.previousCount,
      growthPct: skill.growthPct,
      demandShare: skill.demandShare,
      trend: skill.trend,
    }));

    return {
      generatedAt: now.toISOString(),
      periodDays: safePeriodDays,
      basis,
      topSkills,
      sparkline: this.buildSparkline(
        trendSourceJobs,
        safePeriodDays,
        now,
        basis,
      ),
    };
  }

  /**
   * Analyzes the skill gap between a job's requirements and a user's completed skills.
   *
   * @param jobId - Database ID of the job posting
   * @param userId - UUID of the authenticated user
   * @returns Gap analysis result with isNewUser flag
   * @throws NotFoundException if job is not found
   */
  async analyzeGap(
    jobId: number,
    userId: string,
  ): Promise<GapAnalysisResponse> {
    // 1. Fetch the job from DB
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    // 2. Fetch user's completed skills (join with Skill to get nodeId + name)
    const completedStatusId = await this.progressService.getCompletedStatusId();

    const userProgress = await this.prisma.userSkillProgress.findMany({
      where: {
        userId,
        statusId: completedStatusId,
        roadmapSkill: {
          skill: { nodeId: { not: null } },
        },
      },
      include: {
        roadmapSkill: {
          include: {
            skill: {
              select: { nodeId: true, name: true, description: true },
            },
          },
        },
      },
    });

    // Build unique skill list (a user may have completed the same skill across multiple roadmaps)
    const seenNodeIds = new Set<string>();
    const userCompletedSkills = userProgress
      .map((p) => p.roadmapSkill.skill)
      .filter((skill): skill is NonNullable<typeof skill> => !!skill?.nodeId)
      .filter((p) => {
        if (seenNodeIds.has(p.nodeId!)) return false;
        seenNodeIds.add(p.nodeId!);
        return true;
      })
      .map((skill) => ({
        nodeId: skill.nodeId!,
        name: skill.name,
        description: skill.description,
      }));

    const isNewUser = userCompletedSkills.length === 0;

    if (isNewUser) {
      this.logger.log(
        `User ${userId} has no completed skills — flagging as new user`,
      );
    } else {
      this.logger.log(
        `User ${userId} has ${userCompletedSkills.length} completed skills`,
      );
    }

    // 3. Call AI service
    const aiResult = await this.aiGapService.analyzeGap(
      {
        title: job.title,
        company: job.company,
        description: job.description,
        requirements: job.requirements,
      },
      userCompletedSkills,
    );

    return {
      ...aiResult,
      isNewUser,
    };
  }

  /**
   * Analyzes an arbitrary JD text.
   *
   * @param rawJdText - User provided job description
   * @param userId - ID of the authenticated user
   */
  async parseJd(rawJdText: string, userId: string) {
    if (!rawJdText || rawJdText.length < 50) {
      throw new BadRequestException('JD text must be at least 50 characters');
    }

    const completedStatusId = await this.progressService.getCompletedStatusId();

    const userProgress = await this.prisma.userSkillProgress.findMany({
      where: {
        userId,
        statusId: completedStatusId,
        roadmapSkill: {
          skill: { nodeId: { not: null } },
        },
      },
      include: {
        roadmapSkill: {
          include: {
            skill: {
              select: { nodeId: true, name: true, description: true },
            },
          },
        },
      },
    });

    const seenNodeIds = new Set<string>();
    const userCompletedSkills = userProgress
      .map((p) => p.roadmapSkill.skill)
      .filter((skill): skill is NonNullable<typeof skill> => !!skill?.nodeId)
      .filter((p) => {
        if (seenNodeIds.has(p.nodeId!)) return false;
        seenNodeIds.add(p.nodeId!);
        return true;
      })
      .map((skill) => ({
        nodeId: skill.nodeId!,
        name: skill.name,
        description: skill.description,
      }));

    const isNewUser = userCompletedSkills.length === 0;

    const aiResult = await this.aiGapService.parseJd(
      rawJdText,
      userCompletedSkills,
    );

    const roadmapMap: Record<string, string | null> = {
      frontend: '/roadmaps/Frontend',
      backend: '/roadmaps/Backend',
      devops: '/roadmaps/DevOps',
      unknown: null,
    };

    const roadmapPath = roadmapMap[aiResult.roadmapType] ?? null;

    return {
      ...aiResult,
      roadmapPath,
      isNewUser,
    };
  }

  /**
   * Analyzes a job description deeply using AI (senority, must-have, nice-to-have, AI advice)
   * and includes the job's roadmapPath from the database.
   */
  async analyzeJobJD(jobId: number) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      select: { roadmapPath: true },
    });
    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }
    const analysis = await this.aiGapService.analyzeJobJD(jobId);
    return {
      ...analysis,
      roadmapPath: job.roadmapPath,
    };
  }

  private clampInteger(value: number, min: number, max: number): number {
    if (!Number.isFinite(value)) return min;
    return Math.min(max, Math.max(min, Math.trunc(value)));
  }

  private addDays(date: Date, days: number): Date {
    const copy = new Date(date);
    copy.setUTCDate(copy.getUTCDate() + days);
    return copy;
  }

  private countSkills(jobs: TrendJob[]): Map<string, number> {
    const counts = new Map<string, number>();

    for (const job of jobs) {
      const uniqueSkills = new Set(
        job.skills.map((skill) => skill.trim()).filter(Boolean),
      );

      for (const skill of uniqueSkills) {
        counts.set(skill, (counts.get(skill) ?? 0) + 1);
      }
    }

    return counts;
  }

  private getTrendDirection(
    currentCount: number,
    previousCount: number,
    growthPct: number | null,
  ): MarketTrendDirection {
    if (previousCount === 0 && currentCount > 0) return 'new';
    if (growthPct === null || Math.abs(growthPct) < 1) return 'flat';
    return growthPct > 0 ? 'up' : 'down';
  }

  private buildSparkline(
    jobs: TrendJob[],
    periodDays: number,
    now: Date,
    basis: MarketTrendBasis,
  ): MarketTrendSparklinePointDto[] {
    if (basis === 'all_time_fallback') {
      const countsByDate = new Map<string, number>();

      for (const job of jobs) {
        const key = job.createdAt
          ? job.createdAt.toISOString().slice(0, 10)
          : 'unknown';
        countsByDate.set(key, (countsByDate.get(key) ?? 0) + 1);
      }

      return Array.from(countsByDate.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, jobCount]) => ({ date, jobCount }));
    }

    const start = this.addDays(now, -(periodDays - 1));
    const countsByDate = new Map<string, number>();

    for (let index = 0; index < periodDays; index += 1) {
      const date = this.addDays(start, index).toISOString().slice(0, 10);
      countsByDate.set(date, 0);
    }

    for (const job of jobs) {
      if (!job.createdAt) continue;
      const key = job.createdAt.toISOString().slice(0, 10);
      if (countsByDate.has(key)) {
        countsByDate.set(key, (countsByDate.get(key) ?? 0) + 1);
      }
    }

    return Array.from(countsByDate.entries()).map(([date, jobCount]) => ({
      date,
      jobCount,
    }));
  }
}
