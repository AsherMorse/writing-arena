/**
 * @fileoverview Grader configuration for "Identify Topic Sentences" activity.
 * Extracted from AlphaWrite: activities/19-identify-topic-sentence/grader.config.ts
 */

import { ActivityGraderConfig } from './types';

/**
 * @description Grader config for the Identify Topic Sentences activity.
 * Students identify which sentence in a group is the topic sentence (main idea).
 */
export const identifyTopicSentenceConfig: ActivityGraderConfig = {
  nameOfActivity: 'Identify Topic Sentences',

  goalForThisExercise: {
    primaryGoal:
      'Ensure students can distinguish a topic sentence from supporting details within a short paragraph.',
    secondaryGoals: [
      'Reinforce the characteristics of a topic sentence (general statement introducing the main idea)',
      'Help students understand how supporting details expand or explain the topic sentence',
      'Provide clear feedback on the difference between broad statements and specific details',
    ],
  },

  howTheActivityWorks: `Students see several sentences drawn from a short paragraph (shuffled order). They must identify which sentence is the best candidate for the topic sentence - the one that broadly introduces the main idea. Supporting details are more specific and provide examples or evidence.`,

  gradeAppropriateConsiderations: {
    level1: 'Use clear, straightforward paragraphs where the topic sentence is obviously more general than the details.',
    level2: 'Use more subtle paragraphs where the topic sentence might not appear first, requiring careful analysis.',
  },

  importantPrinciplesForGrading: [
    '1) Broad vs. Specific: A topic sentence presents a broad idea that the rest of the paragraph expands upon. Supporting details are narrower.',
    '2) Previewing the Main Idea: The topic sentence hints at what the entire paragraph will discuss.',
    '3) Cohesiveness: If removing a sentence breaks the paragraph\'s theme, it\'s probably the topic sentence.',
    '4) Feedback should clarify why selected sentences are either too specific or examples rather than the main idea.',
  ],

  commonMistakesToAnticipate: [
    {
      mistake: 'Selecting a specific detail as the topic sentence',
      explanation:
        'Students may misinterpret an interesting fact as the main idea.',
      example:
        'Topic: "Renewable energy is the future." Detail mistaken as topic: "Solar panels can reduce bills by 50%."',
    },
    {
      mistake: 'Choosing a concluding statement instead of the main idea',
      explanation:
        'Some paragraphs end with a summary line, which is not the introductory topic sentence.',
      example:
        '"In conclusion, these adventures can broaden your perspective." is a conclusion, not the topic sentence.',
    },
  ],

  positiveExamples: [
    {
      example:
        'Correct selection: "Many cities are investing in green technology to combat climate change." (broad statement)',
      explainer:
        'This sets up the paragraph\'s direction - how and why cities invest in green tech. It\'s a general assertion.',
    },
    {
      example:
        'Correct selection: "Robots are changing the way people work."',
      explainer:
        'This broadly introduces the paragraph\'s main point about workplace automation.',
    },
  ],

  negativeExamples: [
    {
      example:
        'Incorrect: "In 2020, Chicago allocated $2 million to build new bike lanes."',
      explainer:
        'This is a specific detail about one city, not the broad main idea about green technology.',
    },
    {
      example:
        'Incorrect: "For instance, I love reading mystery novels."',
      explainer:
        'This is a personal example, not a broad statement introducing the topic.',
    },
  ],

  feedbackPromptOverrides: {
    concreteProblem:
      "Explain why the student's chosen sentence is not the best representation of the main idea - it's too specific or a supporting detail.",
    callToAction:
      'Encourage the student to look for a sentence that introduces the entire paragraph\'s focus rather than describing a specific example.',
  },
};

