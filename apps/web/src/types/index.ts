/**
 * Frontend type definitions
 * Re-export shared types from backend @server/types for consistency
 * Fallback: duplicate DTOs if backend types not accessible
 */

// ───── ENUMS ─────
/**
 * User skill completion status
 * @enum {string}
 */
export const UserSkillStatus = {
  NOT_STARTED: "NOT_STARTED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
} as const;

export type UserSkillStatus =
  (typeof UserSkillStatus)[keyof typeof UserSkillStatus];

// ───── AUTH TYPES ─────
/**
 * User data transfer object
 */
export interface UserDto {
  id: string;
  email: string;
  createdAt: string;
}

/**
 * Login request payload
 */
export interface LoginDto {
  email: string;
  password: string;
}

/**
 * Login response with JWT token and user info
 */
export interface AuthResponseDto {
  token: string;
  user: UserDto;
}

// ───── ROADMAP TYPES ─────
/**
 * Career path (e.g., Backend Developer, Frontend Developer)
 */
export interface CareerPathDto {
  id: string;
  name: string;
  description: string;
}

/**
 * Roadmap with levels and skills
 */
export interface RoadmapDto {
  id: string;
  careerPathId: string;
  level: string;
}

/**
 * Request to select a roadmap
 */
export interface SelectRoadmapDto {
  careerPathId: string;
}

// ───── SKILL TYPES ─────
/**
 * Skill with status of current user
 */
export interface SkillDto {
  id: string;
  roadmapId: string;
  name: string;
  description: string;
  orderIndex: number;
  status?: UserSkillStatus;
}

/**
 * Request to mark a skill as completed
 */
export interface CompleteSkillDto {
  skillId: string;
}

// ───── PROGRESS TYPES ─────
/**
 * User's learning progress summary
 */
export interface ProgressDto {
  completedSkills: number;
  totalSkills: number;
  percentage: number;
}

/**
 * Individual skill progress record
 */
export interface UserSkillProgressDto {
  id: string;
  userId: string;
  skillId: string;
  status: UserSkillStatus;
  completedAt?: string;
}
