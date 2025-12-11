/**
 * @fileoverview Practice mode lesson definitions and configuration.
 * Re-exports all lessons organized by category (sentence, paragraph, essay).
 */

import { SENTENCE_LESSONS } from './sentence-lessons';
import { PARAGRAPH_LESSONS } from './paragraph-lessons';
import { ESSAY_LESSONS } from './essay-lessons';
import { LessonCategory, LessonPrompt, PracticeLesson } from './types';

// Re-export types
export type { LessonCategory, LessonPrompt, PracticeLesson };
export type LessonStatus = 'available' | 'coming-soon';

// Re-export category-specific lessons
export { SENTENCE_LESSONS } from './sentence-lessons';
export { PARAGRAPH_LESSONS } from './paragraph-lessons';
export { ESSAY_LESSONS } from './essay-lessons';

/**
 * @description Mastery threshold (90% = mastered)
 */
export const MASTERY_THRESHOLD = 90;

/**
 * @description Default phase durations in minutes for practice sessions.
 * Order: Review (1 min) → Write (3 min) → Revise (2 min)
 */
export const PRACTICE_PHASE_DURATIONS = {
  reviewPhase: 1, // Review examples first
  writePhase: 3,  // Independent writing
  revisePhase: 2, // Revision with feedback
} as const;

/**
 * @description LP rewards for lessons.
 * Per rank-system.md: Lesson mastery = +5 flat, otherwise 0.
 * Only mastery (90%+) awards LP.
 */
export const PRACTICE_LP_REWARDS: Record<string, number> = {
  'perfect': 5,     // 100% (mastery)
  'excellent': 5,   // 90-99% (mastery)
  'good': 0,        // 80-89%
  'passing': 0,     // 70-79%
  'needs-work': 0,  // 60-69%
  'incomplete': 0,  // <60%
};

/**
 * @description Calculate LP based on score (returns 0 if already mastered)
 */
export function calculatePracticeLP(score: number, isMastered: boolean): number {
  if (isMastered) return 0;
  
  if (score === 100) return PRACTICE_LP_REWARDS['perfect'];
  if (score >= 90) return PRACTICE_LP_REWARDS['excellent'];
  if (score >= 80) return PRACTICE_LP_REWARDS['good'];
  if (score >= 70) return PRACTICE_LP_REWARDS['passing'];
  if (score >= 60) return PRACTICE_LP_REWARDS['needs-work'];
  return PRACTICE_LP_REWARDS['incomplete'];
}

/**
 * @description Check if a score achieves mastery
 */
export function checkMastery(score: number): boolean {
  return score >= MASTERY_THRESHOLD;
}

/**
 * @description All practice lessons combined from all categories.
 */
export const PRACTICE_LESSONS: Record<string, PracticeLesson> = {
  ...SENTENCE_LESSONS,
  ...PARAGRAPH_LESSONS,
  ...ESSAY_LESSONS,
};

/**
 * @description Get all available lessons (not coming soon)
 */
export function getAvailableLessons(): PracticeLesson[] {
  return Object.values(PRACTICE_LESSONS).filter(l => l.status === 'available');
}

/**
 * @description Get lessons by category
 */
export function getLessonsByCategory(category: LessonCategory): PracticeLesson[] {
  return Object.values(PRACTICE_LESSONS).filter(l => l.category === category);
}

/**
 * @description Get a specific lesson by ID
 */
export function getLesson(lessonId: string): PracticeLesson | undefined {
  return PRACTICE_LESSONS[lessonId];
}

/**
 * @description Get a random prompt from a lesson
 */
export function getRandomPrompt(lessonId: string): LessonPrompt | undefined {
  const lesson = PRACTICE_LESSONS[lessonId];
  if (!lesson || lesson.prompts.length === 0) return undefined;
  
  const randomIndex = Math.floor(Math.random() * lesson.prompts.length);
  return lesson.prompts[randomIndex];
}

