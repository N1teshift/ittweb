/**
 * Firebase client-side configuration
 * Contains Firebase client initialization settings
 */

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

/**
 * Get Firebase client configuration from environment variables
 */
export function getFirebaseClientConfig(): FirebaseClientConfig {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };
}

/**
 * Validate Firebase client configuration
 */
export function validateFirebaseClientConfig(config: FirebaseClientConfig): string[] {
  const errors: string[] = [];

  if (!config.apiKey) {
    errors.push('NEXT_PUBLIC_FIREBASE_API_KEY is required');
  }
  if (!config.authDomain) {
    errors.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is required');
  }
  if (!config.projectId) {
    errors.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID is required');
  }
  if (!config.storageBucket) {
    errors.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is required');
  }
  if (!config.messagingSenderId) {
    errors.push('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID is required');
  }
  if (!config.appId) {
    errors.push('NEXT_PUBLIC_FIREBASE_APP_ID is required');
  }

  return errors;
}


