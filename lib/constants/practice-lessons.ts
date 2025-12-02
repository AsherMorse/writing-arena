/**
 * @fileoverview Practice mode lesson definitions and configuration.
 * Contains lesson metadata, prompt variations, and scoring constants.
 */

export type LessonCategory = 'sentence' | 'paragraph' | 'essay';
export type LessonStatus = 'available' | 'coming-soon';

/**
 * @description A prompt variation for a lesson.
 */
export interface LessonPrompt {
  id: string;
  /** The prompt/question shown to the student */
  prompt: string;
  /** For conjunction lessons: which conjunction is being tested */
  conjunction?: 'because' | 'but' | 'so';
  /** For appositive lessons: the noun phrase to use */
  nounPhrase?: string;
  /** Optional hint text */
  hint?: string;
}

/**
 * @description Definition of a practice lesson.
 */
export interface PracticeLesson {
  id: string;
  name: string;
  description: string;
  category: LessonCategory;
  status: LessonStatus;
  /** Duration in minutes for each phase (order: review → write → revise) */
  phaseDurations: {
    reviewPhase: number; // Review examples first (I Do/We Do)
    writePhase: number;  // Independent writing (You Do)
    revisePhase: number; // Revision with feedback (You Do Better)
  };
  /** Available prompts for this lesson */
  prompts: LessonPrompt[];
  /** Short instruction shown during the session */
  instruction: string;
  /** Example of a good response (shown in sidebar) */
  exampleResponse?: {
    prompt: string;
    response: string;
    explanation: string;
  };
}

/**
 * @description Mastery threshold (90% = mastered)
 */
export const MASTERY_THRESHOLD = 90;

/**
 * @description Default phase durations in minutes for practice sessions.
 * Order: Review (1 min) → Write (3 min) → Revise (2 min)
 */
export const PRACTICE_PHASE_DURATIONS = {
  reviewPhase: 1, // Review examples first
  writePhase: 3,  // Independent writing
  revisePhase: 2, // Revision with feedback
} as const;

/**
 * @description LP rewards based on score (for non-mastered lessons only)
 */
export const PRACTICE_LP_REWARDS: Record<string, number> = {
  'perfect': 15,    // 100%
  'excellent': 12,  // 90-99%
  'good': 8,        // 80-89%
  'passing': 5,     // 70-79%
  'needs-work': 2,  // 60-69%
  'incomplete': 0,  // <60%
};

/**
 * @description Calculate LP based on score (returns 0 if already mastered)
 */
export function calculatePracticeLP(score: number, isMastered: boolean): number {
  if (isMastered) return 0;
  
  if (score === 100) return PRACTICE_LP_REWARDS['perfect'];
  if (score >= 90) return PRACTICE_LP_REWARDS['excellent'];
  if (score >= 80) return PRACTICE_LP_REWARDS['good'];
  if (score >= 70) return PRACTICE_LP_REWARDS['passing'];
  if (score >= 60) return PRACTICE_LP_REWARDS['needs-work'];
  return PRACTICE_LP_REWARDS['incomplete'];
}

/**
 * @description Check if a score achieves mastery
 */
export function checkMastery(score: number): boolean {
  return score >= MASTERY_THRESHOLD;
}

/**
 * @description All practice lessons (MVP: 2 lessons, rest coming soon)
 */
export const PRACTICE_LESSONS: Record<string, PracticeLesson> = {
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

  // Coming soon lessons (V1)
  'subordinating-conjunctions': {
    id: 'subordinating-conjunctions',
    name: 'Subordinating Conjunctions',
    description: 'Connect clauses using words like although, when, and because.',
    category: 'sentence',
    status: 'coming-soon',
    phaseDurations: { reviewPhase: 1, writePhase: 3, revisePhase: 2 },
    instruction: 'Complete the sentence using a subordinating conjunction.',
    prompts: [],
  },

  'kernel-expansion': {
    id: 'kernel-expansion',
    name: 'Sentence Expansion',
    description: 'Expand simple sentences by adding details and descriptions.',
    category: 'sentence',
    status: 'coming-soon',
    phaseDurations: { reviewPhase: 1, writePhase: 3, revisePhase: 2 },
    instruction: 'Expand the kernel sentence by adding details.',
    prompts: [],
  },

  'fragment-or-sentence': {
    id: 'fragment-or-sentence',
    name: 'Fragment or Sentence',
    description: 'Identify and fix sentence fragments.',
    category: 'sentence',
    status: 'coming-soon',
    phaseDurations: { reviewPhase: 1, writePhase: 3, revisePhase: 2 },
    instruction: 'Identify if this is a fragment and fix it if needed.',
    prompts: [],
  },

  'topic-sentence': {
    id: 'topic-sentence',
    name: 'Topic Sentences',
    description: 'Write clear topic sentences for paragraphs.',
    category: 'paragraph',
    status: 'coming-soon',
    phaseDurations: { reviewPhase: 1, writePhase: 4, revisePhase: 2 },
    instruction: 'Write a topic sentence for the given paragraph details.',
    prompts: [],
  },

  'transition-words': {
    id: 'transition-words',
    name: 'Transition Words',
    description: 'Use transition words to connect ideas smoothly.',
    category: 'paragraph',
    status: 'coming-soon',
    phaseDurations: { reviewPhase: 1, writePhase: 4, revisePhase: 2 },
    instruction: 'Add appropriate transition words to connect the sentences.',
    prompts: [],
  },
};

/**
 * @description Get all available lessons (not coming soon)
 */
export function getAvailableLessons(): PracticeLesson[] {
  return Object.values(PRACTICE_LESSONS).filter(l => l.status === 'available');
}

/**
 * @description Get lessons by category
 */
export function getLessonsByCategory(category: LessonCategory): PracticeLesson[] {
  return Object.values(PRACTICE_LESSONS).filter(l => l.category === category);
}

/**
 * @description Get a specific lesson by ID
 */
export function getLesson(lessonId: string): PracticeLesson | undefined {
  return PRACTICE_LESSONS[lessonId];
}

/**
 * @description Get a random prompt from a lesson
 */
export function getRandomPrompt(lessonId: string): LessonPrompt | undefined {
  const lesson = PRACTICE_LESSONS[lessonId];
  if (!lesson || lesson.prompts.length === 0) return undefined;
  
  const randomIndex = Math.floor(Math.random() * lesson.prompts.length);
  return lesson.prompts[randomIndex];
}

