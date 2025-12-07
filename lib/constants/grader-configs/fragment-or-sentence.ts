/**
 * @fileoverview Grader configuration for "Fragment or Sentence" activity.
 * Extracted from AlphaWrite: activities/02-fragment-or-sentence/grader.config.ts
 */

import { ActivityGraderConfig } from './types';

/**
 * @description Grader config for the Fragment or Sentence activity.
 * Students receive sentence fragments and must expand them into complete sentences.
 */
export const fragmentOrSentenceConfig: ActivityGraderConfig = {
  nameOfActivity: 'Fragment or Sentence',

  goalForThisExercise: {
    primaryGoal:
      'Help students understand what makes a complete sentence and develop their ability to fix sentence fragments.',
    secondaryGoals: [
      'Reinforce understanding of subjects and predicates without using technical terms',
      'Build comprehension through content-embedded practice',
      'Develop proofreading and editing skills',
    ],
  },

  howTheActivityWorks: `Students are given a sentence fragment (e.g., "in the park" or "to the store") and must expand it into a complete sentence. The fragment must be included in the final sentence, but students can place it anywhere - beginning, middle, or end. Students can only modify capitalization (if at start) or punctuation (if at end) of the original fragment.`,

  gradeAppropriateConsiderations: {
    level1: 'Avoid technical terms like subject and predicate. Guide students by asking "who" or "what" did something.',
    level2: 'Can introduce terms like subject and predicate. Can work with more complex fragments including prepositional phrases.',
  },

  importantPrinciplesForGrading: [
    '1) The expanded sentence must include the same words as the original fragment.',
    '2) The expanded sentence must express a logical, complete thought.',
    '3) The expanded sentence must be grammatically correct with proper spelling, punctuation, and capitalization.',
    '4) Imperative sentences (commands like "Go to the store") are valid - they have an implied subject.',
    '5) If an introductory phrase is missing a comma before the main clause, treat it as a "nit" (minor issue), not an error.',
    '6) When a student writes multiple sentences instead of one, focus on this structural issue first.',
  ],

  commonMistakesToAnticipate: [
    {
      mistake: 'Incomplete expansions',
      explanation:
        'Students might add words without creating a complete thought.',
      example:
        'Fragment: "in the park" → "Walking in the park" (still missing who is walking)',
    },
    {
      mistake: 'Writing multiple sentences instead of one',
      explanation:
        'Students sometimes write two or more sentences when the activity asks for one complete sentence.',
      example:
        'Fragment: "with magic powers" → "With magic powers, heroes save the day. They fight villains." (should be one sentence)',
    },
    {
      mistake: 'Missing words from the original fragment',
      explanation:
        'Students might change the words in the fragment instead of using the provided words.',
      example:
        'Fragment: "to the store" → "I went to a shop" (changed "the store" to "a shop")',
    },
    {
      mistake: 'Missing comma after introductory phrase',
      explanation:
        'When the fragment is placed at the beginning as an introductory phrase, students might forget the comma.',
      example:
        'Fragment: "while exploring the ocean" → "While exploring the ocean I saw many fish" (missing comma after "ocean")',
    },
  ],

  positiveExamples: [
    {
      example:
        'Fragment: "in the garden" → "The flowers in the garden are blooming."',
      explainer:
        'Created a complete sentence by adding a subject (flowers) and verb (are blooming), while keeping the original fragment.',
    },
    {
      example:
        'Fragment: "in the garden" → "In the garden, I waited for the birds to begin chirping."',
      explainer:
        'Created a complete sentence with correct capitalization and a comma after the introductory phrase.',
    },
    {
      example:
        'Fragment: "through fields and meadows" → "Through fields and meadows, the antelope herd ran tirelessly."',
      explainer:
        'Used the fragment at the beginning with proper comma, added subject and verb.',
    },
    {
      example:
        'Fragment: "before the game starts" → "Before the game starts, check your equipment."',
      explainer:
        'Created a valid imperative sentence (command) with an implied subject "you."',
    },
  ],

  negativeExamples: [
    {
      example: 'Fragment: "to the store" → "Went to the store"',
      explainer:
        'Still a fragment because it lacks a subject. Needs to specify who went to the store.',
    },
    {
      example:
        'Fragment: "in the beautiful garden" → "In the garden, I planted flowers."',
      explainer:
        'Failed to include the complete fragment - "beautiful" was omitted.',
    },
    {
      example:
        'Fragment: "throughout the Mushroom Kingdom" → "Mario performed at concerts throughout the Kingdom."',
      explainer:
        'Changed the words in the fragment - "Mushroom" was removed.',
    },
  ],

  feedbackPromptOverrides: {
    concreteProblem:
      "In a warm, friendly, encouraging tone, point out what was wrong with the student's expanded sentence (e.g., still a fragment, missing words, multiple sentences).",
    callToAction:
      'In a warm, friendly, encouraging tone, explain how the student can expand the fragment into a complete sentence that includes all the original words.',
  },
};

