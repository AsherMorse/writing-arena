/**
 * @fileoverview Grader configuration for "Subordinating Conjunctions" activity.
 * Extracted from AlphaWrite: activities/14-subordinating-conjunctions/new-graders/write-sentence/grader.config.ts
 */

import { ActivityGraderConfig } from './types';

/**
 * @description Grader config for the Subordinating Conjunctions activity.
 * Students write complete sentences using subordinating conjunctions (although, since, when, etc.).
 */
export const subordinatingConjunctionsConfig: ActivityGraderConfig = {
  nameOfActivity: 'Subordinating Conjunctions',

  goalForThisExercise: {
    primaryGoal:
      'Have students compose a single sentence using a specified subordinating conjunction to form a logical relationship between clauses.',
    secondaryGoals: [
      'Reinforce the function of subordinating conjunctions in creating dependent clauses',
      'Ensure correct comma placement (especially if the dependent clause is at the beginning)',
      'Practice expressing relationships like cause-effect, contrast, and time',
    ],
  },

  howTheActivityWorks: `Students are given a subordinating conjunction (e.g., "although," "since," "whenever," "because," "if") and must write a complete sentence using it. The conjunction should introduce or link a dependent clause and an independent clause. If the subordinating clause comes first, students must place a comma before the main clause. If it comes after the main clause, a comma is typically not needed.`,

  gradeAppropriateConsiderations: {
    level1: 'Accept simple sentences with basic clause structures. Focus on correct conjunction usage and comma placement.',
    level2: 'Expect more sophisticated sentence structures with clear logical relationships between clauses.',
  },

  importantPrinciplesForGrading: [
    '1) Must Use the Supplied Subordinating Conjunction:',
    '- Students cannot substitute a different conjunction or omit it entirely.',
    '2) Sentence Structure and Comma Usage:',
    '- If the dependent clause (starting with the subordinating conjunction) is at the beginning, it must be followed by a comma before the main clause begins.',
    '- If the independent clause comes first and the dependent clause follows, a comma is usually not required.',
    '3) Single Complete Sentence:',
    '- The response should be exactly one sentence, containing at least one dependent clause and one independent clause.',
    '4) Logical Connection:',
    '- The clauses should have a sensible logical relationship (cause-effect, contrast, time, condition).',
  ],

  commonMistakesToAnticipate: [
    {
      mistake: 'Omitting the comma when the subordinating clause is first',
      explanation:
        'If the sentence begins with the dependent clause, a comma is mandatory.',
      example:
        '"Because soccer is a worldwide sport it brings people together." (missing comma after "sport")',
    },
    {
      mistake: 'Forgetting to use the provided subordinating conjunction',
      explanation:
        'Students might switch to a different conjunction or omit it.',
      example:
        'Provided: "although" → Student writes "Even though it was raining..." (wrong conjunction)',
    },
    {
      mistake: 'Writing a fragment instead of a complete sentence',
      explanation:
        'Students might only provide the dependent clause without an independent clause.',
      example: '"Because the weather was nice." (incomplete - no main clause)',
    },
    {
      mistake: 'Creating a run-on sentence',
      explanation:
        'Students might chain multiple clauses together without correct punctuation.',
      example:
        '"Since friendship is valuable you should always help your friends you can learn many things together."',
    },
    {
      mistake: 'Illogical connection between clauses',
      explanation:
        'The dependent and independent clauses should have a sensible relationship.',
      example:
        '"Although I like pizza, the sky is blue." (no logical connection)',
    },
  ],

  positiveExamples: [
    {
      example:
        'Conjunction: "when" → "When friends support each other through hard times, they build a stronger bond."',
      explainer:
        'Correctly starts with a dependent clause using "when," includes a comma, and shows clear cause-effect.',
    },
    {
      example:
        'Conjunction: "although" → "Although it was raining heavily, we decided to continue our hike."',
      explainer:
        'Uses "although" to show contrast, with proper comma after the dependent clause.',
    },
    {
      example:
        'Conjunction: "since" → "Plants can thrive more easily since pollination spreads their seeds."',
      explainer:
        'Independent clause comes first, followed by the subordinating clause. No comma needed.',
    },
    {
      example:
        'Conjunction: "if" → "If you study consistently, your grades will improve over time."',
      explainer:
        'Shows conditional relationship with proper comma placement.',
    },
    {
      example:
        'Conjunction: "because" → "I always set multiple alarms because I tend to oversleep."',
      explainer:
        'Independent clause first, dependent clause second. No comma needed in this structure.',
    },
  ],

  negativeExamples: [
    {
      example:
        'Conjunction: "while" → "While friendship is nice people sometimes misunderstand each other."',
      explainer:
        'Missing comma after "nice." Required when the dependent clause appears first.',
    },
    {
      example:
        'Conjunction: "because" → "Because soccer is fun, baseball is also popular."',
      explainer:
        'No logical cause-effect relationship. The second clause doesn\'t follow from "soccer is fun."',
    },
    {
      example: 'Conjunction: "if" → "If pollination stops."',
      explainer:
        'This is a fragment - there is no independent clause describing what happens.',
    },
  ],

  feedbackPromptOverrides: {
    concreteProblem:
      "In a warm, friendly, encouraging tone, point out what was wrong with the student's sentence (e.g., missing comma, missing conjunction, fragment).",
    callToAction:
      'In a warm, friendly, encouraging tone, explain how the student can correctly write a sentence using the subordinating conjunction.',
  },
};

