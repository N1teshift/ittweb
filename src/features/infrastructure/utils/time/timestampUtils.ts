import { Timestamp } from 'firebase/firestore';
import { isServerSide } from '../server/serverUtils';

/**
 * Interface for timestamp-like objects that have a toDate method
 * Used for duck typing to handle both client and admin SDK Timestamps
 */
export interface TimestampLike {
  toDate?: () => Date;
}

/**
 * Standardized timestamp factory interface
 * Provides consistent API for creating timestamps regardless of SDK used
 */
export interface TimestampFactory {
  /**
   * Create a Timestamp from a Date object
   */
  fromDate: (date: Date) => Timestamp;
  /**
   * Create a Timestamp for the current time
   */
  now: () => Timestamp;
}

/**
 * Convert Firestore timestamp to ISO string
 * Handles both client SDK Timestamp and Admin SDK Timestamp
 * 
 * @param timestamp - Timestamp object, ISO string, Date object, or undefined
 * @returns ISO 8601 string representation
 */
export function timestampToIso(
  timestamp: Timestamp | TimestampLike | string | Date | undefined
): string {
  if (!timestamp) return new Date().toISOString();
  if (typeof timestamp === 'string') return timestamp;
  if ('toDate' in timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toISOString();
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  return new Date().toISOString();
}

/**
 * Create a timestamp factory using the Client SDK (firebase/firestore)
 * Use this for client-side code or when you specifically need the client SDK
 * 
 * @returns TimestampFactory using Client SDK
 */
export function createClientTimestampFactory(): TimestampFactory {
  return {
    fromDate: (date: Date) => Timestamp.fromDate(date),
    now: () => Timestamp.now(),
  };
}

// Cache the admin timestamp factory to avoid repeated imports
let cachedAdminTimestampFactory: TimestampFactory | null = null;
let adminTimestampImportPromise: Promise<TimestampFactory> | null = null;

/**
 * Create a timestamp factory using the Admin SDK (firebase-admin/firestore)
 * Use this for server-side code (API routes, server components)
 * 
 * IMPORTANT: This function dynamically imports firebase-admin to prevent
 * it from being bundled in client-side code. It will throw an error if
 * called on the client side.
 * 
 * The factory is cached after first creation for better performance.
 * 
 * @returns TimestampFactory using Admin SDK
 * @throws Error if called on client-side
 */
export async function createAdminTimestampFactoryAsync(): Promise<TimestampFactory> {
  // Ensure this is only called on server-side
  if (!isServerSide()) {
    throw new Error('createAdminTimestampFactoryAsync() can only be called on server-side');
  }

  // Return cached factory if available
  if (cachedAdminTimestampFactory) {
    return cachedAdminTimestampFactory;
  }

  // If already loading, wait for that promise
  if (adminTimestampImportPromise) {
    return adminTimestampImportPromise;
  }

  // Start async import
  adminTimestampImportPromise = (async () => {
    try {
      // Dynamic import of firebase-admin/firestore to prevent bundling on client-side
      // Use ES module dynamic import for better compatibility with Next.js webpack
      const firestoreAdmin = await import('firebase-admin/firestore');
      
      if (!firestoreAdmin || !firestoreAdmin.Timestamp) {
        throw new Error('firebase-admin/firestore module is not available or Timestamp is not exported');
      }
      
      const AdminTimestamp = firestoreAdmin.Timestamp;
      
      if (!AdminTimestamp || typeof AdminTimestamp.fromDate !== 'function' || typeof AdminTimestamp.now !== 'function') {
        throw new Error('AdminTimestamp class is not valid or missing required methods from firebase-admin/firestore');
      }
      
      // Create and cache the factory
      cachedAdminTimestampFactory = {
        fromDate: (date: Date) => AdminTimestamp.fromDate(date) as Timestamp,
        now: () => AdminTimestamp.now() as Timestamp,
      };
      
      return cachedAdminTimestampFactory;
    } catch (error) {
      adminTimestampImportPromise = null; // Reset on error so we can retry
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create admin timestamp factory: ${errorMessage}. Make sure this is only called server-side and firebase-admin is installed.`);
    }
  })();

  return adminTimestampImportPromise;
}

/**
 * Synchronous version that throws if factory isn't cached
 * For backward compatibility, but prefer async version
 * 
 * @deprecated Use createAdminTimestampFactoryAsync() instead
 * @returns TimestampFactory using Admin SDK
 * @throws Error if factory not cached or called on client-side
 */
export function createAdminTimestampFactory(): TimestampFactory {
  if (!isServerSide()) {
    throw new Error('createAdminTimestampFactory() can only be called on server-side');
  }
  
  if (!cachedAdminTimestampFactory) {
    throw new Error('Admin timestamp factory not initialized. Call createAdminTimestampFactoryAsync() first, or ensure it has been called at least once.');
  }
  
  return cachedAdminTimestampFactory;
}

/**
 * Create a timestamp factory that automatically detects client vs server
 * Uses Admin SDK on server-side, Client SDK on client-side
 * 
 * This is the recommended factory for most use cases
 * 
 * NOTE: On server-side, the factory must be initialized first using
 * createAdminTimestampFactoryAsync() or it will throw an error.
 * 
 * @returns TimestampFactory appropriate for current environment
 * @throws Error if server-side factory not initialized
 */
export function createTimestampFactory(): TimestampFactory {
  if (isServerSide()) {
    return createAdminTimestampFactory();
  }
  return createClientTimestampFactory();
}

/**
 * Async version that ensures admin factory is initialized
 * Use this in server-side code that can be async
 * 
 * @returns TimestampFactory appropriate for current environment
 */
export async function createTimestampFactoryAsync(): Promise<TimestampFactory> {
  if (isServerSide()) {
    return createAdminTimestampFactoryAsync();
  }
  return createClientTimestampFactory();
}

/**
 * Type guard to check if an object is a Timestamp (client SDK)
 */
export function isTimestamp(obj: unknown): obj is Timestamp {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'toDate' in obj &&
    'toMillis' in obj &&
    typeof (obj as TimestampLike).toDate === 'function'
  );
}

/**
 * Type guard to check if an object is a TimestampLike (handles both SDKs)
 */
export function isTimestampLike(obj: unknown): obj is TimestampLike {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'toDate' in obj &&
    typeof (obj as TimestampLike).toDate === 'function'
  );
}

