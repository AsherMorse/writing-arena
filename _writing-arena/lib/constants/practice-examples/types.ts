/**
 * @fileoverview Type definitions for practice review examples.
 */

/**
 * @description An instruction card shown during review phase.
 * Teaches the concept before students evaluate examples.
 */
export interface InstructionCard {
  type: 'instruction';
  /** Card title (e.g., "How this works") */
  title: string;
  /** Main content explaining the concept */
  content: string;
  /** Optional tip or hint */
  tip?: string;
}

/**
 * @description An example card for students to evaluate.
 */
export interface ExampleCard {
  type: 'example';
  example: ReviewExample;
}

/**
 * @description A tutorial card shown at the start of review phase.
 * Contains markdown content teaching the concept.
 */
export interface TutorialCard {
  type: 'tutorial';
  /** Lesson ID (for finding custom components) */
  lessonId: string;
  /** Markdown content for the tutorial */
  content: string;
  /** Lesson name for the header */
  lessonName: string;
}

/**
 * @description Union type for items in the review phase sequence.
 * Can be a tutorial, instruction card, or an example to evaluate.
 */
export type ReviewItem = TutorialCard | InstructionCard | ExampleCard;

export interface ReviewExample {
  /** The question/prompt shown to the AI */
  question: string;
  /** The AI's answer (can be correct or incorrect) */
  answer: string;
  /** Whether this is a correct example */
  isCorrect: boolean;
  /** Explanation of why it's correct/incorrect (for teacher reference) */
  explanation: string;
  /** Topic context for the example */
  topic?: string;
}

export interface LessonExamples {
  lessonId: string;
  examples: ReviewExample[];
}

