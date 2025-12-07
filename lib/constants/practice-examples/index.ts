/**
 * @fileoverview Pre-generated AI examples and instruction content for Review phase.
 * Re-exports all examples organized by category (sentence, paragraph, essay).
 *
 * The Review phase is now FIRST in the flow (I Do, We Do, You Do pedagogy).
 * Students see instruction cards and evaluate examples BEFORE writing.
 */

import { getGraderConfig } from '../grader-configs';
import { SENTENCE_EXAMPLES } from './sentence-examples';
import { PARAGRAPH_EXAMPLES } from './paragraph-examples';
import { ESSAY_EXAMPLES } from './essay-examples';
import { ReviewExample, ReviewItem } from './types';

// Re-export types
export type { InstructionCard, ExampleCard, ReviewItem, ReviewExample, LessonExamples } from './types';

// Re-export category-specific examples
export { SENTENCE_EXAMPLES } from './sentence-examples';
export { PARAGRAPH_EXAMPLES } from './paragraph-examples';
export { ESSAY_EXAMPLES } from './essay-examples';

// Re-export individual example arrays for backwards compatibility
export {
  BASIC_CONJUNCTIONS_EXAMPLES,
  WRITE_APPOSITIVES_EXAMPLES,
  SUBORDINATING_CONJUNCTIONS_EXAMPLES,
  KERNEL_EXPANSION_EXAMPLES,
  FRAGMENT_OR_SENTENCE_EXAMPLES,
} from './sentence-examples';

export {
  MAKE_TOPIC_SENTENCES_EXAMPLES,
  IDENTIFY_TOPIC_SENTENCE_EXAMPLES,
  WRITING_SPOS_EXAMPLES,
  ELIMINATE_IRRELEVANT_SENTENCES_EXAMPLES,
  ELABORATE_PARAGRAPHS_EXAMPLES,
  USING_TRANSITION_WORDS_EXAMPLES,
  FINISHING_TRANSITION_WORDS_EXAMPLES,
  WRITE_CS_FROM_DETAILS_EXAMPLES,
  WRITE_TS_FROM_DETAILS_EXAMPLES,
} from './paragraph-examples';

export {
  DISTINGUISH_GST_EXAMPLES,
  WRITE_GS_FROM_T_EXAMPLES,
  WRITE_INTRODUCTORY_SENTENCES_EXAMPLES,
  CRAFT_CONCLUSION_FROM_GST_EXAMPLES,
  WRITE_T_FROM_TOPIC_EXAMPLES,
  MATCH_DETAILS_PRO_CON_EXAMPLES,
  WRITE_S_FROM_GT_EXAMPLES,
  PRE_TRANSITION_OUTLINE_EXAMPLES,
} from './essay-examples';

/**
 * @description Map of all lesson IDs to their review examples.
 */
export const REVIEW_EXAMPLES: Record<string, ReviewExample[]> = {
  ...SENTENCE_EXAMPLES,
  ...PARAGRAPH_EXAMPLES,
  ...ESSAY_EXAMPLES,
};

/**
 * @description Gets review examples for a lesson.
 * Returns a mix of correct and incorrect examples for review.
 */
export function getReviewExamples(lessonId: string): ReviewExample[] {
  return REVIEW_EXAMPLES[lessonId] || [];
}

/**
 * @description Gets a random subset of examples for review phase.
 * Ensures a mix of correct and incorrect examples.
 */
export function getRandomReviewExamples(
  lessonId: string,
  count: number = 3
): ReviewExample[] {
  const examples = getReviewExamples(lessonId);
  if (examples.length <= count) return examples;

  // Ensure we get at least one correct and one incorrect
  const correct = examples.filter(e => e.isCorrect);
  const incorrect = examples.filter(e => !e.isCorrect);

  const selected: ReviewExample[] = [];

  // Add at least one correct
  if (correct.length > 0) {
    const randomCorrect = correct[Math.floor(Math.random() * correct.length)];
    selected.push(randomCorrect);
  }

  // Add at least one incorrect
  if (incorrect.length > 0) {
    const randomIncorrect = incorrect[Math.floor(Math.random() * incorrect.length)];
    selected.push(randomIncorrect);
  }

  // Fill remaining slots randomly from all examples
  const remaining = examples.filter(e => !selected.includes(e));
  while (selected.length < count && remaining.length > 0) {
    const randomIndex = Math.floor(Math.random() * remaining.length);
    selected.push(remaining.splice(randomIndex, 1)[0]);
  }

  // Shuffle the final selection
  return selected.sort(() => Math.random() - 0.5);
}

/**
 * @description Builds the complete review phase sequence.
 * Includes instruction cards (from grader config) followed by examples to evaluate.
 * This implements the "I Do" part of "I Do, We Do, You Do".
 */
export function buildReviewSequence(
  lessonId: string,
  exampleCount: number = 3
): ReviewItem[] {
  const items: ReviewItem[] = [];

  // Try to get grader config for instruction content
  try {
    const config = getGraderConfig(lessonId);

    // Add "How this works" instruction card
    if (config.howTheActivityWorks) {
      items.push({
        type: 'instruction',
        title: 'How this works',
        content: config.howTheActivityWorks,
      });
    }

    // Add a "key rules" card from the first few grading principles
    const keyRules = config.importantPrinciplesForGrading
      ?.filter(p => p.trim().length > 0)
      ?.slice(0, 3)
      ?.join('\n');

    if (keyRules) {
      items.push({
        type: 'instruction',
        title: 'Key rules to remember',
        content: keyRules,
        tip: 'Look for these patterns in the examples below!',
      });
    }
  } catch {
    // No grader config available - skip instruction cards
  }

  // Add examples to evaluate
  const examples = getRandomReviewExamples(lessonId, exampleCount);
  examples.forEach(example => {
    items.push({
      type: 'example',
      example,
    });
  });

  return items;
}

