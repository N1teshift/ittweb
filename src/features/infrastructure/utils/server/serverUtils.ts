/**
 * Server-side utility functions
 * This file should NOT import any server-only dependencies like firebase-admin
 */

/**
 * Check if we're running on the server
 * Safe to use in both client and server code
 */
export function isServerSide(): boolean {
  return typeof window === 'undefined';
}

/**
 * Check if we're running on the client
 */
export function isClientSide(): boolean {
  return typeof window !== 'undefined';
}



