import { Timestamp } from 'firebase/firestore';
import type { SkillGapsMap } from './skill-gaps';

// Re-export skill gap types
export * from './skill-gaps';

/**
 * @description Skill-based rank levels that gate writing modes.
 * Scribe = Paragraph, Scholar = Essay, Loremaster = Essay + Passage
 */
export type SkillLevel = 'scribe' | 'scholar' | 'loremaster';

/**
 * @description Tier within a skill level (3 = lowest, 1 = highest).
 * T3 requires 70%+, T2 requires 80%+, T1 requires 90%+ to promote.
 */
export type SkillTier = 1 | 2 | 3;

/**
 * @description Writing submission types that map to skill levels.
 */
export type SubmissionLevel = 'paragraph' | 'essay' | 'essay_passage';

/**
 * @description Mastery status for a single lesson.
 */
export interface LessonMasteryStatus {
  mastered: boolean;      // 90%+ achieved
  bestScore: number;      // Highest score
  lastScore: number;      // Most recent score
  completedAt: Timestamp; // When first completed
  masteredAt?: Timestamp; // When first mastered (if mastered)
  attempts: number;       // Total attempts
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  avatar: string;
  
  // Legacy rank fields (kept for backward compatibility)
  currentRank: string;
  rankLP: number;
  totalLP: number;
  
  // New skill-based rank system (optional during migration)
  skillLevel?: SkillLevel;   // 'scribe' | 'scholar' | 'loremaster'
  skillTier?: SkillTier;     // 1 | 2 | 3 (3 = lowest, 1 = highest)
  tierLP?: number;           // 0-100, progress within current tier
  
  traits: {
    content: number;
    organization: number;
    grammar: number;
    vocabulary: number;
    mechanics: number;
  };
  stats: {
    rankedMatches: number;
    practiceMatches: number;
    lessonsCompleted: number;
    wins: number;
    totalWords: number;
    currentStreak: number;
  };
  
  // Practice mode mastery tracking
  practiceMastery?: {
    [lessonId: string]: LessonMasteryStatus;
  };

  // Ranked mode progress tracking
  rankedProgress?: RankedProgress;

  // Skill gap tracking (denormalized for fast block checks)
  skillGaps?: SkillGapsMap;
  
  // Streak tracking
  lastActivityDate?: string; // Format: 'YYYY-MM-DD'
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface RankedPrompt {
  id: string;
  level: SubmissionLevel;
  sequenceNumber: number;
  activeDate: string;
  promptText: string;
  topic?: string;
  angle?: string;
  inspirationText?: string;
  createdAt: Timestamp;
}

export interface RankedProgress {
  currentPromptSequence: number;
  completedPrompts: string[];
}

export interface RankedSubmission {
  id: string;
  userId: string;
  promptId: string;
  /** The actual prompt text used (may be personalized per user) */
  promptText?: string;
  level: SubmissionLevel;
  originalContent: string;
  originalScore: number;
  originalFeedback: Record<string, unknown>;
  revisedContent?: string;
  revisedScore?: number;
  revisedFeedback?: Record<string, unknown>;
  lpEarned: number;
  submittedAt: Timestamp;
  completedAt?: Timestamp;
}

export interface PracticeSubmission {
  id: string;
  userId: string;
  type: SubmissionLevel;
  topic: string;
  prompt: string;
  originalContent: string;
  originalScore: number;
  originalFeedback: Record<string, unknown>;
  revisedContent?: string;
  revisedScore?: number;
  revisedFeedback?: Record<string, unknown>;
  submittedAt: Timestamp;
  completedAt?: Timestamp;
}

export interface AIStudent {
  id: string;
  displayName: string;
  personality: string;
  avatar: string;
  currentRank: string;
  rankLP: number;
  characterLevel: number;
  totalXP: number;
  stats: {
    totalMatches: number;
    wins: number;
    losses: number;
    totalWords: number;
    winRate: number;
  };
  traits: {
    content: number;
    organization: number;
    grammar: number;
    vocabulary: number;
    mechanics: number;
  };
  writingStyle: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * @description Options returned from the prompt options endpoint for student selection.
 */
export interface PromptOptions {
  topic: string;
  angle: string;
  question: string;
  options: string[];
}

/**
 * @description Response from prompt generation with selection validation.
 * Includes split prompt format for UI flexibility (question vs hint).
 */
export interface PromptGenerationResponse {
  valid: boolean;
  /** Full prompt text (question + hint combined) - for storage/backwards compat */
  promptText?: string;
  /** Main question portion of the prompt */
  promptQuestion?: string;
  /** Optional hint/suggestions (e.g., "You might discuss...") */
  promptHint?: string;
  reason?: string;
  selection?: string;
}

