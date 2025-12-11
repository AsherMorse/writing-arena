/**
 * @fileoverview User Profile Service
 * Handles CRUD operations for user profiles including LP tracking and streak calculation.
 */

import { db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { promoteRank as legacyPromoteRank, demoteRank as legacyDemoteRank } from './ai-students';
import { UserProfile, SkillLevel, SkillTier } from '@/lib/types';
import { applyLPChange, getDefaultRank } from './rank-system';
import {
  getThreshold,
  getEffectiveScore,
  calculateTierLP,
  calculatePracticeLP,
} from '@/lib/utils/score-calculator';
import { TIER_LP_START, LESSON_MASTERY_LP } from '@/lib/utils/rank-constants';

/**
 * @description Formats a date as YYYY-MM-DD string for consistent date tracking.
 */
function formatDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * @description Calculates new streak based on last activity date.
 * Returns updated streak count and whether it should be updated.
 */
function calculateStreak(
  lastActivityDate: string | undefined,
  currentStreak: number,
  todayString: string
): { newStreak: number; shouldUpdate: boolean } {
  // No last activity - first time, start streak at 1
  if (!lastActivityDate) {
    return { newStreak: 1, shouldUpdate: true };
  }

  // Already played today - no change
  if (lastActivityDate === todayString) {
    return { newStreak: currentStreak, shouldUpdate: false };
  }

  // Calculate yesterday's date
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = formatDateString(yesterday);

  // Played yesterday - increment streak
  if (lastActivityDate === yesterdayString) {
    return { newStreak: currentStreak + 1, shouldUpdate: true };
  }

  // Streak broken - reset to 1
  return { newStreak: 1, shouldUpdate: true };
}

/**
 * @description Creates a new user profile with skill-based rank system.
 * New users start at Scribe III with 65 LP.
 */
export async function createUserProfile(uid: string, data: Partial<UserProfile>) {
  const userRef = doc(db, 'users', uid);
  const defaultRank = getDefaultRank();
  
  const profileData = {
    uid,
    displayName: data.displayName || 'New Adventurer',
    email: data.email || '',
    avatar: '🌿',
    // Legacy fields (kept for backward compatibility)
    currentRank: 'Bronze III',
    rankLP: 0,
    totalLP: 0,
    // New skill-based rank fields
    skillLevel: defaultRank.level,
    skillTier: defaultRank.tier,
    tierLP: defaultRank.tierLP,
    hasNobleName: data.hasNobleName ?? false,
    traits: {
      content: 2,
      organization: 3,
      grammar: 2,
      vocabulary: 1,
      mechanics: 2,
    },
    stats: {
      rankedMatches: 0,
      practiceMatches: 0,
      lessonsCompleted: 0,
      wins: 0,
      totalWords: 0,
      currentStreak: 0,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  await setDoc(userRef, profileData, { merge: true });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    let rawData = userSnap.data();
    
    if (!rawData.traits || !rawData.traits.content) {
      await setDoc(userRef, {
        traits: {
          content: 2,
          organization: 3,
          grammar: 2,
          vocabulary: 1,
          mechanics: 2,
        },
        stats: rawData.stats || {
          rankedMatches: 0,
          practiceMatches: 0,
          lessonsCompleted: 0,
          wins: 0,
          totalWords: 0,
          currentStreak: 0,
        },
        avatar: rawData.avatar || '🌿',
        currentRank: rawData.currentRank || 'Bronze III',
        rankLP: rawData.rankLP || 0,
        totalLP: rawData.totalLP || 0,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      
      const updatedSnap = await getDoc(userRef);
      rawData = updatedSnap.exists() ? updatedSnap.data() : rawData;
    }
    
    const avatarValue = (() => {
      if (!rawData.avatar) return '🌿';
      if (typeof rawData.avatar === 'string') return rawData.avatar;
      if (rawData.avatar.photoURL) return '🌿';
      return '🌿';
    })();
    
    // Get default rank values for missing fields
    const defaultRank = getDefaultRank();
    
    const cleanProfile: UserProfile = {
      uid: rawData.uid || rawData.id || uid,
      displayName: rawData.displayName || 'New Adventurer',
      email: rawData.email || '',
      avatar: avatarValue,
      // Legacy fields (kept for backward compatibility)
      currentRank: rawData.currentRank || 'Bronze III',
      rankLP: rawData.rankLP || 0,
      totalLP: rawData.totalLP || 0,
      // New skill-based rank fields (default to Scribe III, 65 LP)
      skillLevel: rawData.skillLevel || defaultRank.level,
      skillTier: rawData.skillTier || defaultRank.tier,
      tierLP: rawData.tierLP ?? defaultRank.tierLP,
      hasNobleName: rawData.hasNobleName ?? false,
      traits: rawData.traits || {
        content: 2,
        organization: 3,
        grammar: 2,
        vocabulary: 1,
        mechanics: 2,
      },
      stats: {
        rankedMatches: rawData.stats?.rankedMatches || 0,
        practiceMatches: rawData.stats?.practiceMatches || 0,
        lessonsCompleted: rawData.stats?.lessonsCompleted || 0,
        wins: rawData.stats?.wins || 0,
        totalWords: rawData.stats?.totalWords || 0,
        currentStreak: rawData.stats?.currentStreak || 0,
      },
      createdAt: rawData.createdAt,
      updatedAt: rawData.updatedAt,
    };
    
    return cleanProfile;
  }
  
  return null;
}

export async function updateUserProfile(uid: string, updates: Partial<UserProfile>) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * @deprecated Use updateUserStatsAfterRanked instead. XP/Points system removed.
 * @description Legacy function for updating user stats after a competitive session.
 */
export async function updateUserStatsAfterSession(
  uid: string, 
  _xpEarned: number, 
  _pointsEarned: number,
  lpChange?: number,
  isWin?: boolean,
  wordCount?: number
) {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    return;
  }
  
  const userData = userSnap.data() as UserProfile;
  const newLP = Math.max(0, userData.rankLP + (lpChange || 0));
  
  const updates: any = {
    'stats.totalWords': userData.stats.totalWords + (wordCount || 0),
    updatedAt: serverTimestamp(),
  };
  
  if (isWin) {
    updates['stats.wins'] = userData.stats.wins + 1;
  }
  
  if (lpChange !== undefined) {
    updates.rankLP = newLP;
    updates.totalLP = (userData.totalLP || 0) + lpChange;
    
    if (newLP >= 100 && userData.rankLP < 100) {
      const newRank = legacyPromoteRank(userData.currentRank);
      updates.currentRank = newRank;
      updates.rankLP = newLP - 100;
    } else if (newLP < 0 && userData.rankLP >= 0) {
      const newRank = legacyDemoteRank(userData.currentRank);
      updates.currentRank = newRank;
      updates.rankLP = 100 + newLP;
    }
  }
  
  await updateDoc(userRef, updates);
}

/**
 * @description Updates user stats after a ranked submission.
 * Increments totalLP and rankLP based on score, handles rank promotion and streak tracking.
 */
export async function updateUserStatsAfterRanked(
  uid: string,
  lpEarned: number,
  wordCount?: number
) {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return;

  const userData = userSnap.data() as UserProfile;
  const newRankLP = userData.rankLP + lpEarned;
  const todayString = formatDateString(new Date());

  const updates: Record<string, unknown> = {
    totalLP: (userData.totalLP || 0) + lpEarned,
    'stats.rankedMatches': (userData.stats.rankedMatches || 0) + 1,
    'stats.totalWords': userData.stats.totalWords + (wordCount || 0),
    updatedAt: serverTimestamp(),
  };

  updates.rankLP = newRankLP;

  // Handle rank promotion
  if (newRankLP >= 100 && userData.rankLP < 100) {
    const newRank = legacyPromoteRank(userData.currentRank);
    updates.currentRank = newRank;
    updates.rankLP = newRankLP - 100;
  }

  // Update streak
  const { newStreak, shouldUpdate } = calculateStreak(
    userData.lastActivityDate,
    userData.stats.currentStreak,
    todayString
  );

  if (shouldUpdate) {
    updates['stats.currentStreak'] = newStreak;
    updates.lastActivityDate = todayString;
  }

  await updateDoc(userRef, updates);
}

/**
 * @deprecated Use updateRankAfterPracticeSubmission instead for the new skill-based system.
 * @description Updates user stats after a practice session.
 * Practice mode: Earns LP (both rank and total), word count tracked, updates streak.
 */
export async function updateUserStatsAfterPractice(
  uid: string,
  lpChange: number,
  wordCount?: number
) {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return;

  const userData = userSnap.data() as UserProfile;
  const newLP = Math.max(0, userData.rankLP + lpChange);
  const todayString = formatDateString(new Date());

  const updates: Record<string, unknown> = {
    'stats.practiceMatches': (userData.stats.practiceMatches || 0) + 1,
    'stats.totalWords': userData.stats.totalWords + (wordCount || 0),
    updatedAt: serverTimestamp(),
  };

  // Update LP if there's a change (mastered lessons give 0 LP)
  if (lpChange > 0) {
    updates.rankLP = newLP;
    updates.totalLP = (userData.totalLP || 0) + lpChange;

    // Handle rank promotion
    if (newLP >= 100 && userData.rankLP < 100) {
      const newRank = legacyPromoteRank(userData.currentRank);
      updates.currentRank = newRank;
      updates.rankLP = newLP - 100;
    }
  }

  // Update streak
  const { newStreak, shouldUpdate } = calculateStreak(
    userData.lastActivityDate,
    userData.stats.currentStreak,
    todayString
  );

  if (shouldUpdate) {
    updates['stats.currentStreak'] = newStreak;
    updates.lastActivityDate = todayString;
  }

  await updateDoc(userRef, updates);
}

// =============================================================================
// NEW SKILL-BASED RANK SYSTEM FUNCTIONS
// =============================================================================

/**
 * @description Result of a rank update operation.
 */
export interface RankUpdateResult {
  lpChange: number;
  newLevel: SkillLevel;
  newTier: SkillTier;
  newTierLP: number;
  change: 'promoted' | 'demoted' | 'none';
}

/**
 * @description Updates user rank after a ranked submission.
 * Uses the new skill-based system: effective score → tier LP → rank change.
 * 
 * @param uid - User ID
 * @param originalScore - Original submission score (0-100)
 * @param revisedScore - Optional revised score (0-100)
 * @param wordCount - Optional word count for stats
 * @returns RankUpdateResult with LP change and new rank info
 */
export async function updateRankAfterRankedSubmission(
  uid: string,
  originalScore: number,
  revisedScore?: number,
  wordCount?: number
): Promise<RankUpdateResult | null> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return null;

  const userData = userSnap.data() as UserProfile;
  const defaultRank = getDefaultRank();
  
  // Get current rank (with defaults for missing fields)
  const currentLevel = userData.skillLevel || defaultRank.level;
  const currentTier = userData.skillTier || defaultRank.tier;
  const currentTierLP = userData.tierLP ?? defaultRank.tierLP;
  
  // Calculate effective score and LP change
  const effectiveScore = getEffectiveScore(originalScore, revisedScore);
  const threshold = getThreshold(currentTier);
  const lpChange = calculateTierLP(effectiveScore, threshold);
  
  // Apply LP change and get new rank
  const rankUpdate = applyLPChange(currentLevel, currentTier, currentTierLP, lpChange);
  
  const todayString = formatDateString(new Date());

  const updates: Record<string, unknown> = {
    // Update new rank fields
    skillLevel: rankUpdate.newLevel,
    skillTier: rankUpdate.newTier,
    tierLP: rankUpdate.newTierLP,
    // Update totalLP (always increases for positive LP)
    totalLP: (userData.totalLP || 0) + Math.max(0, lpChange),
    // Update stats
    'stats.rankedMatches': (userData.stats.rankedMatches || 0) + 1,
    'stats.totalWords': userData.stats.totalWords + (wordCount || 0),
    updatedAt: serverTimestamp(),
  };

  // Update streak
  const { newStreak, shouldUpdate } = calculateStreak(
    userData.lastActivityDate,
    userData.stats.currentStreak,
    todayString
  );

  if (shouldUpdate) {
    updates['stats.currentStreak'] = newStreak;
    updates.lastActivityDate = todayString;
  }

  await updateDoc(userRef, updates);

  return {
    lpChange,
    newLevel: rankUpdate.newLevel,
    newTier: rankUpdate.newTier,
    newTierLP: rankUpdate.newTierLP,
    change: rankUpdate.change,
  };
}

/**
 * @description Updates user rank after a practice submission.
 * Practice mode: quarter LP, no negative LP possible.
 * 
 * @param uid - User ID
 * @param originalScore - Original submission score (0-100)
 * @param revisedScore - Optional revised score (0-100)
 * @param wordCount - Optional word count for stats
 * @returns RankUpdateResult with LP change and new rank info
 */
export async function updateRankAfterPracticeSubmission(
  uid: string,
  originalScore: number,
  revisedScore?: number,
  wordCount?: number
): Promise<RankUpdateResult | null> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return null;

  const userData = userSnap.data() as UserProfile;
  const defaultRank = getDefaultRank();
  
  // Get current rank (with defaults for missing fields)
  const currentLevel = userData.skillLevel || defaultRank.level;
  const currentTier = userData.skillTier || defaultRank.tier;
  const currentTierLP = userData.tierLP ?? defaultRank.tierLP;
  
  // Calculate effective score and practice LP (quarter, no negative)
  const effectiveScore = getEffectiveScore(originalScore, revisedScore);
  const threshold = getThreshold(currentTier);
  const lpChange = calculatePracticeLP(effectiveScore, threshold);
  
  // Apply LP change (practice LP is always 0 or positive, so no demotion possible)
  const rankUpdate = applyLPChange(currentLevel, currentTier, currentTierLP, lpChange);
  
  const todayString = formatDateString(new Date());

  const updates: Record<string, unknown> = {
    // Update new rank fields
    skillLevel: rankUpdate.newLevel,
    skillTier: rankUpdate.newTier,
    tierLP: rankUpdate.newTierLP,
    // Update totalLP
    totalLP: (userData.totalLP || 0) + lpChange,
    // Update stats
    'stats.practiceMatches': (userData.stats.practiceMatches || 0) + 1,
    'stats.totalWords': userData.stats.totalWords + (wordCount || 0),
    updatedAt: serverTimestamp(),
  };

  // Update streak
  const { newStreak, shouldUpdate } = calculateStreak(
    userData.lastActivityDate,
    userData.stats.currentStreak,
    todayString
  );

  if (shouldUpdate) {
    updates['stats.currentStreak'] = newStreak;
    updates.lastActivityDate = todayString;
  }

  await updateDoc(userRef, updates);

  return {
    lpChange,
    newLevel: rankUpdate.newLevel,
    newTier: rankUpdate.newTier,
    newTierLP: rankUpdate.newTierLP,
    change: rankUpdate.change,
  };
}

/**
 * @description Updates user rank after mastering a lesson.
 * Grants a flat +5 LP bonus. Does NOT increment stats.lessonsCompleted
 * (that's handled by updateMastery in practice-mastery.ts).
 * 
 * @param uid - User ID
 * @returns RankUpdateResult with LP change and new rank info
 */
export async function updateRankAfterLessonMastery(
  uid: string
): Promise<RankUpdateResult | null> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return null;

  const userData = userSnap.data() as UserProfile;
  const defaultRank = getDefaultRank();
  
  // Get current rank (with defaults for missing fields)
  const currentLevel = userData.skillLevel || defaultRank.level;
  const currentTier = userData.skillTier || defaultRank.tier;
  const currentTierLP = userData.tierLP ?? defaultRank.tierLP;
  
  // Flat +5 LP for lesson mastery
  const lpChange = LESSON_MASTERY_LP;
  
  // Apply LP change
  const rankUpdate = applyLPChange(currentLevel, currentTier, currentTierLP, lpChange);

  const updates: Record<string, unknown> = {
    // Update new rank fields
    skillLevel: rankUpdate.newLevel,
    skillTier: rankUpdate.newTier,
    tierLP: rankUpdate.newTierLP,
    // Update totalLP
    totalLP: (userData.totalLP || 0) + lpChange,
    // Note: stats.lessonsCompleted is handled by updateMastery, not here
    updatedAt: serverTimestamp(),
  };

  await updateDoc(userRef, updates);

  return {
    lpChange,
    newLevel: rankUpdate.newLevel,
    newTier: rankUpdate.newTier,
    newTierLP: rankUpdate.newTierLP,
    change: rankUpdate.change,
  };
}
