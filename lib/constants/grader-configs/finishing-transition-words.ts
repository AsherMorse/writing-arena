/**
 * @fileoverview Grader configuration for "Finishing Transition Words" activity.
 * Extracted from AlphaWrite: activities/32-finishing-transition-words/grader.config.ts
 */

import { ActivityGraderConfig } from './types';

/**
 * @description Grader config for the Finishing Transition Words activity.
 * Students write a sentence that logically follows another sentence using a given transition word.
 */
export const finishingTransitionWordsConfig: ActivityGraderConfig = {
  nameOfActivity: 'Finishing Transition Words',

  goalForThisExercise: {
    primaryGoal:
      'Help students develop the ability to connect ideas logically using transition words while maintaining topic coherence.',
    secondaryGoals: [
      'Practice writing complete sentences that flow from previous ideas',
      'Learn to use transitions appropriately based on their function',
      'Develop understanding of cause-effect, contrast, and other relationships',
    ],
  },

  howTheActivityWorks: `Students are given: 1) Background information about a topic, 2) An initial sentence to transition from, 3) A required transition word to start their new sentence. They must write a sentence that connects coherently to the first sentence and uses the transition word appropriately.`,

  gradeAppropriateConsiderations: {
    level1: 'Students use common (TWR Level 1) transitions. Focus on basic coherence and logical connection.',
    level2: 'Students may use more nuanced transitions. Expect better logical precision but still be lenient on topic link.',
  },

  importantPrinciplesForGrading: [
    '1) The transition word must be used at the start of the second sentence.',
    '2) The relationship between sentences must match the transition word\'s purpose (e.g., "however" shows contrast).',
    '3) Students may use the background context but are not required to.',
    '4) Don\'t penalize for elements the student can\'t control (the first sentence, the transition word).',
    '5) BE LENIENT: Accept any sentence that uses the transition correctly and connects logically to the general topic.',
  ],

  commonMistakesToAnticipate: [
    {
      mistake: 'Topic change',
      explanation: 'The new sentence is completely unrelated to the first.',
      example:
        'First: "The computer crashed." → Student: "In addition, my dog is brown."',
    },
    {
      mistake: 'Wrong transition relationship',
      explanation: 'Using a contrast transition when ideas support each other.',
      example:
        'First: "The sun provides energy." → "Nevertheless, plants need sunlight to grow." (should be addition, not contrast)',
    },
    {
      mistake: 'Not using the required transition',
      explanation: 'Student uses a different transition word than provided.',
    },
  ],

  positiveExamples: [
    {
      example:
        'Context: "Cities are improving public transport." First: "The city increased bus service." → "As a result, more people used public transportation."',
      explainer:
        'Shows clear cause-effect relationship, maintains topic, uses context.',
    },
    {
      example:
        'First: "Ancient Egypt was a powerful civilization." → "For example, they built massive pyramids."',
      explainer:
        'Uses illustration transition correctly with a relevant example.',
    },
    {
      example:
        'First: "My garden gets lots of rain." → "Moreover, the sunny spot helps my flowers grow tall."',
      explainer:
        'Uses addition transition correctly to add another helpful condition.',
    },
  ],

  negativeExamples: [
    {
      example:
        'First: "The computer crashed." → "In addition, my dog is brown."',
      explainer:
        'Changes topic completely and ignores the context.',
    },
    {
      example:
        'First: "The sun provides energy." → "Nevertheless, plants need sunlight to grow."',
      explainer:
        'Uses contrast transition incorrectly - the ideas actually support each other.',
    },
  ],

  feedbackPromptOverrides: {
    concreteProblem:
      'In a warm, friendly tone, point out what the student missed in their transition and second sentence.',
    callToAction:
      'In a warm, friendly tone, explain how the student can avoid this mistake in the future.',
  },
};

