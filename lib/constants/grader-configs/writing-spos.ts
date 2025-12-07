/**
 * @fileoverview Grader configuration for "Writing Single Paragraph Outlines" activity.
 * Note: AlphaWrite doesn't have a grader.config.ts for this activity - using custom config.
 */

import { ActivityGraderConfig } from './types';

/**
 * @description Grader config for the Writing SPOs (Single Paragraph Outlines) activity.
 * Students create organized outlines with topic sentence and supporting details.
 */
export const writingSposConfig: ActivityGraderConfig = {
  nameOfActivity: 'Writing Single Paragraph Outlines',

  goalForThisExercise: {
    primaryGoal:
      'Help students learn to organize their ideas into a structured single paragraph outline (SPO) with a clear topic sentence and supporting details.',
    secondaryGoals: [
      'Develop pre-writing and planning skills',
      'Practice identifying main ideas and supporting evidence',
      'Build understanding of paragraph structure',
    ],
  },

  howTheActivityWorks: `Students are given a topic and must create a single paragraph outline (SPO) that includes: 1) A topic sentence stating the main idea, 2) Multiple supporting details that explain or prove the topic sentence, 3) Optionally, a concluding sentence. The outline should be organized and logical.`,

  gradeAppropriateConsiderations: {
    level1: 'Accept simple outlines with a clear topic sentence and 2-3 related details.',
    level2: 'Expect more developed outlines with varied and specific supporting details.',
  },

  importantPrinciplesForGrading: [
    '1) The topic sentence should clearly state the main idea.',
    '2) Supporting details should directly relate to and support the topic sentence.',
    '3) Details should be distinct from each other (not repetitive).',
    '4) The outline should have a logical organization.',
    '5) Accept bullet points, numbered lists, or short phrases.',
    '6) Grammar is less important than clear organization of ideas.',
  ],

  commonMistakesToAnticipate: [
    {
      mistake: 'Details that don\'t support the topic',
      explanation: 'Supporting details are off-topic or unrelated to the main idea.',
      example:
        'Topic: "Dogs make great pets." Detail: "Cats sleep a lot." (not about dogs)',
    },
    {
      mistake: 'Missing or weak topic sentence',
      explanation: 'The outline lacks a clear main idea or the topic sentence is too vague.',
      example:
        'Topic sentence: "Stuff about animals." (too vague)',
    },
    {
      mistake: 'Repetitive details',
      explanation: 'The same point is made multiple times in different words.',
      example:
        'Detail 1: "Dogs are loyal." Detail 2: "Dogs are faithful." (same idea)',
    },
  ],

  positiveExamples: [
    {
      example:
        'Topic: Dogs make great family pets. Details: - Loyal and protective - Easy to train - Good for exercise - Provide companionship',
      explainer:
        'Clear topic sentence with varied, relevant supporting details.',
    },
  ],

  negativeExamples: [
    {
      example:
        'Topic: Dogs. Details: - Dogs - Pets - Animals',
      explainer:
        'Topic sentence is incomplete; details are vague and don\'t support a main idea.',
    },
  ],

  feedbackPromptOverrides: {
    concreteProblem:
      'In a warm, friendly tone, point out what\'s missing or unclear in the outline structure.',
    callToAction:
      'Explain how the student can improve their outline with a clearer topic sentence or more specific details.',
  },
};

