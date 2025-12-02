import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

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

// Check if config is valid
const isConfigValid = firebaseConfig.apiKey && firebaseConfig.projectId;

if (!isConfigValid) {
  console.warn('Firebase config is missing. Please check your .env.local file.');
}

// Initialize Firebase only if it hasn't been initialized and config is valid
const app = isConfigValid && getApps().length === 0 
  ? initializeApp(firebaseConfig) 
  : getApps()[0];

// Initialize services
export const auth = app ? getAuth(app) : null as any;
export const db = app ? getFirestore(app) : null as any;

// Analytics only on client side
export const analytics = typeof window !== 'undefined' && app ? getAnalytics(app) : null;

export default app;

