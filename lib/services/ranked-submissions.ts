import { db } from '../config/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { RankedSubmission, SubmissionLevel } from '@/lib/types';

/**
 * @description Creates a new ranked submission with level and LP tracking.
 */
export async function createRankedSubmission(
  userId: string,
  promptId: string,
  level: SubmissionLevel,
  originalContent: string,
  originalScore: number,
  originalFeedback: Record<string, unknown>,
  lpEarned: number,
  promptText?: string
): Promise<string> {
  const submissionsRef = collection(db, 'rankedSubmissions');

  const docRef = await addDoc(submissionsRef, {
    userId,
    promptId,
    promptText,
    level,
    originalContent,
    originalScore,
    originalFeedback,
    lpEarned,
    submittedAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * @description Updates a ranked submission with revision data and recalculated LP.
 */
export async function updateRankedSubmission(
  submissionId: string,
  revisedContent: string,
  revisedScore: number,
  revisedFeedback: Record<string, unknown>,
  lpEarned: number
): Promise<void> {
  const submissionRef = doc(db, 'rankedSubmissions', submissionId);

  await updateDoc(submissionRef, {
    revisedContent,
    revisedScore,
    revisedFeedback,
    lpEarned,
    completedAt: serverTimestamp(),
  });
}

export async function getSubmissionByUserAndPrompt(
  userId: string,
  promptId: string
): Promise<RankedSubmission | null> {
  const submissionsRef = collection(db, 'rankedSubmissions');
  const q = query(
    submissionsRef,
    where('userId', '==', userId),
    where('promptId', '==', promptId)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const docSnap = snapshot.docs[0];
  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as RankedSubmission;
}

export async function deleteAllUserSubmissions(userId: string): Promise<number> {
  const submissionsRef = collection(db, 'rankedSubmissions');
  const q = query(submissionsRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);

  const { deleteDoc } = await import('firebase/firestore');
  
  const deletePromises = snapshot.docs.map((docSnap) => 
    deleteDoc(doc(db, 'rankedSubmissions', docSnap.id))
  );
  
  await Promise.all(deletePromises);
  return snapshot.size;
}

export async function getUserSubmissionsForDate(
  userId: string,
  dateString: string,
  level: 'paragraph' | 'essay' = 'paragraph'
): Promise<RankedSubmission[]> {
  const submissionsRef = collection(db, 'rankedSubmissions');
  const q = query(submissionsRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);

  const prefix = `${level}-${dateString}-`;
  
  return snapshot.docs
    .filter((docSnap) => {
      const data = docSnap.data();
      return data.promptId && data.promptId.startsWith(prefix);
    })
    .map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as RankedSubmission[];
}
