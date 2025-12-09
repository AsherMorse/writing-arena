import { db } from '../config/firebase';
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  limit,
  Timestamp,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { RankedSubmission } from '@/lib/types';

export interface LeaderboardEntry {
  displayName: string;
  originalScore: number;
  revisedScore?: number;
  rank: number;
  submittedAt: Timestamp;
  isCurrentUser?: boolean;
  originalContent?: string;
  revisedContent?: string;
}

export interface LeaderboardData {
  userRank: number | null;
  userPercentile: number | null;
  totalSubmissions: number;
  topThree: LeaderboardEntry[];
  rankings: LeaderboardEntry[];
}

export async function getLeaderboard(
  promptId: string,
  currentUserId?: string
): Promise<LeaderboardData> {
  const submissionsRef = collection(db, 'rankedSubmissions');
  const q = query(
    submissionsRef,
    where('promptId', '==', promptId),
    orderBy('originalScore', 'desc'),
    orderBy('submittedAt', 'asc')
  );

  const snapshot = await getDocs(q);

  let userRank: number | null = null;
  let userPercentile: number | null = null;
  const totalSubmissions = snapshot.docs.length;

  const rankings: LeaderboardEntry[] = snapshot.docs.map((docSnap, index) => {
    const data = docSnap.data() as RankedSubmission;
    const rank = index + 1;
    const isCurrentUser = currentUserId === data.userId;
    const isTopThree = rank <= 3;

    if (isCurrentUser) {
      userRank = rank;
      userPercentile = totalSubmissions > 0
        ? Math.round(((totalSubmissions - rank) / totalSubmissions) * 100)
        : 0;
    }

    return {
      displayName: `Scribe #${rank}`,
      originalScore: data.originalScore,
      revisedScore: data.revisedScore,
      rank,
      submittedAt: data.submittedAt,
      isCurrentUser,
      originalContent: isTopThree ? data.originalContent : undefined,
      revisedContent: isTopThree ? data.revisedContent : undefined,
    };
  });

  const topThree = rankings.slice(0, 3);

  return {
    userRank,
    userPercentile,
    totalSubmissions,
    topThree,
    rankings,
  };
}

export async function getTopThree(promptId: string): Promise<LeaderboardEntry[]> {
  const submissionsRef = collection(db, 'rankedSubmissions');
  const q = query(
    submissionsRef,
    where('promptId', '==', promptId),
    orderBy('originalScore', 'desc'),
    orderBy('submittedAt', 'asc'),
    limit(3)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap, index) => {
    const data = docSnap.data() as RankedSubmission;
    const rank = index + 1;
    return {
      displayName: `Scribe #${rank}`,
      originalScore: data.originalScore,
      revisedScore: data.revisedScore,
      rank,
      submittedAt: data.submittedAt,
    };
  });
}

export async function createFakeSubmission(
  promptId: string,
  originalScore: number,
  revisedScore?: number
): Promise<string> {
  const submissionsRef = collection(db, 'rankedSubmissions');

  const fakeUserId = `fake-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const docRef = await addDoc(submissionsRef, {
    userId: fakeUserId,
    promptId,
    originalContent: '[Debug] Fake submission for testing leaderboard.',
    originalScore,
    originalFeedback: {},
    revisedContent: revisedScore ? '[Debug] Fake revised content.' : undefined,
    revisedScore,
    revisedFeedback: revisedScore ? {} : undefined,
    submittedAt: serverTimestamp(),
    completedAt: revisedScore ? serverTimestamp() : undefined,
  });

  return docRef.id;
}

export async function deleteAllSubmissionsForPrompt(promptId: string): Promise<number> {
  const submissionsRef = collection(db, 'rankedSubmissions');
  const q = query(submissionsRef, where('promptId', '==', promptId));
  const snapshot = await getDocs(q);

  const deletePromises = snapshot.docs.map((docSnap) =>
    deleteDoc(doc(db, 'rankedSubmissions', docSnap.id))
  );

  await Promise.all(deletePromises);
  return snapshot.size;
}

