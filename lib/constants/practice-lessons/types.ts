/**
 * @fileoverview Type definitions for practice lessons.
 */

export type LessonCategory = 'sentence' | 'paragraph' | 'essay';
export type LessonStatus = 'available' | 'coming-soon';

/**
 * @description A prompt variation for a lesson.
 */
export interface LessonPrompt {
  id: string;
  /** The prompt/question shown to the student */
  prompt: string;
  /** For conjunction lessons: which conjunction is being tested */
  conjunction?: 'because' | 'but' | 'so';
  /** For appositive lessons: the noun phrase to use */
  nounPhrase?: string;
  /** Optional hint text */
  hint?: string;
}

/**
 * @description Definition of a practice lesson.
 */
export interface PracticeLesson {
  id: string;
  name: string;
  description: string;
  category: LessonCategory;
  status: LessonStatus;
  /** Duration in minutes for each phase (order: review → write → revise) */
  phaseDurations: {
    reviewPhase: number; // Review examples first (I Do/We Do)
    writePhase: number;  // Independent writing (You Do)
    revisePhase: number; // Revision with feedback (You Do Better)
  };
  /** Available prompts for this lesson */
  prompts: LessonPrompt[];
  /** Short instruction shown during the session */
  instruction: string;
  /** Example of a good response (shown in sidebar) */
  exampleResponse?: {
    prompt: string;
    response: string;
    explanation: string;
  };
}

