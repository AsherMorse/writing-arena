/**
 * @fileoverview Grader configuration for "Write Appositives" activity.
 * Extracted from AlphaWrite: activities/13-write-appositives/new-graders/word/grader.config.ts
 */

import { ActivityGraderConfig } from './types';

/**
 * @description Grader config for the Write Appositives activity.
 * Students write sentences incorporating a given noun phrase as an appositive.
 */
export const writeAppositivesConfig: ActivityGraderConfig = {
  nameOfActivity: 'Write Appositives',

  goalForThisExercise: {
    primaryGoal:
      'Enable students to integrate a given noun phrase as an appositive into their own sentences.',
    secondaryGoals: [
      'Develop understanding of appositives as descriptive elements',
      'Practice proper comma usage with non-essential appositives',
    ],
  },

  howTheActivityWorks:
    'Students are given a noun phrase and must write a sentence that incorporates it as a non-essential appositive.',

  gradeAppropriateConsiderations: {
    level1: '',
    level2: '',
  },

  importantPrinciplesForGrading: [
    '1. Use the provided phrase as an appositive:',
    '- The student must include the exact given phrase as an appositive in their sentence.',
    '- The appositive can describe any noun in the sentence, and can appear at the beginning, middle, or end.',
    '',
    '2. Structure over semantics:',
    '- Focus EXCLUSIVELY on the grammatical structure rather than semantic perfection or factual accuracy.',
    '- Allow creative content if the grammar is correct.',
    "- Do NOT nitpick stylistic word choices or cultural preferences that don't affect grammar.",
    '- Avoid flagging words like "lady" vs "woman" or other stylistic preferences - focus only on the appositive structure.',
    '- NEVER penalize for factual inaccuracies about specific topics, brands, people, or places.',
    '- Assume that factual details in student sentences may be creative or fictional, and grade only on proper grammar and structure.',
    '',
    '3. Proper punctuation:',
    '- Non-essential appositives need appropriate comma placement based on position.',
    '- An appositive requires a comma either before or after it (or both) depending on its position.',
    '',
    '4. Use kid-friendly language in feedback:',
    '- Avoid grammar terms like "noun phrase" or "appositive" in feedback.',
    '- Instead use simple language like "describing word" or "extra information about a thing."',
  ],

  commonMistakesToAnticipate: [
    {
      mistake: 'Missing commas around the appositive',
      explanation: 'Students may forget to set off the appositive with commas.',
      example:
        'Provided: "a talented musician" → "My brother a talented musician plays in a band."',
    },
    {
      mistake: 'Changing the given phrase',
      explanation: 'Students might alter the provided phrase or add to it.',
      example:
        'Provided: "a skilled chef" → "My aunt, a skilled chef who owns a restaurant, made dinner."',
    },
  ],

  formatRequirements: [],

  positiveExamples: [
    {
      example:
        'Provided: "my neighbor" → "Sarah, my neighbor, shared her homemade jam with me."',
      explainer:
        'This is correct because it uses the exact phrase as given, set off by commas.',
    },
    {
      example:
        'Provided: "a skilled surgeon" → "A skilled surgeon, Dr. Perkins saved many lives during the war."',
      explainer:
        'This is correct because it places the appositive at the beginning, followed by a comma.',
    },
    {
      example:
        'Provided: "the brave leader of the Avengers team" → "The brave leader of the Avengers team, Captain America is an old school hero born in the 1920s."',
      explainer:
        'This is correct because the appositive at the beginning is followed by a noun it describes and a comma separates them.',
    },
    {
      example:
        'Provided: "a master of martial arts and espionage" → "A master of martial arts and espionage, Black Widow is the only lady on the Avengers."',
      explainer:
        'This is correct because it uses the appositive at the beginning followed by a comma. The word choice of "lady" is perfectly acceptable and should not be flagged as an issue.',
    },
    {
      example:
        'Provided: "a popular sandwich shop with over 40,000 locations worldwide" → "Jimmy Johns, a popular sandwich shop with over 40,000 locations worldwide, is a fantastic place to eat."',
      explainer:
        'This is correct because it properly uses the appositive phrase with commas. The factual accuracy about the number of locations is NOT relevant to grading the grammatical structure.',
    },
  ],

  negativeExamples: [
    {
      example: 'Provided: "my sister" → "My sister Emily is coming to dinner."',
      explainer:
        'This is missing the commas needed to make it a non-essential appositive.',
    },
  ],

  questionLabel: 'Noun phrase to use',

  feedbackPromptOverrides: {
    concreteProblem:
      'In a warm, friendly, encouraging tone, point out what was wrong with how the student used the describing phrase in their sentence.',
    callToAction:
      'In a warm, friendly, encouraging tone, explain how the student can correctly use the describing phrase next time.',
  },
};

