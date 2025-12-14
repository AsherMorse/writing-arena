import { db } from '../config/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { RankedProgress, UserProfile } from '@/lib/types';

const DEFAULT_PROGRESS: RankedProgress = {
  currentPromptSequence: 1,
  completedPrompts: [],
};

export async function getUserRankedProgress(userId: string): Promise<RankedProgress> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return DEFAULT_PROGRESS;
  }

  const userData = userSnap.data() as UserProfile;
  return userData.rankedProgress || DEFAULT_PROGRESS;
}

export async function advanceUserProgress(
  userId: string,
  completedPromptId: string
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return;
  }

  const userData = userSnap.data() as UserProfile;
  const currentProgress = userData.rankedProgress || DEFAULT_PROGRESS;

  const alreadyCompleted = currentProgress.completedPrompts.includes(completedPromptId);

  const updatedProgress: RankedProgress = {
    currentPromptSequence: alreadyCompleted
      ? currentProgress.currentPromptSequence
      : currentProgress.currentPromptSequence + 1,
    completedPrompts: alreadyCompleted
      ? currentProgress.completedPrompts
      : [...currentProgress.completedPrompts, completedPromptId],
  };

  await updateDoc(userRef, {
    rankedProgress: updatedProgress,
    updatedAt: serverTimestamp(),
  });
}

export async function resetUserProgress(userId: string): Promise<void> {
  const userRef = doc(db, 'users', userId);

  await updateDoc(userRef, {
    rankedProgress: DEFAULT_PROGRESS,
    updatedAt: serverTimestamp(),
  });
}
