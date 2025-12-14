/**
 * @fileoverview Grader configuration for "Write Introductory Sentences" activity.
 * Extracted from AlphaWrite: activities/38-write-introductory-sentences/grader.config.ts
 */

import { ActivityGraderConfig } from './types';

/**
 * @description Grader config for the Write Introductory Sentences activity.
 * Students write additional specific statements to complete an introduction.
 */
export const writeIntroductorySentencesConfig: ActivityGraderConfig = {
  nameOfActivity: 'Add Intro Sentences',

  goalForThisExercise: {
    primaryGoal:
      'Help students learn to create statements that effectively connect general statements to thesis statements.',
    secondaryGoals: [
      'Develop skills for writing structured introductory paragraphs',
      'Practice narrowing broad ideas to more focused contexts',
      'Learn to connect broad concepts to specific arguments',
      'Understand the GST paragraph structure',
    ],
  },

  howTheActivityWorks: `Students are given a minimal intro paragraph with: G (general), S1 (specific), and T (thesis). They must write additional specific statement(s) (S2, S3, etc.) that: 1) Add detail to the intro, 2) Are more specific than G, 3) Are not identical to S1, 4) Help create flow from G to T.`,

  gradeAppropriateConsiderations: {
    level1: 'Focus on basic coherence and logical connection. Be very lenient.',
    level2: 'Expect better logical precision but still accept multiple valid approaches.',
  },

  importantPrinciplesForGrading: [
    '1) Statements should provide some details or context related to the topic.',
    '2) Should build on S1 rather than just repeat it.',
    '3) Each statement should be a complete sentence.',
    '4) Consider connections broadly - they can be conceptual without similar words.',
    '5) Be very lenient with relevant connections.',
    '6) Focus on basic understanding of relationships, not specific word choice.',
    '7) Accept different types of details: explanations, examples, elaborations.',
    '8) Reward plausible attempts at bridging S1 and T.',
    '9) Be lenient with minor spelling errors.',
    '10) Using key terms from background is acceptable; only penalize near-identical copying.',
  ],

  commonMistakesToAnticipate: [
    {
      mistake: 'Statement remains very general',
      explanation: 'The new statement doesn\'t add focus or detail.',
      example:
        'G: "Books have influenced societies." S1: "Classic literature shaped values." S2: "Many books have been important." (too general)',
    },
    {
      mistake: 'Unclear connection',
      explanation: 'The statement is somewhat related but doesn\'t connect to G and T.',
      example:
        'Topic about technology → S2: "Many people enjoy watching movies." (unclear connection)',
    },
    {
      mistake: 'Exactly repeating G, S1, or T',
      explanation: 'Restating instead of adding something new.',
    },
  ],

  positiveExamples: [
    {
      example:
        'G: "Environmental issues affect communities." S1: "Coral reefs are bleaching." S2: "Coastal communities are introducing restoration projects." T: "Immediate climate action is necessary."',
      explainer:
        'S2 adds new detail about conservation efforts, building from the problem (S1) toward the call for action (T).',
    },
  ],

  negativeExamples: [
    {
      example:
        'G: "Technology transformed communication." S1: "Smartphones enabled instant messaging." S2: "People use many different devices today." (too vague)',
      explainer:
        'S2 is too broad and doesn\'t build toward the thesis about social media.',
    },
  ],

  feedbackPromptOverrides: {
    concreteProblem:
      'In a warm, friendly tone, point out what was wrong with the specific statement(s).',
    callToAction:
      'Explain how to create statements that add detail and bridge toward the thesis.',
  },
};

