/**
 * @fileoverview Pre-generated AI examples and instruction content for Review phase.
 * Extracted from AlphaWrite test data: activities/{activity}/evals/test-data.ts
 *
 * The Review phase is now FIRST in the flow (I Do, We Do, You Do pedagogy).
 * Students see instruction cards and evaluate examples BEFORE writing.
 */

import { getGraderConfig } from './grader-configs';

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
 * @description Union type for items in the review phase sequence.
 * Can be either an instruction card or an example to evaluate.
 */
export type ReviewItem = InstructionCard | ExampleCard;

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

/**
 * @description Review examples for Because/But/So activity.
 * Students review these AI-generated completions and identify issues.
 */
export const BASIC_CONJUNCTIONS_EXAMPLES: ReviewExample[] = [
  // Correct examples
  {
    question: 'The dog barked loudly because _____',
    answer: 'it saw the mailman coming.',
    isCorrect: true,
    explanation: 'Shows clear cause-and-effect relationship - the dog barked because it saw something.',
    topic: 'animals',
  },
  {
    question: 'She studied hard for the test, but _____',
    answer: 'the questions were harder than expected.',
    isCorrect: true,
    explanation: 'Shows valid contrast - studying hard vs. difficult questions.',
    topic: 'school',
  },
  {
    question: 'The weather forecast predicted rain, so _____',
    answer: 'we decided to have the picnic indoors.',
    isCorrect: true,
    explanation: 'Shows logical consequence - rain prediction led to indoor plans.',
    topic: 'weather',
  },
  // Incorrect examples for students to identify
  {
    question: 'The store was crowded, but _____',
    answer: 'my house will be hot tomorrow.',
    isCorrect: false,
    explanation: 'Non-sequitur: introduces unrelated topic instead of contrasting something about the store.',
    topic: 'shopping',
  },
  {
    question: 'The computer stopped working because _____',
    answer: 'old and broken.',
    isCorrect: false,
    explanation: 'Fragment: not a complete clause, missing subject and verb structure.',
    topic: 'technology',
  },
  {
    question: 'The teacher assigned homework, but _____',
    answer: 'pizza is my favorite food.',
    isCorrect: false,
    explanation: 'Off-topic: introduces completely unrelated information instead of showing contrast about homework.',
    topic: 'school',
  },
];

/**
 * @description Review examples for Write Appositives activity.
 * Students review these AI-generated sentences and identify appositive usage.
 */
export const WRITE_APPOSITIVES_EXAMPLES: ReviewExample[] = [
  // Correct examples
  {
    question: 'Write a sentence using "my neighbor" as an appositive.',
    answer: 'Sarah, my neighbor, shared her homemade jam with me.',
    isCorrect: true,
    explanation: 'Correctly uses the phrase as an appositive set off by commas.',
    topic: 'community',
  },
  {
    question: 'Write a sentence using "a skilled surgeon" as an appositive.',
    answer: 'A skilled surgeon, Dr. Perkins saved many lives during the war.',
    isCorrect: true,
    explanation: 'Correctly places appositive at the beginning, followed by a comma.',
    topic: 'careers',
  },
  {
    question: 'Write a sentence using "a talented musician" as an appositive.',
    answer: 'My brother, a talented musician, plays in a band.',
    isCorrect: true,
    explanation: 'Correctly uses commas to set off the appositive in the middle of the sentence.',
    topic: 'music',
  },
  // Incorrect examples for students to identify
  {
    question: 'Write a sentence using "my sister" as an appositive.',
    answer: 'My sister Emily is coming to dinner.',
    isCorrect: false,
    explanation: 'Missing commas: needs commas around "my sister" to make it a proper appositive.',
    topic: 'family',
  },
  {
    question: 'Write a sentence using "a fast runner" as an appositive.',
    answer: 'Tom a fast runner won the race yesterday.',
    isCorrect: false,
    explanation: 'Missing commas: the appositive "a fast runner" needs to be set off by commas.',
    topic: 'sports',
  },
];

/**
 * @description Map of lesson IDs to their review examples.
 */
export const REVIEW_EXAMPLES: Record<string, ReviewExample[]> = {
  'basic-conjunctions': BASIC_CONJUNCTIONS_EXAMPLES,
  'write-appositives': WRITE_APPOSITIVES_EXAMPLES,
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

