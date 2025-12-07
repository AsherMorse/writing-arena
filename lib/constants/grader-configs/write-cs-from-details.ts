/**
 * @fileoverview Grader configuration for "Write Concluding Sentences" activity.
 * Extracted from AlphaWrite: activities/24-write-cs-from-details/grader.config.ts
 */

import { ActivityGraderConfig } from './types';

/**
 * @description Grader config for the Write Concluding Sentences activity.
 * Students write concluding sentences that wrap up a paragraph based on topic and details.
 */
export const writeCsFromDetailsConfig: ActivityGraderConfig = {
  nameOfActivity: 'Write Concluding Sentences',

  goalForThisExercise: {
    primaryGoal:
      'Help students learn to write effective concluding sentences that wrap up a paragraph by restating the main idea, summarizing key points, or providing final thoughts.',
    secondaryGoals: [
      'Develop understanding of paragraph structure and organization',
      'Practice creating conclusions that feel complete and satisfying',
      'Learn to tie back to the main idea of a paragraph',
    ],
  },

  howTheActivityWorks: `Students are presented with a topic sentence and supporting details that form a paragraph. They may also receive optional context. Their task is to write an effective concluding sentence that wraps up the paragraph.`,

  gradeAppropriateConsiderations: {
    level1: 'Accept simple concluding sentences that relate to the topic and provide closure.',
    level2: 'Expect more sophisticated conclusions that synthesize details or offer insights.',
  },

  importantPrinciplesForGrading: [
    '1) The concluding sentence must relate to the topic sentence and details.',
    '2) It should not introduce completely new, unrelated information.',
    '3) It should provide a sense of closure or completion.',
    '4) It should be a complete sentence with proper grammar.',
    '5) Multiple valid approaches: restating the idea, summarizing, reflecting, suggesting action, or making predictions.',
    '6) Minor grammar errors can be overlooked if meaning is clear.',
  ],

  commonMistakesToAnticipate: [
    {
      mistake: 'Introducing unrelated information',
      explanation: 'The conclusion brings up ideas not connected to the paragraph topic.',
      example:
        'Topic about penguins → Conclusion: "Dolphins are also interesting marine animals."',
    },
    {
      mistake: 'Repeating the topic sentence exactly',
      explanation: 'The conclusion is just a copy of the topic sentence.',
      example:
        'Topic: "Penguins have special adaptations." → Conclusion: "Penguins have special adaptations."',
    },
    {
      mistake: 'Too vague or generic',
      explanation: 'The conclusion could apply to any paragraph.',
      example:
        '"This is why this topic is so interesting."',
    },
    {
      mistake: 'Contradicting earlier information',
      explanation: 'The conclusion contradicts the topic or details.',
      example:
        'Details about cold adaptations → Conclusion: "Penguins prefer warm places."',
    },
  ],

  positiveExamples: [
    {
      example:
        'Topic: "Honeybees play a crucial role in our food system." Details: pollinate 1/3 of crops, threatened by colony collapse. → "Protecting these essential pollinators is vital for our future food security."',
      explainer:
        'Connects back to "crucial role" while synthesizing the threat mentioned in details.',
    },
    {
      example:
        'Topic: "The Maya developed a sophisticated civilization." Details: calendars, pyramids, writing. → "Through these achievements, the Maya demonstrated one of the most advanced ancient civilizations."',
      explainer:
        'Summarizes achievements while reinforcing "sophisticated civilization."',
    },
  ],

  negativeExamples: [
    {
      example:
        'Topic about honeybees → Conclusion: "Butterflies are also beautiful insects with colorful wings."',
      explainer:
        'Introduces unrelated information about butterflies.',
    },
  ],

  feedbackPromptOverrides: {
    concreteProblem:
      'In a warm, friendly tone, point out what was wrong with the concluding sentence compared to the topic and details.',
    callToAction:
      'Explain how the student can improve their concluding sentence to better wrap up the paragraph.',
  },
};

