/**
 * @fileoverview Sentence-level practice lessons (Tier 1).
 * Covers basic sentence construction, conjunctions, and fragments.
 */

import { PracticeLesson } from './types';

/**
 * @description Sentence-level practice lessons.
 */
export const SENTENCE_LESSONS: Record<string, PracticeLesson> = {
  'basic-conjunctions': {
    id: 'basic-conjunctions',
    name: 'Because, But, So',
    description: 'Complete sentences using conjunctions to show cause, contrast, or result.',
    category: 'sentence',
    status: 'available',
    phaseDurations: {
      reviewPhase: 1,
      writePhase: 3,
      revisePhase: 2,
    },
    instruction: 'Complete the sentence stem with a clause that makes sense with the conjunction.',
    prompts: [
      {
        id: 'bbs-1',
        prompt: 'The student stayed up late, so _____',
        conjunction: 'so',
        hint: 'What happened as a result of staying up late?',
      },
      {
        id: 'bbs-2',
        prompt: 'Pizza is a popular food because _____',
        conjunction: 'because',
        hint: 'Why is pizza popular?',
      },
      {
        id: 'bbs-3',
        prompt: 'The weather was cold, but _____',
        conjunction: 'but',
        hint: 'What contrast or surprise happened despite the cold?',
      },
      {
        id: 'bbs-4',
        prompt: 'I wanted to go outside, but _____',
        conjunction: 'but',
        hint: 'What prevented you or changed your plans?',
      },
      {
        id: 'bbs-5',
        prompt: 'The library was closed, so _____',
        conjunction: 'so',
        hint: 'What did you do instead?',
      },
      {
        id: 'bbs-6',
        prompt: 'Dogs are loyal pets because _____',
        conjunction: 'because',
        hint: 'What makes dogs loyal?',
      },
    ],
    exampleResponse: {
      prompt: 'The cat was hungry, so _____',
      response: 'The cat was hungry, so it meowed loudly for food.',
      explanation: "This shows a logical result - the cat's hunger led to meowing for food.",
    },
  },

  'write-appositives': {
    id: 'write-appositives',
    name: 'Appositives',
    description: 'Write sentences using noun phrases as appositives to add detail.',
    category: 'sentence',
    status: 'available',
    phaseDurations: {
      reviewPhase: 1,
      writePhase: 3,
      revisePhase: 2,
    },
    instruction: 'Write a complete sentence using the given phrase as an appositive (extra information set off by commas).',
    prompts: [
      {
        id: 'app-1',
        prompt: 'Write a sentence using this phrase as an appositive:',
        nounPhrase: 'my best friend',
        hint: 'Put commas around the phrase when it adds extra info about someone.',
      },
      {
        id: 'app-2',
        prompt: 'Write a sentence using this phrase as an appositive:',
        nounPhrase: 'a talented artist',
        hint: 'This phrase should describe a person in your sentence.',
      },
      {
        id: 'app-3',
        prompt: 'Write a sentence using this phrase as an appositive:',
        nounPhrase: 'the fastest runner on the team',
        hint: 'Use commas to set off this describing phrase.',
      },
      {
        id: 'app-4',
        prompt: 'Write a sentence using this phrase as an appositive:',
        nounPhrase: 'a delicious treat',
        hint: 'This can describe any food or snack in your sentence.',
      },
      {
        id: 'app-5',
        prompt: 'Write a sentence using this phrase as an appositive:',
        nounPhrase: 'our family pet',
        hint: 'Put this phrase after the name of your pet with commas.',
      },
    ],
    exampleResponse: {
      prompt: 'Use "a great listener" as an appositive',
      response: 'My teacher, a great listener, always helps us with problems.',
      explanation: 'The phrase "a great listener" is set off by commas and adds extra information about the teacher.',
    },
  },

  'subordinating-conjunctions': {
    id: 'subordinating-conjunctions',
    name: 'Subordinating Conjunctions',
    description: 'Connect clauses using words like although, when, and because.',
    category: 'sentence',
    status: 'available',
    phaseDurations: { reviewPhase: 1, writePhase: 3, revisePhase: 2 },
    instruction: 'Complete the sentence using a subordinating conjunction.',
    prompts: [
      {
        id: 'sc-1',
        prompt: 'Complete the sentence: "Although the weather was cold, _____"',
        hint: 'Show contrast - what did you do despite the cold weather?',
      },
      {
        id: 'sc-2',
        prompt: 'Complete the sentence: "Before we eat dinner, _____"',
        hint: 'What happens first, before eating?',
      },
      {
        id: 'sc-3',
        prompt: 'Complete the sentence: "When the bell rings, _____"',
        hint: 'What happens at that moment?',
      },
      {
        id: 'sc-4',
        prompt: 'Complete the sentence: "If it rains tomorrow, _____"',
        hint: 'What will happen as a result?',
      },
      {
        id: 'sc-5',
        prompt: 'Complete the sentence: "Even though the test was hard, _____"',
        hint: 'Show contrast - what happened despite the difficulty?',
      },
      {
        id: 'sc-6',
        prompt: 'Complete the sentence: "After we finish homework, _____"',
        hint: 'What can you do next?',
      },
    ],
    exampleResponse: {
      prompt: 'Complete: "Because the library was crowded, _____"',
      response: 'Because the library was crowded, we decided to study at home instead.',
      explanation: 'Shows cause and effect - the crowd caused the decision to study elsewhere.',
    },
  },

  'kernel-expansion': {
    id: 'kernel-expansion',
    name: 'Sentence Expansion',
    description: 'Expand simple sentences by adding details and descriptions.',
    category: 'sentence',
    status: 'available',
    phaseDurations: { reviewPhase: 1, writePhase: 3, revisePhase: 2 },
    instruction: 'Expand the kernel sentence by adding details that answer who, what, when, where, why, or how.',
    prompts: [
      {
        id: 'ke-1',
        prompt: 'Expand this sentence by adding who and where: "Birds sing."',
        hint: 'What kind of birds? Where do they sing?',
      },
      {
        id: 'ke-2',
        prompt: 'Expand this sentence by adding when and why: "Students read."',
        hint: 'When do they read? Why do they read?',
      },
      {
        id: 'ke-3',
        prompt: 'Expand this sentence by adding how and what: "Scientists discover."',
        hint: 'How do they discover? What do they discover?',
      },
      {
        id: 'ke-4',
        prompt: 'Expand this sentence by adding who and where: "Children play."',
        hint: 'Which children? Where do they play?',
      },
      {
        id: 'ke-5',
        prompt: 'Expand this sentence by adding where and when: "Flowers bloom."',
        hint: 'Where do they bloom? When do they bloom?',
      },
      {
        id: 'ke-6',
        prompt: 'Expand this sentence by adding how and why: "Chefs cook."',
        hint: 'How do they cook? Why do they cook?',
      },
    ],
    exampleResponse: {
      prompt: 'Expand: "Dogs bark." by adding when and why.',
      response: 'The excited dogs bark loudly at night to warn their owners of strangers.',
      explanation: 'Adds when (at night) and why (to warn their owners), plus extra details for a richer sentence.',
    },
  },

  'fragment-or-sentence': {
    id: 'fragment-or-sentence',
    name: 'Fragment or Sentence',
    description: 'Identify and fix sentence fragments.',
    category: 'sentence',
    status: 'available',
    phaseDurations: { reviewPhase: 1, writePhase: 3, revisePhase: 2 },
    instruction: 'Turn the fragment into a complete sentence by adding the missing parts.',
    prompts: [
      {
        id: 'fos-1',
        prompt: 'Fix this fragment: "under the bright lights"',
        hint: 'Add a subject and verb to make it complete. Who or what is under the lights?',
      },
      {
        id: 'fos-2',
        prompt: 'Fix this fragment: "running through the park"',
        hint: 'Who is running? Add a subject to complete the sentence.',
      },
      {
        id: 'fos-3',
        prompt: 'Fix this fragment: "because they move quickly"',
        hint: 'This needs a main clause. What happens because they move quickly?',
      },
      {
        id: 'fos-4',
        prompt: 'Fix this fragment: "after finishing homework"',
        hint: 'What happens after finishing homework? Add an independent clause.',
      },
      {
        id: 'fos-5',
        prompt: 'Fix this fragment: "through the dark forest"',
        hint: 'Add a subject and verb. Who or what went through the forest?',
      },
      {
        id: 'fos-6',
        prompt: 'Fix this fragment: "if the weather improves"',
        hint: 'This is a condition. What will happen if the weather improves?',
      },
    ],
    exampleResponse: {
      prompt: 'Fix: "during warm summer months"',
      response: 'During warm summer months, many families travel to the beach.',
      explanation: 'Adds an independent clause (many families travel to the beach) to complete the sentence.',
    },
  },
};

