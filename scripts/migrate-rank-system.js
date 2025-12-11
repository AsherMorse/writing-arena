/**
 * @fileoverview Migration script to set new skill-based rank defaults for all users.
 * Run with: node scripts/migrate-rank-system.js
 * 
 * This script sets all users to Scribe III with 65 LP (the new rank system defaults).
 * 
 * NOTE: Requires temporary open firestore rules to run.
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  getDocs, 
  updateDoc,
  serverTimestamp,
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

// New rank system defaults
const RANK_DEFAULTS = {
  skillLevel: 'scribe',
  skillTier: 3,
  tierLP: 65,
};

/**
 * @description Main migration function.
 */
async function migrateRankSystem() {
  console.log('Starting rank system migration...');
  console.log(`Setting all users to: ${RANK_DEFAULTS.skillLevel} ${RANK_DEFAULTS.skillTier === 3 ? 'III' : RANK_DEFAULTS.skillTier === 2 ? 'II' : 'I'} with ${RANK_DEFAULTS.tierLP} LP\n`);

  const usersSnapshot = await getDocs(collection(db, 'users'));
  
  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data();
    const uid = userDoc.id;

    // Skip if already has new rank fields set
    if (userData.skillLevel && userData.skillTier && userData.tierLP !== undefined) {
      console.log(`[SKIP] ${uid} - Already has rank: ${userData.skillLevel} ${userData.skillTier}, ${userData.tierLP} LP`);
      skipped++;
      continue;
    }

    try {
      await updateDoc(userDoc.ref, {
        skillLevel: RANK_DEFAULTS.skillLevel,
        skillTier: RANK_DEFAULTS.skillTier,
        tierLP: RANK_DEFAULTS.tierLP,
        updatedAt: serverTimestamp(),
      });

      console.log(`[OK] ${uid} - Set to Scribe III, 65 LP`);
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
migrateRankSystem()
  .then(() => {
    console.log('\nRank system migration finished successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nMigration failed:', error);
    process.exit(1);
  });
