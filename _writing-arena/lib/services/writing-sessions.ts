/**
 * Writing Sessions Service
 * Handles CRUD operations for writing sessions
 */

import { db } from '../config/firebase';
import { collection, doc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { queryWithFallback } from '@/lib/utils/firestore-query';

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

export async function saveWritingSession(session: WritingSession) {
  const sessionsRef = collection(db, 'sessions');
  const sessionRef = doc(sessionsRef);
  
  await setDoc(sessionRef, {
    ...session,
    timestamp: serverTimestamp(),
  });
  
  return sessionRef.id;
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
  
  return queryWithFallback(
    async () => {
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
    },
    async () => {
      const q = query(
        sessionsRef,
        where('userId', '==', uid),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as WritingSession));
    },
    (session) => session.mode === 'ranked'
  ).then(results => results.slice(0, limitCount));
}

export async function countCompletedRankedMatches(uid: string): Promise<number> {
  const { query, where, getDocs } = await import('firebase/firestore');
  const sessionsRef = collection(db, 'sessions');
  
  const results = await queryWithFallback(
    async () => {
      const q = query(
        sessionsRef,
        where('userId', '==', uid),
        where('mode', '==', 'ranked')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as WritingSession);
    },
    async () => {
      const q = query(
        sessionsRef,
        where('userId', '==', uid)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as WritingSession);
    },
    (session) => session.mode === 'ranked'
  );
  
  return results.length;
}

