// This file should only be imported in server-side code (API routes)
// Marking as server-only to prevent client bundling
if (typeof window !== 'undefined') {
  throw new Error('firebase-admin can only be used in server-side code');
}

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { logger, LOG_CONTEXTS } from '@/lib/utils/logger';

// Initialize Firebase Admin
// We need to use the service account key from environment variables
// or use the default credentials if running in a managed environment

// Keep track of the initialized app
let app: App;

if (getApps().length === 0) {
  // For local development or Vercel, we might need to handle credentials differently
  // Priority: 1. Service account key file, 2. Environment variable, 3. Default credentials
  
  let serviceAccount: any = null;
  
  // Try to load from service account key file (for local development)
  try {
    const fs = require('fs');
    const path = require('path');
    const keyPath = path.join(process.cwd(), 'writing-arena-firebase-adminsdk-fbsvc-2d22b9faf8.json');
    if (fs.existsSync(keyPath)) {
      serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    }
  } catch (error) {
    // File doesn't exist or can't be read, continue to next option
  }
  
  // Try environment variable (for Vercel deployment)
  if (!serviceAccount && process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    } catch (error) {
      logger.error(LOG_CONTEXTS.FIREBASE, 'Error parsing service account key from env', error);
    }
  }
  
  // Initialize with service account if available
  if (serviceAccount) {
    try {
      app = initializeApp({
        credential: cert(serviceAccount),
        projectId: 'writing-arena',
      });
    } catch (error) {
      logger.error(LOG_CONTEXTS.FIREBASE, 'Error initializing with service account', error);
      // Fallback to default init
      app = initializeApp({
        projectId: 'writing-arena',
      });
    }
  } else {
    // Fallback to default initialization (works on Google Cloud Platform automatically)
    // For Vercel without service account, this might fail for protected operations
    // but we'll try best effort.
    // Note: This will likely fail locally without GOOGLE_APPLICATION_CREDENTIALS env var
    app = initializeApp({
      projectId: 'writing-arena',
    });
  }
} else {
  app = getApps()[0];
}

export const adminDb = getFirestore(app);
