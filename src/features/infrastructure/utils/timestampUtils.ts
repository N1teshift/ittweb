import { Timestamp } from 'firebase/firestore';

/**
 * Interface for timestamp-like objects that have a toDate method
 */
export interface TimestampLike {
  toDate?: () => Date;
}

/**
 * Convert Firestore timestamp to ISO string
 * Handles both client SDK Timestamp and Admin SDK Timestamp
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

