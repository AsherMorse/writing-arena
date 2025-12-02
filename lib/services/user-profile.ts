/**
 * User Profile Service
 * Handles CRUD operations for user profiles
 */

import { db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { promoteRank, demoteRank } from './ai-students';
import { UserProfile } from '@/lib/types';

export async function createUserProfile(uid: string, data: Partial<UserProfile>) {
  const userRef = doc(db, 'users', uid);
  
  const profileData = {
    uid,
    displayName: data.displayName || 'Student Writer',
    email: data.email || '',
    avatar: '🌿',
    characterLevel: 2,
    totalXP: 1250,
    totalPoints: 1250,
    currentRank: 'Silver III',
    rankLP: 120,
    traits: {
      content: 2,
      organization: 3,
      grammar: 2,
      vocabulary: 1,
      mechanics: 2,
    },
    stats: {
      totalMatches: 47,
      wins: 29,
      totalWords: 12438,
      currentStreak: 3,
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
          totalMatches: 0,
          wins: 0,
          totalWords: 0,
          currentStreak: 0,
        },
        avatar: rawData.avatar || '🌿',
        characterLevel: rawData.characterLevel || 2,
        totalXP: rawData.totalXP || 1250,
        totalPoints: rawData.totalPoints || 1250,
        currentRank: rawData.currentRank || 'Silver III',
        rankLP: rawData.rankLP || 120,
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
    
    const cleanProfile: UserProfile = {
      uid: rawData.uid || rawData.id || uid,
      displayName: rawData.displayName || 'Student Writer',
      email: rawData.email || '',
      avatar: avatarValue,
      characterLevel: rawData.characterLevel || 2,
      totalXP: rawData.totalXP || 1250,
      totalPoints: rawData.totalPoints || 1250,
      currentRank: rawData.currentRank || 'Silver III',
      rankLP: rawData.rankLP || 120,
      traits: rawData.traits || {
        content: 2,
        organization: 3,
        grammar: 2,
        vocabulary: 1,
        mechanics: 2,
      },
      stats: {
        totalMatches: rawData.stats?.totalMatches || 0,
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

export async function updateUserStatsAfterSession(
  uid: string, 
  xpEarned: number, 
  pointsEarned: number,
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
    totalXP: userData.totalXP + xpEarned,
    totalPoints: userData.totalPoints + pointsEarned,
    'stats.totalMatches': userData.stats.totalMatches + 1,
    'stats.totalWords': userData.stats.totalWords + (wordCount || 0),
    updatedAt: serverTimestamp(),
  };
  
  if (isWin) {
    updates['stats.wins'] = userData.stats.wins + 1;
  }
  
  if (lpChange !== undefined) {
    updates.rankLP = newLP;
    
    if (newLP >= 100 && userData.rankLP < 100) {
      const newRank = promoteRank(userData.currentRank);
      updates.currentRank = newRank;
      updates.rankLP = newLP - 100;
    } else if (newLP < 0 && userData.rankLP >= 0) {
      const newRank = demoteRank(userData.currentRank);
      updates.currentRank = newRank;
      updates.rankLP = 100 + newLP;
    }
  }
  
  await updateDoc(userRef, updates);
}

/**
 * @description Updates user stats after a practice session.
 * Practice mode: LP only (no XP, no points), word count tracked.
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

  const updates: Record<string, unknown> = {
    'stats.totalWords': userData.stats.totalWords + (wordCount || 0),
    updatedAt: serverTimestamp(),
  };

  // Only update LP if there's a change (mastered lessons give 0 LP)
  if (lpChange > 0) {
    updates.rankLP = newLP;

    // Handle rank promotion
    if (newLP >= 100 && userData.rankLP < 100) {
      const newRank = promoteRank(userData.currentRank);
      updates.currentRank = newRank;
      updates.rankLP = newLP - 100;
    }
  }

  await updateDoc(userRef, updates);
}
