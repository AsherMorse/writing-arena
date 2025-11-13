import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';

// User Profile Interface
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  avatar: string;
  characterLevel: number;
  totalXP: number;
  totalPoints: number;
  currentRank: string;
  rankLP: number;
  traits: {
    content: number;
    organization: number;
    grammar: number;
    vocabulary: number;
    mechanics: number;
  };
  stats: {
    totalMatches: number;
    wins: number;
    totalWords: number;
    currentStreak: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Session Interface
export interface WritingSession {
  id?: string;
  userId: string;
  mode: 'practice' | 'quick-match' | 'ranked';
  trait: string;
  promptType: string;
  content: string;
  wordCount: number;
  score: number;
  traitScores: {
    content: number;
    organization: number;
    grammar: number;
    vocabulary: number;
    mechanics: number;
  };
  xpEarned: number;
  pointsEarned: number;
  lpChange?: number; // For ranked only
  placement?: number; // For competitive modes
  timestamp: Timestamp;
}

// Create or update user profile
export async function createUserProfile(uid: string, data: Partial<UserProfile>) {
  console.log('💾 FIRESTORE - Creating profile for:', uid, data);
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
  
  console.log('💾 FIRESTORE - Profile data to write:', {
    uid: profileData.uid,
    hasTraits: !!profileData.traits,
    traitsContent: profileData.traits.content
  });
  
  await setDoc(userRef, profileData, { merge: true });
  console.log('✅ FIRESTORE - Profile write complete');
}

// Get user profile
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  console.log('📖 FIRESTORE - Fetching profile for:', uid);
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    let rawData = userSnap.data();
    console.log('📖 FIRESTORE - Profile found:');
    console.log('  - uid:', rawData.uid);
    console.log('  - displayName:', rawData.displayName);
    console.log('  - hasTraits:', !!rawData.traits);
    console.log('  - traits:', rawData.traits);
    console.log('  - ALL KEYS:', Object.keys(rawData));
    console.log('  - FULL RAW DATA:', JSON.stringify(rawData, null, 2));
    
    // If profile is missing traits (old profile), update it
    if (!rawData.traits || !rawData.traits.content) {
      console.log('⚠️ FIRESTORE - Profile missing traits, updating...');
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
      
      console.log('✅ FIRESTORE - Profile updated with traits, refetching...');
      const updatedSnap = await getDoc(userRef);
      rawData = updatedSnap.exists() ? updatedSnap.data() : rawData;
      console.log('✅ FIRESTORE - Updated profile, keys:', Object.keys(rawData));
    }
    
    // Return only expected UserProfile fields to avoid rendering issues
    const cleanProfile: UserProfile = {
      uid: rawData.uid || uid,
      displayName: rawData.displayName || 'Student Writer',
      email: rawData.email || '',
      avatar: rawData.avatar || '🌿',
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
      stats: rawData.stats || {
        totalMatches: 0,
        wins: 0,
        totalWords: 0,
        currentStreak: 0,
      },
      createdAt: rawData.createdAt,
      updatedAt: rawData.updatedAt,
    };
    
    console.log('✅ FIRESTORE - Returning clean profile:');
    console.log('  - uid:', cleanProfile.uid);
    console.log('  - displayName:', cleanProfile.displayName);
    console.log('  - traits:', cleanProfile.traits);
    console.log('  - stats:', cleanProfile.stats);
    console.log('  - CLEAN PROFILE KEYS:', Object.keys(cleanProfile));
    console.log('  - CLEAN PROFILE JSON:', JSON.stringify(cleanProfile, null, 2));
    
    return cleanProfile;
  }
  
  console.log('📖 FIRESTORE - No profile found for:', uid);
  return null;
}

// Update user profile
export async function updateUserProfile(uid: string, updates: Partial<UserProfile>) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

// Save writing session
export async function saveWritingSession(session: WritingSession) {
  const sessionsRef = collection(db, 'sessions');
  const sessionRef = doc(sessionsRef);
  
  await setDoc(sessionRef, {
    ...session,
    timestamp: serverTimestamp(),
  });
  
  return sessionRef.id;
}

// Update user stats after session
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
  
  if (!userSnap.exists()) return;
  
  const userData = userSnap.data() as UserProfile;
  
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
    updates.rankLP = Math.max(0, userData.rankLP + lpChange);
  }
  
  await updateDoc(userRef, updates);
}

// Get user's recent sessions
export async function getUserSessions(uid: string, limitCount = 10) {
  const { query, where, orderBy, getDocs, limit } = await import('firebase/firestore');
  const sessionsRef = collection(db, 'sessions');
  const q = query(
    sessionsRef,
    where('userId', '==', uid),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

