/**
 * @fileoverview Grader configuration for "Write Thesis from Topic" activity.
 * Extracted from AlphaWrite: activities/39-write-t-from-topic/grader.config.ts
 */

import { ActivityGraderConfig } from './types';

/**
 * @description Grader config for the Write Thesis from Topic activity.
 * Students write a thesis statement expressing a main idea related to a given topic.
 */
export const writeTFromTopicConfig: ActivityGraderConfig = {
  nameOfActivity: 'Write Thesis from Topic',

  goalForThisExercise: {
    primaryGoal:
      'Help students learn to write simple thesis statements that express a main idea related to a topic.',
    secondaryGoals: [
      'Practice stating opinions or claims clearly',
      'Learn to connect ideas to a given topic',
      'Build foundation for essay writing',
    ],
  },

  howTheActivityWorks: `Students are given a topic and some background information. They must write a thesis statement that: 1) Expresses a main idea related to the topic, 2) Shows a clear connection to the topic, 3) Uses complete sentence structure. Example thesis statements may be provided as models.`,

  gradeAppropriateConsiderations: {
    level1: 'For grades 3-5, celebrate any clear statement expressing an opinion or idea about the topic. Using ideas from background is acceptable.',
    level2: 'Expect somewhat more sophisticated thesis statements but remain lenient.',
  },

  importantPrinciplesForGrading: [
    '1) The thesis statement should be related to the given topic. This is most important.',
    '2) For elementary students, a simple statement expressing an opinion or idea is sufficient and CORRECT.',
    '3) Do NOT expect young students to include multiple supporting points.',
    '4) Specificity is NOT the primary goal. A simple, general statement about the topic is acceptable.',
    '5) A thesis that makes a simple claim about a person, event, or concept is successful at this level.',
    '6) Be lenient about the position - what matters is that they stated a clear idea.',
    '7) ORIGINALITY: Only penalize if nearly identical (word-for-word) to an example or background text.',
    '8) Focus on substance over style. Minor awkward phrasing is okay if clear and relevant.',
  ],

  commonMistakesToAnticipate: [
    {
      mistake: 'Statement not related to the topic',
      explanation: 'The student writes about something completely unrelated.',
      example:
        'Topic: "Important Historical Figures" → Thesis: "Dogs make the best pets." (unrelated)',
    },
    {
      mistake: 'Not a complete sentence',
      explanation: 'The student writes a fragment.',
      example:
        'Topic: "Importance of exercise" → Thesis: "Exercise for health." (fragment)',
    },
    {
      mistake: 'Copying directly from examples',
      explanation: 'Near-identical copy of an example thesis.',
    },
  ],

  positiveExamples: [
    {
      example:
        'Topic: "Pets" → Thesis: "Dogs make wonderful pets because they are loyal and fun."',
      explainer:
        'Simple, clear statement with an opinion about the topic.',
    },
    {
      example:
        'Topic: "Space Exploration" → Thesis: "Learning about space is important for understanding our universe."',
      explainer:
        'States a clear main idea related to the topic.',
    },
  ],

  negativeExamples: [
    {
      example:
        'Topic: "Seasons of the Year" → Thesis: "Seasons."',
      explainer:
        'Not a complete sentence and doesn\'t express any idea about the topic.',
    },
  ],

  feedbackPromptOverrides: {
    concreteProblem:
      'In a warm, friendly tone, point out what was wrong with the thesis statement.',
    callToAction:
      'Explain how to write a clear sentence that states a main idea about the topic.',
  },
};

