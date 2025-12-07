/**
 * @fileoverview Grader configuration for "Distinguish GST Statements" activity.
 * Extracted from AlphaWrite: activities/34-distinguish-g-s-t/grader.config.ts
 */

import { ActivityGraderConfig } from './types';

/**
 * @description Grader config for the Distinguish GST Statements activity.
 * Students identify and categorize statements as General, Specific, or Thesis.
 */
export const distinguishGstConfig: ActivityGraderConfig = {
  nameOfActivity: 'Distinguish GST Statements',

  goalForThisExercise: {
    primaryGoal:
      'Help students identify and differentiate between general, specific, and thesis statements, crucial for well-structured essay introductions.',
    secondaryGoals: [
      'Develop understanding of how essay introductions are structured',
      'Learn to recognize the role of different statement types in academic writing',
    ],
  },

  howTheActivityWorks: `Students are presented with three statements about a topic. They must correctly categorize each as: 1) A general statement (broad context), 2) A specific statement (narrowed focus with details), or 3) A thesis statement (main argument/claim). This is the foundation of the GST introduction structure.`,

  gradeAppropriateConsiderations: {
    level1: 'Use clear examples where statement types are distinct.',
    level2: 'Use more nuanced statements requiring careful analysis.',
  },

  importantPrinciplesForGrading: [
    '1) General statements are broad and introduce universal ideas - they set the stage.',
    '2) Specific statements narrow the focus with particular details or examples - they build context.',
    '3) Thesis statements present the main argument that would be supported in an essay - they make a claim.',
    '4) Focus feedback on the specific characteristics the student missed.',
    '5) Use second-person language ("you" instead of "the student").',
  ],

  commonMistakesToAnticipate: [
    {
      mistake: 'Confusing specific statements with thesis statements',
      explanation: 'Students think specific details with concrete info are the main argument.',
      example:
        'A specific statement about Mandela\'s leadership might be mistaken for a thesis.',
    },
    {
      mistake: 'Mistaking general statements for thesis statements',
      explanation: 'Students confuse broad claims with thesis statements.',
      example:
        'A general statement about athletic impact might be mistaken for a thesis.',
    },
    {
      mistake: 'Confusing general and specific statements',
      explanation: 'Students struggle to distinguish between levels of generality.',
      example:
        'Mixing up statements about books in general versus specific literary works.',
    },
  ],

  positiveExamples: [
    {
      example:
        'Topic: Environmental Conservation. G: "Environmental issues affect communities worldwide." S: "Coral reefs are bleaching due to rising temperatures." T: "Immediate climate action is necessary."',
      explainer:
        'The general introduces the broad topic. The specific narrows to coral reefs. The thesis presents a clear argument about action needed.',
    },
  ],

  negativeExamples: [
    {
      example:
        'Incorrect: "The Civil War lasted from 1861 to 1865" categorized as General (should be Specific because of dates).',
      explainer:
        'Specific dates and facts belong to Specific statements, not General ones.',
    },
  ],

  feedbackPromptOverrides: {
    concreteProblem:
      'In a warm, friendly tone, directly address what the student did wrong in categorizing the sentences.',
    callToAction:
      'Explain how to recognize each statement type (G=broad context, S=specific details, T=main argument).',
  },
};

