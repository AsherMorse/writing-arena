/**
 * @fileoverview Practice mode mastery service.
 * Handles tracking and updating lesson mastery status for users.
 */

import { db } from '../config/firebase';
import { doc, getDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { LessonMasteryStatus, UserProfile } from '@/lib/types';
import { MASTERY_THRESHOLD, calculatePracticeLP } from '@/lib/constants/practice-lessons';

/**
 * @description Updates mastery status for a lesson after a practice attempt.
 * Updates on any attempt, tracks best score, and sets mastered flag when threshold reached.
 */
export async function updateMastery(
  uid: string,
  lessonId: string,
  score: number
): Promise<LessonMasteryStatus> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error(`User not found: ${uid}`);
  }

  const userData = userSnap.data() as UserProfile;
  const currentMastery = userData.practiceMastery?.[lessonId];
  const now = Timestamp.now();
  const isMasteredNow = score >= MASTERY_THRESHOLD;

  // Build updated mastery status
  // Determine masteredAt: keep existing, set now if first mastery, or omit if not mastered
  const masteredAt = currentMastery?.masteredAt || (isMasteredNow ? now : undefined);

  const updatedStatus: LessonMasteryStatus = {
    mastered: currentMastery?.mastered || isMasteredNow,
    bestScore: Math.max(score, currentMastery?.bestScore || 0),
    lastScore: score,
    completedAt: currentMastery?.completedAt || now,
    attempts: (currentMastery?.attempts || 0) + 1,
    // Only include masteredAt if it has a value (Firestore rejects undefined)
    ...(masteredAt && { masteredAt }),
  };

  // Update Firestore
  await updateDoc(userRef, {
    [`practiceMastery.${lessonId}`]: updatedStatus,
    updatedAt: serverTimestamp(),
  });

  return updatedStatus;
}

/**
 * @description Checks if a user has mastered a specific lesson.
 */
export async function isMastered(uid: string, lessonId: string): Promise<boolean> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return false;

  const userData = userSnap.data() as UserProfile;
  return userData.practiceMastery?.[lessonId]?.mastered || false;
}

/**
 * @description Gets all mastery statuses for a user.
 */
export async function getUserMasteryStatus(
  uid: string
): Promise<Record<string, LessonMasteryStatus>> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return {};

  const userData = userSnap.data() as UserProfile;
  return userData.practiceMastery || {};
}

/**
 * @description Gets mastery status for a specific lesson.
 */
export async function getLessonMasteryStatus(
  uid: string,
  lessonId: string
): Promise<LessonMasteryStatus | null> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return null;

  const userData = userSnap.data() as UserProfile;
  return userData.practiceMastery?.[lessonId] || null;
}

/**
 * @description Checks if a user can earn LP for a lesson (false if already mastered).
 */
export async function canEarnLP(uid: string, lessonId: string): Promise<boolean> {
  const mastered = await isMastered(uid, lessonId);
  return !mastered;
}

/**
 * @description Calculates LP earned for a practice session.
 * Returns 0 if lesson is already mastered.
 */
export async function calculateLPForSession(
  uid: string,
  lessonId: string,
  score: number
): Promise<number> {
  const mastered = await isMastered(uid, lessonId);
  return calculatePracticeLP(score, mastered);
}

/**
 * @description Gets category mastery progress (e.g., "2/5 sentence skills mastered").
 */
export async function getCategoryMasteryProgress(
  uid: string,
  category: 'sentence' | 'paragraph' | 'essay',
  lessonIds: string[]
): Promise<{ mastered: number; total: number }> {
  const masteryStatus = await getUserMasteryStatus(uid);
  
  const masteredCount = lessonIds.filter(
    id => masteryStatus[id]?.mastered
  ).length;

  return {
    mastered: masteredCount,
    total: lessonIds.length,
  };
}

