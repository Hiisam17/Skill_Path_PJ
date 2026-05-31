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
 * Response structure from AI for Job JD deep analysis (AI Job Analyst).
 */
export interface JobAnalysisResult {
  seniority: 'Intern' | 'Fresher' | 'Junior' | 'Mid' | 'Senior' | 'Lead';
  must_have: string[];
  nice_to_have: string[];
  experience_years: string | number;
  ai_advice: string;
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
  private readonly groqModel: string;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const apiKey = this.config.get<string>('GROQ_API_KEY');
    this.groqModel =
      this.config.get<string>('GROQ_MODEL')?.trim() ||
      'llama-3.3-70b-versatile';
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
        model: this.groqModel,
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
        model: this.groqModel,
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

  /**
   * Analyzes a Job's JD deeply using Groq to classify skills, seniority, and give advice.
   *
   * Dynamic prompt strategy:
   *  - If job.skills.length > 0 → classify existing normalized skills into must-have / nice-to-have.
   *  - If job.skills.length === 0 → extract skills from raw JD content.
   *
   * @param jobId - The ID of the Job record in the database
   * @returns Parsed JobAnalysisResult or a safe fallback on error
   */
  async analyzeJobJD(jobId: number): Promise<JobAnalysisResult> {
    // ── 1. Fetch Job from DB ──────────────────────────────────────────────────
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        title: true,
        company: true,
        description: true,
        requirements: true,
        skills: true,
        roadmapPath: true,
      },
    });

    if (!job) {
      throw new Error(`Job with id=${jobId} not found`);
    }

    this.logger.log(
      `analyzeJobJD: jobId=${jobId}, title="${job.title}", skills.length=${job.skills.length}`,
    );

    // ── 2. Build Dynamic System Prompt ───────────────────────────────────────
    const hasSkills = job.skills.length > 0;

    const systemPrompt = hasSkills
      ? `Bạn là AI chuyên phân tích JD tuyển dụng IT.

Dưới đây là JD và mảng kỹ năng chuẩn hệ thống đã nhận diện được.
Nhiệm vụ của bạn là phân loại các kỹ năng trong mảng này thành Must-have và Nice-to-have dựa vào ngữ cảnh JD.
Tuyệt đối chỉ sử dụng các từ khóa nằm trong mảng được cung cấp, KHÔNG TỰ BỊA THÊM kỹ năng khác.

Quy tắc cho từng trường:
4. Lời khuyên (ai_advice): TUYỆT ĐỐI KHÔNG viết những câu sáo rỗng, chung chung về thái độ học hỏi hay kỹ năng mềm. Bạn PHẢI chỉ đích danh ít nhất 1-2 kỹ năng (tech stack) quan trọng nhất trong mục must_have để khuyên ứng viên ôn tập sâu, hoặc gợi ý cách dùng kỹ năng nice_to_have để ghi điểm. Viết 2-3 câu ngắn gọn, mang tính chiến lược chuyên môn của một Tech Lead.

Trả về JSON với cấu trúc BẮT BUỘC sau (không markdown, không giải thích thêm):
{
  "seniority": "Intern" | "Fresher" | "Junior" | "Mid" | "Senior" | "Lead",
  "must_have": string[],
  "nice_to_have": string[],
  "experience_years": string | number,
  "ai_advice": string
}`
      : `Bạn là AI chuyên phân tích JD tuyển dụng IT.

Hệ thống không tìm thấy kỹ năng chuẩn cho vị trí này.
Dựa vào nội dung JD dưới đây, hãy tự bóc tách các kỹ năng IT và phân loại chúng vào Must-have và Nice-to-have.

Quy tắc cho từng trường:
4. Lời khuyên (ai_advice): TUYỆT ĐỐI KHÔNG viết những câu sáo rỗng, chung chung về thái độ học hỏi hay kỹ năng mềm. Bạn PHẢI chỉ đích danh ít nhất 1-2 kỹ năng (tech stack) quan trọng nhất trong mục must_have để khuyên ứng viên ôn tập sâu, hoặc gợi ý cách dùng kỹ năng nice_to_have để ghi điểm. Viết 2-3 câu ngắn gọn, mang tính chiến lược chuyên môn của một Tech Lead.

Trả về JSON với cấu trúc BẮT BUỘC sau (không markdown, không giải thích thêm):
{
  "seniority": "Intern" | "Fresher" | "Junior" | "Mid" | "Senior" | "Lead",
  "must_have": string[],
  "nice_to_have": string[],
  "experience_years": string | number,
  "ai_advice": string
}`;

    // ── 3. Build User Prompt ──────────────────────────────────────────────────
    const jdContent = [
      `Job Title: ${job.title}`,
      `Company: ${job.company}`,
      `Description:\n${job.description}`,
      job.requirements ? `Requirements:\n${job.requirements}` : null,
    ]
      .filter(Boolean)
      .join('\n\n');

    const userPrompt = hasSkills
      ? `${jdContent}\n\n---\nMảng kỹ năng chuẩn hệ thống (CHỈ dùng các từ khóa này):\n${JSON.stringify(job.skills)}`
      : jdContent;

    // ── 4. Call Groq ─────────────────────────────────────────────────────────
    const FALLBACK: JobAnalysisResult = {
      seniority: 'Junior',
      must_have: job.skills.slice(0, 5),
      nice_to_have: [],
      experience_years: 'N/A',
      ai_advice: 'Không thể phân tích JD lúc này. Vui lòng thử lại sau.',
    };

    console.log(`[analyzeJobJD] BEFORE API Call - Job ID: ${jobId}, Title: "${job.title}", Company: "${job.company}"`);
    console.log(`[analyzeJobJD] BEFORE API Call - JD Content Length: ${jdContent.length} characters`);
    console.log(`[analyzeJobJD] BEFORE API Call - Skills Array Length: ${job.skills.length}`, job.skills);

    try {
      const response = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        model: this.groqModel,
        temperature: 0.15,
        response_format: { type: 'json_object' },
      });

      const rawText = response.choices[0]?.message?.content?.trim() || '';
      console.log(`[analyzeJobJD] AFTER API Call - Groq Raw Response (Raw Text):`, rawText);
      this.logger.debug(`Groq analyzeJobJD raw: ${rawText.substring(0, 300)}`);

      if (!rawText) {
        console.warn('[analyzeJobJD] Groq returned empty response, using fallback');
        this.logger.warn('analyzeJobJD: Groq returned empty response, using fallback');
        return FALLBACK;
      }

      // Strip potential markdown fences (safety net even with json_object mode)
      let jsonStr = rawText;
      const fenceMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (fenceMatch) {
        jsonStr = fenceMatch[1].trim();
        console.log(`[analyzeJobJD] Stripped markdown fences. Clean JSON string to parse:`, jsonStr);
      }

      let parsed: any;
      try {
        parsed = JSON.parse(jsonStr);
      } catch (parseErr: any) {
        console.error(`[analyzeJobJD] JSON Parse Error:`, {
          errorMessage: parseErr.message,
          errorStack: parseErr.stack,
          rawResponseAttemptedToParse: rawText
        });
        this.logger.error(
          `analyzeJobJD: JSON parse failed for jobId=${jobId}. Raw: ${rawText.substring(0, 300)}`,
        );
        return FALLBACK;
      }

      // ── 5. Validate & Sanitize Output ──────────────────────────────────────
      const validSeniorities = ['Intern', 'Fresher', 'Junior', 'Mid', 'Senior', 'Lead'];

      const result: JobAnalysisResult = {
        seniority: validSeniorities.includes(parsed.seniority)
          ? parsed.seniority
          : 'Junior',
        must_have: Array.isArray(parsed.must_have)
          ? parsed.must_have.filter((s: any) => typeof s === 'string')
          : [],
        nice_to_have: Array.isArray(parsed.nice_to_have)
          ? parsed.nice_to_have.filter((s: any) => typeof s === 'string')
          : [],
        experience_years:
          parsed.experience_years !== undefined ? parsed.experience_years : 'N/A',
        ai_advice:
          typeof parsed.ai_advice === 'string' && parsed.ai_advice.trim()
            ? parsed.ai_advice.trim()
            : FALLBACK.ai_advice,
      };

      // If skills were pre-normalized, filter hallucinated entries
      if (hasSkills) {
        const allowedSet = new Set(job.skills);
        const before = result.must_have.length + result.nice_to_have.length;
        result.must_have = result.must_have.filter((s) => allowedSet.has(s));
        result.nice_to_have = result.nice_to_have.filter((s) => allowedSet.has(s));
        const after = result.must_have.length + result.nice_to_have.length;
        if (before !== after) {
          console.warn(`[analyzeJobJD] Filtered ${before - after} hallucinated skills for jobId=${jobId}`);
          this.logger.warn(
            `analyzeJobJD: Filtered ${before - after} hallucinated skills for jobId=${jobId}`,
          );
        }
      }

      this.logger.log(
        `analyzeJobJD complete: jobId=${jobId}, seniority=${result.seniority}, ` +
          `must_have=${result.must_have.length}, nice_to_have=${result.nice_to_have.length}`,
      );

      return result;
    } catch (error: any) {
      console.error(`[analyzeJobJD] Groq calling/processing failure! Full error details:`, {
        message: error.message,
        stack: error.stack,
        statusCode: error.status || error.statusCode || (error.response && error.response.status) || 'N/A',
        errorObject: error
      });
      this.logger.error(
        `analyzeJobJD: Groq API error for jobId=${jobId}: ${error.message}`,
        error.stack,
      );
      // Return safe fallback instead of crashing the caller
      return FALLBACK;
    }
  }
}
