/**
 * @fileoverview Grader configuration for "Elaborate on Paragraphs" activity.
 * Extracted from AlphaWrite: activities/30-elaborate-paragraphs/grader.config.ts
 */

import { ActivityGraderConfig } from './types';

/**
 * @description Grader config for the Elaborate Paragraphs activity.
 * Students revise a simple paragraph by expanding details following specific instructions.
 */
export const elaborateParagraphsConfig: ActivityGraderConfig = {
  nameOfActivity: 'Elaborate on Paragraphs',

  goalForThisExercise: {
    primaryGoal:
      'Have students revise a simple paragraph by expanding details, improving vocabulary, and following specific instructions.',
    secondaryGoals: [
      'Reinforce paragraph structure through guided revisions',
      'Encourage students to add time/place details and better word choice',
      'Practice incorporating reasons and explanations into writing',
    ],
  },

  howTheActivityWorks: `Students receive a brief paragraph and a set of step-by-step instructions for improving it (e.g., "Expand the time details" or "Use more descriptive adjectives"). They rewrite the paragraph incorporating each instruction. Their revision is satisfactory if they follow at least 80% of the given instructions.`,

  gradeAppropriateConsiderations: {
    level1: 'Students revise using 3-4 straightforward instructions. Focus on whether each instruction was applied.',
    level2: 'Students use 4-5 instructions with more nuanced elaborations (explaining reasons, adding sensory details).',
  },

  importantPrinciplesForGrading: [
    '1) Accuracy of Instruction Compliance: Each instruction should be clearly visible in the revised paragraph.',
    '2) Minimum 80% Rule: If there are N instructions, at least 0.8×N must be addressed.',
    '3) Paragraph Integrity: The result should still read as a coherent paragraph, not disjointed inserts.',
    '4) Minor grammar slips are tolerable, but overall clarity is key.',
  ],

  commonMistakesToAnticipate: [
    {
      mistake: 'Ignoring or skipping certain instructions',
      explanation:
        'Students may overlook a step, lowering their instruction completion count.',
      example:
        'Instruction: "Expand the time detail." → Student\'s revision never includes a time reference.',
    },
    {
      mistake: 'Overly minimal changes',
      explanation:
        'Simply adding "really" or changing "fun" to "nice" is insufficient.',
      example:
        'Instruction: "Give a specific reason." → "We had a nice bus ride because it was fun." (no actual reason)',
    },
    {
      mistake: 'Changing the original meaning',
      explanation:
        'Adding info that conflicts with the original or omitting key parts.',
      example:
        'Original says aquarium visit, revision changes it to zoo visit.',
    },
  ],

  positiveExamples: [
    {
      example:
        'Original: "We went to the aquarium. We saw fish." Instructions: Add when, describe fish, explain why it was good. → "Last Tuesday, we went to the aquarium. We saw colorful tropical fish swimming in huge tanks. It was wonderful because we learned about marine life!"',
      explainer:
        'Added time (Last Tuesday), described fish (colorful tropical), and explained why (learned about marine life). All instructions addressed.',
    },
  ],

  negativeExamples: [
    {
      example:
        'Original paragraph about aquarium → Revision: "We went to the zoo. We saw lions." (changed the entire premise)',
      explainer:
        'Lost the original setting entirely and ignored instructions about fish.',
    },
    {
      example:
        'Only changed "lots of fish" to "many fish" - no other improvements.',
      explainer:
        'Only satisfied 1 of 5 instructions (below 80% threshold).',
    },
  ],

  feedbackPromptOverrides: {
    concreteProblem:
      'Identify which instruction(s) the student missed or insufficiently addressed. Note if they changed the paragraph\'s meaning.',
    callToAction:
      'Ask the student to re-check each step and incorporate them to reach at least 80% completion.',
  },
};

