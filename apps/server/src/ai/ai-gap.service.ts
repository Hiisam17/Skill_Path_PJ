import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Response structure from AI for gap analysis.
 */
export interface GapAnalysisResult {
  requiredSkillIds: string[];
  gapSkillIds: string[];
  matchScore: number;
  summary: string;
}

/**
 * Response structure from AI for JD parsing.
 */
export interface GapAnalysisJdResult extends GapAnalysisResult {
  roadmapType: 'frontend' | 'backend' | 'devops' | 'unknown';
}

/**
 * Minimal Job type used by AiGapService.
 */
export interface JobInput {
  title: string;
  company: string;
  description: string;
  requirements: string | null;
}

/**
 * Minimal Skill type used by AiGapService.
 */
export interface SkillInput {
  nodeId: string;
  name: string;
  description: string | null;
}

/**
 * AI-powered skill gap analysis service.
 * Uses Groq (Llama 3) to compare user skills against job requirements
 * and identify missing competencies.
 */
@Injectable()
export class AiGapService {
  private readonly logger = new Logger(AiGapService.name);
  private readonly groq: Groq;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const apiKey = this.config.get<string>('GROQ_API_KEY');
    if (!apiKey || apiKey.includes('your_groq_api_key')) {
      this.logger.warn(
        'GROQ_API_KEY is not configured. AI gap analysis will fail at runtime.',
      );
    }
    this.groq = new Groq({ apiKey: apiKey || '' });
  }

  /**
   * Fetches all valid skills (with nodeId) from the database
   * to provide as context to the AI.
   */
  private async getValidSkillCatalog(): Promise<SkillInput[]> {
    const skills = await this.prisma.skill.findMany({
      where: { nodeId: { not: null } },
      select: { nodeId: true, name: true, description: true },
    });

    return skills
      .filter((s): s is { nodeId: string; name: string; description: string | null } => !!s.nodeId)
      .map((s) => ({
        nodeId: s.nodeId,
        name: s.name,
        description: s.description,
      }));
  }

  /**
   * Analyzes the skill gap between a job's requirements and the user's current skills.
   *
   * @param job - The target job posting
   * @param userSkills - Skills the user has already completed (with nodeId and name)
   * @returns Parsed gap analysis result from Groq
   * @throws Error if Groq API fails or returns invalid JSON
   */
  async analyzeGap(job: JobInput, userSkills: SkillInput[]): Promise<GapAnalysisResult> {
    const validSkills = await this.getValidSkillCatalog();
    const validNodeIds = new Set(validSkills.map((s) => s.nodeId));

    // Build the skill catalog for context
    const skillCatalog = validSkills.map(
      (s) => `  - ${s.nodeId}: ${s.name}${s.description ? ` (${s.description.substring(0, 80)})` : ''}`,
    ).join('\n');

    const userSkillList = userSkills.length > 0
      ? userSkills.map((s) => `  - ${s.nodeId} (${s.name})`).join('\n')
      : '  (User has no completed skills yet)';

    const systemPrompt = `You are a technical recruiter and skill analyst. Your job is to analyze job postings and determine which skills are required, then compare against a user's current skills to find gaps.

You MUST ONLY use skill IDs from the following valid catalog:
${skillCatalog}

IMPORTANT RULES:
1. Only return nodeId values that exist in the catalog above.
2. requiredSkillIds = all skills from the catalog that this job requires.
3. gapSkillIds = requiredSkillIds minus the user's current skills.
4. matchScore = percentage (0-100) of required skills the user already has.
5. summary = brief 2-3 sentence analysis in Vietnamese.

Return ONLY a valid JSON object with NO additional text, NO markdown code fences. Just the raw JSON format:
{"requiredSkillIds": [...], "gapSkillIds": [...], "matchScore": number, "summary": "..."}`;

    const userPrompt = `Analyze this job posting:

Job Title: ${job.title}
Company: ${job.company}
Description: ${job.description}
Requirements: ${job.requirements || 'Not specified'}

User's current completed skills (nodeId + full name for clarity):
${userSkillList}

Return the JSON analysis.`;

    this.logger.log(`Calling Groq for gap analysis: "${job.title}" at ${job.company}`);

    try {
      const response = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2, // Low temperature for more deterministic JSON output
        response_format: { type: 'json_object' }, // Enforce JSON output on Groq
      });

      const rawText = response.choices[0]?.message?.content?.trim() || '';
      this.logger.debug(`Groq raw response: ${rawText.substring(0, 200)}...`);

      if (!rawText) {
        throw new Error('Groq returned empty response');
      }

      // Parse JSON — handle potential markdown code fences just in case
      let jsonStr = rawText;
      const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }

      let parsed: any;
      try {
        parsed = JSON.parse(jsonStr);
      } catch {
        this.logger.error(`Failed to parse Groq response as JSON: ${rawText}`);
        throw new Error('Groq returned invalid JSON. Raw response: ' + rawText.substring(0, 300));
      }

      // Validate structure
      if (
        !Array.isArray(parsed.requiredSkillIds) ||
        !Array.isArray(parsed.gapSkillIds) ||
        typeof parsed.matchScore !== 'number' ||
        typeof parsed.summary !== 'string'
      ) {
        throw new Error(
          'Groq response is missing required fields (requiredSkillIds, gapSkillIds, matchScore, summary)',
        );
      }

      // Filter out any nodeIds that don't exist in our catalog
      const filteredRequired = parsed.requiredSkillIds.filter((id: string) => validNodeIds.has(id));
      const filteredGaps = parsed.gapSkillIds.filter((id: string) => validNodeIds.has(id));

      if (filteredRequired.length !== parsed.requiredSkillIds.length) {
        this.logger.warn(
          `Filtered out ${parsed.requiredSkillIds.length - filteredRequired.length} invalid requiredSkillIds`,
        );
      }
      if (filteredGaps.length !== parsed.gapSkillIds.length) {
        this.logger.warn(
          `Filtered out ${parsed.gapSkillIds.length - filteredGaps.length} invalid gapSkillIds`,
        );
      }

      const result: GapAnalysisResult = {
        requiredSkillIds: filteredRequired,
        gapSkillIds: filteredGaps,
        matchScore: Math.max(0, Math.min(100, Math.round(parsed.matchScore))),
        summary: parsed.summary,
      };

      this.logger.log(
        `Gap analysis complete: ${result.requiredSkillIds.length} required, ${result.gapSkillIds.length} gaps, ${result.matchScore}% match`,
      );

      return result;
    } catch (error: any) {
      if (error.message?.includes('Groq returned')) {
        throw error;
      }
      this.logger.error(`Groq API error: ${error.message}`, error.stack);
      throw new Error(`AI analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyzes an arbitrary job description and returns required skills, gaps, and roadmap type.
   *
   * @param rawJdText - The raw job description text
   * @param userSkills - Skills the user has already completed
   * @returns Parsed gap analysis result with roadmapType
   */
  async parseJd(rawJdText: string, userSkills: SkillInput[]): Promise<GapAnalysisJdResult> {
    const validSkills = await this.getValidSkillCatalog();
    const validNodeIds = new Set(validSkills.map((s) => s.nodeId));

    const skillCatalog = validSkills.map(
      (s) => `  - ${s.nodeId}: ${s.name}${s.description ? ` (${s.description.substring(0, 80)})` : ''}`,
    ).join('\n');

    const userSkillList = userSkills.length > 0
      ? userSkills.map((s) => `  - ${s.nodeId} (${s.name})`).join('\n')
      : '  (User has no completed skills yet)';

    const systemPrompt = `Bạn là technical recruiter. Skill IDs hợp lệ:
[
${skillCatalog}
]
Chỉ trả về JSON thuần, không markdown, không giải thích:
{
  "requiredSkillIds": string[],
  "gapSkillIds": string[],
  "matchScore": number,
  "summary": string,
  "roadmapType": "frontend" | "backend" | "devops" | "unknown"
}`;

    const userPrompt = `Đây là JD paste từ trang tuyển dụng:
${rawJdText}

User đã có các skill (nodeId + tên đầy đủ):
${userSkillList}

Hãy:
1. Extract tất cả required skills và map vào nodeId hợp lệ
2. Tính matchScore từ 0-100
3. Xác định roadmapType dựa trên nội dung JD
4. Viết summary bằng tiếng Việt, ngắn gọn 2-3 câu`;

    this.logger.log(`Calling Groq for JD parsing`);

    try {
      const response = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2,
        response_format: { type: 'json_object' },
      });

      const rawText = response.choices[0]?.message?.content?.trim() || '';
      
      if (!rawText) {
        throw new Error('Groq returned empty response');
      }

      let jsonStr = rawText;
      const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }

      let parsed: any;
      try {
        parsed = JSON.parse(jsonStr);
      } catch {
        this.logger.error(`Failed to parse Groq response as JSON: ${rawText}`);
        throw new Error('Groq returned invalid JSON. Raw response: ' + rawText.substring(0, 300));
      }

      if (
        !Array.isArray(parsed.requiredSkillIds) ||
        !Array.isArray(parsed.gapSkillIds) ||
        typeof parsed.matchScore !== 'number' ||
        typeof parsed.summary !== 'string' ||
        !['frontend', 'backend', 'devops', 'unknown'].includes(parsed.roadmapType)
      ) {
        throw new Error(
          'Groq response is missing required fields or has invalid roadmapType',
        );
      }

      const filteredRequired = parsed.requiredSkillIds.filter((id: string) => validNodeIds.has(id));
      const filteredGaps = parsed.gapSkillIds.filter((id: string) => validNodeIds.has(id));

      const result: GapAnalysisJdResult = {
        requiredSkillIds: filteredRequired,
        gapSkillIds: filteredGaps,
        matchScore: Math.max(0, Math.min(100, Math.round(parsed.matchScore))),
        summary: parsed.summary,
        roadmapType: parsed.roadmapType,
      };

      this.logger.log(`JD Parsing complete: roadmapType=${result.roadmapType}, matchScore=${result.matchScore}%`);
      return result;
    } catch (error: any) {
      if (error.message?.includes('Groq returned')) {
        throw error;
      }
      this.logger.error(`Groq API error: ${error.message}`, error.stack);
      throw new Error(`AI JD analysis failed: ${error.message}`);
    }
  }
}
