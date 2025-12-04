/**
 * Firestore Helper Utilities
 * 
 * Provides helper functions to reduce code duplication between server-side and client-side
 * Firestore operations. The admin SDK and client SDK have different APIs, so these helpers
 * abstract the common patterns while maintaining type safety.
 */

import { getFirestoreInstance } from './firebaseClient';
import { isServerSide } from '@/features/infrastructure/utils';
import type { Firestore as AdminFirestore } from 'firebase-admin/firestore';
import type { Firestore as ClientFirestore } from 'firebase/firestore';

/**
 * Execute a function with the appropriate Firestore database instance
 * 
 * @param serverFn - Function to execute with admin SDK (receives adminDb)
 * @param clientFn - Function to execute with client SDK (receives db instance)
 * @returns Result from the executed function
 */
// Cache the admin module to avoid repeated imports
let cachedAdminModule: { getFirestoreAdmin: () => AdminFirestore } | null = null;

export async function withFirestore<T>(
  serverFn: (adminDb: AdminFirestore) => Promise<T>,
  clientFn: (db: ClientFirestore) => Promise<T>
): Promise<T> {
  if (isServerSide()) {
    // Dynamic import to prevent firebase-admin from being bundled on client-side
    // Use ES module dynamic import instead of require() for better compatibility
    if (!cachedAdminModule) {
      cachedAdminModule = await import('./admin');
    }
    const adminDb = cachedAdminModule.getFirestoreAdmin();
    return serverFn(adminDb);
  } else {
    const db = getFirestoreInstance();
    return clientFn(db);
  }
}

/**
 * Get a document from Firestore (works for both server and client)
 * 
 * @param collectionName - Name of the collection
 * @param documentId - ID of the document
 * @returns Document snapshot or null if not found
 */
export async function getDocument(
  collectionName: string,
  documentId: string
): Promise<{ exists: boolean; data: () => Record<string, unknown> | undefined; id: string } | null> {
  return withFirestore(
    async (adminDb) => {
      const doc = await adminDb.collection(collectionName).doc(documentId).get();
      return doc.exists ? { exists: true, data: () => doc.data(), id: doc.id } : null;
    },
    async (db) => {
      const { doc: docFn, getDoc } = await import('firebase/firestore');
      const docRef = docFn(db, collectionName, documentId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { exists: true, data: () => docSnap.data(), id: docSnap.id } : null;
    }
  );
}

/**
 * Get all documents from a collection (works for both server and client)
 * 
 * @param collectionName - Name of the collection
 * @returns Array of document snapshots
 */
export async function getCollectionSnapshot(collectionName: string): Promise<Array<{ data: () => Record<string, unknown> | undefined; id: string }>> {
  return withFirestore(
    async (adminDb) => {
      const snapshot = await adminDb.collection(collectionName).get();
      const docs: Array<{ data: () => Record<string, unknown> | undefined; id: string }> = [];
      snapshot.forEach((doc) => {
        docs.push({ data: () => doc.data(), id: doc.id });
      });
      return docs;
    },
    async (db) => {
      const { collection, getDocs } = await import('firebase/firestore');
      const snapshot = await getDocs(collection(db, collectionName));
      const docs: Array<{ data: () => Record<string, unknown> | undefined; id: string }> = [];
      snapshot.forEach((doc) => {
        docs.push({ data: () => doc.data(), id: doc.id });
      });
      return docs;
    }
  );
}


