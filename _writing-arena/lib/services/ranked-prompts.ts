import { db } from '../config/firebase';
import { collection, doc, query, where, getDocs, getDoc, orderBy, setDoc, serverTimestamp } from 'firebase/firestore';
import { RankedPrompt } from '@/lib/types';
import { getUserSubmissionsForDate } from './ranked-submissions';

// Old topics (too young for grades 6-8)
// const RANKED_TOPICS = [
//   'Summer', 'Friendship', 'Video Games', 'Superheroes', 'Space',
//   'Pets', 'Sports', 'Music', 'Bravery', 'Flying', 'Dinosaurs',
//   'The Ocean', 'Robots', 'Dreams', 'Holidays', 'Wild Animals',
//   'Books', 'Inventions', 'Weather', 'Movies', 'Nature', 'Travel',
//   'Art', 'Winter', 'Teamwork', 'Technology', 'Forests', 'Mountains',
//   'Learning', 'Sleep', 'Magic', 'Kindness', 'Colors',
// ];

export const RANKED_TOPICS = [
  // Entertainment
  'Video Games', 'YouTube', 'Music', 'Movies', 'Anime', 'Sports',
  'TikTok', 'Streaming Shows', 'Social Media', 'Memes',
  
  // Food
  'Pizza', 'Fast Food', 'Snacks', 'School Lunch', 
  
  // Things Kids Care About
  'Cars', 'Shoes', 'Phones', 'Pets', 'Books',
  'Skateboards', 'Hobbies',
  
  // School Life
  'Field Trips', 'Summer Break', 'Recess', 'Group Projects',
  'After-School Clubs', 'Lunch Tables',
];

export const VIBES = [
  'convince a skeptical friend',
  'explain it to someone who has never heard of it',
  'settle an argument',
  'give your honest hot take',
  'hype it up',
  'defend an unpopular opinion about it',
];

export const ESSAY_TOPICS = [
  // Debates students care about
  'Screen Time', 'Homework', 'School Start Times', 'Dress Codes',
  'Social Media Age Limits', 'Video Game Violence', 'Phone Rules',
  'Standardized Tests', 'Group Projects', 'Online Learning',
  // Multi-dimensional topics
  'Friendship', 'Competition vs Cooperation', 'Taking Risks',
  'Learning from Failure', 'Following Rules vs Questioning Them',
  'Privacy Online', 'Fame and Influence', 'Fitting In vs Standing Out',
  // Compare/contrast friendly
  'Online vs In-Person Friendships', 'Books vs Movies',
  'Solo vs Team Activities', 'City vs Small Town Life',
];

export const ESSAY_VIBES = [
  'settle an argument',
  'defend an unpopular opinion',
  'convince someone who disagrees',
  'explain why people get it wrong',
  'compare two sides fairly',
  'challenge what everyone assumes',
  'make someone care about this',
];

function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

function getDateSeed(dateString: string): number {
  const dateParts = dateString.split('-').map(Number);
  return dateParts[0] * 10000 + dateParts[1] * 100 + dateParts[2];
}

function getTopicForPrompt(
  dateString: string,
  promptIndex: number,
  level: 'paragraph' | 'essay' = 'paragraph'
): string {
  const topics = level === 'essay' ? ESSAY_TOPICS : RANKED_TOPICS;
  const baseSeed = getDateSeed(dateString);
  const seed = baseSeed + promptIndex * 7919;
  const random = seededRandom(seed);
  const index = Math.floor(random() * topics.length);
  return topics[index];
}

function getAngleForPrompt(
  dateString: string,
  promptIndex: number,
  level: 'paragraph' | 'essay' = 'paragraph'
): string {
  const vibes = level === 'essay' ? ESSAY_VIBES : VIBES;
  const baseSeed = getDateSeed(dateString);
  const seed = baseSeed + promptIndex * 7919 + 1;
  const random = seededRandom(seed);
  const index = Math.floor(random() * vibes.length);
  return vibes[index];
}

export async function getPromptBySequence(
  sequenceNumber: number,
  level: 'paragraph' | 'essay' = 'paragraph'
): Promise<RankedPrompt | null> {
  const promptsRef = collection(db, 'rankedPrompts');
  const q = query(
    promptsRef,
    where('level', '==', level),
    where('sequenceNumber', '==', sequenceNumber)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  } as RankedPrompt;
}

export async function getAllPrompts(
  level: 'paragraph' | 'essay' = 'paragraph'
): Promise<RankedPrompt[]> {
  const promptsRef = collection(db, 'rankedPrompts');
  const q = query(
    promptsRef,
    where('level', '==', level),
    orderBy('sequenceNumber', 'asc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as RankedPrompt[];
}

export async function getMaxSequenceNumber(
  level: 'paragraph' | 'essay' = 'paragraph'
): Promise<number> {
  const prompts = await getAllPrompts(level);
  if (prompts.length === 0) return 0;
  return Math.max(...prompts.map((p) => p.sequenceNumber));
}

export function formatDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

export async function getPromptByDate(
  date: Date,
  level: 'paragraph' | 'essay' = 'paragraph'
): Promise<RankedPrompt | null> {
  const dateString = formatDateString(date);
  const promptsRef = collection(db, 'rankedPrompts');
  const q = query(
    promptsRef,
    where('level', '==', level),
    where('activeDate', '==', dateString)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  } as RankedPrompt;
}

export async function getPromptByDateAndIndex(
  dateString: string,
  promptIndex: number,
  level: 'paragraph' | 'essay' = 'paragraph'
): Promise<RankedPrompt | null> {
  const promptId = `${level}-${dateString}-${promptIndex}`;
  return getPromptById(promptId);
}

/**
 * @description Fetches a prompt by its document ID.
 */
export async function getPromptById(promptId: string): Promise<RankedPrompt | null> {
  const promptsRef = collection(db, 'rankedPrompts');
  const docRef = doc(promptsRef, promptId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as RankedPrompt;
}

async function generatePromptAtIndex(
  dateString: string,
  promptIndex: number,
  level: 'paragraph' | 'essay' = 'paragraph'
): Promise<RankedPrompt | null> {
  const topic = getTopicForPrompt(dateString, promptIndex, level);
  const angle = getAngleForPrompt(dateString, promptIndex, level);
  const promptId = `${level}-${dateString}-${promptIndex}`;

  try {
    const response = await fetch('/api/daily-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, angle, level }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate prompt');
    }

    const { promptText } = await response.json();

    let inspirationText: string | undefined;
    try {
      const inspResponse = await fetch('/api/generate-inspiration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText }),
      });
      if (inspResponse.ok) {
        const inspData = await inspResponse.json();
        inspirationText = inspData.backgroundInfo;
      }
    } catch {
    }

    const promptsRef = collection(db, 'rankedPrompts');
    const existingSnapshot = await getDocs(query(promptsRef, where('level', '==', level)));
    const sequenceNumber = existingSnapshot.size + 1;

    const newPrompt: Record<string, unknown> = {
      level,
      sequenceNumber,
      activeDate: dateString,
      dailyIndex: promptIndex,
      promptText,
      topic,
      angle,
      createdAt: serverTimestamp(),
    };
    
    if (inspirationText) {
      newPrompt.inspirationText = inspirationText;
    }

    const docRef = doc(promptsRef, promptId);
    
    try {
      await setDoc(docRef, newPrompt, { merge: false });
    } catch {
      const existing = await getDoc(docRef);
      if (existing.exists()) {
        return {
          id: existing.id,
          ...existing.data(),
        } as RankedPrompt;
      }
      throw new Error('Failed to create prompt');
    }

    const created = await getDoc(docRef);
    if (!created.exists()) {
      throw new Error('Failed to create prompt');
    }

    return {
      id: created.id,
      ...created.data(),
    } as RankedPrompt;
  } catch (error) {
    console.error('generatePromptAtIndex error:', error);
    return null;
  }
}

export interface NextPromptResult {
  prompt: RankedPrompt | null;
  promptIndex: number;
  completedCount: number;
}

export async function getNextPromptForUser(
  userId: string,
  level: 'paragraph' | 'essay' = 'paragraph'
): Promise<NextPromptResult> {
  const { getDebugDate } = await import('@/lib/utils/debug-date');
  const today = getDebugDate();
  const dateString = formatDateString(today);

  const submissions = await getUserSubmissionsForDate(userId, dateString, level);
  const completedCount = submissions.length;
  const nextIndex = completedCount;

  let prompt = await getPromptByDateAndIndex(dateString, nextIndex, level);
  
  if (!prompt) {
    prompt = await generatePromptAtIndex(dateString, nextIndex, level);
  }

  return {
    prompt,
    promptIndex: nextIndex,
    completedCount,
  };
}

export async function getTodaysPrompt(
  level: 'paragraph' | 'essay' = 'paragraph'
): Promise<RankedPrompt | null> {
  const { getDebugDate } = await import('@/lib/utils/debug-date');
  const today = getDebugDate();
  const dateString = formatDateString(today);

  const existing = await getPromptByDateAndIndex(dateString, 0, level);
  if (existing) return existing;

  return generatePromptAtIndex(dateString, 0, level);
}

