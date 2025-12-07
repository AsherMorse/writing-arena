/**
 * @fileoverview Grader configuration for "Eliminate Irrelevant Sentences" activity.
 * Extracted from AlphaWrite: activities/22-eliminate-irrelevant-sentences/grader.config.ts
 */

import { ActivityGraderConfig } from './types';

/**
 * @description Grader config for the Eliminate Irrelevant Sentences activity.
 * Students identify the topic sentence and the irrelevant sentence in a group.
 */
export const eliminateIrrelevantSentencesConfig: ActivityGraderConfig = {
  nameOfActivity: 'Eliminate Irrelevant Sentences',

  goalForThisExercise: {
    primaryGoal:
      'Help students understand what makes a topic sentence, supporting detail, and an irrelevant sentence.',
    secondaryGoals: [
      'Develop ability to identify sentences that don\'t belong',
      'Strengthen understanding of paragraph coherence',
      'Practice identifying the main idea vs. off-topic content',
    ],
  },

  howTheActivityWorks: `Students see a list of sentences: one is the topic sentence, one is irrelevant, and the others are supporting details. They must identify which sentence is the main topic sentence and which sentence is irrelevant to that topic.`,

  gradeAppropriateConsiderations: {
    level1: 'Use paragraphs where the topic sentence is fairly obvious and the irrelevant sentence is clearly off-topic.',
    level2: 'Introduce paragraphs with more subtle distinctions. The irrelevant sentence may be thematically closer to the main topic.',
  },

  importantPrinciplesForGrading: [
    '1) Topic Sentence: Introduces the main idea, generally broader than details, sets the focus.',
    '2) Supporting Details: Add specific examples, evidence, or explanations that connect to the topic.',
    '3) Irrelevant Sentence: Does not connect to the main idea; may be about the general subject but shifts to an unrelated aspect.',
  ],

  commonMistakesToAnticipate: [
    {
      mistake: 'Choosing a supporting detail as the topic sentence',
      explanation:
        'Students may select a specific detail instead of the broader main idea.',
      example:
        'Topic: "Dogs make great pets." Detail mistaken as topic: "Dogs need daily walks."',
    },
    {
      mistake: 'Missing the irrelevant sentence because it mentions related words',
      explanation:
        'The irrelevant sentence may use similar vocabulary but doesn\'t support the main idea.',
      example:
        'Topic about "rainforests" → Irrelevant: "Some house plants require daily watering."',
    },
    {
      mistake: 'Marking a supporting detail as irrelevant',
      explanation:
        'Students might not see how a detail connects to the main idea.',
      example:
        'Topic: "Reading benefits the mind." Detail wrongly marked: "Studies show readers have better vocabulary."',
    },
  ],

  positiveExamples: [
    {
      example:
        'Sentences about "Exercise": 1) Regular exercise improves health. 2) Walking strengthens your heart. 3) Many gyms offer discounts. 4) Swimming helps joints. → Topic: #1, Irrelevant: #3',
      explainer:
        '#1 states the broad idea. #3 is about gym pricing, not health benefits.',
    },
  ],

  negativeExamples: [
    {
      example:
        'Incorrect: Selecting #2 as topic and #4 as irrelevant in the example above.',
      explainer:
        '#2 is a specific detail about walking. #4 is relevant as it discusses a health benefit.',
    },
  ],

  feedbackPromptOverrides: {
    concreteProblem:
      'In a warm, friendly tone, point out if the student mistook a detail for the topic sentence or missed the truly irrelevant sentence.',
    callToAction:
      'Help the student understand how to identify topic sentences (broader) and irrelevant sentences (don\'t support the main topic).',
  },
};

