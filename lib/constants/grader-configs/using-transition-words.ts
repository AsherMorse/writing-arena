/**
 * @fileoverview Grader configuration for "Using Transition Words" activity.
 * Extracted from AlphaWrite: activities/31-using-transition-words/grader.config.ts
 */

import { ActivityGraderConfig } from './types';

/**
 * @description Grader config for the Using Transition Words activity.
 * Students fill in transition words that create logical connections between sentences.
 */
export const usingTransitionWordsConfig: ActivityGraderConfig = {
  nameOfActivity: 'Using Transition Words',

  goalForThisExercise: {
    primaryGoal:
      'Have students write-in a transition word that creates a logical connection between two or more sentences.',
    secondaryGoals: [
      'Learn different types of transitions (cause-effect, contrast, time, addition)',
      'Practice creating coherent flow between ideas',
      'Understand how transitions guide readers through text',
    ],
  },

  howTheActivityWorks: `Students see a passage with blanks where transition words should go. They fill in transitions that create logical connections between sentences. The goal is to create coherent flow, regardless of which specific transition category is used.`,

  gradeAppropriateConsiderations: {
    level1: 'Students use common transition words (TWR Level 1). Be lenient - accept any coherent choice.',
    level2: 'Students may use more nuanced transitions. Accept multiple valid interpretations.',
  },

  importantPrinciplesForGrading: [
    '1) Be Extremely Lenient: If a student\'s transition creates ANY coherent flow, accept it as correct.',
    '2) Only Mark Wrong When Truly Illogical: Reject only transitions that create genuinely nonsensical relationships.',
    '3) When in doubt, accept as correct.',
    '4) Multiple transitions may work for the same blank.',
  ],

  commonMistakesToAnticipate: [
    {
      mistake: 'Using a transition that creates a nonsensical relationship',
      explanation:
        'A transition that makes the sentence pair completely illogical.',
      example:
        '"The ice cream melted. Therefore, it was very cold outside." (cold doesn\'t cause melting)',
    },
  ],

  positiveExamples: [
    {
      example:
        '"Plants need sunlight to grow. ________, they turn toward the sun." → "Therefore" (cause-effect)',
      explainer:
        'Creates a coherent relationship showing plants\' response is caused by their need for sunlight.',
    },
    {
      example:
        'Same passage → "Naturally" is ALSO correct',
      explainer:
        '"Naturally" acknowledges this behavior is expected, creating coherent flow.',
    },
    {
      example:
        '"It rained all day. ________, we stayed inside." → "So" or "Meanwhile" both work',
      explainer:
        '"So" shows consequence; "Meanwhile" shows what happened during the rain. Both are valid.',
    },
  ],

  negativeExamples: [
    {
      example:
        '"I failed the test. Therefore, I studied very hard."',
      explainer:
        'Creates illogical cause-effect. Studying hard wouldn\'t cause failing.',
    },
  ],

  feedbackPromptOverrides: {
    concreteProblem:
      'In a warm tone, point out what was wrong with the transition choice. Remember multiple interpretations are valid - only mark incorrect if truly illogical.',
    callToAction:
      'Suggest how to select transitions that create logical connections. Acknowledge any merit in the student\'s choice first.',
  },
};

