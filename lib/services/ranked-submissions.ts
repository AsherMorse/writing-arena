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
import { RankedSubmission } from '@/lib/types';

export async function createRankedSubmission(
  userId: string,
  promptId: string,
  originalContent: string,
  originalScore: number,
  originalFeedback: Record<string, unknown>
): Promise<string> {
  const submissionsRef = collection(db, 'rankedSubmissions');

  const docRef = await addDoc(submissionsRef, {
    userId,
    promptId,
    originalContent,
    originalScore,
    originalFeedback,
    submittedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function updateRankedSubmission(
  submissionId: string,
  revisedContent: string,
  revisedScore: number,
  revisedFeedback: Record<string, unknown>
): Promise<void> {
  const submissionRef = doc(db, 'rankedSubmissions', submissionId);

  await updateDoc(submissionRef, {
    revisedContent,
    revisedScore,
    revisedFeedback,
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
