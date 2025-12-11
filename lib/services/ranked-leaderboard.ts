import { db } from '../config/firebase';
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  limit,
  Timestamp,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { RankedSubmission, SkillLevel, SkillTier, UserTitle } from '@/lib/types';
import { getRankDisplayName } from '@/lib/utils/score-calculator';

/**
 * @description Formats a user's display name with title and rank.
 * Example: "Wordsmith Tom Smith, Scribe III"
 */
function formatLeaderboardName(
  name: string,
  title: UserTitle = 'Wordsmith',
  skillLevel: SkillLevel = 'scribe',
  skillTier: SkillTier = 3
): string {
  const rankDisplay = getRankDisplayName(skillLevel, skillTier);
  return `${title} ${name}, ${rankDisplay}`;
}

export interface LeaderboardEntry {
  displayName: string;
  originalScore: number;
  revisedScore?: number;
  rank: number;
  submittedAt: Timestamp;
  isCurrentUser?: boolean;
  originalContent?: string;
  revisedContent?: string;
  /** The prompt text this user responded to (may be personalized) */
  promptText?: string;
}

export interface DailyChampion {
  userId: string;
  displayName: string;
  dailyLP: number;
  rank: number;
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

  // Filter to only completed submissions (those with completedAt set)
  // and deduplicate by userId (keep best submission per user by originalScore)
  const submissionsByUser = new Map<string, { docSnap: typeof snapshot.docs[0]; data: RankedSubmission }>();
  
  snapshot.docs.forEach((docSnap) => {
    const data = docSnap.data() as RankedSubmission;
    
    // Skip submissions without completedAt (not yet revised)
    if (!data.completedAt) return;
    
    const existing = submissionsByUser.get(data.userId);
    
    // Keep the submission with the higher originalScore
    if (!existing || data.originalScore > existing.data.originalScore) {
      submissionsByUser.set(data.userId, { docSnap, data });
    }
  });

  // Convert to array and sort by originalScore (leaderboard ranks by original, not revised)
  const completedSubmissions = [...submissionsByUser.values()]
    .sort((a, b) => {
      if (b.data.originalScore !== a.data.originalScore) {
        return b.data.originalScore - a.data.originalScore;
      }
      // Tiebreaker: higher revisedScore wins
      const aRevised = a.data.revisedScore ?? 0;
      const bRevised = b.data.revisedScore ?? 0;
      if (bRevised !== aRevised) {
        return bRevised - aRevised;
      }
      // Final tiebreaker: earlier submission wins
      return a.data.submittedAt.toMillis() - b.data.submittedAt.toMillis();
    });

  let userRank: number | null = null;
  let userPercentile: number | null = null;
  const totalSubmissions = completedSubmissions.length;

  // Fetch user profiles to get display names
  const userIds = completedSubmissions.map(({ data }) => data.userId);
  const profilePromises = userIds.map((uid) =>
    getDoc(doc(db, 'users', uid)).catch(() => null)
  );
  const profileSnapshots = await Promise.all(profilePromises);

  // Build formatted display name map with title and rank
  const displayNames: Record<string, string> = {};
  profileSnapshots.forEach((snap, index) => {
    if (snap?.exists()) {
      const profileData = snap.data();
      const name = profileData.displayName || `Scribe #${index + 1}`;
      const title = profileData.title || 'Wordsmith';
      const skillLevel = profileData.skillLevel || 'scribe';
      const skillTier = profileData.skillTier || 3;
      displayNames[userIds[index]] = formatLeaderboardName(name, title, skillLevel, skillTier);
    }
  });

  const rankings: LeaderboardEntry[] = completedSubmissions.map(({ data }, index) => {
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
      displayName: displayNames[data.userId] || formatLeaderboardName(`Scribe #${rank}`, 'Wordsmith', 'scribe', 3),
      originalScore: data.originalScore,
      revisedScore: data.revisedScore,
      rank,
      submittedAt: data.submittedAt,
      isCurrentUser,
      originalContent: isTopThree ? data.originalContent : undefined,
      revisedContent: isTopThree ? data.revisedContent : undefined,
      promptText: data.promptText,
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

/**
 * @description Fetches top 3 submissions for a prompt with formatted display names.
 * Format: "Title Name, Rank Tier" (e.g., "Wordsmith Tom Smith, Scribe III")
 * Only includes completed submissions (those with revision).
 */
export async function getTopThree(promptId: string): Promise<LeaderboardEntry[]> {
  const submissionsRef = collection(db, 'rankedSubmissions');
  const q = query(
    submissionsRef,
    where('promptId', '==', promptId),
    orderBy('originalScore', 'desc'),
    orderBy('submittedAt', 'asc')
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return [];

  // Filter to only completed submissions and deduplicate by userId
  const submissionsByUser = new Map<string, RankedSubmission>();
  
  snapshot.docs.forEach((docSnap) => {
    const data = docSnap.data() as RankedSubmission;
    
    // Skip submissions without completedAt (not yet revised)
    if (!data.completedAt) return;
    
    const existing = submissionsByUser.get(data.userId);
    
    // Keep the submission with the higher originalScore
    if (!existing || data.originalScore > existing.originalScore) {
      submissionsByUser.set(data.userId, data);
    }
  });

  // Sort by originalScore and take top 3
  const topSubmissions = [...submissionsByUser.values()]
    .sort((a, b) => {
      if (b.originalScore !== a.originalScore) return b.originalScore - a.originalScore;
      // Tiebreaker: higher revisedScore wins
      const aRevised = a.revisedScore ?? 0;
      const bRevised = b.revisedScore ?? 0;
      if (bRevised !== aRevised) return bRevised - aRevised;
      // Final tiebreaker: earlier submission wins
      return a.submittedAt.toMillis() - b.submittedAt.toMillis();
    })
    .slice(0, 3);

  if (topSubmissions.length === 0) return [];

  // Extract user IDs and fetch profiles in parallel
  const userIds = topSubmissions.map((s) => s.userId);
  
  const profilePromises = userIds.map((uid) => 
    getDoc(doc(db, 'users', uid)).catch(() => null)
  );
  const profileSnapshots = await Promise.all(profilePromises);

  // Build formatted display name map with title and rank
  const displayNames: Record<string, string> = {};
  profileSnapshots.forEach((snap, index) => {
    if (snap?.exists()) {
      const profileData = snap.data();
      const name = profileData.displayName || `Scribe #${index + 1}`;
      const title = profileData.title || 'Wordsmith';
      const skillLevel = profileData.skillLevel || 'scribe';
      const skillTier = profileData.skillTier || 3;
      displayNames[userIds[index]] = formatLeaderboardName(name, title, skillLevel, skillTier);
    }
  });

  return topSubmissions.map((data, index) => {
    const rank = index + 1;
    return {
      displayName: displayNames[data.userId] || formatLeaderboardName(`Scribe #${rank}`, 'Wordsmith', 'scribe', 3),
      originalScore: data.originalScore,
      revisedScore: data.revisedScore,
      rank,
      submittedAt: data.submittedAt,
      promptText: data.promptText,
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

/**
 * @description Gets top 3 students by daily LP earned for a specific level (paragraph/essay).
 * Queries all submissions from today, sums lpEarned per user, and returns top 3.
 */
export async function getDailyTopThree(level: 'paragraph' | 'essay'): Promise<DailyChampion[]> {
  const submissionsRef = collection(db, 'rankedSubmissions');
  
  // Get start of today
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startTimestamp = Timestamp.fromDate(startOfToday);
  
  const q = query(
    submissionsRef,
    where('level', '==', level),
    where('submittedAt', '>=', startTimestamp)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return [];

  // Sum LP by user
  const lpByUser = new Map<string, number>();
  snapshot.docs.forEach((docSnap) => {
    const data = docSnap.data() as RankedSubmission;
    const current = lpByUser.get(data.userId) || 0;
    lpByUser.set(data.userId, current + (data.lpEarned || 0));
  });

  // Sort by LP descending and take top 3
  const sortedUsers = [...lpByUser.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  if (sortedUsers.length === 0) return [];

  // Fetch display names and profile data
  const userIds = sortedUsers.map(([uid]) => uid);
  const profilePromises = userIds.map((uid) => 
    getDoc(doc(db, 'users', uid)).catch(() => null)
  );
  const profileSnapshots = await Promise.all(profilePromises);

  // Build formatted display name map with title and rank
  const displayNames: Record<string, string> = {};
  profileSnapshots.forEach((snap, index) => {
    if (snap?.exists()) {
      const profileData = snap.data();
      const name = profileData.displayName || `Champion #${index + 1}`;
      const title = profileData.title || 'Wordsmith';
      const skillLevel = profileData.skillLevel || 'scribe';
      const skillTier = profileData.skillTier || 3;
      displayNames[userIds[index]] = formatLeaderboardName(name, title, skillLevel, skillTier);
    }
  });

  return sortedUsers.map(([userId, dailyLP], index) => ({
    userId,
    displayName: displayNames[userId] || formatLeaderboardName(`Champion #${index + 1}`, 'Wordsmith', 'scribe', 3),
    dailyLP,
    rank: index + 1,
  }));
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

