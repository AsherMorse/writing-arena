/**
 * @fileoverview Grader configuration for "Write S from G+T" activity.
 * Extracted from AlphaWrite: activities/35-write-s-from-g-t/grader.config.ts
 */

import { ActivityGraderConfig } from './types';

/**
 * @description Grader config for the Write S from G+T activity.
 * Students write a Specific statement to connect a General statement to a Thesis.
 */
export const writeSFromGTConfig: ActivityGraderConfig = {
  nameOfActivity: 'Write S from G+T',

  goalForThisExercise: {
    primaryGoal:
      'Help students learn to connect general ideas to specific ones, building toward a main point.',
    secondaryGoals: [
      'Practice writing detailed sentences',
      'Learn to narrow broad ideas to more specific ones',
      'Practice building connections between ideas',
    ],
  },

  howTheActivityWorks: `Students are given two parts of a paragraph: 1) A general statement (G) that introduces a broad idea, 2) A thesis statement (T) that gives the main point. The student must write a specific statement (S) that connects these two, helping the ideas flow together. This specific statement should add some details about the topic and help connect the broad idea to the main point.`,

  gradeAppropriateConsiderations: {
    level1:
      'Be EXTREMELY lenient. If the student adds any relevant detail that logically bridges G and T (even loosely), consider it correct.',
    level2:
      'Expect somewhat better connections, but still be lenient on exact details.',
  },

  importantPrinciplesForGrading: [
    '1) Be EXTREMELY lenient. The goal is connection and adding *some* relevant detail, not perfect prose.',
    '2) "Specific" means more detailed than the General statement. It does NOT require listing multiple named examples.',
    '3) Accept various approaches: examples, explanations, descriptions, or elaborations are all valid.',
    '4) If the student adds *any* relevant detail that logically bridges G and T (even loosely), consider it correct.',
    '5) Do NOT penalize imperfect connections if relevant bridging detail is present.',
    '6) Focus on encouraging effort and the addition of *any* relevant detail.',
    '7) Do not require multiple specific examples unless clearly necessitated by G and T.',
    '8) Accept creative connections that make sense from a child\'s perspective.',
  ],

  commonMistakesToAnticipate: [
    {
      mistake: 'Statement that repeats the general or thesis statement',
      explanation:
        'The specific statement should add new details rather than just repeating what\'s already been said.',
      example:
        'General: "Books are fun to read." Specific (repeating): "Reading books is enjoyable." Thesis: "My favorite book is Charlotte\'s Web."',
    },
    {
      mistake: 'Completely unrelated statement',
      explanation:
        'The specific statement goes in a totally different direction that doesn\'t connect to the topic at all.',
      example:
        'General: "Exercise is good for you." Specific (unrelated): "My dog likes to play with toys." Thesis: "Swimming is my favorite way to exercise."',
    },
    {
      mistake: 'Not a complete sentence',
      explanation: 'The student provides a fragment or list instead of a complete sentence.',
      example:
        'General: "Space is interesting." Specific: "astronauts and rockets" (not a complete sentence).',
    },
  ],

  positiveExamples: [
    {
      example:
        'G: "Animals live in many different places."\nS: "Some animals like bears and wolves live in forests where they can find food and shelter."\nT: "Forest animals need protection so they can have safe homes."',
      explainer:
        'This specific statement adds details about which animals live in forests and why, connecting the general idea about animal habitats to the main point about protecting forest animals.',
    },
    {
      example:
        'G: "The Gulf of Mexico is important."\nS: "Many different fish, sea turtles, and dolphins live in the warm Gulf waters."\nT: "The incredible diversity of sea life makes it one of the most valuable marine ecosystems."',
      explainer:
        'The specific statement adds concrete examples of marine life, bridging from "important" to "diverse ecosystem."',
    },
  ],

  negativeExamples: [
    {
      example:
        'G: "The seasons change throughout the year."\nS: "Summer is hot." (Adds almost no detail, doesn\'t connect well)\nT: "Winter is the best season because of snow and holidays."',
      explainer:
        'This specific statement adds very little new detail and doesn\'t help bridge the general idea to the main point about winter.',
    },
    {
      example:
        'G: "Books are important for learning."\nS: "My dog likes to play with toys."\nT: "Reading helps children develop imagination."',
      explainer:
        'This specific statement is completely unrelated to books or reading.',
    },
  ],

  feedbackPromptOverrides: {
    concreteProblem:
      'In a warm, friendly, encouraging tone, gently point out what the student missed in their specific statement.',
    callToAction:
      'In a warm, friendly, encouraging tone, explain how they can improve their specific statement next time.',
  },
};

