import { db } from '../config/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { RankedPrompt } from '@/lib/types';

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
