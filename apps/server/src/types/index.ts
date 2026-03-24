/**
 * Shared TypeScript interfaces and DTOs for IT Career Roadmap Platform
 * Used for API contracts between Backend and Frontend
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Skill progress status enumeration
 */
export enum UserSkillStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

// ============================================================================
// AUTHENTICATION DTOs
// ============================================================================

/**
 * User data transfer object for login and user profile responses
 */
export interface UserDto {
  id: string;
  email: string;
  createdAt: Date;
}

/**
 * Login request payload
 */
export interface LoginDto {
  email: string;
  password: string;
}

/**
 * Authentication response containing JWT token and user info
 */
export interface AuthResponseDto {
  token: string;
  user: UserDto;
}

// ============================================================================
// CAREER PATH & ROADMAP DTOs
// ============================================================================

/**
 * Career path data transfer object
 * Represents a career track (e.g., Backend Developer, Frontend Developer)
 */
export interface CareerPathDto {
  id: string;
  name: string;
  description: string;
}

/**
 * Roadmap data transfer object
 * Represents a learning roadmap with specific level within a career path
 */
export interface RoadmapDto {
  id: string;
  careerPathId: string;
  level: string;
}

/**
 * Request payload for selecting a career path and its roadmap
 */
export interface SelectRoadmapDto {
  careerPathId: string;
}

// ============================================================================
// SKILL DTOs
// ============================================================================

/**
 * Skill data transfer object with progress status
 * Represents a single skill in the roadmap with user's progress status
 */
export interface SkillDto {
  id: string;
  roadmapId: string;
  name: string;
  description: string;
  orderIndex: number;
  status: UserSkillStatus;
}

/**
 * Request payload for marking a skill as complete
 */
export interface CompleteSkillDto {
  skillId: string;
}

// ============================================================================
// PROGRESS DTOs
// ============================================================================

/**
 * User progress data transfer object
 * Contains aggregated completion statistics for the user's current roadmap
 */
export interface ProgressDto {
  completedSkills: number;
  totalSkills: number;
  percentage: number;
}

/**
 * User skill progress record
 * Represents individual skill completion status and timestamp
 */
export interface UserSkillProgressDto {
  id: string;
  userId: string;
  skillId: string;
  status: UserSkillStatus;
  completedAt: Date | null;
}
