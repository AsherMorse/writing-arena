/**
 * @fileoverview Service for claiming unique medieval names from the pool.
 * Handles temporary reservations and permanent claims to ensure uniqueness.
 */

import { db } from '../config/firebase';
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { generateRandomName, hashName } from '../utils/medieval-name-generator';

const TAKEN_NAMES_COLLECTION = 'takenNames';

interface NameReservation {
  displayName: string;
  reservedBy: string;
  reservedAt: Timestamp;
  expiresAt: Timestamp | null;
  claimed: boolean;
  claimedBy?: string;
  claimedAt?: Timestamp;
}

/**
 * @description Checks if a name reservation is expired.
 */
function isExpired(reservation: NameReservation): boolean {
  if (!reservation.expiresAt) return false;
  return reservation.expiresAt.toDate() < new Date();
}

/**
 * @description Reserves multiple names temporarily for user selection.
 * Names expire after TTL if not claimed, allowing others to use them.
 */
export async function reserveNameOptions(
  uid: string,
  count: number = 5,
  ttlMinutes: number = 5
): Promise<string[]> {
  const names: string[] = [];
  const expiresAt = Timestamp.fromDate(
    new Date(Date.now() + ttlMinutes * 60 * 1000)
  );

  let totalAttempts = 0;
  const maxTotalAttempts = count * 20;

  while (names.length < count && totalAttempts < maxTotalAttempts) {
    totalAttempts++;
    const name = generateRandomName();
    const nameHash = hashName(name);

    try {
      const success = await runTransaction(db, async (transaction) => {
        const nameRef = doc(db, TAKEN_NAMES_COLLECTION, nameHash);
        const nameDoc = await transaction.get(nameRef);

        if (nameDoc.exists()) {
          const data = nameDoc.data() as NameReservation;
          // Only allow if reservation is expired and unclaimed
          if (data.claimed || !isExpired(data)) {
            return false;
          }
        }

        transaction.set(nameRef, {
          displayName: name,
          reservedBy: uid,
          reservedAt: serverTimestamp(),
          expiresAt,
          claimed: false,
        });

        return true;
      });

      if (success) {
        names.push(name);
      }
    } catch {
      // Transaction conflict, try another name
    }
  }

  if (names.length < count) {
    throw new Error(
      `Could only reserve ${names.length} of ${count} names after ${totalAttempts} attempts`
    );
  }

  return names;
}

/**
 * @description Permanently claims a reserved name for a user.
 * Removes expiration so the name is taken forever.
 */
export async function confirmNameSelection(
  uid: string,
  selectedName: string
): Promise<void> {
  const nameHash = hashName(selectedName);
  const nameRef = doc(db, TAKEN_NAMES_COLLECTION, nameHash);

  await runTransaction(db, async (transaction) => {
    const nameDoc = await transaction.get(nameRef);

    if (!nameDoc.exists()) {
      throw new Error('Name reservation not found');
    }

    const data = nameDoc.data() as NameReservation;

    if (data.claimed) {
      throw new Error('Name already claimed by another user');
    }

    if (data.reservedBy !== uid && !isExpired(data)) {
      throw new Error('Name reserved by another user');
    }

    transaction.update(nameRef, {
      claimedBy: uid,
      claimedAt: serverTimestamp(),
      claimed: true,
      expiresAt: null,
    });
  });
}

/**
 * @description Releases names that weren't selected back to the pool.
 */
export async function releaseUnselectedNames(
  uid: string,
  allNames: string[],
  selectedName: string
): Promise<void> {
  const toRelease = allNames.filter((n) => n !== selectedName);

  await Promise.all(
    toRelease.map(async (name) => {
      const nameHash = hashName(name);
      const nameRef = doc(db, TAKEN_NAMES_COLLECTION, nameHash);

      try {
        const nameDoc = await getDoc(nameRef);
        if (nameDoc.exists()) {
          const data = nameDoc.data() as NameReservation;
          // Only release if this user reserved it and it's not claimed
          if (data.reservedBy === uid && !data.claimed) {
            await deleteDoc(nameRef);
          }
        }
      } catch {
        // Ignore errors during cleanup
      }
    })
  );
}

/**
 * @description Releases a specific name back to the pool.
 */
export async function releaseName(displayName: string): Promise<void> {
  const nameHash = hashName(displayName);
  await deleteDoc(doc(db, TAKEN_NAMES_COLLECTION, nameHash));
}

/**
 * @description Claims a random name directly (for migrations).
 * Tries multiple names until one is available.
 */
export async function claimRandomName(uid: string): Promise<string> {
  const maxAttempts = 50;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const name = generateRandomName();
    const nameHash = hashName(name);

    try {
      const success = await runTransaction(db, async (transaction) => {
        const nameRef = doc(db, TAKEN_NAMES_COLLECTION, nameHash);
        const nameDoc = await transaction.get(nameRef);

        if (nameDoc.exists()) {
          const data = nameDoc.data() as NameReservation;
          if (data.claimed || !isExpired(data)) {
            return null;
          }
        }

        transaction.set(nameRef, {
          displayName: name,
          reservedBy: uid,
          reservedAt: serverTimestamp(),
          expiresAt: null,
          claimed: true,
          claimedBy: uid,
          claimedAt: serverTimestamp(),
        });

        return name;
      });

      if (success) return success;
    } catch {
      // Transaction conflict, retry
    }
  }

  throw new Error('Failed to claim a unique name after max attempts');
}

/**
 * @description Regenerates a user's name by releasing old and claiming new options.
 * Returns new reserved options for the user to pick from.
 */
export async function regenerateNameOptions(
  uid: string,
  oldName: string
): Promise<string[]> {
  await releaseName(oldName);
  return reserveNameOptions(uid);
}
