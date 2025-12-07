/**
 * @fileoverview Grader configuration for "Write G & S from Thesis" activity.
 * Extracted from AlphaWrite: activities/36-write-g-s-from-t/grader.config.ts
 */

import { ActivityGraderConfig } from './types';

/**
 * @description Grader config for the Write G & S from Thesis activity.
 * Students write General and Specific statements to introduce a given Thesis.
 */
export const writeGSFromTConfig: ActivityGraderConfig = {
  nameOfActivity: 'Write G & S from Thesis',

  goalForThisExercise: {
    primaryGoal:
      'Help students learn to introduce a main idea with supporting sentences.',
    secondaryGoals: [
      'Practice writing sentences that flow together',
      'Learn to start with big ideas before focusing on details',
      'Understand how to build up to a main point',
    ],
  },

  howTheActivityWorks: `Students are given a thesis statement (T) that presents the main point. They must write two sentences to introduce it: 1) A general statement (G) that introduces a broad idea related to the topic, 2) A specific statement (S) that adds details and connects to the main point. Together, these should help ideas flow logically (G → S → T).`,

  gradeAppropriateConsiderations: {
    level1: 'Be extremely lenient. If G is broad and S adds any relevant detail toward T (even loosely), consider it correct.',
    level2: 'Expect somewhat better flow, but still be lenient on exact connections.',
  },

  importantPrinciplesForGrading: [
    '1) Be EXTREMELY lenient. If G is broad and S adds any relevant detail toward T, accept it.',
    '2) Do NOT penalize imperfect flow or slightly weak connections if the basic G→S→T idea is attempted.',
    '3) Children connect ideas creatively; accept approaches that make sense from a child\'s perspective.',
    '4) The specific statement should be MORE specific than general, but doesn\'t need exhaustive details.',
    '5) Accept various approaches: examples, explanations, or simple additional facts.',
    '6) Allow creative interpretations - students may approach from unexpected angles.',
  ],

  commonMistakesToAnticipate: [
    {
      mistake: 'Sentences that don\'t connect to the main point',
      explanation: 'The sentences are about a completely different topic.',
      example:
        'Main point: "Dogs make wonderful pets." → G: "The sky is blue." S: "Clouds are made of water vapor."',
    },
    {
      mistake: 'Just repeating the main point',
      explanation: 'Saying the same thing in different words instead of building up to it.',
      example:
        'Main point: "Recess is my favorite part of school." → G: "I love recess." S: "Recess is the best time at school."',
    },
  ],

  positiveExamples: [
    {
      example:
        'Main point: "Winter is the best season." → G: "The four seasons each bring different weather." S: "Winter brings cold temperatures and snow perfect for sledding."',
      explainer:
        'G introduces seasons broadly. S adds specific winter details that connect to why winter is best.',
    },
  ],

  negativeExamples: [
    {
      example:
        'Main point: "Fruits and vegetables keep us healthy." → G: "Food is important." S: "Apples are tasty."',
      explainer:
        'G is overly broad and S has a weak connection to the thesis about health.',
    },
  ],

  feedbackPromptOverrides: {
    concreteProblem:
      'In a warm, friendly tone, point out what the student missed in their G or S statements.',
    callToAction:
      'Explain how they can improve their statements to better introduce the main point.',
  },
};

