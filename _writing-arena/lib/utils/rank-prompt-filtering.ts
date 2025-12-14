/**
 * Rank-based prompt complexity filtering
 * 
 * Filters prompts by difficulty based on rank tier to ensure proper scaffolding:
 * - Bronze: Sentence-level prompts (simpler types)
 * - Silver: Paragraph prompts (moderate complexity)
 * - Gold: Micro-essay prompts (more complex)
 * - Platinum+: AP-level prompts (most complex)
 */

import { WritingPrompt } from './prompts';
import { getRankTier, RankTier } from '@/lib/constants/rank-timing';

export interface PromptComplexity {
  level: 'sentence' | 'paragraph' | 'micro-essay' | 'ap-level';
  minWords: number;
  maxWords: number;
  promptTypes: Array<'narrative' | 'descriptive' | 'informational' | 'argumentative'>;
  requiredElements: string[];
}

export const RANK_PROMPT_CONFIG: Record<RankTier, PromptComplexity> = {
  bronze: {
    level: 'sentence',
    minWords: 50,
    maxWords: 100,
    promptTypes: ['narrative', 'descriptive'], // Simpler types for beginners
    requiredElements: ['clear main idea', 'complete sentences'],
  },
  silver: {
    level: 'paragraph',
    minWords: 100,
    maxWords: 200,
    promptTypes: ['narrative', 'descriptive', 'informational'], // Add informational
    requiredElements: ['topic sentence', 'supporting details', 'conclusion'],
  },
  gold: {
    level: 'micro-essay',
    minWords: 150,
    maxWords: 300,
    promptTypes: ['narrative', 'descriptive', 'informational', 'argumentative'], // All types
    requiredElements: ['thesis', '2-3 supporting points', 'conclusion'],
  },
  platinum: {
    level: 'ap-level',
    minWords: 200,
    maxWords: 400,
    promptTypes: ['argumentative', 'informational'], // AP-level types
    requiredElements: ['thesis', 'evidence', 'analysis', 'sophistication'],
  },
  diamond: {
    level: 'ap-level',
    minWords: 200,
    maxWords: 400,
    promptTypes: ['argumentative', 'informational'],
    requiredElements: ['thesis', 'evidence', 'analysis', 'sophistication'],
  },
  master: {
    level: 'ap-level',
    minWords: 200,
    maxWords: 400,
    promptTypes: ['argumentative', 'informational'],
    requiredElements: ['thesis', 'evidence', 'analysis', 'sophistication'],
  },
};

/**
 * Get prompts filtered by rank complexity
 * 
 * @param rank - User's rank (e.g., "Silver III")
 * @param allPrompts - Array of all available prompts
 * @returns Filtered prompts appropriate for the rank
 */
export function getPromptsByRank(
  rank: string,
  allPrompts: WritingPrompt[]
): WritingPrompt[] {
  const tier = getRankTier(rank);
  const config = RANK_PROMPT_CONFIG[tier];
  
  // Filter prompts by allowed types for this rank
  const filtered = allPrompts.filter(prompt => 
    config.promptTypes.includes(prompt.type)
  );
  
  // If no prompts match, fall back to all prompts (shouldn't happen)
  return filtered.length > 0 ? filtered : allPrompts;
}

/**
 * Get a random prompt filtered by rank
 * 
 * @param rank - User's rank
 * @param allPrompts - Array of all available prompts
 * @returns A random prompt appropriate for the rank
 */
export function getRandomPromptByRank(
  rank: string,
  allPrompts: WritingPrompt[]
): WritingPrompt {
  const filtered = getPromptsByRank(rank, allPrompts);
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
}

/**
 * Get prompt complexity config for a rank
 * 
 * @param rank - User's rank
 * @returns Complexity configuration
 */
export function getPromptComplexityForRank(rank: string): PromptComplexity {
  const tier = getRankTier(rank);
  return RANK_PROMPT_CONFIG[tier];
}






