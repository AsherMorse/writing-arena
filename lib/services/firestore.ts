import { db } from '../config/firebase';
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
import { promoteRank, demoteRank } from './ai-students';
import { UserProfile } from '@/lib/types';

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
  lpChange?: number;
  placement?: number;
  timestamp: Timestamp;
  matchId?: string;
}

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

export async function saveWritingSession(session: WritingSession) {
  const sessionsRef = collection(db, 'sessions');
  const sessionRef = doc(sessionsRef);
  
  await setDoc(sessionRef, {
    ...session,
    timestamp: serverTimestamp(),
  });
  
  return sessionRef.id;
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

export async function getCompletedRankedMatches(uid: string, limitCount = 5): Promise<WritingSession[]> {
  const { query, where, orderBy, getDocs, limit } = await import('firebase/firestore');
  const sessionsRef = collection(db, 'sessions');
  
  try {
    const q = query(
      sessionsRef,
      where('userId', '==', uid),
      where('mode', '==', 'ranked'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as WritingSession));
  } catch (error: any) {
    if (error?.code === 'failed-precondition') {
      const q = query(
        sessionsRef,
        where('userId', '==', uid),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      const allSessions = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as WritingSession));
      
      return allSessions
        .filter(session => session.mode === 'ranked')
        .slice(0, limitCount);
    }
    throw error;
  }
}

export async function countCompletedRankedMatches(uid: string): Promise<number> {
  const { query, where, getDocs } = await import('firebase/firestore');
  const sessionsRef = collection(db, 'sessions');
  
  try {
    const q = query(
      sessionsRef,
      where('userId', '==', uid),
      where('mode', '==', 'ranked')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error: any) {
    if (error?.code === 'failed-precondition') {
      const q = query(
        sessionsRef,
        where('userId', '==', uid)
      );
      
      const snapshot = await getDocs(q);
      const allSessions = snapshot.docs.map(doc => doc.data() as WritingSession);
      
      return allSessions.filter(session => session.mode === 'ranked').length;
    }
    throw error;
  }
}

export interface ImproveConversation {
  id?: string;
  userId: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export async function saveImproveConversation(
  uid: string,
  messages: Array<{ id: string; role: 'user' | 'assistant'; content: string; timestamp: Date }>
): Promise<string> {
  const conversationsRef = collection(db, 'improveConversations');
  const conversationRef = doc(conversationsRef);
  
  const conversationData = {
    userId: uid,
    messages: messages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: Timestamp.fromDate(msg.timestamp),
    })),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  await setDoc(conversationRef, conversationData);
  return conversationRef.id;
}

export async function updateImproveConversation(
  conversationId: string,
  messages: Array<{ id: string; role: 'user' | 'assistant'; content: string; timestamp: Date }>
): Promise<void> {
  const conversationRef = doc(db, 'improveConversations', conversationId);
  
  await updateDoc(conversationRef, {
    messages: messages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: Timestamp.fromDate(msg.timestamp),
    })),
    updatedAt: serverTimestamp(),
  });
}

export async function getImproveConversations(uid: string, limitCount = 10): Promise<ImproveConversation[]> {
  const { query, where, orderBy, getDocs, limit } = await import('firebase/firestore');
  const conversationsRef = collection(db, 'improveConversations');
  
  const q = query(
    conversationsRef,
    where('userId', '==', uid),
    orderBy('updatedAt', 'desc'),
    limit(limitCount)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    messages: doc.data().messages.map((msg: any) => ({
      ...msg,
      timestamp: msg.timestamp?.toDate?.() || new Date(msg.timestamp),
    })),
  } as ImproveConversation));
}

export async function getImproveConversation(conversationId: string): Promise<ImproveConversation | null> {
  const conversationRef = doc(db, 'improveConversations', conversationId);
  const snapshot = await getDoc(conversationRef);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    messages: data.messages.map((msg: any) => ({
      ...msg,
      timestamp: msg.timestamp?.toDate?.() || new Date(msg.timestamp),
    })),
  } as ImproveConversation;
}
