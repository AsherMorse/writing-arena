/**
 * @fileoverview Grader configuration for "Make Topic Sentences" activity.
 * Extracted from AlphaWrite: activities/25-make-topic-sentences/grader.config.ts
 */

import { ActivityGraderConfig } from './types';

/**
 * @description Grader config for the Make Topic Sentences activity.
 * Students write topic sentences that introduce a main idea using specified sentence strategies.
 */
export const makeTopicSentencesConfig: ActivityGraderConfig = {
  nameOfActivity: 'Make Topic Sentences',

  goalForThisExercise: {
    primaryGoal:
      'Help students write a topic sentence that introduces their main idea in an engaging way.',
    secondaryGoals: [
      'Practice using different sentence types to make writing more interesting',
      'Build confidence in writing complete sentences',
      'Learn to introduce paragraphs effectively',
    ],
  },

  howTheActivityWorks: `Students are given a topic and some background context to help them brainstorm. They may also be given a required sentence strategy (e.g., "Write a declarative sentence" or "Use an appositive"). Their task is to write one topic sentence that would plausibly introduce a paragraph about that topic.`,

  gradeAppropriateConsiderations: {
    level1: 'For Grades 4-5: Focus on correctly applying basic sentence strategies and ensuring the sentence is on-topic and grammatically sound.',
    level2: 'For Grade 6: Greater expectation for crafting an engaging and original topic sentence. Clarity, conciseness, and correct application of the strategy remain key.',
  },

  importantPrinciplesForGrading: [
    '1) Topic Focus: The sentence should be about the given topic.',
    '2) Sentence Type: If a specific sentence strategy is required, it should be used correctly.',
    '3) Clarity: The sentence should make sense to the reader.',
    '4) Originality: The sentence should not be a simple copy-paste of the background context.',
    '5) Be lenient: If the student has used the sentence strategy correctly and stayed on topic, accept it as correct.',
  ],

  commonMistakesToAnticipate: [
    {
      mistake: 'Writing multiple sentences instead of one',
      explanation: 'The activity asks for one topic sentence.',
      example:
        'Writing "I love dogs. They are great pets." instead of one topic sentence.',
    },
    {
      mistake: 'Writing about a completely different topic',
      explanation: 'The sentence is not about the assigned topic at all.',
      example:
        'For a topic about "Space," writing "My favorite food is pizza."',
    },
    {
      mistake: 'Copying directly from the background',
      explanation: 'The student copies the provided context instead of writing their own sentence.',
    },
  ],

  positiveExamples: [
    {
      example:
        'Topic: "Space" → "Have you ever wondered what it would be like to walk on the moon?"',
      explainer:
        'This is a good question that introduces the topic of space exploration.',
    },
    {
      example:
        'Topic: "Ocean" → "Discover the mysterious world beneath the waves."',
      explainer:
        'This is a good imperative sentence that begins with a command verb and engages the reader.',
    },
    {
      example:
        'Topic: "Dogs" → "Dogs, loyal companions for thousands of years, make wonderful family pets."',
      explainer:
        'Uses an appositive to add detail about dogs while introducing the main idea.',
    },
  ],

  negativeExamples: [
    {
      example:
        'Topic: "Dinosaurs" → "I like pizza and ice cream and watching TV."',
      explainer: 'This sentence is not about the assigned topic of dinosaurs.',
    },
    {
      example:
        'Topic: "Rainforests" → "Rainforests. Trees. Animals."',
      explainer: 'These are fragments, not a complete topic sentence.',
    },
  ],

  feedbackPromptOverrides: {
    concreteProblem:
      'In a warm, friendly, encouraging tone, point out what the student got wrong in their topic sentence.',
    callToAction:
      'In a warm, friendly, encouraging tone, give the student a simple, clear suggestion for how to improve their sentence next time.',
  },
};

