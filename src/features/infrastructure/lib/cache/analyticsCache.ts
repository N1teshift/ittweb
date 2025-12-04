/**
 * Analytics Cache Types and Utilities
 * 
 * Client-safe types and utilities for analytics caching.
 * Server-only functions are in analyticsCache.server.ts
 */

/** Cache entry structure */
export interface CacheEntry<T> {
  data: T;
  computedAt: string;
  expiresAt: string;
  filters: Record<string, unknown>;
  version: number;
}

/** Cache configuration */
export interface CacheConfig {
  /** Time-to-live in seconds */
  ttlSeconds: number;
  /** Cache version - increment to invalidate all caches */
  version?: number;
}

/**
 * Generate a cache key from analytics type and filters
 * Client-safe utility function
 */
export function generateCacheKey(
  analyticsType: string,
  filters: Record<string, unknown>
): string {
  // Sort filters for consistent keys
  const sortedFilters = Object.keys(filters)
    .filter(k => filters[k] !== undefined && filters[k] !== null)
    .sort()
    .map(k => `${k}:${filters[k]}`)
    .join('|');
  
  return `${analyticsType}_${sortedFilters || 'default'}`;
}
