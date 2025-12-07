export type ErrorSeverity = 'error' | 'nit';

export interface GraderRemark {
  type: 'issue';
  severity: ErrorSeverity;
  category: string;
  concreteProblem: string;
  callToAction: string;
  substringOfInterest?: string;
}

export interface GraderResult {
  isCorrect: boolean;
  remarks: GraderRemark[];
  scores: {
    topicSentence: number;
    detailSentences: number;
    concludingSentence: number;
    conventions: number;
    total: number;
    maxTotal: number;
    percentage: number;
  };
}

export interface GraderConfig {
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
  formatRequirements: Array<{
    requirement: string;
    correctExample?: string;
    incorrectExample?: string;
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

export const PARAGRAPH_GRADER_CONFIG: GraderConfig = {
  nameOfActivity: 'Single Paragraph Writing',
  goalForThisExercise: {
    primaryGoal:
      'Help students compose a well-structured expository paragraph that clearly expresses and supports a main idea using TWR strategies.',
    secondaryGoals: [
      'Practice writing clear, focused topic sentences that address the prompt',
      'Develop supporting details with varied sentence structures and transitions',
      'Craft effective concluding sentences that summarize or extend the main idea',
      'Apply grammar and mechanics conventions appropriately',
      'Use TWR sentence strategies: because/but/so, appositives, subordinating conjunctions',
    ],
  },
  howTheActivityWorks: [
    'The student is given a writing prompt that asks them to explain, describe, or persuade about a topic.',
    'The student writes a single paragraph (typically 5-8 sentences) that includes:',
    '  - A topic sentence that states the main idea',
    '  - Supporting detail sentences that develop the idea',
    '  - A concluding sentence that wraps up the paragraph',
    'The paragraph is evaluated on structure, content relevance, sentence variety, and conventions.',
  ].join('\n'),
  gradeAppropriateConsiderations: {
    level1:
      'For grades 4-6: Accept simpler sentence structures. Focus on whether the basic paragraph structure is present (topic sentence, details, conclusion). Be lenient on word choice sophistication. Value any attempt at using transitions or sentence variety.',
    level2:
      'For grades 7-9: Expect more developed details and clearer connections between ideas. Look for varied sentence structures and effective transitions. Word choice should be appropriate to the topic. Conventions should be mostly correct.',
  },
  importantPrinciplesForGrading: [
    '1. TOPIC SENTENCE: Must clearly state the main idea and address the prompt directly. A strong topic sentence previews what the paragraph will discuss.',
    "2. SUPPORTING DETAILS: Each detail sentence should directly support the topic sentence. Details should be specific, not vague. Look for logical ordering (chronological, importance, etc.) and transitions between ideas.",
    '3. CONCLUDING SENTENCE: Should restate or extend the main idea WITHOUT just copying the topic sentence. A strong conclusion leaves the reader with a clear takeaway.',
    '4. SENTENCE VARIETY: Look for use of TWR strategies: compound sentences with because/but/so, appositives, subordinating conjunctions (although, since, while, when). Variety makes writing more engaging.',
    '5. TRANSITIONS: Effective paragraphs use transition words (First, Furthermore, However, Therefore, In conclusion) to connect ideas logically.',
    '6. CONVENTIONS: Grammar, spelling, punctuation, and capitalization. Minor errors that do not impede understanding are nits. Errors that confuse meaning are errors.',
    '7. PROMPT RELEVANCE: The entire paragraph must address the given prompt. Off-topic content is a significant issue.',
    '8. Be encouraging and specific in feedback. Point to exact text when noting issues.',
  ],
  commonMistakesToAnticipate: [
    {
      mistake: 'Topic sentence is too vague or does not address the prompt',
      explanation:
        'Students often write generic statements that could apply to any topic instead of directly addressing the prompt.',
      example:
        'Prompt: "What is your favorite season?" Response starts with: "There are many seasons."',
    },
    {
      mistake: 'Details do not support the topic sentence',
      explanation:
        'Students may include interesting but irrelevant information that does not connect to their main idea.',
      example:
        'Topic sentence about why summer is great, but details discuss what happened at school.',
    },
    {
      mistake: 'Concluding sentence just repeats the topic sentence',
      explanation:
        'Students often copy their topic sentence word-for-word instead of restating or extending the idea.',
      example:
        'Topic: "Dogs make great pets." Conclusion: "Dogs make great pets."',
    },
    {
      mistake: 'No transitions between ideas',
      explanation:
        'Sentences feel choppy and disconnected without transition words to show relationships.',
      example:
        '"I like summer. It is warm. I can swim." (missing First, Also, Furthermore, etc.)',
    },
    {
      mistake: 'Run-on sentences or fragments',
      explanation:
        'Students combine too many ideas without proper punctuation or write incomplete thoughts.',
      example:
        'Run-on: "I like pizza it is delicious I eat it every day." Fragment: "Because it is fun."',
    },
    {
      mistake: 'All simple sentences with no variety',
      explanation:
        'Using only subject-verb-object patterns makes writing monotonous.',
      example:
        '"I like dogs. Dogs are fun. Dogs are loyal." (no compound or complex sentences)',
    },
  ],
  formatRequirements: [
    {
      requirement: 'Paragraph must have a clear topic sentence, typically as the first sentence',
      correctExample:
        'Summer is my favorite season because of the warm weather, outdoor activities, and time with friends.',
      incorrectExample:
        'I am going to write about summer now. (announces instead of stating main idea)',
    },
    {
      requirement: 'Paragraph must include at least 3 supporting detail sentences',
      correctExample:
        '(After topic sentence) First, the warm weather allows me to spend time outside. Furthermore, I enjoy swimming at the local pool. Additionally, summer break gives me time to see friends.',
      incorrectExample: '(After topic sentence) Summer is fun. I like it.',
    },
    {
      requirement: 'Paragraph must end with a concluding sentence that wraps up the main idea',
      correctExample:
        'In conclusion, summer offers the perfect combination of warmth, activities, and friendship.',
      incorrectExample: 'The end. (not a real conclusion)',
    },
    {
      requirement: 'Sentences should use proper capitalization and end punctuation',
      correctExample: 'First, I enjoy playing sports.',
      incorrectExample: 'first i enjoy playing sports',
    },
  ],
  positiveExamples: [
    {
      example:
        'Summer is my favorite season for several reasons. First, the warm weather allows me to spend time outside playing sports with my friends. Furthermore, I love swimming at the community pool, which helps me stay cool on hot days. Additionally, summer break from school gives me the opportunity to visit my grandparents in another state. In conclusion, the combination of great weather, fun activities, and family time makes summer the best time of year.',
      explainer:
        'This paragraph has a clear topic sentence with a preview of reasons, uses transition words (First, Furthermore, Additionally, In conclusion), includes specific supporting details, and ends with a strong concluding sentence that restates the main idea in a fresh way.',
    },
    {
      example:
        'My school should extend recess time because it benefits students in multiple ways. Students who have longer breaks are more focused when they return to class, since they have had time to release their energy. Additionally, recess provides important social time where students can build friendships and practice cooperation. Although some people worry about losing class time, research shows that students actually learn better with more breaks. Therefore, extending recess would improve both student well-being and academic performance.',
      explainer:
        'This paragraph demonstrates strong argumentation with a clear claim, uses subordinating conjunctions (since, Although), addresses a counterargument, and includes varied sentence structures. The conclusion ties back to the topic sentence effectively.',
    },
  ],
  negativeExamples: [
    {
      example:
        'I like summer. It is hot. I go swimming. I see my friends. Summer is fun. I like summer.',
      explainer:
        'This response lacks a proper topic sentence that previews the paragraph. All sentences are simple with no variety. There are no transitions connecting ideas. The conclusion just repeats the opening without adding insight. Details are vague ("it is fun") instead of specific.',
    },
    {
      example:
        'There are many seasons in the year. Spring, summer, fall, and winter are the four seasons. Each season has different weather. I learned about seasons in science class last year. My teacher was nice.',
      explainer:
        'This response does not address the prompt directly (asking about favorite season). It includes off-topic information (science class, teacher). There is no clear main idea or supporting argument. The paragraph lacks focus and structure.',
    },
  ],
};

