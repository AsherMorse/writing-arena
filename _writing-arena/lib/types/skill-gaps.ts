/**
 * @fileoverview Type definitions for skill gap tracking system.
 * Tracks writing weaknesses, intervention rules, and resolution status.
 */

import type { Timestamp } from 'firebase/firestore';

/**
 * @description Severity level of a skill gap based on score.
 * - high: Scores 0-2 (critical, needs immediate attention)
 * - medium: Score 3 (significant gap, needs work)
 * - low: Score 4 (minor improvement area)
 */
export type GapSeverity = 'low' | 'medium' | 'high';

/**
 * @description Current status of a skill gap.
 * - active: Gap is being tracked, may block ranked access
 * - resolving: Student is working on lessons (future use)
 * - resolved: Student completed required lessons, gap cleared
 */
export type GapStatus = 'active' | 'resolving' | 'resolved';

/**
 * @description Source of the submission that triggered the gap.
 * Only ranked submissions count toward blocking thresholds.
 */
export type SubmissionSource = 'practice' | 'ranked';

/**
 * @description Single occurrence of a gap detected in a submission.
 */
export interface GapOccurrence {
  /** When this occurrence was recorded */
  timestamp: Timestamp;
  /** Whether from practice or ranked submission */
  source: SubmissionSource;
  /** Severity at time of occurrence */
  severity: GapSeverity;
  /** Raw score that triggered the gap */
  score: number;
  /** ID of the submission that triggered this occurrence */
  submissionId: string;
}

/**
 * @description Aggregated gap data for a single criterion stored on user doc.
 */
export interface SkillGapData {
  /** Recent occurrences of this gap (max 20, newest first) */
  occurrences: GapOccurrence[];
  /** Lessons recommended to fix this gap */
  recommendedLessons: string[];
  /** Current status of this gap */
  status: GapStatus;
  /** Lessons completed to resolve (when status=resolved) */
  resolvedBy?: string[];
  /** When gap was resolved */
  resolvedAt?: Timestamp;
}

/**
 * @description Reason for blocking user from ranked mode.
 */
export type BlockReason = 'high_severity' | 'medium_pattern' | 'low_pattern';

/**
 * @description Result of checking if user should be blocked from ranked.
 */
export interface BlockCheckResult {
  /** Whether user is currently blocked */
  blocked: boolean;
  /** Why they're blocked (if blocked) */
  reason?: BlockReason;
  /** Which criteria are causing the block */
  blockingGaps: string[];
  /** Lessons required to unblock */
  requiredLessons: string[];
  /** Criteria approaching block threshold (for warnings) */
  warnings?: string[];
}

/**
 * @description Map of criterion names to their gap data.
 * Stored at users/{uid}.skillGaps
 */
export type SkillGapsMap = Record<string, SkillGapData>;
