/**
 * @fileoverview Hook for fetching and managing practice mastery status.
 * Provides real-time mastery data for UI components.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LessonMasteryStatus } from '@/lib/types';
import { logger, LOG_CONTEXTS } from '@/lib/utils/logger';
import {
  getUserMasteryStatus,
  getLessonMasteryStatus,
  canEarnLP,
  updateMastery,
  calculateLPForSession,
} from '@/lib/services/practice-mastery';
import { getAvailableLessons, MASTERY_THRESHOLD } from '@/lib/constants/practice-lessons';

interface UsePracticeMasteryState {
  masteryStatus: Record<string, LessonMasteryStatus>;
  isLoading: boolean;
  error: string | null;
}

interface UsePracticeMasteryActions {
  refreshMastery: () => Promise<void>;
  checkLessonMastery: (lessonId: string) => boolean;
  checkCanEarnLP: (lessonId: string) => boolean;
  getBestScore: (lessonId: string) => number;
  getAttemptCount: (lessonId: string) => number;
}

type UsePracticeMasteryReturn = UsePracticeMasteryState & UsePracticeMasteryActions;

/**
 * @description Hook for accessing user's practice mastery status.
 * Automatically fetches mastery data when user is authenticated.
 */
export function usePracticeMastery(): UsePracticeMasteryReturn {
  const { user } = useAuth();
  const [masteryStatus, setMasteryStatus] = useState<Record<string, LessonMasteryStatus>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * @description Fetches all mastery statuses for the current user.
   */
  const refreshMastery = useCallback(async () => {
    if (!user?.uid) {
      setMasteryStatus({});
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const status = await getUserMasteryStatus(user.uid);
      setMasteryStatus(status);
    } catch (err) {
      logger.error(LOG_CONTEXTS.PRACTICE, 'Failed to fetch mastery status', err);
      setError('Failed to load mastery data');
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  // Fetch mastery on mount and when user changes
  useEffect(() => {
    refreshMastery();
  }, [refreshMastery]);

  /**
   * @description Checks if a lesson is mastered (from cached state).
   */
  const checkLessonMastery = useCallback(
    (lessonId: string): boolean => {
      return masteryStatus[lessonId]?.mastered || false;
    },
    [masteryStatus]
  );

  /**
   * @description Checks if LP can be earned for a lesson (not mastered).
   */
  const checkCanEarnLP = useCallback(
    (lessonId: string): boolean => {
      return !checkLessonMastery(lessonId);
    },
    [checkLessonMastery]
  );

  /**
   * @description Gets the best score for a lesson.
   */
  const getBestScore = useCallback(
    (lessonId: string): number => {
      return masteryStatus[lessonId]?.bestScore || 0;
    },
    [masteryStatus]
  );

  /**
   * @description Gets the number of attempts for a lesson.
   */
  const getAttemptCount = useCallback(
    (lessonId: string): number => {
      return masteryStatus[lessonId]?.attempts || 0;
    },
    [masteryStatus]
  );

  return {
    masteryStatus,
    isLoading,
    error,
    refreshMastery,
    checkLessonMastery,
    checkCanEarnLP,
    getBestScore,
    getAttemptCount,
  };
}

interface UseLessonMasteryState {
  status: LessonMasteryStatus | null;
  isMastered: boolean;
  canEarnLP: boolean;
  bestScore: number;
  attempts: number;
  isLoading: boolean;
  error: string | null;
}

interface UseLessonMasteryActions {
  refreshStatus: () => Promise<void>;
  recordAttempt: (score: number) => Promise<{ lpEarned: number; newStatus: LessonMasteryStatus }>;
}

type UseLessonMasteryReturn = UseLessonMasteryState & UseLessonMasteryActions;

/**
 * @description Hook for managing mastery of a single lesson.
 * Provides status and actions for a specific lesson.
 */
export function useLessonMastery(lessonId: string): UseLessonMasteryReturn {
  const { user } = useAuth();
  const [status, setStatus] = useState<LessonMasteryStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * @description Fetches mastery status for this lesson.
   */
  const refreshStatus = useCallback(async () => {
    if (!user?.uid) {
      setStatus(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const lessonStatus = await getLessonMasteryStatus(user.uid, lessonId);
      setStatus(lessonStatus);
    } catch (err) {
      logger.error(LOG_CONTEXTS.PRACTICE, 'Failed to fetch lesson mastery', err);
      setError('Failed to load lesson data');
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, lessonId]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  /**
   * @description Records a practice attempt and updates mastery.
   * Returns LP earned and new mastery status.
   */
  const recordAttempt = useCallback(
    async (score: number): Promise<{ lpEarned: number; newStatus: LessonMasteryStatus }> => {
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }

      // Calculate LP before updating (based on current mastery)
      const lpEarned = await calculateLPForSession(user.uid, lessonId, score);

      // Update mastery status
      const newStatus = await updateMastery(user.uid, lessonId, score);
      setStatus(newStatus);

      return { lpEarned, newStatus };
    },
    [user?.uid, lessonId]
  );

  return {
    status,
    isMastered: status?.mastered || false,
    canEarnLP: !status?.mastered,
    bestScore: status?.bestScore || 0,
    attempts: status?.attempts || 0,
    isLoading,
    error,
    refreshStatus,
    recordAttempt,
  };
}

/**
 * @description Gets category mastery summary for display.
 */
export function getCategoryMasterySummary(
  masteryStatus: Record<string, LessonMasteryStatus>,
  category: 'sentence' | 'paragraph' | 'essay'
): { mastered: number; total: number; percentage: number } {
  const lessonsInCategory = getAvailableLessons().filter(l => l.category === category);
  const masteredCount = lessonsInCategory.filter(
    l => masteryStatus[l.id]?.mastered
  ).length;

  return {
    mastered: masteredCount,
    total: lessonsInCategory.length,
    percentage: lessonsInCategory.length > 0
      ? Math.round((masteredCount / lessonsInCategory.length) * 100)
      : 0,
  };
}

