import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";
import { getFirebaseClientConfig } from './config';
import { createComponentLogger } from '@/features/infrastructure/logging';

const logger = createComponentLogger('firebase.client');

// Initialize Firebase
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let analytics: Analytics | null = null;

/**
 * Initialize Firebase app (singleton pattern)
 * Gracefully handles missing config during CI builds
 */
export function initializeFirebaseApp(): FirebaseApp {
  if (app) {
    return app;
  }

  const config = getFirebaseClientConfig();
  const isCI = process.env.CI === 'true';
  
  // During CI builds, create a minimal stub config if missing (just to allow build to complete)
  if (!config.projectId) {
    if (isCI) {
      logger.warn('Firebase config missing during CI build - using stub config for build');
      // Create minimal stub config to allow build to complete
      const stubConfig = {
        apiKey: 'stub-api-key',
        authDomain: 'stub.firebaseapp.com',
        projectId: 'stub-project',
        storageBucket: 'stub-project.appspot.com',
        messagingSenderId: '123456789',
        appId: 'stub-app-id',
      };
      app = initializeApp(stubConfig);
      return app;
    }
    throw new Error(`Firebase configuration error: Firebase config missing`);
  }

  // Check if Firebase is already initialized
  const existingApps = getApps();
  if (existingApps.length > 0) {
    app = existingApps[0];
  } else {
    app = initializeApp(config);
  }

  return app;
}

/**
 * Get Firestore instance
 */
export function getFirestoreInstance(): Firestore {
  if (!db) {
    const firebaseApp = initializeFirebaseApp();
    db = getFirestore(firebaseApp);
  }
  return db;
}

/**
 * Get Storage instance
 */
export function getStorageInstance(): FirebaseStorage {
  if (!storage) {
    const firebaseApp = initializeFirebaseApp();
    storage = getStorage(firebaseApp);
  }
  return storage;
}

/**
 * Get Analytics instance (client-side only)
 */
export async function getAnalyticsInstance(): Promise<Analytics | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  if (analytics) {
    return analytics;
  }

  try {
    const supported = await isSupported();
    if (supported) {
      const firebaseApp = initializeFirebaseApp();
      analytics = getAnalytics(firebaseApp);
      return analytics;
    }
  } catch (error) {
    logger.warn('Analytics initialization failed', { 
      error: error instanceof Error ? error.message : String(error) 
    });
  }

  return null;
}

// Initialize on import (client-side only, and only if config exists)
if (typeof window !== 'undefined' && !process.env.CI) {
  try {
    const config = getFirebaseClientConfig();
    if (config.projectId) {
      initializeFirebaseApp();
      getAnalyticsInstance();
    }
  } catch (error) {
    logger.error('Firebase initialization error', 
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

// Export instances for backward compatibility
export { app, db, storage, analytics };


