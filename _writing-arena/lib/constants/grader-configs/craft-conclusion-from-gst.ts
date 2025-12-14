/**
 * @fileoverview Grader configuration for "Write Conclusion Paragraphs" activity.
 * Extracted from AlphaWrite: activities/37-craft-conclusion-from-gst/grader.config.ts
 */

import { ActivityGraderConfig } from './types';

/**
 * @description Grader config for the Write Conclusion Paragraphs activity.
 * Students write conclusion paragraphs using the TSG structure (reverse of GST intro).
 */
export const craftConclusionFromGstConfig: ActivityGraderConfig = {
  nameOfActivity: 'Write Conclusion Paragraphs',

  goalForThisExercise: {
    primaryGoal:
      'Help students learn to write simple ending paragraphs that wrap up their ideas.',
    secondaryGoals: [
      'Practice restating main ideas in different words',
      'Learn to summarize details mentioned earlier',
      'Understand how to end with a big idea connecting to the beginning',
    ],
  },

  howTheActivityWorks: `Students are given a beginning paragraph with three parts: G (General Statement), S (Specific Statement), and T (Thesis). They must write an ending paragraph that flips the order: T (Thesis Restatement with different words), S (Specific Statement looking ahead), G (General Statement like the beginning). This is the TSG conclusion structure.`,

  gradeAppropriateConsiderations: {
    level1: 'Be extremely lenient. Focus on whether students attempted the T-S-G pattern, not on sophisticated language.',
    level2: 'Expect somewhat better rephrasing but still value effort over precision.',
  },

  importantPrinciplesForGrading: [
    '1) Be extremely lenient with elementary students learning this structure.',
    '2) Focus on whether the student ATTEMPTED the T-S-G pattern, not sophistication.',
    '3) Accept any thesis restatement that relates to the same topic, even if simplified.',
    '4) Accept simple, short sentences as long as they follow T-S-G structure.',
    '5) Do not mark responses incorrect for being "too simple" or "too short."',
    '6) Value effort and basic understanding over precision or complexity.',
  ],

  commonMistakesToAnticipate: [
    {
      mistake: 'Copying the beginning sentences exactly',
      explanation: 'Students just repeat the same sentences instead of rephrasing.',
      example:
        'Using exact same words instead of saying similar things differently.',
    },
    {
      mistake: 'Not following T-S-G order',
      explanation: 'Students might start with a broad idea (like G-S-T) instead of T-S-G.',
      example:
        'Starting with the general statement instead of restating the thesis.',
    },
    {
      mistake: 'Introducing completely new ideas',
      explanation: 'The conclusion should wrap up existing ideas, not add new info.',
      example:
        'Adding a new fact or opinion not related to the introduction.',
    },
  ],

  positiveExamples: [
    {
      example:
        'Beginning (G-S-T): G: "Our bodies need movement." S: "Running and swimming make hearts strong." T: "Exercise keeps us healthy." → Ending (T-S-G): T: "Staying active is necessary for health." S: "Fun activities make our bodies stronger." G: "Taking care of ourselves helps us live better."',
      explainer:
        'Successfully follows T-S-G with appropriate rephrasing. Thesis captures the main idea, specifics echo the intro, general provides closure.',
    },
  ],

  negativeExamples: [
    {
      example:
        'Just copying the intro: G: "Pets come in many sizes." S: "Dogs are loyal." T: "Dogs make the best pets." (exact copies in wrong order)',
      explainer:
        'Doesn\'t follow T-S-G order and just copies sentences without rephrasing.',
    },
  ],

  feedbackPromptOverrides: {
    concreteProblem:
      'In a warm, friendly tone, point out what the student missed in their ending paragraph.',
    callToAction:
      'Explain how they can improve: start with thesis restatement (T), add a specific detail (S), end with a broad idea (G).',
  },
};

