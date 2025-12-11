/**
 * @fileoverview Removes ", House X" suffix from existing noble names.
 * Run with: node scripts/shorten-noble-names.js
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

/**
 * @description Removes ", House X" from a name if present.
 */
function shortenName(name) {
  if (!name) return name;
  const houseIndex = name.indexOf(', House ');
  if (houseIndex === -1) return name;
  return name.substring(0, houseIndex);
}

/**
 * @description Main function to shorten all noble names.
 */
async function shortenNames() {
  console.log('Starting name shortening...\n');

  const usersSnapshot = await getDocs(collection(db, 'users'));
  
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data();
    const uid = userDoc.id;
    const currentName = userData.displayName;

    // Skip if no house in name
    if (!currentName || !currentName.includes(', House ')) {
      console.log(`[SKIP] ${uid} - No house in name: ${currentName}`);
      skipped++;
      continue;
    }

    const shortName = shortenName(currentName);

    try {
      await updateDoc(userDoc.ref, {
        displayName: shortName,
        updatedAt: serverTimestamp(),
      });

      console.log(`[OK] ${uid}`);
      console.log(`     ${currentName}`);
      console.log(`  -> ${shortName}`);
      updated++;
    } catch (error) {
      console.error(`[ERROR] ${uid} - ${error.message}`);
      errors++;
    }
  }

  console.log('\n--- Shortening Complete ---');
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log(`Total: ${usersSnapshot.size}`);
}

// Run
shortenNames()
  .then(() => {
    console.log('\nDone.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nFailed:', error);
    process.exit(1);
  });
