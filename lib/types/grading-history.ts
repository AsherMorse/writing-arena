/**
 * @fileoverview Type definitions for grading history storage.
 * Used to track skill gaps over time and determine practice requirements.
 */

import type { Timestamp } from 'firebase/firestore';
import type {
  ParagraphScorecard,
  SkillGap,
  ParagraphRubricType,
} from '@/lib/grading/paragraph-rubrics';
import type {
  EssayScorecard,
  EssaySkillGap,
  EssayType,
} from '@/lib/grading/essay-rubrics';

/**
 * @description Grader type selection.
 */
export type GraderType = 'paragraph' | 'essay';

/**
 * @description Single grading history entry stored per session.
 * Note: strengths/improvements are now per-category in scorecard.categories
 * (examplesOfGreatResults/examplesOfWhereToImprove) for paragraph grader.
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
  overallFeedback: string;
  /** @deprecated Use scorecard.categories[].examplesOfGreatResults instead */
  strengths?: string[];
  /** @deprecated Use scorecard.categories[].examplesOfWhereToImprove instead */
  improvements?: string[];
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
  overallFeedback: string;
  /** @deprecated Use scorecard.categories[].examplesOfGreatResults instead */
  strengths?: string[];
  /** @deprecated Use scorecard.categories[].examplesOfWhereToImprove instead */
  improvements?: string[];
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
  essayType?: EssayType;
  rubricType?: ParagraphRubricType;
}

/**
 * @description Response from grading API endpoint.
 * Note: For paragraph grader, examples are in scorecard.categories[].examplesOfGreatResults/examplesOfWhereToImprove.
 */
export interface GradeRevisionResponse {
  success: boolean;
  gradingId: string;
  scorecard: ParagraphScorecard | EssayScorecard;
  gaps: SkillGap[] | EssaySkillGap[];
  hasSevereGap: boolean;
  blockStatus: BlockStatus;
  overallFeedback: string;
}
