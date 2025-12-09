import { db } from '../config/firebase';
import { collection, doc, query, where, getDocs, getDoc, orderBy, setDoc, serverTimestamp } from 'firebase/firestore';
import { RankedPrompt } from '@/lib/types';

const RANKED_TOPICS = [
  'Summer', 'Friendship', 'Video Games', 'Superheroes', 'Space',
  'Pets', 'Sports', 'Music', 'Bravery', 'Flying', 'Dinosaurs',
  'The Ocean', 'Robots', 'Dreams', 'Holidays', 'Wild Animals',
  'Books', 'Inventions', 'Weather', 'Movies', 'Nature', 'Travel',
  'Art', 'Winter', 'Teamwork', 'Technology', 'Forests', 'Mountains',
  'Learning', 'Sleep', 'Magic', 'Kindness', 'Colors',
];

function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

function getTopicForDate(dateString: string): string {
  const dateParts = dateString.split('-').map(Number);
  const seed = dateParts[0] * 10000 + dateParts[1] * 100 + dateParts[2];
  const random = seededRandom(seed);
  const index = Math.floor(random() * RANKED_TOPICS.length);
  return RANKED_TOPICS[index];
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

export async function getTodaysPrompt(
  level: 'paragraph' | 'essay' = 'paragraph'
): Promise<RankedPrompt | null> {
  const { getDebugDate } = await import('@/lib/utils/debug-date');
  const today = getDebugDate();
  const dateString = formatDateString(today);

  const existing = await getPromptByDate(today, level);
  if (existing) return existing;

  const topic = getTopicForDate(dateString);
  const deterministicId = `${level}-${dateString}`;

  try {
    const response = await fetch('/fantasy/api/daily-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate prompt');
    }

    const { promptText } = await response.json();

    const promptsRef = collection(db, 'rankedPrompts');
    const existingSnapshot = await getDocs(query(promptsRef, where('level', '==', level)));
    const sequenceNumber = existingSnapshot.size + 1;

    const newPrompt = {
      level,
      sequenceNumber,
      activeDate: dateString,
      promptText,
      topic,
      createdAt: serverTimestamp(),
    };

    const docRef = doc(promptsRef, deterministicId);
    await setDoc(docRef, newPrompt, { merge: false });

    const created = await getDoc(docRef);
    if (!created.exists()) {
      throw new Error('Failed to create prompt');
    }

    return {
      id: created.id,
      ...created.data(),
    } as RankedPrompt;
  } catch (error) {
    console.error('getTodaysPrompt error:', error);
    return null;
  }
}

