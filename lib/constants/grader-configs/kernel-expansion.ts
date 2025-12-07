/**
 * @fileoverview Grader configuration for "Kernel Expansion" (Sentence Expansion) activity.
 * Extracted from AlphaWrite: activities/16-kernel-expansion/grader.config.ts
 */

import { ActivityGraderConfig } from './types';

/**
 * @description Grader config for the Kernel Expansion activity.
 * Students expand simple "kernel" sentences by adding details (who, what, when, where, why, how).
 */
export const kernelExpansionConfig: ActivityGraderConfig = {
  nameOfActivity: 'Sentence Expansion',

  goalForThisExercise: {
    primaryGoal:
      'Help students process and understand new information by expanding simple sentences with relevant details that address specific questions (who, what, when, where, why, how).',
    secondaryGoals: [
      'Practice adding descriptive details to simple sentences',
      'Develop ability to elaborate on basic ideas',
      'Build comprehension through content-embedded writing',
    ],
  },

  howTheActivityWorks: `Students are given a simple "kernel" sentence (e.g., "The dog barked." or "It melts.") and must expand it by adding details. The expansion should answer questions like who, what, when, where, why, or how. The expanded sentence must keep the core action or event from the kernel sentence while integrating additional information naturally.`,

  gradeAppropriateConsiderations: {
    level1: 'Accept simple expansions with 1-2 added details. Focus on maintaining the core meaning.',
    level2: 'Expect more sophisticated expansions with multiple integrated details and natural flow.',
  },

  importantPrinciplesForGrading: [
    '1) The core action or event from the kernel sentence should be recognizable, but can be rephrased naturally.',
    '2) Added details should be incorporated in a way that makes sense and flows naturally.',
    '3) Students can add clarifying details that help the sentence make more sense.',
    '4) Run-on sentences are errors, while minor spelling or punctuation issues are nits.',
    '5) The expansion must be a complete, grammatical sentence.',
  ],

  commonMistakesToAnticipate: [
    {
      mistake: 'Changing the core event',
      explanation:
        'Students might describe a completely different action than what the kernel sentence conveyed.',
      example:
        'Kernel: "She reads." → "The girl went to sleep." (completely different action)',
    },
    {
      mistake: 'Not actually expanding the sentence',
      explanation:
        'Students might just restate the kernel without adding meaningful details.',
      example: 'Kernel: "The cat slept." → "The cat was sleeping." (no real expansion)',
    },
    {
      mistake: 'Adding distracting information',
      explanation:
        'Including major new events or scenarios that distract from the core meaning.',
      example:
        'Kernel: "They swim." → "They swim quickly because a shark was chasing them and they needed to escape to the island." (too much added)',
    },
    {
      mistake: 'Creating a fragment',
      explanation: 'The expansion must still be a complete sentence.',
      example:
        'Kernel: "Birds fly." → "Birds flying gracefully in the sky." (fragment)',
    },
  ],

  positiveExamples: [
    {
      example:
        'Kernel: "It melts." → "On a hot afternoon, the chocolate ice cream melts quickly on the sidewalk."',
      explainer:
        'Adds when (hot afternoon), what kind (chocolate ice cream), how (quickly), and where (sidewalk) while keeping the core action.',
    },
    {
      example:
        'Kernel: "Birds fly." → "Birds fly gracefully across the clear blue sky."',
      explainer:
        'Incorporates descriptive details (gracefully, clear blue sky) that enhance the meaning naturally.',
    },
    {
      example:
        'Kernel: "The dog barked." → "The big brown dog barked loudly at the mailman yesterday morning."',
      explainer:
        'Adds who (big brown dog), how (loudly), at what (mailman), and when (yesterday morning).',
    },
    {
      example:
        'Kernel: "She reads." → "Every night before bed, Sarah reads her favorite mystery novel in her cozy room."',
      explainer:
        'Adds when (every night before bed), who (Sarah), what (favorite mystery novel), and where (cozy room).',
    },
  ],

  negativeExamples: [
    {
      example:
        'Kernel: "She writes." → "The student finished her homework at her desk."',
      explainer:
        'Changes the core action completely from "writing" to "finishing homework."',
    },
    {
      example:
        'Kernel: "They swim." → "They swim quickly across the lake because a shark was chasing them."',
      explainer:
        'Adds a major new scenario (shark chase) that distracts from the simple expansion exercise.',
    },
    {
      example: 'Kernel: "The cat slept." → "The cat."',
      explainer: 'This is not an expansion - it removes content.',
    },
  ],

  feedbackPromptOverrides: {
    concreteProblem:
      "In a warm, friendly, encouraging tone, point out what was wrong with the student's expanded sentence (e.g., changed meaning, missing details, not a complete sentence).",
    callToAction:
      'In a warm, friendly, encouraging tone, explain how the student can correctly expand the sentence next time by adding details about who, what, when, where, why, or how.',
  },
};

