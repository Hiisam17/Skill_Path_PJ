import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiGapService, GapAnalysisResult } from '../ai/ai-gap.service';
import { ProgressService } from '../progress/progress.service';

/**
 * Extended gap analysis response that includes the isNewUser flag.
 */
export interface GapAnalysisResponse extends GapAnalysisResult {
  isNewUser: boolean;
}

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
   * Analyzes the skill gap between a job's requirements and a user's completed skills.
   *
   * @param jobId - Database ID of the job posting
   * @param userId - UUID of the authenticated user
   * @returns Gap analysis result with isNewUser flag
   * @throws NotFoundException if job is not found
   */
  async analyzeGap(jobId: number, userId: string): Promise<GapAnalysisResponse> {
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
      this.logger.log(`User ${userId} has no completed skills — flagging as new user`);
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

    const aiResult = await this.aiGapService.parseJd(rawJdText, userCompletedSkills);

    const roadmapMap: Record<string, string | null> = {
      frontend: '/roadmaps/1',
      backend: '/roadmaps/Backend',
      devops: '/roadmaps/3',
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
}
