/**
 * @fileoverview Service for storing and retrieving grading history.
 * Tracks skill gaps over time for practice recommendations and block flow.
 */

import { db } from '../config/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import type {
  GradingHistoryEntry,
  GradingHistoryInput,
  AccumulatedGap,
  BlockStatus,
} from '@/lib/types/grading-history';
import type { SkillGap } from '@/lib/grading/paragraph-rubrics';
import type { EssaySkillGap } from '@/lib/grading/essay-rubrics';

/**
 * @description Threshold for accumulated gaps before blocking.
 * User is blocked if same criterion has 3+ medium gaps.
 */
const ACCUMULATED_GAP_THRESHOLD = 3;

/**
 * @description Save a grading result to the user's history.
 * @param userId - The user's ID
 * @param input - The grading data to save
 * @returns The generated document ID
 */
export async function saveGradingResult(
  userId: string,
  input: GradingHistoryInput
): Promise<string> {
  const historyRef = collection(db, 'users', userId, 'gradingHistory');
  const docRef = doc(historyRef);

  const entry: Omit<GradingHistoryEntry, 'id'> & { timestamp: ReturnType<typeof serverTimestamp> } = {
    ...input,
    timestamp: serverTimestamp(),
  };

  await setDoc(docRef, entry);
  return docRef.id;
}

/**
 * @description Fetch all grading history for a user, ordered by most recent.
 * @param userId - The user's ID
 * @param limitCount - Max number of entries to fetch (default: 50)
 * @returns Array of grading history entries
 */
export async function getGradingHistory(
  userId: string,
  limitCount: number = 50
): Promise<GradingHistoryEntry[]> {
  const historyRef = collection(db, 'users', userId, 'gradingHistory');
  const q = query(historyRef, orderBy('timestamp', 'desc'), limit(limitCount));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as GradingHistoryEntry[];
}

/**
 * @description Get the most recent grading result for a specific match.
 * @param userId - The user's ID
 * @param matchId - The match ID to look up
 * @returns The grading entry or null if not found
 */
export async function getGradingResultByMatch(
  userId: string,
  matchId: string
): Promise<GradingHistoryEntry | null> {
  const history = await getGradingHistory(userId, 100);
  return history.find((entry) => entry.matchId === matchId) || null;
}

/**
 * @description Get criterion name from gap (handles both paragraph and essay gaps).
 */
function getCriterionFromGap(gap: SkillGap | EssaySkillGap): string {
  // Paragraph gaps use 'category', essay gaps use 'criterion'
  return (gap as SkillGap).category || (gap as EssaySkillGap).criterion;
}

/**
 * @description Aggregate medium gaps by criterion across all history.
 * Only counts medium severity gaps for accumulation tracking.
 * @param userId - The user's ID
 * @returns Array of accumulated gaps per criterion
 */
export async function getAccumulatedGaps(
  userId: string
): Promise<AccumulatedGap[]> {
  const history = await getGradingHistory(userId);
  const gapCounts = new Map<string, AccumulatedGap>();

  for (const entry of history) {
    for (const gap of entry.gaps) {
      // Only count medium severity gaps for accumulation
      if (gap.severity !== 'medium') continue;

      const criterion = getCriterionFromGap(gap);
      const existing = gapCounts.get(criterion);

      if (existing) {
        existing.count++;
        // Keep most recent occurrence timestamp
        if (entry.timestamp > existing.lastOccurrence) {
          existing.lastOccurrence = entry.timestamp;
          existing.recommendedLessons = gap.recommendedLessons;
        }
      } else {
        gapCounts.set(criterion, {
          criterion,
          count: 1,
          severity: 'medium',
          recommendedLessons: gap.recommendedLessons,
          lastOccurrence: entry.timestamp,
        });
      }
    }
  }

  return Array.from(gapCounts.values());
}

/**
 * @description Get unique recommended lessons from gaps.
 */
function getUniqueRecommendedLessons(
  gaps: Array<SkillGap | EssaySkillGap | AccumulatedGap>
): string[] {
  const lessons = new Set<string>();
  for (const gap of gaps) {
    for (const lesson of gap.recommendedLessons) {
      lessons.add(lesson);
    }
  }
  return Array.from(lessons);
}

/**
 * @description Check if user should be blocked from ranked matches.
 * Blocked if:
 * 1. Latest session has a severe gap (paragraph score ≤2, or essay "No")
 * 2. Same criterion has accumulated 3+ medium gaps across all time
 * @param userId - The user's ID
 * @returns Block status with reason and required lessons
 */
export async function checkBlockStatus(userId: string): Promise<BlockStatus> {
  const history = await getGradingHistory(userId);

  // No history = not blocked
  if (history.length === 0) {
    return {
      isBlocked: false,
      reason: null,
      blockingCriteria: [],
      requiredLessons: [],
    };
  }

  // Check for severe gaps in latest session
  const latest = history[0];
  if (latest.hasSevereGap) {
    const severeGaps = latest.gaps.filter((g) => g.severity === 'high');
    return {
      isBlocked: true,
      reason: 'severe_gap',
      blockingCriteria: severeGaps.map(getCriterionFromGap),
      requiredLessons: getUniqueRecommendedLessons(severeGaps),
    };
  }

  // Check for accumulated gaps (3+ medium per criterion)
  const accumulated = await getAccumulatedGaps(userId);
  const accumulatedBlocks = accumulated.filter(
    (g) => g.count >= ACCUMULATED_GAP_THRESHOLD
  );

  if (accumulatedBlocks.length > 0) {
    return {
      isBlocked: true,
      reason: 'accumulated_gaps',
      blockingCriteria: accumulatedBlocks.map((g) => g.criterion),
      requiredLessons: getUniqueRecommendedLessons(accumulatedBlocks),
    };
  }

  return {
    isBlocked: false,
    reason: null,
    blockingCriteria: [],
    requiredLessons: [],
  };
}

/**
 * @description Clear accumulated gaps for a criterion after user completes practice.
 * This is done by marking related history entries as resolved (future enhancement).
 * For now, this is a placeholder - gaps are tracked but not cleared.
 * @param userId - The user's ID
 * @param criterion - The criterion to clear
 */
export async function resolveGaps(
  userId: string,
  criterion: string
): Promise<void> {
  // TODO: Implement gap resolution after practice completion
  // Options:
  // 1. Add 'resolved' field to history entries
  // 2. Create separate 'resolvedGaps' subcollection
  // 3. Track completion in user profile
  console.log(`[GradingHistory] Resolving gaps for ${criterion} (user: ${userId})`);
}

/**
 * @description Get a summary of the user's grading performance.
 * @param userId - The user's ID
 * @returns Summary statistics
 */
export async function getGradingSummary(userId: string): Promise<{
  totalSessions: number;
  averageScore: number;
  severeGapCount: number;
  mostCommonGap: string | null;
}> {
  const history = await getGradingHistory(userId);

  if (history.length === 0) {
    return {
      totalSessions: 0,
      averageScore: 0,
      severeGapCount: 0,
      mostCommonGap: null,
    };
  }

  // Calculate average percentage score
  const totalScore = history.reduce((sum, entry) => {
    const scorecard = entry.scorecard;
    return sum + scorecard.percentageScore;
  }, 0);
  const averageScore = Math.round(totalScore / history.length);

  // Count sessions with severe gaps
  const severeGapCount = history.filter((e) => e.hasSevereGap).length;

  // Find most common gap criterion
  const accumulated = await getAccumulatedGaps(userId);
  const mostCommonGap =
    accumulated.length > 0
      ? accumulated.sort((a, b) => b.count - a.count)[0].criterion
      : null;

  return {
    totalSessions: history.length,
    averageScore,
    severeGapCount,
    mostCommonGap,
  };
}

