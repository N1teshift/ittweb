import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore, Timestamp as AdminTimestamp } from 'firebase-admin/firestore';

let adminApp: App | null = null;
let adminDb: Firestore | null = null;

/**
 * Initialize Firebase Admin SDK (server-side only)
 * Uses service account credentials from environment variables or Application Default Credentials
 */
export function initializeFirebaseAdmin(): App {
  if (adminApp) {
    return adminApp;
  }

  // Check if Firebase Admin is already initialized
  const existingApps = getApps();
  if (existingApps.length > 0) {
    adminApp = existingApps[0];
    return adminApp;
  }

  // Try to initialize with service account credentials from environment
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;

  if (serviceAccountKey && projectId) {
    try {
      // Parse the service account key (can be JSON string)
      // If it's a file path, it should be loaded separately
      const credentials = JSON.parse(serviceAccountKey);

      adminApp = initializeApp({
        credential: cert(credentials),
        projectId,
      });
      return adminApp;
    } catch (error) {
      console.error('Failed to initialize Firebase Admin with service account:', error);
      // Fall through to Application Default Credentials
    }
  }

  // Fall back to Application Default Credentials (works in Firebase environments)
  try {
    adminApp = initializeApp({
      projectId,
    });
    return adminApp;
  } catch (error) {
    throw new Error(
      `Firebase Admin initialization failed: ${error instanceof Error ? error.message : String(error)}. ` +
      'Please set FIREBASE_SERVICE_ACCOUNT_KEY or use Application Default Credentials.'
    );
  }
}

/**
 * Get Firestore Admin instance (server-side only)
 * This bypasses security rules and should only be used in API routes
 */
export function getFirestoreAdmin(): Firestore {
  if (!adminDb) {
    const app = initializeFirebaseAdmin();
    adminDb = getFirestore(app);
  }
  return adminDb;
}

/**
 * Check if we're running on the server
 */
export function isServerSide(): boolean {
  return typeof window === 'undefined';
}

/**
 * Get Admin Timestamp utility
 */
export function getAdminTimestamp() {
  return AdminTimestamp;
}

