/**
 * @fileoverview One-time migration to assign noble names to existing users.
 * Run with: node scripts/migrate-noble-names.js
 * 
 * This script:
 * 1. Queries all users without hasNobleName = true
 * 2. Assigns a unique medieval noble name to each
 * 3. Updates hasNobleName to true
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc,
  runTransaction,
  serverTimestamp,
  Timestamp
} = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAf4CsjSud_lH3oOUhBngvIAZNxIWDpS0Q",
  authDomain: "writing-arena.firebaseapp.com",
  databaseURL: "https://writing-arena-default-rtdb.firebaseio.com",
  projectId: "writing-arena",
  storageBucket: "writing-arena.firebasestorage.app",
  messagingSenderId: "774068675032",
  appId: "1:774068675032:web:1426c690e6d34dc93a52ad",
  measurementId: "G-8GZWHR7FKN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Name generation constants
const TITLES = [
  'Sir', 'Lady', 'Lord', 'Dame', 'Squire', 'Knight', 'Baron', 'Baroness',
  'Duke', 'Duchess', 'Count', 'Countess', 'Sage', 'Scribe', 'Magister',
];

const FIRST_NAMES = [
  'Aldric', 'Elara', 'Cedric', 'Isolde', 'Gareth', 'Rowena', 'Theron',
  'Lyra', 'Edmund', 'Seraphina', 'Alaric', 'Gwendolyn', 'Roderick',
  'Elowen', 'Osric', 'Brynn', 'Leofric', 'Astrid', 'Percival', 'Rosalind',
  'Aldwin', 'Mira', 'Caspian', 'Freya', 'Hadrian', 'Wren',
];

const EPITHETS = [
  'the Bold', 'the Wise', 'the Swift', 'the Brave', 'the Clever',
  'the Curious', 'the Wordsmith', 'the Scribe', 'the Storyteller',
  'the Eloquent', 'the Thoughtful', 'the Keen', 'the Steadfast',
  'the Learned', 'the Dreamer',
];

/**
 * @description Generates a random medieval-style display name.
 */
function generateRandomName() {
  const title = TITLES[Math.floor(Math.random() * TITLES.length)];
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const epithet = EPITHETS[Math.floor(Math.random() * EPITHETS.length)];

  return `${title} ${firstName} ${epithet}`;
}

/**
 * @description Creates a Firestore-safe document ID from a name.
 */
function hashName(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * @description Claims a random name directly for a user.
 */
async function claimRandomName(uid) {
  const maxAttempts = 50;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const name = generateRandomName();
    const nameHash = hashName(name);

    try {
      const success = await runTransaction(db, async (transaction) => {
        const nameRef = doc(db, 'takenNames', nameHash);
        const nameDoc = await transaction.get(nameRef);

        if (nameDoc.exists()) {
          const data = nameDoc.data();
          // Check if expired
          if (data.claimed || !data.expiresAt || data.expiresAt.toDate() > new Date()) {
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
    } catch (error) {
      // Transaction conflict, retry
    }
  }

  throw new Error('Failed to claim a unique name after max attempts');
}

/**
 * @description Main migration function.
 */
async function migrateUsers() {
  console.log('Starting noble name migration...\n');

  const usersSnapshot = await getDocs(collection(db, 'users'));
  
  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data();
    const uid = userDoc.id;

    // Skip if already has noble name
    if (userData.hasNobleName === true) {
      console.log(`[SKIP] ${uid} - Already has noble name: ${userData.displayName}`);
      skipped++;
      continue;
    }

    try {
      const nobleName = await claimRandomName(uid);

      await updateDoc(userDoc.ref, {
        displayName: nobleName,
        hasNobleName: true,
        updatedAt: serverTimestamp(),
      });

      console.log(`[OK] ${uid} - Assigned: ${nobleName}`);
      migrated++;
    } catch (error) {
      console.error(`[ERROR] ${uid} - ${error.message}`);
      errors++;
    }
  }

  console.log('\n--- Migration Complete ---');
  console.log(`Migrated: ${migrated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log(`Total: ${usersSnapshot.size}`);
}

// Run migration
migrateUsers()
  .then(() => {
    console.log('\nMigration finished successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nMigration failed:', error);
    process.exit(1);
  });
