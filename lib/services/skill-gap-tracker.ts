/**
 * @fileoverview Skill gap tracking service for adaptive intervention.
 * Tracks writing weaknesses, checks block status, and manages resolution.
 */

import { db } from '@/lib/config/firebase';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import {
  INTERVENTION_RULES,
  MAX_OCCURRENCES_STORED,
} from '@/lib/constants/gap-intervention';
import type { SkillGap } from '@/app/fantasy/_lib/grading';
import type {
  GapOccurrence,
  SkillGapData,
  BlockCheckResult,
  SubmissionSource,
  GapSeverity,
  SkillGapsMap,
} from '@/lib/types/skill-gaps';
import type { UserProfile } from '@/lib/types';

/**
 * @description Get count of recent occurrences within time window.
 * Optionally filter by submission source (practice vs ranked).
 */
export function getRecentGapCount(
  occurrences: GapOccurrence[],
  timeWindowMs: number,
  source?: SubmissionSource
): number {
  const now = Date.now();
  return occurrences.filter((o) => {
    const withinWindow = now - o.timestamp.toMillis() < timeWindowMs;
    const matchesSource = !source || o.source === source;
    return withinWindow && matchesSource;
  }).length;
}

/**
 * @description Get the highest severity among recent occurrences.
 */
function getHighestRecentSeverity(
  occurrences: GapOccurrence[],
  timeWindowMs: number
): GapSeverity | null {
  const now = Date.now();
  const recentOccurrences = occurrences.filter(
    (o) => now - o.timestamp.toMillis() < timeWindowMs
  );

  if (recentOccurrences.length === 0) return null;

  const severityOrder: Record<GapSeverity, number> = {
    high: 0,
    medium: 1,
    low: 2,
  };

  return recentOccurrences.reduce((max, o) => {
    return severityOrder[o.severity] < severityOrder[max] ? o.severity : max;
  }, recentOccurrences[0].severity);
}

/**
 * @description Update user's skill gaps after a graded submission.
 * Adds new occurrences and updates recommended lessons.
 */
export async function updateSkillGaps(
  userId: string,
  gaps: SkillGap[],
  source: SubmissionSource,
  submissionId: string
): Promise<void> {
  if (gaps.length === 0) return;

  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error(`User not found: ${userId}`);
  }

  const userData = userSnap.data() as UserProfile;
  const currentSkillGaps = userData.skillGaps || {};
  const updates: Record<string, unknown> = {};

  for (const gap of gaps) {
    const criterion = gap.category;
    const currentGap = currentSkillGaps[criterion];

    const newOccurrence: GapOccurrence = {
      timestamp: Timestamp.now(),
      source,
      severity: gap.severity,
      score: gap.score,
      submissionId,
    };

    // Build updated occurrences (keep last N, newest first)
    const existingOccurrences = currentGap?.occurrences || [];
    const updatedOccurrences = [newOccurrence, ...existingOccurrences].slice(
      0,
      MAX_OCCURRENCES_STORED
    );

    // If gap was resolved but reappears, set back to active
    const newStatus =
      currentGap?.status === 'resolved' ? 'active' : currentGap?.status || 'active';

    const updatedGapData: SkillGapData = {
      occurrences: updatedOccurrences,
      recommendedLessons: gap.recommendedLessons,
      status: newStatus,
    };

    updates[`skillGaps.${criterion}`] = updatedGapData;
  }

  await updateDoc(userRef, updates);
}

/**
 * @description Check if user should be blocked from ranked based on gap patterns.
 * Returns block status with reason, blocking gaps, and required lessons.
 */
export async function checkBlockStatus(
  userId: string
): Promise<BlockCheckResult> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return { blocked: false, blockingGaps: [], requiredLessons: [] };
  }

  const userData = userSnap.data() as UserProfile;
  const skillGaps = userData.skillGaps || {};

  const blockingGaps: string[] = [];
  const requiredLessons = new Set<string>();
  const warnings: string[] = [];
  let blockReason: BlockCheckResult['reason'];

  for (const [criterion, gapData] of Object.entries(skillGaps)) {
    // Skip resolved gaps
    if (gapData.status === 'resolved') continue;

    // Find highest severity among recent occurrences (using longest window)
    const maxTimeWindow = Math.max(
      INTERVENTION_RULES.high.timeWindow,
      INTERVENTION_RULES.medium.timeWindow,
      INTERVENTION_RULES.low.timeWindow
    );

    const highestSeverity = getHighestRecentSeverity(
      gapData.occurrences,
      maxTimeWindow
    );

    if (!highestSeverity) continue;

    const rules = INTERVENTION_RULES[highestSeverity];
    const rankedCount = getRecentGapCount(
      gapData.occurrences,
      rules.timeWindow,
      'ranked'
    );

    // Check if blocked
    if (rankedCount >= rules.rankedBlock) {
      blockingGaps.push(criterion);
      gapData.recommendedLessons.forEach((l) => requiredLessons.add(l));

      // Set block reason (high severity takes precedence)
      if (!blockReason || highestSeverity === 'high') {
        blockReason =
          highestSeverity === 'high'
            ? 'high_severity'
            : highestSeverity === 'medium'
              ? 'medium_pattern'
              : 'low_pattern';
      }
    }
    // Check if warning (approaching block threshold)
    else if (rankedCount >= rules.rankedWarn) {
      warnings.push(criterion);
    }
  }

  return {
    blocked: blockingGaps.length > 0,
    reason: blockReason,
    blockingGaps,
    requiredLessons: Array.from(requiredLessons),
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * @description Mark a gap as resolved after completing required lessons.
 */
export async function resolveGap(
  userId: string,
  criterion: string,
  completedLessons: string[]
): Promise<void> {
  const userRef = doc(db, 'users', userId);

  await updateDoc(userRef, {
    [`skillGaps.${criterion}.status`]: 'resolved',
    [`skillGaps.${criterion}.resolvedBy`]: completedLessons,
    [`skillGaps.${criterion}.resolvedAt`]: Timestamp.now(),
  });
}

/**
 * @description Get user's current skill gaps data.
 * Returns empty object if user has no gaps.
 */
export async function getUserSkillGaps(
  userId: string
): Promise<SkillGapsMap> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return {};

  const userData = userSnap.data() as UserProfile;
  return userData.skillGaps || {};
}

/**
 * @description Check if all recommended lessons for a gap have been mastered.
 * Used to determine if a gap should be auto-resolved.
 */
export function areAllLessonsMastered(
  recommendedLessons: string[],
  practiceMastery: Record<string, { mastered: boolean }> | undefined
): boolean {
  if (!practiceMastery || recommendedLessons.length === 0) return false;

  return recommendedLessons.every(
    (lessonId) => practiceMastery[lessonId]?.mastered === true
  );
}

/**
 * @description Get gaps that would be resolved by mastering a specific lesson.
 * Returns criterion names where all recommended lessons are now mastered.
 */
export async function getGapsResolvedByLesson(
  userId: string,
  masteredLessonId: string
): Promise<string[]> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return [];

  const userData = userSnap.data() as UserProfile;
  const skillGaps = userData.skillGaps || {};
  const practiceMastery = userData.practiceMastery || {};

  const resolvedGaps: string[] = [];

  for (const [criterion, gapData] of Object.entries(skillGaps)) {
    // Skip already resolved or if lesson isn't recommended
    if (gapData.status === 'resolved') continue;
    if (!gapData.recommendedLessons.includes(masteredLessonId)) continue;

    // Check if ALL recommended lessons are now mastered
    const allMastered = gapData.recommendedLessons.every(
      (lessonId) => practiceMastery[lessonId]?.mastered === true
    );

    if (allMastered) {
      resolvedGaps.push(criterion);
    }
  }

  return resolvedGaps;
}
