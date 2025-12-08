import { db } from '../config/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  limit,
} from 'firebase/firestore';
import { PracticeSubmission } from '@/lib/types';

export async function createPracticeSubmission(
  userId: string,
  type: 'paragraph' | 'essay',
  topic: string,
  prompt: string,
  originalContent: string,
  originalScore: number,
  originalFeedback: Record<string, unknown>
): Promise<string> {
  const submissionsRef = collection(db, 'practiceSubmissions');

  const docRef = await addDoc(submissionsRef, {
    userId,
    type,
    topic,
    prompt,
    originalContent,
    originalScore,
    originalFeedback,
    submittedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function updatePracticeSubmission(
  submissionId: string,
  revisedContent: string,
  revisedScore: number,
  revisedFeedback: Record<string, unknown>
): Promise<void> {
  const submissionRef = doc(db, 'practiceSubmissions', submissionId);

  await updateDoc(submissionRef, {
    revisedContent,
    revisedScore,
    revisedFeedback,
    completedAt: serverTimestamp(),
  });
}

export async function getUserPracticeSubmissions(
  userId: string,
  type?: 'paragraph' | 'essay',
  maxResults: number = 50
): Promise<PracticeSubmission[]> {
  const submissionsRef = collection(db, 'practiceSubmissions');
  
  let q;
  if (type) {
    q = query(
      submissionsRef,
      where('userId', '==', userId),
      where('type', '==', type),
      orderBy('submittedAt', 'desc'),
      limit(maxResults)
    );
  } else {
    q = query(
      submissionsRef,
      where('userId', '==', userId),
      orderBy('submittedAt', 'desc'),
      limit(maxResults)
    );
  }

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as PracticeSubmission[];
}

export async function deleteAllUserPracticeSubmissions(userId: string): Promise<number> {
  const submissionsRef = collection(db, 'practiceSubmissions');
  const q = query(submissionsRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);

  const { deleteDoc } = await import('firebase/firestore');
  
  const deletePromises = snapshot.docs.map((docSnap) => 
    deleteDoc(doc(db, 'practiceSubmissions', docSnap.id))
  );
  
  await Promise.all(deletePromises);
  return snapshot.size;
}
