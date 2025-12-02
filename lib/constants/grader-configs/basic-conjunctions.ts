/**
 * @fileoverview Grader configuration for "Because, But, So" activity.
 * Extracted from AlphaWrite: activities/11-basic-conjunctions/grader.config.ts
 */

import { ActivityGraderConfig } from './types';

/**
 * @description Grader config for the Because/But/So conjunction activity.
 * Students complete sentence stems ending with because, but, or so.
 */
export const basicConjunctionsConfig: ActivityGraderConfig = {
  nameOfActivity: 'Because, But, So',

  goalForThisExercise: {
    primaryGoal:
      "Develop students' analytical thinking by having them express relationships between ideas using basic conjunctions (because, but, so).",
    secondaryGoals: [
      'Check student comprehension of content material',
      'Practice expressing cause-effect relationships',
      'Learn to show contrasts and changes of direction',
      'Develop ability to explain reasons clearly',
    ],
  },

  howTheActivityWorks: `Students are shown a sentence stem that has a conjunction and a missing subsequent clause. The three conjunctions are "because", "but", and "so". Students will be given the sentence stem all the way through to the conjunction, and it's the student's job to finish the rest of the sentence. Each conjunction has a specific purpose: 'because' explains why something is true, 'but' indicates a change of direction, and 'so' shows what happens as a result.`,

  gradeAppropriateConsiderations: {
    level1: '',
    level2: '',
  },

  importantPrinciplesForGrading: [
    `1) Semantic rules:`,
    "- 'because' must explain why something is true, happened, or exists",
    "- 'but' must show a clear change of direction or contrast within the same topic",
    "- 'so' must connect a situation, condition, or action to a believable logical consequence, outcome, or countermeasure",
    `- When considering whether the completion follows these semantic rules, try to consider *what the student is trying to say*, and grade on that basis.`,
    `- On detailed matters of science, history, geography, etc., be lenient according to the student's grade level. Remember we're testing writing in this exercise, not these other subjects.`,
    `2) Mechanics:`,
    'Responses must complete the sentence logically and grammatically',
  ],

  commonMistakesToAnticipate: [
    {
      mistake: "Using 'so' as an intensifier",
      explanation:
        "Students might use 'so' to mean 'very' rather than to show a result.",
      example:
        "Incorrect: 'The dog is big, so big!'. Correct: 'The dog is big, so it needs a large bed.'",
    },
    {
      mistake: "Off-topic contrasts with 'but'",
      explanation:
        "Students might introduce unrelated information after 'but'. THIS MISTAKE TYPE IS AN ERROR.",
      example:
        "Incorrect: 'I like pizza, but the sky is blue'. Correct: 'I like pizza, but it's not healthy'",
    },
    {
      mistake: "Weak cause-effect with 'so'",
      explanation:
        'Students might not show clear logical connection. THIS MISTAKE TYPE IS AN ERROR.',
      example:
        "Incorrect: 'It's sunny, so I have a cat'. Correct: 'It's sunny, so I'll wear sunscreen'",
    },
    {
      mistake: "Weak logical connection with 'because'",
      explanation:
        'Students might not show a clear cause-effect relationship. THIS MISTAKE TYPE IS AN ERROR.',
      example:
        "Incorrect: 'She studied hard because the sky is blue'. Correct: 'She studied hard because she wanted to pass the test.'",
    },
  ],

  positiveExamples: [
    {
      example:
        "Stem: 'Forests are important because _____'. Answer: 'Forests are important because they produce oxygen for us to breathe.'",
      explainer:
        'Shows clear cause-and-effect relationship explaining why forests matter.',
    },
    {
      example:
        "Stem: 'The museum closes at five o'clock, so _____'. Answer: 'The museum closes at five o'clock, so we left school early to make it.'",
      explainer:
        'Shows a logical action taken in anticipation of a future condition, demonstrating understanding of cause-and-effect timing.',
    },
    {
      example:
        "Stem: 'The sun gives us light, but _____'. Answer: 'The sun gives us light, but too much exposure can be harmful.'",
      explainer:
        "Shows valid contrast about the same topic (the sun's effects).",
    },
    {
      example:
        "Stem: 'It's raining heavily, so _____'. Answer: 'It's raining heavily, so we should stay inside.'",
      explainer: 'Shows logical result or reasonable follow-up action.',
    },
    {
      example:
        "Stem: 'I enjoy reading books because _____'. Answer: 'I enjoy reading books because they transport me to different worlds'",
      explainer:
        'This answer is correct in terms of content and conjunction usage, even though it lacks ending punctuation. The missing period should be treated as a "nit" (minor issue) rather than an error that would make the answer incorrect.',
    },
  ],

  negativeExamples: [
    {
      example:
        "Stem: 'The book was interesting, but _____'. Answer: 'The book was interesting, but my dog likes to run.'",
      explainer:
        'Introduces unrelated topic instead of showing contrast about the book.',
    },
    {
      example:
        "Stem: 'The water is cold, so _____'. Answer: 'The water is cold, so cold!'",
      explainer: "Uses 'so' as an intensifier instead of showing a result.",
    },
  ],

  questionLabel: 'Sentence stem',

  feedbackPromptOverrides: {
    concreteProblem:
      'In a warm, friendly, encouraging tone, point out what was wrong with how the student completed the sentence stem.',
    callToAction:
      'In a warm, friendly, encouraging tone, explain how the student can avoid this mistake in the future.',
  },
};

