/**
 * @fileoverview Type definitions for grading history storage.
 * Used to track skill gaps over time and determine practice requirements.
 */

import type { Timestamp } from 'firebase/firestore';
import type {
  ParagraphScorecard,
  SkillGap,
} from '@/lib/grading/paragraph-rubrics';
import type {
  EssayScorecard,
  EssaySkillGap,
} from '@/lib/grading/essay-rubrics';

/**
 * @description Grader type selection.
 */
export type GraderType = 'paragraph' | 'essay';

/**
 * @description Single grading history entry stored per session.
 */
export interface GradingHistoryEntry {
  id: string;
  timestamp: Timestamp;
  matchId: string;
  phase: 1 | 3;
  graderType: GraderType;
  scorecard: ParagraphScorecard | EssayScorecard;
  gaps: SkillGap[] | EssaySkillGap[];
  hasSevereGap: boolean;
  writingContent: string;
  prompt: string;
  strengths: string[];
  improvements: string[];
  overallFeedback: string;
}

/**
 * @description Input for creating a grading history entry (without auto-generated fields).
 */
export interface GradingHistoryInput {
  matchId: string;
  phase: 1 | 3;
  graderType: GraderType;
  scorecard: ParagraphScorecard | EssayScorecard;
  gaps: SkillGap[] | EssaySkillGap[];
  hasSevereGap: boolean;
  writingContent: string;
  prompt: string;
<<<<<<< HEAD
  strengths: string[];
  improvements: string[];
  overallFeedback: string;
=======
>>>>>>> 2fb2fc6eb687eeb197bef84f5b4bf0a3bff05f34
}

/**
 * @description Aggregated gap data for pattern detection across sessions.
 */
export interface AccumulatedGap {
  criterion: string;
  count: number;
  severity: 'high' | 'medium';
  recommendedLessons: string[];
  lastOccurrence: Timestamp;
}

/**
 * @description Reason for blocking user from ranked matches.
 */
export type BlockReason = 'severe_gap' | 'accumulated_gaps' | null;

/**
 * @description Result of block status check.
 */
export interface BlockStatus {
  isBlocked: boolean;
  reason: BlockReason;
  blockingCriteria: string[];
  requiredLessons: string[];
}

/**
 * @description Input for grading API endpoint.
 */
export interface GradeRevisionInput {
  matchId: string;
  userId: string;
  content: string;
  prompt: string;
  graderType: GraderType;
  gradeLevel?: number;
}

/**
 * @description Response from grading API endpoint.
 */
export interface GradeRevisionResponse {
  success: boolean;
  gradingId: string;
  scorecard: ParagraphScorecard | EssayScorecard;
  gaps: SkillGap[] | EssaySkillGap[];
  hasSevereGap: boolean;
  blockStatus: BlockStatus;
  strengths: string[];
  improvements: string[];
  overallFeedback: string;
}

