/**
 * Mock data generation utilities
 * 
 * ⚠️ WARNING: These functions generate MOCK data with RANDOM scores.
 * They should ONLY be used when the LLM API is unavailable (missing API key or API failure).
 * 
 * In production, ALL scores MUST come from LLM evaluation.
 * Mock data is clearly marked with warnings to indicate LLM API is broken.
 */

import { randomScore } from './random-utils';
import { SCORING } from '@/lib/constants/scoring';
import { countWords } from './text-utils';
import { calculateXPEarned } from './score-calculator';
import { MOCK_WARNINGS } from '@/lib/constants/mock-warnings';

export function generateMockRanking(
  playerId: string,
  playerName: string,
  baseScore: number = SCORING.DEFAULT_WRITING_SCORE
): any {
  const score = randomScore(baseScore, 20);
  return {
    playerId,
    playerName,
    score: Math.min(score, SCORING.MAX_SCORE),
    rank: 0, // Will be set after sorting
    strengths: [MOCK_WARNINGS.RANDOM_SCORE_GENERATED],
    improvements: [
      MOCK_WARNINGS.SET_API_KEY,
      MOCK_WARNINGS.RANDOM_FEEDBACK,
    ],
  };
}

export function generateMockFeedback(baseScore: number = SCORING.DEFAULT_FEEDBACK_SCORE): any {
  return {
    overallScore: randomScore(baseScore, 20),
    strengths: ['🚨 LLM API UNAVAILABLE: Random score generated - not from AI evaluation'],
    improvements: [
      '🚨 LLM API UNAVAILABLE: Set ANTHROPIC_API_KEY to enable real AI scoring',
      '⚠️ This feedback is randomly generated and not based on actual quality',
    ],
  };
}

export function generateMockAIFeedback(): any {
  return {
    strengths: [
      MOCK_WARNINGS.RANDOM_SCORE_GENERATED,
      'Strong opening hook that draws the reader in',
      'Good use of descriptive language and sensory details',
    ],
    improvements: [
      MOCK_WARNINGS.SET_API_KEY,
      MOCK_WARNINGS.RANDOM_FEEDBACK,
      'Consider adding more character development',
      'Add more specific details using the five senses',
    ],
    score: randomScore(SCORING.DEFAULT_FEEDBACK_SCORE, 15),
  };
}

export function generateMockRevisionScore(
  originalContent: string,
  revisedContent: string,
  baseScore: number = SCORING.DEFAULT_REVISION_SCORE
): any {
  const changeAmount = Math.abs(revisedContent.length - originalContent.length);
  const hasSignificantChanges = changeAmount > 50;
  
  const score = hasSignificantChanges 
    ? randomScore(85, 10)
    : randomScore(60, 15);
  
  return {
    score,
    improvements: [
      MOCK_WARNINGS.RANDOM_SCORE_GENERATED,
      MOCK_WARNINGS.SET_API_KEY,
      MOCK_WARNINGS.RANDOM_FEEDBACK,
      'Added more descriptive details',
      'Improved sentence variety',
    ],
    strengths: [
      '⚠️ Enable AI evaluation for real feedback',
      'Applied feedback effectively',
      'Meaningful changes made',
    ],
    suggestions: [
      'Could combine more short sentences',
      'Try adding more transitional phrases',
    ],
  };
}

export function generateMockAIWriting(rank: string): any {
  const skillLevel = getSkillLevelFromRank(rank);
  
  const mockWritings: Record<string, string> = {
    beginner: `The lighthouse was old and scary. I went inside becuase I was curios. There was a chest that was glowing I wonder what was in it. It was really intresting.`,
    intermediate: `The old lighthouse stood on teh cliff. I walked past it before but today was different. The door was open and I could see a golden light inside. I decided to go in, I couldnt beleive what I saw.`,
    proficient: `The weathered lighthouse had always intrigued me, standing on the rocky cliff. For years, its door remained locked. But today, as I walked my usual path, I noticed something different—the door stood ajar, and a mysterious golden light spilled out. My curiosity overcame my caution and I stepped inside.`,
  };
  
  const content = mockWritings[skillLevel] || mockWritings.intermediate;
  const wordCount = countWords(content);
  
  return {
    content,
    wordCount,
  };
}

function getSkillLevelFromRank(rank: string | number | unknown): string {
  const rankStr = String(rank ?? 'Silver III');
  if (rankStr.includes('Bronze')) return 'beginner';
  if (rankStr.includes('Silver')) return 'intermediate';
  if (rankStr.includes('Gold')) return 'proficient';
  if (rankStr.includes('Platinum')) return 'advanced';
  return 'intermediate';
}

/**
 * Generate mock practice feedback
 */
export function generateMockPracticeFeedback(wordCount: number): any {
  const base = Math.min(100, Math.max(45, 60 + wordCount / 8));
  return {
    overallScore: Math.round(base),
    xpEarned: calculateXPEarned(base, 'practice'),
    traits: {
      content: Math.round(base + Math.random() * 10 - 5),
      organization: Math.round(base + Math.random() * 10 - 5),
      grammar: Math.round(base + Math.random() * 10 - 5),
      vocabulary: Math.round(base + Math.random() * 10 - 5),
      mechanics: Math.round(base + Math.random() * 10 - 5),
    },
    strengths: [
      'Clear main idea anchored your draft.',
      'Specific examples made the message concrete.',
      'Paragraph order helped readers follow.',
    ],
    improvements: [
      'Add transitions to smooth shifts between ideas.',
      'Vary sentence openings to avoid repetition.',
      'Double-check punctuation on compound sentences.',
    ],
    specificFeedback: {
      content: 'Stay focused on the prompt; add one more supporting detail next time.',
      organization: 'Consider transition words like furthermore or however to guide readers.',
      grammar: 'Watch comma placement in longer sentences.',
      vocabulary: 'Swap general verbs for precise action words.',
      mechanics: 'Proofread for capitalization and ending punctuation.',
    },
    nextSteps: [
      'Practice a descriptive prompt to stretch vocabulary.',
      'Rewrite one paragraph using sentence combining.',
      'Use because/but/so to expand key ideas.',
    ],
  };
}

/**
 * Generate mock quick match results
 */
export function generateMockQuickMatchResults(
  wordCount: number, 
  aiScores: number[],
  yourScore?: number
): any {
  const fallbackScore = yourScore || Math.min(Math.max(60 + wordCount / 5, 40), 100);
  
  const allPlayers = [
    { name: 'You', avatar: '🌿', score: Math.round(fallbackScore), wordCount, isYou: true },
    { name: 'WriteBot', avatar: '🤖', score: Math.round(60 + Math.random() * 30), wordCount: aiScores[0] || 0, isYou: false },
    { name: 'PenPal AI', avatar: '✍️', score: Math.round(65 + Math.random() * 25), wordCount: aiScores[1] || 0, isYou: false },
    { name: 'WordSmith', avatar: '📝', score: Math.round(55 + Math.random() * 35), wordCount: aiScores[2] || 0, isYou: false },
    { name: 'QuillMaster', avatar: '🖋️', score: Math.round(60 + Math.random() * 30), wordCount: aiScores[3] || 0, isYou: false },
  ];
  
  return allPlayers;
}

// ============================================================================
// MOCK DATA FOR COMPONENTS
// ============================================================================

/**
 * Mock peer writings for fallback when peer data is unavailable
 */
export const MOCK_PEER_WRITINGS = [
  {
    id: 'peer1',
    author: 'ProWriter99',
    avatar: '🎯',
    rank: 'Silver II',
    content: `The old lighthouse stood sentinel on the rocky cliff, its weathered stones telling stories of countless storms. Sarah had passed it every day on her way to school, never giving it much thought. But today was different. Today, the rusty door that had always been locked stood slightly ajar, and a mysterious golden light spilled from within.

Her curiosity got the better of her. She pushed the door open and stepped inside. The circular room was dusty and filled with old equipment, but in the center sat an ornate wooden chest she'd never seen before. As she approached, the chest began to glow...`,
    wordCount: 112
  },
  {
    id: 'peer2',
    author: 'WordMaster',
    avatar: '📖',
    rank: 'Silver III',
    content: `It was a normal Tuesday morning. I woke up, got dressed, and went to school like always. Nothing interesting ever happens in my small town. But then something weird happened.

At lunch, I found a strange coin in my sandwich. It was old and had weird symbols on it. When I touched it, everything around me started to shimmer and change. Suddenly I wasn't in the cafeteria anymore.

I was standing in a forest I'd never seen before. There were trees everywhere and strange birds singing. I had no idea how I got there or how to get back home.`,
    wordCount: 104
  }
];

/**
 * Mock AI feedback for fallback
 */
export const MOCK_AI_FEEDBACK = {
  strengths: [
    "Strong opening hook that draws the reader in",
    "Good use of descriptive language and sensory details",
    "Clear narrative structure with a beginning, middle, and setup for continuation"
  ],
  improvements: [
    "Consider adding more character development - what does Sarah look like? What are her motivations?",
    "The pacing could be slower to build more tension before discovering the chest",
    "Add more specific details about the lighthouse's interior to create atmosphere"
  ],
  score: 78
};

/**
 * Mock phase feedback based on The Writing Revolution concepts
 */
export const MOCK_PHASE_FEEDBACK = {
  writing: {
    strengths: [
      'Clear topic sentence establishes the main idea',
      'Good use of transition words (First, Then, Finally)',
      'Concrete details support your points'
    ],
    improvements: [
      'Try expanding sentences with because/but/so to show deeper thinking',
      'Add more specific details - use the five senses (what did you see, hear, feel?)',
      'Consider using an appositive to add description (e.g., "The lighthouse, an ancient stone tower, stood...")'
    ],
    writingRevConcepts: [
      'Sentence expansion: Practice combining short sentences',
      'Note-taking: Organize ideas before writing',
      'Single Paragraph Outline (SPO): Use topic sentence + supporting details + conclusion'
    ]
  },
  feedback: {
    strengths: [
      'You identified specific strengths in your peer\'s writing',
      'Suggestions were constructive and actionable',
      'Good attention to organization and structure'
    ],
    improvements: [
      'Be more specific about which sentences worked well and why',
      'Reference Writing Revolution strategies (sentence combining, transitions)',
      'Suggest concrete revision strategies, not just general comments'
    ],
    writingRevConcepts: [
      'Analyzing sentence structure: Look for fragments or run-ons',
      'Evaluating transitions: Check if ideas connect logically',
      'Assessing paragraph structure: Topic sentence + evidence + conclusion'
    ]
  },
  revision: {
    strengths: [
      'Applied peer feedback by adding descriptive details',
      'Improved sentence variety and complexity',
      'Better use of transitional phrases'
    ],
    improvements: [
      'Could combine more short sentences for better flow',
      'Add subordinating conjunctions (although, since, while) for complexity',
      'Use appositives to add information without new sentences'
    ],
    writingRevConcepts: [
      'Revision vs. Editing: Focus on ideas first, grammar later',
      'Sentence combining: Join related ideas',
      'Adding conjunctions: Use FANBOYS (for, and, nor, but, or, yet, so) and subordinating conjunctions'
    ]
  }
};

