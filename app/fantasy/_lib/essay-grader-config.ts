export type CriterionStatus = 'yes' | 'developing' | 'no';

export interface EssayCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
}

export interface EssayCriterionResult {
  criterionId: string;
  status: CriterionStatus;
  feedback: string;
  highlights?: string[];
}

export const HIGHLIGHTABLE_CRITERIA = ['thesis', 'topicSentences', 'supportingDetails', 'transitions', 'conclusion'];

export interface EssayScores {
  thesis: number;
  topicSentences: number;
  supportingDetails: number;
  unity: number;
  transitions: number;
  conclusion: number;
  sentenceStrategies: number;
  conventions: number;
  paragraphCount: number;
  total: number;
  maxTotal: number;
  percentage: number;
}

export interface EssayGraderResult {
  isCorrect: boolean;
  criteria: EssayCriterionResult[];
  scores: EssayScores;
  paragraphCount: number;
}

export const ESSAY_CRITERIA: EssayCriterion[] = [
  {
    id: 'thesis',
    name: 'Thesis Statement',
    description: 'Clear main idea that guides the entire essay',
    weight: 1,
  },
  {
    id: 'topicSentences',
    name: 'Topic Sentences',
    description: 'Each body paragraph has a clear topic sentence',
    weight: 1,
  },
  {
    id: 'supportingDetails',
    name: 'Supporting Details',
    description: 'Details in each paragraph support their topic sentence',
    weight: 1,
  },
  {
    id: 'unity',
    name: 'Essay Unity',
    description: 'All paragraphs support the thesis',
    weight: 1,
  },
  {
    id: 'transitions',
    name: 'Transitions',
    description: 'Correct use of transition words between and within paragraphs',
    weight: 1,
  },
  {
    id: 'conclusion',
    name: 'Conclusion',
    description: 'Effective conclusion that wraps up without just repeating the thesis',
    weight: 1,
  },
  {
    id: 'sentenceStrategies',
    name: 'Sentence Strategies',
    description: 'Variety in sentence structure (conjunctions, appositives, etc.)',
    weight: 1,
  },
  {
    id: 'conventions',
    name: 'Conventions',
    description: 'Grammar, spelling, and punctuation',
    weight: 1,
  },
  {
    id: 'paragraphCount',
    name: 'Minimum Paragraphs',
    description: 'At least 4 paragraphs (intro, 2+ body, conclusion)',
    weight: 1,
  },
];

export const MINIMUM_PARAGRAPHS = 4;

export interface EssayGraderConfig {
  nameOfActivity: string;
  goalForThisExercise: {
    primaryGoal: string;
    secondaryGoals: string[];
  };
  howTheActivityWorks: string;
  gradeAppropriateConsiderations: {
    level1: string;
    level2: string;
  };
  importantPrinciplesForGrading: string[];
  commonMistakesToAnticipate: Array<{
    mistake: string;
    explanation: string;
    example?: string;
  }>;
  positiveExamples: Array<{
    example: string;
    explainer: string;
  }>;
  negativeExamples: Array<{
    example: string;
    explainer: string;
  }>;
}

export const ESSAY_GRADER_CONFIG: EssayGraderConfig = {
  nameOfActivity: 'Expository Essay Writing',
  goalForThisExercise: {
    primaryGoal:
      'Help students compose a well-structured multi-paragraph expository essay that develops a thesis using TWR strategies.',
    secondaryGoals: [
      'Practice writing clear thesis statements that guide the essay',
      'Develop body paragraphs with topic sentences and supporting details',
      'Use transitions effectively between and within paragraphs',
      'Craft conclusions that synthesize rather than repeat',
      'Apply sentence strategies for variety and sophistication',
      'Maintain essay unity with all paragraphs supporting the thesis',
    ],
  },
  howTheActivityWorks: [
    'The student is given a writing prompt that asks them to explain, describe, or persuade about a topic.',
    'The student writes a multi-paragraph essay (minimum 4 paragraphs) that includes:',
    '  - An introduction with a clear thesis statement',
    '  - Body paragraphs each with a topic sentence and supporting details',
    '  - A conclusion that wraps up the essay',
    'The essay is evaluated on structure, thesis development, paragraph unity, transitions, and conventions.',
  ].join('\n'),
  gradeAppropriateConsiderations: {
    level1:
      'For grades 4-6: Accept simpler thesis statements and basic paragraph structure. Focus on whether paragraphs have topic sentences and relate to the thesis. Be lenient on transition sophistication.',
    level2:
      'For grades 7-9: Expect more developed thesis statements with clear reasoning. Look for specific supporting details and smooth transitions. Conclusions should synthesize ideas, not just repeat the thesis.',
  },
  importantPrinciplesForGrading: [
    '1. THESIS STATEMENT: Must clearly state the main argument or idea. Should appear in the introduction and preview the essay content.',
    '2. TOPIC SENTENCES: Each body paragraph needs a clear topic sentence that supports the thesis and previews that paragraph.',
    '3. SUPPORTING DETAILS: Details must directly support their topic sentence. Look for specific examples, evidence, or explanations.',
    '4. ESSAY UNITY: All paragraphs must connect to and support the thesis. Off-topic paragraphs break unity.',
    '5. TRANSITIONS: Between paragraphs (Furthermore, In contrast, Similarly) and within paragraphs. Ideas should flow logically.',
    '6. CONCLUSION: Should synthesize the main points and leave a final impression. Should NOT just copy the thesis.',
    '7. SENTENCE STRATEGIES: Look for variety - compound sentences, subordinating conjunctions, appositives.',
    '8. CONVENTIONS: Grammar, spelling, punctuation. Minor errors are nits; errors affecting clarity are significant.',
    '9. PARAGRAPH COUNT: Minimum 4 paragraphs for grades 6-8 (intro, 2+ body, conclusion).',
    '10. Be encouraging and specific. Guide improvement without writing for them.',
  ],
  commonMistakesToAnticipate: [
    {
      mistake: 'Thesis is too vague or just announces the topic',
      explanation: 'Students often write "I will tell you about X" instead of making a clear claim.',
      example: 'Bad: "This essay is about dogs." Good: "Dogs make excellent pets because of their loyalty, companionship, and ability to improve mental health."',
    },
    {
      mistake: 'Body paragraphs lack topic sentences',
      explanation: 'Students jump into details without stating what the paragraph is about.',
      example: 'Starting a paragraph with "Also, they are fluffy" instead of "One reason dogs make great pets is their comforting presence."',
    },
    {
      mistake: 'Supporting details do not support the topic sentence',
      explanation: 'Details may be interesting but do not connect to the paragraph\'s main idea.',
      example: 'Topic sentence about loyalty, but details discuss how much dogs eat.',
    },
    {
      mistake: 'Conclusion just restates the thesis',
      explanation: 'Instead of synthesizing ideas, students copy their introduction.',
      example: 'Ending with the exact same sentence as the thesis without new insight.',
    },
    {
      mistake: 'Missing transitions between paragraphs',
      explanation: 'Paragraphs feel disconnected without words showing relationships.',
      example: 'Jumping from one body paragraph to another without any transitional phrase.',
    },
    {
      mistake: 'Too few paragraphs',
      explanation: 'Writing everything in 1-2 paragraphs instead of organizing into proper essay structure.',
      example: 'A long block of text without paragraph breaks.',
    },
  ],
  positiveExamples: [
    {
      example: `Dogs make wonderful companions for people of all ages. They provide unconditional love, encourage physical activity, and can even improve mental health. For these reasons, dogs are often called "man's best friend."

One of the most important qualities of dogs is their loyalty. Dogs form strong bonds with their owners and are always excited to see them come home. This constant affection helps people feel valued and loved. Furthermore, dogs remember their owners even after long separations, showing remarkable dedication.

In addition to loyalty, dogs encourage their owners to stay active. Walking a dog several times a day provides regular exercise that many people would not otherwise get. Playing fetch or running in the park with a dog makes exercise fun rather than a chore. As a result, dog owners often have better physical health.

Perhaps most importantly, dogs can significantly improve mental health. Studies have shown that petting a dog reduces stress and lowers blood pressure. For people who feel lonely, a dog provides constant companionship. Many therapy programs now use dogs to help people with anxiety and depression.

In conclusion, dogs earn their reputation as excellent companions through their loyalty, their encouragement of physical activity, and their positive effect on mental health. Whether providing comfort after a hard day or motivation to go for a walk, dogs enrich the lives of their owners in countless ways.`,
      explainer: 'This essay has a clear thesis with three points, topic sentences for each body paragraph, specific supporting details, smooth transitions, and a conclusion that synthesizes rather than repeats.',
    },
  ],
  negativeExamples: [
    {
      example: `This essay is about dogs. Dogs are good pets. I like dogs because they are fun. My dog is named Max. He likes to play. Dogs are fluffy and nice. You should get a dog. Dogs are the best.`,
      explainer: 'This lacks a real thesis, has no paragraph structure, provides no specific supporting details, uses no transitions, and has no proper conclusion. It reads as a list of statements rather than a developed essay.',
    },
  ],
};
