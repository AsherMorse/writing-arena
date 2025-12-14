/**
 * Rank-based phase duration configuration
 * Time scales with complexity as students progress through ranks
 * 
 * Based on learning science feedback: proper scaffolding requires
 * more time for complex tasks as students advance.
 */

export type RankTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master';

export interface RankTimingConfig {
  phase1: number; // Writing phase duration (seconds)
  phase2: number; // Peer feedback phase duration (seconds)
  phase3: number; // Revision phase duration (seconds)
}

/**
 * Rank-based timing configuration
 * 
 * Timing scales with task complexity:
 * - Bronze: Sentence-level tasks (simpler, less time)
 * - Silver: Paragraph tasks (moderate complexity)
 * - Gold: Micro-essays (more complex)
 * - Platinum+: AP-level FRQ compressions (most complex)
 */
export const RANK_TIMING: Record<RankTier, RankTimingConfig> = {
  bronze: {
    phase1: 180,  // 3 minutes - sentence-level tasks at high school level
    phase2: 150,  // 2.5 minutes
    phase3: 150,  // 2.5 minutes
  },
  silver: {
    phase1: 240,  // 4 minutes - paragraph tasks
    phase2: 180,  // 3 minutes
    phase3: 180,  // 3 minutes
  },
  gold: {
    phase1: 300,  // 5 minutes - micro-essays
    phase2: 210,  // 3.5 minutes
    phase3: 210,  // 3.5 minutes
  },
  platinum: {
    phase1: 360,  // 6 minutes - AP-level FRQ compressions
    phase2: 240,  // 4 minutes
    phase3: 240,  // 4 minutes
  },
  diamond: {
    phase1: 360,  // 6 minutes
    phase2: 240,  // 4 minutes
    phase3: 240,  // 4 minutes
  },
  master: {
    phase1: 360,  // 6 minutes
    phase2: 240,  // 4 minutes
    phase3: 240,  // 4 minutes
  },
};

/**
 * Get rank tier from rank string
 * 
 * @param rank - Rank string (e.g., "Silver III", "Gold I", "Platinum")
 * @returns Rank tier enum value
 */
export function getRankTier(rank: string): RankTier {
  const rankLower = rank.toLowerCase();
  if (rankLower.includes('bronze')) return 'bronze';
  if (rankLower.includes('silver')) return 'silver';
  if (rankLower.includes('gold')) return 'gold';
  if (rankLower.includes('platinum')) return 'platinum';
  if (rankLower.includes('diamond')) return 'diamond';
  if (rankLower.includes('master') || rankLower.includes('grand')) return 'master';
  return 'silver'; // Default to silver if rank not recognized
}

/**
 * Get phase duration for a specific rank and phase
 * 
 * @param rank - Rank string (e.g., "Silver III")
 * @param phase - Phase number (1, 2, or 3)
 * @returns Phase duration in seconds
 */
export function getPhaseDuration(rank: string, phase: 1 | 2 | 3): number {
  const tier = getRankTier(rank);
  const config = RANK_TIMING[tier];
  
  switch (phase) {
    case 1: return config.phase1;
    case 2: return config.phase2;
    case 3: return config.phase3;
  }
}

/**
 * Get all phase durations for a rank
 * 
 * @param rank - Rank string
 * @returns Complete timing configuration for the rank
 */
export function getRankTiming(rank: string): RankTimingConfig {
  const tier = getRankTier(rank);
  return RANK_TIMING[tier];
}

