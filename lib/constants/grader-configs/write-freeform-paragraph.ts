/**
 * @fileoverview Grader configuration for "Write a Free-Form Paragraph" activity.
 * Uses same cardinal rubric as writing-spos (single-paragraph-rubric).
 */

import { ActivityGraderConfig } from './types';

/**
 * @description Grader config for the Write Free-Form Paragraph activity.
 * Students write a complete paragraph with topic sentence, supporting details, and conclusion.
 */
export const writeFreeformParagraphConfig: ActivityGraderConfig = {
  nameOfActivity: 'Write a Free-Form Paragraph',

  goalForThisExercise: {
    primaryGoal:
      'Have students write a complete, well-organized paragraph on a given topic with a clear topic sentence, supporting details, and a concluding sentence.',
    secondaryGoals: [
      'Practice organizing ideas into a coherent paragraph structure',
      'Develop the ability to support a main idea with relevant details',
      'Build skills in writing strong opening and closing sentences',
    ],
  },

  howTheActivityWorks: `Students are given a topic (with optional context paragraph) and must write a complete paragraph that includes:
1) A topic sentence that introduces the main idea
2) Supporting details that explain or prove the topic sentence
3) A concluding sentence that wraps up the paragraph
The paragraph should be well-organized, on-topic, and meet the minimum sentence requirement.`,

  gradeAppropriateConsiderations: {
    level1: 'Accept paragraphs with 3-4 sentences that have a clear topic sentence and basic supporting details.',
    level2: 'Expect more developed paragraphs with 5+ sentences, varied sentence structure, and stronger transitions.',
  },

  importantPrinciplesForGrading: [
    '1) The topic sentence should clearly introduce the main idea and address the prompt.',
    '2) Supporting details should be relevant and directly support the topic sentence.',
    '3) Details should be specific and varied (not repetitive).',
    '4) The concluding sentence should effectively wrap up the paragraph.',
    '5) The paragraph should stay on topic throughout.',
    '6) Grammar and conventions should be appropriate for grade level.',
  ],

  commonMistakesToAnticipate: [
    {
      mistake: 'Missing or weak topic sentence',
      explanation: 'The paragraph starts with a detail instead of stating the main idea.',
      example:
        'Starting with "First, dolphins use clicks" instead of "Dolphins have fascinating ways of communicating."',
    },
    {
      mistake: 'Off-topic sentences',
      explanation: 'Including information that does not support the main idea.',
      example:
        'In a paragraph about dolphins: "I went to the zoo last summer." (irrelevant personal detail)',
    },
    {
      mistake: 'Repetitive details',
      explanation: 'Restating the same point in different words instead of adding new information.',
      example:
        '"Dolphins are smart. Dolphins are intelligent. Dolphins are clever." (same idea repeated)',
    },
    {
      mistake: 'Missing concluding sentence',
      explanation: 'The paragraph ends abruptly without wrapping up the main idea.',
      example:
        'Ending with a detail instead of a summary: "They also use body language."',
    },
  ],

  positiveExamples: [
    {
      example:
        'Dolphins are remarkable communicators that use many different methods to share information. They produce clicking sounds to locate objects and other dolphins through echolocation. Dolphins also whistle to identify themselves to their pod members, with each dolphin having its own unique whistle. In addition, they use body language like leaping and slapping the water to express emotions. These diverse communication skills help dolphins survive and thrive in the ocean.',
      explainer:
        'Strong topic sentence, varied supporting details with transitions, and effective concluding sentence that ties back to the main idea.',
    },
  ],

  negativeExamples: [
    {
      example:
        'Dolphins click. They whistle. Dolphins swim fast. I saw a dolphin once at the aquarium.',
      explainer:
        'No topic sentence, choppy unconnected sentences, includes irrelevant personal detail, no concluding sentence.',
    },
    {
      example:
        'Dolphins are cool. They do things in the ocean. They are nice animals.',
      explainer:
        'Too vague, lacks specific details, no real supporting evidence or examples.',
    },
  ],

  feedbackPromptOverrides: {
    concreteProblem:
      'Point out specific issues with paragraph structure, missing elements, or off-topic content.',
    callToAction:
      'Guide the student to strengthen their topic sentence, add specific details, or improve their conclusion.',
  },
};
