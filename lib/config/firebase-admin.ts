import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
// We need to use the service account key from environment variables
// or use the default credentials if running in a managed environment

// Keep track of the initialized app
let app: App;

if (getApps().length === 0) {
  // For local development or Vercel, we might need to handle credentials differently
  // If FIREBASE_SERVICE_ACCOUNT_KEY is present, use it
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      app = initializeApp({
        credential: cert(serviceAccount)
      });
    } catch (error) {
      console.error('Error parsing service account key:', error);
      // Fallback to default init if parsing fails
      app = initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    }
  } else {
    // Fallback to default initialization (works on Google Cloud Platform automatically)
    // For Vercel without service account, this might fail for protected operations
    // but we'll try best effort.
    // Note: This will likely fail locally without GOOGLE_APPLICATION_CREDENTIALS env var
    app = initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
} else {
  app = getApps()[0];
}

export const adminDb = getFirestore(app);
