/**
 * @fileoverview Rank system service for skill-based progression.
 * Handles rank transitions (promote/demote) and LP changes.
 */

import type { SkillLevel, SkillTier, UserProfile } from '@/lib/types';
import {
  TIER_LP_CAP,
  TIER_LP_START,
  SKILL_LEVELS,
} from '@/lib/utils/rank-constants';

/**
 * @description Result of a rank change operation.
 */
export interface RankUpdate {
  newLevel: SkillLevel;
  newTier: SkillTier;
  newTierLP: number;
  change: 'promoted' | 'demoted' | 'none';
}

/**
 * @description Promotes a rank by one step.
 * T3 → T2 → T1 → next level T3
 * 
 * Examples:
 * - Scribe III → Scribe II
 * - Scribe I → Scholar III
 * - Loremaster I → Loremaster I (max, no change)
 */
export function promoteRank(
  level: SkillLevel,
  tier: SkillTier
): { level: SkillLevel; tier: SkillTier } {
  // If not at tier 1, just move up a tier (3→2, 2→1)
  if (tier > 1) {
    return { level, tier: (tier - 1) as SkillTier };
  }

  // At tier 1, try to move to next level
  const levelIndex = SKILL_LEVELS.indexOf(level);
  
  // If at max level (loremaster), stay at max
  if (levelIndex >= SKILL_LEVELS.length - 1) {
    return { level, tier };
  }

  // Move to next level at tier 3
  return {
    level: SKILL_LEVELS[levelIndex + 1] as SkillLevel,
    tier: 3,
  };
}

/**
 * @description Demotes a rank by one step.
 * T1 → T2 → T3 → previous level T1
 * 
 * Examples:
 * - Scribe II → Scribe III
 * - Scholar III → Scribe I
 * - Scribe III → Scribe III (floor, no change)
 */
export function demoteRank(
  level: SkillLevel,
  tier: SkillTier
): { level: SkillLevel; tier: SkillTier } {
  // If not at tier 3, just move down a tier (1→2, 2→3)
  if (tier < 3) {
    return { level, tier: (tier + 1) as SkillTier };
  }

  // At tier 3, try to move to previous level
  const levelIndex = SKILL_LEVELS.indexOf(level);
  
  // If at min level (scribe), stay at floor
  if (levelIndex <= 0) {
    return { level, tier };
  }

  // Move to previous level at tier 1
  return {
    level: SKILL_LEVELS[levelIndex - 1] as SkillLevel,
    tier: 1,
  };
}

/**
 * @description Applies an LP change to a user profile and returns the rank update.
 * Handles promotion (at 100 LP) and demotion (at 0 LP).
 * 
 * @param currentLevel - Current skill level
 * @param currentTier - Current skill tier
 * @param currentTierLP - Current LP within tier (0-100)
 * @param lpChange - LP to add (can be negative)
 * @returns RankUpdate with new rank state and change type
 */
export function applyLPChange(
  currentLevel: SkillLevel,
  currentTier: SkillTier,
  currentTierLP: number,
  lpChange: number
): RankUpdate {
  let newTierLP = currentTierLP + lpChange;
  let newLevel = currentLevel;
  let newTier = currentTier;
  let change: 'promoted' | 'demoted' | 'none' = 'none';

  // Check for promotion (hit 100 LP)
  if (newTierLP >= TIER_LP_CAP) {
    const promoted = promoteRank(currentLevel, currentTier);
    
    // Only apply promotion if rank actually changed
    if (promoted.level !== currentLevel || promoted.tier !== currentTier) {
      newLevel = promoted.level;
      newTier = promoted.tier;
      newTierLP = TIER_LP_START; // Reset to 65 LP
      change = 'promoted';
    } else {
      // At max rank, cap at 100
      newTierLP = TIER_LP_CAP;
    }
  }
  // Check for demotion (hit 0 LP)
  else if (newTierLP <= 0) {
    const demoted = demoteRank(currentLevel, currentTier);
    
    // Only apply demotion if rank actually changed
    if (demoted.level !== currentLevel || demoted.tier !== currentTier) {
      newLevel = demoted.level;
      newTier = demoted.tier;
      newTierLP = TIER_LP_START; // Reset to 65 LP
      change = 'demoted';
    } else {
      // At min rank (Scribe III), floor at 0
      newTierLP = 0;
    }
  }

  return {
    newLevel,
    newTier,
    newTierLP,
    change,
  };
}

/**
 * @description Gets the default rank for new users or users missing rank data.
 */
export function getDefaultRank(): { level: SkillLevel; tier: SkillTier; tierLP: number } {
  return {
    level: 'scribe',
    tier: 3,
    tierLP: TIER_LP_START,
  };
}

/**
 * @description Checks if the user is at the maximum rank (Loremaster I).
 */
export function isMaxRank(level: SkillLevel, tier: SkillTier): boolean {
  return level === 'loremaster' && tier === 1;
}

/**
 * @description Checks if the user is at the minimum rank (Scribe III).
 */
export function isMinRank(level: SkillLevel, tier: SkillTier): boolean {
  return level === 'scribe' && tier === 3;
}
