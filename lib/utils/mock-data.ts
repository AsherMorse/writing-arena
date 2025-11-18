/**
 * Mock data generation utilities
 * 
 * Centralized mock data generators for consistent fallback behavior
 * when API key is missing or API calls fail.
 */

import { randomScore } from './random-utils';
import { SCORING } from '@/lib/constants/scoring';
import { countWords } from './text-utils';

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
    strengths: ['⚠️ MOCK SCORING: This score is not based on actual quality'],
    improvements: ['⚠️ Enable AI evaluation for accurate feedback'],
  };
}

export function generateMockFeedback(baseScore: number = SCORING.DEFAULT_FEEDBACK_SCORE): any {
  return {
    overallScore: randomScore(baseScore, 20),
    strengths: ['⚠️ MOCK FEEDBACK: Enable AI for accurate assessment'],
    improvements: ['⚠️ Enable AI evaluation for real feedback'],
  };
}

export function generateMockAIFeedback(): any {
  return {
    strengths: [
      '⚠️ MOCK FEEDBACK: Enable AI for accurate assessment',
      'Strong opening hook that draws the reader in',
      'Good use of descriptive language and sensory details',
    ],
    improvements: [
      '⚠️ Enable AI evaluation for real feedback',
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
      '⚠️ MOCK SCORING: Enable AI for accurate assessment',
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

function getSkillLevelFromRank(rank: string): string {
  if (rank.includes('Bronze')) return 'beginner';
  if (rank.includes('Silver')) return 'intermediate';
  if (rank.includes('Gold')) return 'proficient';
  if (rank.includes('Platinum')) return 'advanced';
  return 'intermediate';
}

