/**
 * @fileoverview Review examples for sentence-level lessons (Tier 1).
 * Extracted from AlphaWrite test data.
 */

import { ReviewExample } from './types';

/**
 * @description Review examples for Because/But/So activity.
 * Students review these AI-generated completions and identify issues.
 */
export const BASIC_CONJUNCTIONS_EXAMPLES: ReviewExample[] = [
  // Correct examples
  {
    question: 'The dog barked loudly because _____',
    answer: 'it saw the mailman coming.',
    isCorrect: true,
    explanation: 'Shows clear cause-and-effect relationship - the dog barked because it saw something.',
    topic: 'animals',
  },
  {
    question: 'She studied hard for the test, but _____',
    answer: 'the questions were harder than expected.',
    isCorrect: true,
    explanation: 'Shows valid contrast - studying hard vs. difficult questions.',
    topic: 'school',
  },
  {
    question: 'The weather forecast predicted rain, so _____',
    answer: 'we decided to have the picnic indoors.',
    isCorrect: true,
    explanation: 'Shows logical consequence - rain prediction led to indoor plans.',
    topic: 'weather',
  },
  // Incorrect examples for students to identify
  {
    question: 'The store was crowded, but _____',
    answer: 'my house will be hot tomorrow.',
    isCorrect: false,
    explanation: 'Non-sequitur: introduces unrelated topic instead of contrasting something about the store.',
    topic: 'shopping',
  },
  {
    question: 'The computer stopped working because _____',
    answer: 'old and broken.',
    isCorrect: false,
    explanation: 'Fragment: not a complete clause, missing subject and verb structure.',
    topic: 'technology',
  },
  {
    question: 'The teacher assigned homework, but _____',
    answer: 'pizza is my favorite food.',
    isCorrect: false,
    explanation: 'Off-topic: introduces completely unrelated information instead of showing contrast about homework.',
    topic: 'school',
  },
];

/**
 * @description Review examples for Write Appositives activity.
 * Students review these AI-generated sentences and identify appositive usage.
 */
export const WRITE_APPOSITIVES_EXAMPLES: ReviewExample[] = [
  // Correct examples
  {
    question: 'Write a sentence using "my neighbor" as an appositive.',
    answer: 'Sarah, my neighbor, shared her homemade jam with me.',
    isCorrect: true,
    explanation: 'Correctly uses the phrase as an appositive set off by commas.',
    topic: 'community',
  },
  {
    question: 'Write a sentence using "a skilled surgeon" as an appositive.',
    answer: 'A skilled surgeon, Dr. Perkins saved many lives during the war.',
    isCorrect: true,
    explanation: 'Correctly places appositive at the beginning, followed by a comma.',
    topic: 'careers',
  },
  {
    question: 'Write a sentence using "a talented musician" as an appositive.',
    answer: 'My brother, a talented musician, plays in a band.',
    isCorrect: true,
    explanation: 'Correctly uses commas to set off the appositive in the middle of the sentence.',
    topic: 'music',
  },
  // Incorrect examples for students to identify
  {
    question: 'Write a sentence using "my sister" as an appositive.',
    answer: 'My sister Emily is coming to dinner.',
    isCorrect: false,
    explanation: 'Missing commas: needs commas around "my sister" to make it a proper appositive.',
    topic: 'family',
  },
  {
    question: 'Write a sentence using "a fast runner" as an appositive.',
    answer: 'Tom a fast runner won the race yesterday.',
    isCorrect: false,
    explanation: 'Missing commas: the appositive "a fast runner" needs to be set off by commas.',
    topic: 'sports',
  },
];

/**
 * @description Review examples for Subordinating Conjunctions activity.
 * Students review sentences with subordinating conjunctions.
 */
export const SUBORDINATING_CONJUNCTIONS_EXAMPLES: ReviewExample[] = [
  // Correct examples
  {
    question: 'Complete the sentence: "Although the weather was cold, _____"',
    answer: 'we wore warm jackets.',
    isCorrect: true,
    explanation: 'Shows valid contrast - despite cold weather, appropriate action was taken.',
    topic: 'weather',
  },
  {
    question: 'Complete the sentence: "Before we eat dinner, _____"',
    answer: 'we wash our hands.',
    isCorrect: true,
    explanation: 'Shows logical time sequence - hand washing happens before eating.',
    topic: 'daily routine',
  },
  {
    question: 'Complete the sentence: "When the bell rings, _____"',
    answer: 'everyone packs their bags.',
    isCorrect: true,
    explanation: 'Shows clear cause-and-effect with time conjunction.',
    topic: 'school',
  },
  {
    question: 'Write a sentence about soccer using "when".',
    answer: 'When the referee blows the whistle, the soccer game begins.',
    isCorrect: true,
    explanation: 'Uses "when" correctly to show time relationship.',
    topic: 'sports',
  },
  // Incorrect examples
  {
    question: 'Complete the sentence: "Although the movie was long, _____"',
    answer: 'watching it.',
    isCorrect: false,
    explanation: 'Fragment: "watching it" is not a complete clause with a subject and verb.',
    topic: 'entertainment',
  },
  {
    question: 'Complete the sentence: "Before the game started, _____"',
    answer: 'the sun went down yesterday.',
    isCorrect: false,
    explanation: 'Non-sequitur: the completion has nothing to do with the game starting.',
    topic: 'sports',
  },
  {
    question: 'Write a sentence about cats using "although".',
    answer: 'Cats are cute and fluffy pets.',
    isCorrect: false,
    explanation: 'Missing subordinating conjunction: "although" was not used in the sentence.',
    topic: 'pets',
  },
];

/**
 * @description Review examples for Kernel Expansion activity.
 * Students review expanded sentences and identify good vs poor expansions.
 */
export const KERNEL_EXPANSION_EXAMPLES: ReviewExample[] = [
  // Correct examples
  {
    question: 'Expand the kernel sentence "Birds sing." by adding who and where.',
    answer: 'Robins and sparrows sing in the trees every morning.',
    isCorrect: true,
    explanation: 'Adds who (robins and sparrows) and where (in the trees) while keeping the original meaning.',
    topic: 'nature',
  },
  {
    question: 'Expand the kernel sentence "Students read." by adding when and why.',
    answer: 'Students read during library time to learn new things.',
    isCorrect: true,
    explanation: 'Adds when (during library time) and why (to learn new things).',
    topic: 'education',
  },
  {
    question: 'Expand the kernel sentence "Flowers bloom." by adding where and when.',
    answer: 'Flowers bloom in the garden during early spring.',
    isCorrect: true,
    explanation: 'Adds where (in the garden) and when (during early spring).',
    topic: 'nature',
  },
  {
    question: 'Expand the kernel sentence "Children play." by adding who, what, and where.',
    answer: 'The kindergarten students play hopscotch and tag on the playground.',
    isCorrect: true,
    explanation: 'Adds who (kindergarten students), what (hopscotch and tag), and where (playground).',
    topic: 'recreation',
  },
  // Incorrect examples
  {
    question: 'Expand the kernel sentence "Dogs bark." by adding when and why.',
    answer: 'Cats meow at night to get attention.',
    isCorrect: false,
    explanation: 'Changed the subject from dogs to cats - expansion must keep the original kernel meaning.',
    topic: 'pets',
  },
  {
    question: 'Expand the kernel sentence "Cars drive." by adding where and how.',
    answer: 'Cars drive on roads quickly.',
    isCorrect: false,
    explanation: 'Too short: needs more detail to properly expand the sentence.',
    topic: 'transportation',
  },
  {
    question: 'Expand the kernel sentence "Dancers perform." by adding who and where.',
    answer: 'Ballet dancers performs on stage at the theater.',
    isCorrect: false,
    explanation: 'Grammar error: "dancers performs" should be "dancers perform" (subject-verb agreement).',
    topic: 'performing arts',
  },
];

/**
 * @description Review examples for Fragment or Sentence activity.
 * Students identify fragments and review how to fix them.
 */
export const FRAGMENT_OR_SENTENCE_EXAMPLES: ReviewExample[] = [
  // Correct examples (properly fixed fragments)
  {
    question: 'Fix this fragment: "under the bright lights"',
    answer: 'The team performs under the bright lights.',
    isCorrect: true,
    explanation: 'Correctly adds a subject and verb to make a complete sentence.',
    topic: 'sports',
  },
  {
    question: 'Fix this fragment: "running through the park"',
    answer: 'The children were running through the park.',
    isCorrect: true,
    explanation: 'Adds subject (children) and helping verb (were) to complete the sentence.',
    topic: 'activities',
  },
  {
    question: 'Fix this fragment: "after finishing homework"',
    answer: 'After finishing homework, she played video games.',
    isCorrect: true,
    explanation: 'Adds an independent clause to complete the sentence.',
    topic: 'school',
  },
  {
    question: 'Fix this fragment: "if the weather improves"',
    answer: 'We can have a picnic if the weather improves.',
    isCorrect: true,
    explanation: 'Adds an independent clause to complete the conditional sentence.',
    topic: 'activities',
  },
  // Incorrect examples (improperly fixed fragments)
  {
    question: 'Fix this fragment: "while holding a pencil"',
    answer: 'While holding a pencil writes carefully.',
    isCorrect: false,
    explanation: 'Still a fragment: missing a subject. Who writes carefully?',
    topic: 'school',
  },
  {
    question: 'Fix this fragment: "near the flowing rivers"',
    answer: 'The campsite is near the flowing rivers they are very peaceful.',
    isCorrect: false,
    explanation: 'Run-on sentence: two independent clauses joined without proper punctuation.',
    topic: 'nature',
  },
  {
    question: 'Fix this fragment: "between the tall buildings"',
    answer: 'The narrow alley between the tall buildings were dark.',
    isCorrect: false,
    explanation: 'Subject-verb disagreement: "alley" is singular but "were" is plural.',
    topic: 'city',
  },
];

/**
 * @description Map of sentence lesson IDs to their review examples.
 */
export const SENTENCE_EXAMPLES: Record<string, ReviewExample[]> = {
  'basic-conjunctions': BASIC_CONJUNCTIONS_EXAMPLES,
  'write-appositives': WRITE_APPOSITIVES_EXAMPLES,
  'subordinating-conjunctions': SUBORDINATING_CONJUNCTIONS_EXAMPLES,
  'kernel-expansion': KERNEL_EXPANSION_EXAMPLES,
  'fragment-or-sentence': FRAGMENT_OR_SENTENCE_EXAMPLES,
};

