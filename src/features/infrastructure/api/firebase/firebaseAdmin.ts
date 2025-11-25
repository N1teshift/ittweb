import type { App as FirebaseAdminApp } from 'firebase-admin/app';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createComponentLogger } from '@/features/infrastructure/logging';

const logger = createComponentLogger('firebaseAdmin');

let adminApp: FirebaseAdminApp | null = null;

type AdminCredentials = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

function readAdminCredentials(): AdminCredentials {
  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    '';
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || '';
  const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY || '';

  console.log('[firebaseAdmin] env snippet', {
    projectId,
    clientEmail,
    hasPrivateKey: !!rawKey,
    keyStart: rawKey?.slice(0, 30),
    keyEnd: rawKey?.slice(-30),
  });

  if (process.env.NODE_ENV === 'development') {
    logger.debug('Firebase admin env check', {
      hasProjectId: !!projectId,
      hasClientEmail: !!clientEmail,
      hasPrivateKey: !!rawKey,
    });
  }

  if (!projectId || !clientEmail || !rawKey) {
    throw new Error(
      'Firebase admin credentials are missing. Please set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY environment variables.'
    );
  }

  const privateKey = rawKey.replace(/\\n/g, '\n');

  return { projectId, clientEmail, privateKey };
}

export function initializeFirebaseAdminApp(): FirebaseAdminApp {
  if (adminApp) {
    return adminApp;
  }

  const existing = getApps();
  if (existing.length > 0) {
    adminApp = existing[0];
    return adminApp;
  }

  try {
    const credentials = readAdminCredentials();
    adminApp = initializeApp({
      credential: cert(credentials),
      projectId: credentials.projectId,
    });
    return adminApp;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      logger.error('Firebase admin initialization failed', error as Error, {
        hasProjectId: !!process.env.FIREBASE_ADMIN_PROJECT_ID,
        hasClientEmail: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        hasPrivateKey: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
      });
    }
    logger.error('Failed to initialize Firebase admin app', error as Error);
    throw error;
  }
}

export function getAdminFirestore() {
  const app = initializeFirebaseAdminApp();
  return getFirestore(app);
}


