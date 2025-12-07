/**
 * @fileoverview Grader configuration for "Match Details Pro/Con" activity.
 * Extracted from AlphaWrite: activities/40-match-details-pro-con/grader.config.ts
 */

import { ActivityGraderConfig } from './types';

/**
 * @description Grader config for the Match Details Pro/Con activity.
 * Students identify how supporting details support different sides of an argument.
 */
export const matchDetailsProConConfig: ActivityGraderConfig = {
  nameOfActivity: 'Match Details Pro/Con',

  goalForThisExercise: {
    primaryGoal:
      'Help students identify how specific details support different sides of an argument by matching them with appropriate pro or con topic sentences.',
    secondaryGoals: [
      'Develop critical thinking skills by analyzing how details connect to arguments',
      'Learn to recognize language and content that indicates pro vs. con perspectives',
      'Build foundation for balanced argumentative writing',
    ],
  },

  howTheActivityWorks: `Students are presented with a debate topic, pro and con topic sentences, and a set of supporting details. They must match each detail to either the pro or con topic sentence by categorizing which side it supports. Each detail is specifically written to support either the pro or con perspective.`,

  gradeAppropriateConsiderations: {
    level1: 'Use clear distinctions between pro and con details.',
    level2: 'Use more nuanced details requiring closer analysis.',
  },

  importantPrinciplesForGrading: [
    '1) Focus feedback ONLY on the incorrectly matched details.',
    '2) Explain why each misclassified detail belongs with the other perspective.',
    '3) Reference the topic sentences in explanations.',
    '4) Look for patterns that might reveal a misunderstanding.',
    '5) Keep feedback encouraging and constructive.',
  ],

  commonMistakesToAnticipate: [
    {
      mistake: 'Reversal of pro and con sides',
      explanation: 'Student understands details but reverses which side is pro and con.',
      example:
        'If most details are reversed, point out the distinction between pro and con topic sentences.',
    },
    {
      mistake: 'Misinterpreting detail language',
      explanation: 'Not noticing words that signal support for a particular perspective.',
      example:
        '"Unfortunately" often signals con; "benefit" signals pro.',
    },
  ],

  positiveExamples: [
    {
      example:
        'Topic: "School Uniforms" - Pro: "Uniforms create equality." Con: "Uniforms limit expression." Detail: "Students can focus on learning, not fashion." → Correctly matched to Pro.',
      explainer:
        'The detail supports the pro perspective by showing a benefit of uniforms.',
    },
  ],

  negativeExamples: [
    {
      example:
        'Detail: "Uniforms are expensive for families." → Incorrectly matched to Pro.',
      explainer:
        'This detail mentions a negative (expense), so it supports the con perspective.',
    },
  ],

  feedbackPromptOverrides: {
    concreteProblem:
      'In a warm, friendly tone, point out which details were incorrectly sorted and why they belong with the other perspective.',
    callToAction:
      'Explain how to analyze language and content to determine which perspective a detail supports.',
  },
};

