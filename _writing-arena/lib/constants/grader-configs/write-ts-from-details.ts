/**
 * @fileoverview Grader configuration for "Write Topic Sentences from Details" activity.
 * Extracted from AlphaWrite: activities/23-write-ts-from-details/grader.config.ts
 */

import { ActivityGraderConfig } from './types';

/**
 * @description Grader config for the Write Topic Sentences from Details activity.
 * Students write topic sentences that capture the main idea from a set of related details.
 */
export const writeTsFromDetailsConfig: ActivityGraderConfig = {
  nameOfActivity: 'Write Topic Sentences from Details',

  goalForThisExercise: {
    primaryGoal:
      'Help students learn to write effective topic sentences that capture the main idea of a group of related details.',
    secondaryGoals: [
      'Develop ability to identify central themes from supporting details',
      'Build critical thinking skills by synthesizing information',
      'Practice inferring main ideas from specific examples',
    ],
  },

  howTheActivityWorks: `Students are presented with a set of related details about a topic. They may also receive optional context. Their task is to write an effective topic sentence that captures the main idea of the details.`,

  gradeAppropriateConsiderations: {
    level1: 'For elementary students, accept simple topic sentences. Be very lenient.',
    level2: 'Expect more sophisticated synthesis while remaining lenient.',
  },

  importantPrinciplesForGrading: [
    '1) The topic sentence must clearly relate to the given details.',
    '2) A good topic sentence introduces a plausible main idea - it does NOT need to reference ALL details.',
    '3) It is acceptable if the topic sentence only gestures at some details, as long as they fit under the proposed idea.',
    '4) Students may approach the topic from various angles - there is no single correct answer.',
    '5) The topic sentence should be a complete sentence (subject + predicate).',
    '6) Students can use key terms from context but should not copy entire sentences.',
    '7) Be very lenient with grading, especially for younger students.',
  ],

  commonMistakesToAnticipate: [
    {
      mistake: 'Too narrow in focus',
      explanation: 'The topic sentence addresses only one detail rather than the overall theme.',
      example:
        'Details about penguin habitats, diet, and decline → Topic: "Penguins eat fish and krill." (too narrow)',
    },
    {
      mistake: 'Too broad or vague',
      explanation: 'The topic sentence is so general it doesn\'t provide meaningful focus.',
      example:
        'Details about Antarctica climate effects → Topic: "Climate affects animals." (too vague)',
    },
    {
      mistake: 'Unrelated content',
      explanation: 'The topic sentence introduces information not connected to the details.',
      example:
        'Details about Mayan architecture → Topic: "The Aztecs had a powerful empire."',
    },
  ],

  positiveExamples: [
    {
      example:
        'Details: Emperor/Adelie penguins dropped by half since 1980s, sea ice not forming, krill disappearing. → "Antarctic penguin populations are declining due to climate-related changes."',
      explainer:
        'Effectively synthesizes details about decline and connects to environmental factors.',
    },
    {
      example:
        'Details about Legendary Pokémon being rare and powerful → "In the world of Pokémon, Legendary species are the most powerful and rare."',
      explainer:
        'Captures the key concepts of rarity and power from the details.',
    },
  ],

  negativeExamples: [
    {
      example:
        'Details about penguin population decline → Topic: "Antarctica is very cold."',
      explainer:
        'Too general and fails to address any specific details about penguins or environmental changes.',
    },
  ],

  feedbackPromptOverrides: {
    concreteProblem:
      'In a warm, friendly tone, point out what went wrong in the student\'s topic sentence.',
    callToAction:
      'In a warm, friendly tone, explain how the student can avoid this mistake next time.',
  },
};

