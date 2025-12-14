/**
 * @fileoverview Hook for managing practice lesson state.
 * Handles lesson loading, phase tracking, and timing.
 *
 * Phase order follows "I Do, We Do, You Do" pedagogy:
 * 1. Review Phase - Students see examples and evaluate them (I Do)
 * 2. Write Phase - Students write independently (You Do)
 * 3. Revise Phase - Students improve based on feedback (You Do Better)
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  getLesson,
  getRandomPrompt,
  PracticeLesson,
  LessonPrompt,
  PRACTICE_PHASE_DURATIONS,
} from '@/lib/constants/practice-lessons';
import { getReviewExamples, ReviewExample } from '@/lib/constants/practice-examples';

/** Semantic phase names (order: review → write → revise) */
export type PracticePhase = 'review' | 'write' | 'revise';

interface UsePracticeLessonState {
  lesson: PracticeLesson | null;
  currentPrompt: LessonPrompt | null;
  reviewExamples: ReviewExample[];
  currentPhase: PracticePhase;
  timeRemaining: number;
  isTimerRunning: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UsePracticeLessonActions {
  startSession: () => void;
  nextPhase: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetSession: () => void;
}

type UsePracticeLessonReturn = UsePracticeLessonState & UsePracticeLessonActions;

/**
 * @description Hook for managing a practice lesson session.
 * Handles lesson loading, phase transitions, and countdown timer.
 */
export function usePracticeLesson(lessonId: string): UsePracticeLessonReturn {
  const [lesson, setLesson] = useState<PracticeLesson | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<LessonPrompt | null>(null);
  const [reviewExamples, setReviewExamples] = useState<ReviewExample[]>([]);
  const [currentPhase, setCurrentPhase] = useState<PracticePhase>('review');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load lesson on mount
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const loadedLesson = getLesson(lessonId);
    if (!loadedLesson) {
      setError(`Lesson not found: ${lessonId}`);
      setIsLoading(false);
      return;
    }

    if (loadedLesson.status !== 'available') {
      setError(`Lesson not available: ${lessonId}`);
      setIsLoading(false);
      return;
    }

    setLesson(loadedLesson);
    setCurrentPrompt(getRandomPrompt(lessonId) || null);
    setReviewExamples(getReviewExamples(lessonId));
    // Initial time is for review phase (first phase)
    setTimeRemaining(loadedLesson.phaseDurations.reviewPhase * 60);
    setIsLoading(false);
  }, [lessonId]);

  // Timer effect
  useEffect(() => {
    if (isTimerRunning && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning, timeRemaining]);

  /**
   * @description Starts the practice session timer.
   * Session begins with the Review phase (I Do).
   */
  const startSession = useCallback(() => {
    if (!lesson) return;
    setCurrentPhase('review');
    setTimeRemaining(lesson.phaseDurations.reviewPhase * 60);
    setIsTimerRunning(true);
  }, [lesson]);

  /**
   * @description Advances to the next phase.
   * Order: review → write → revise
   */
  const nextPhase = useCallback(() => {
    if (!lesson) return;

    setCurrentPhase(prev => {
      if (prev === 'review') {
        // Review → Write
        setTimeRemaining(lesson.phaseDurations.writePhase * 60);
        setIsTimerRunning(true);
        return 'write';
      }
      if (prev === 'write') {
        // Write → Revise
        setTimeRemaining(lesson.phaseDurations.revisePhase * 60);
      setIsTimerRunning(true);
        return 'revise';
      }
      // Already at last phase (revise)
      return prev;
    });
  }, [lesson]);

  /**
   * @description Pauses the countdown timer.
   */
  const pauseTimer = useCallback(() => {
    setIsTimerRunning(false);
  }, []);

  /**
   * @description Resumes the countdown timer.
   */
  const resumeTimer = useCallback(() => {
    if (timeRemaining > 0) {
      setIsTimerRunning(true);
    }
  }, [timeRemaining]);

  /**
   * @description Resets the session to initial state.
   */
  const resetSession = useCallback(() => {
    if (!lesson) return;
    setCurrentPhase('review');
    setCurrentPrompt(getRandomPrompt(lessonId) || null);
    setTimeRemaining(lesson.phaseDurations.reviewPhase * 60);
    setIsTimerRunning(false);
  }, [lesson, lessonId]);

  return {
    lesson,
    currentPrompt,
    reviewExamples,
    currentPhase,
    timeRemaining,
    isTimerRunning,
    isLoading,
    error,
    startSession,
    nextPhase,
    pauseTimer,
    resumeTimer,
    resetSession,
  };
}

/**
 * @description Formats seconds into MM:SS display string.
 */
export function formatTimeRemaining(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * @description Gets the phase name for display.
 */
export function getPhaseName(phase: PracticePhase): string {
  switch (phase) {
    case 'review': return 'Review';
    case 'write': return 'Write';
    case 'revise': return 'Revise';
  }
}

/**
 * @description Gets the default phase duration in minutes.
 */
export function getDefaultPhaseDuration(phase: PracticePhase): number {
  switch (phase) {
    case 'review': return PRACTICE_PHASE_DURATIONS.reviewPhase;
    case 'write': return PRACTICE_PHASE_DURATIONS.writePhase;
    case 'revise': return PRACTICE_PHASE_DURATIONS.revisePhase;
  }
}

/**
 * @description Gets the phase number for display (1, 2, or 3).
 */
export function getPhaseNumber(phase: PracticePhase): number {
  switch (phase) {
    case 'review': return 1;
    case 'write': return 2;
    case 'revise': return 3;
  }
}

