/**
 * Analytics Cache Service
 * 
 * Stores pre-computed analytics results in Firestore for fast retrieval.
 * Works in serverless environments like Vercel.
 * 
 * Cache Strategy:
 * - Analytics are computed once and stored in Firestore
 * - Cached results are returned if still valid (based on TTL)
 * - Background recomputation when cache is stale
 * - Cache invalidation when games are created/updated
 */

import { getFirestoreAdmin, isServerSide } from '@/features/infrastructure/api/firebase/admin';
import { createComponentLogger } from '@/features/infrastructure/logging';

const logger = createComponentLogger('analyticsCache');
const CACHE_COLLECTION = 'analyticsCache';

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

/** Default cache configurations by analytics type */
export const CACHE_CONFIGS: Record<string, CacheConfig> = {
  meta: { ttlSeconds: 300, version: 1 },           // 5 minutes
  activity: { ttlSeconds: 300, version: 1 },       // 5 minutes
  classStats: { ttlSeconds: 600, version: 1 },     // 10 minutes
  classSelection: { ttlSeconds: 600, version: 1 }, // 10 minutes
  classWinRate: { ttlSeconds: 600, version: 1 },   // 10 minutes
  gameLength: { ttlSeconds: 600, version: 1 },     // 10 minutes
  playerActivity: { ttlSeconds: 600, version: 1 }, // 10 minutes
  ittStats: { ttlSeconds: 600, version: 1 },       // 10 minutes
  topHunters: { ttlSeconds: 600, version: 1 },     // 10 minutes
  topHealers: { ttlSeconds: 600, version: 1 },     // 10 minutes
  eloHistory: { ttlSeconds: 300, version: 1 },     // 5 minutes (per-player)
  winRate: { ttlSeconds: 300, version: 1 },        // 5 minutes
};

/**
 * Generate a cache key from analytics type and filters
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

/**
 * Get cached analytics result
 * Returns null if cache miss or expired
 */
export async function getCachedAnalytics<T>(
  analyticsType: string,
  filters: Record<string, unknown>
): Promise<T | null> {
  if (!isServerSide()) {
    return null;
  }

  try {
    const cacheKey = generateCacheKey(analyticsType, filters);
    const config = CACHE_CONFIGS[analyticsType] || { ttlSeconds: 300, version: 1 };
    
    const db = getFirestoreAdmin();
    const doc = await db.collection(CACHE_COLLECTION).doc(cacheKey).get();
    
    if (!doc.exists) {
      logger.debug('Cache miss - not found', { analyticsType, cacheKey });
      return null;
    }
    
    const entry = doc.data() as CacheEntry<T>;
    
    // Check version
    if (entry.version !== config.version) {
      logger.debug('Cache miss - version mismatch', { 
        analyticsType, 
        cacheVersion: entry.version, 
        currentVersion: config.version 
      });
      return null;
    }
    
    // Check expiry
    const now = new Date();
    const expiresAt = new Date(entry.expiresAt);
    
    if (now > expiresAt) {
      logger.debug('Cache miss - expired', { 
        analyticsType, 
        expiresAt: entry.expiresAt 
      });
      return null;
    }
    
    logger.debug('Cache hit', { analyticsType, cacheKey });
    return entry.data;
  } catch (error) {
    logger.warn('Cache read error', { analyticsType, error });
    return null;
  }
}

/**
 * Store analytics result in cache
 */
export async function setCachedAnalytics<T>(
  analyticsType: string,
  filters: Record<string, unknown>,
  data: T
): Promise<void> {
  if (!isServerSide()) {
    return;
  }

  try {
    const cacheKey = generateCacheKey(analyticsType, filters);
    const config = CACHE_CONFIGS[analyticsType] || { ttlSeconds: 300, version: 1 };
    
    const now = new Date();
    const expiresAt = new Date(now.getTime() + config.ttlSeconds * 1000);
    
    const entry: CacheEntry<T> = {
      data,
      computedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      filters,
      version: config.version || 1,
    };
    
    const db = getFirestoreAdmin();
    await db.collection(CACHE_COLLECTION).doc(cacheKey).set(entry);
    
    logger.debug('Cache set', { analyticsType, cacheKey, expiresAt: entry.expiresAt });
  } catch (error) {
    logger.warn('Cache write error', { analyticsType, error });
  }
}

/**
 * Invalidate all analytics caches
 * Call this when games are created/updated/deleted
 */
export async function invalidateAnalyticsCache(
  category?: string
): Promise<void> {
  if (!isServerSide()) {
    return;
  }

  try {
    const db = getFirestoreAdmin();
    const collection = db.collection(CACHE_COLLECTION);
    
    // If category specified, only invalidate caches for that category
    // Otherwise, invalidate all caches
    const query = collection.limit(500);
    
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      return;
    }
    
    const batch = db.batch();
    let invalidated = 0;
    
    snapshot.docs.forEach((doc) => {
      const data = doc.data() as CacheEntry<unknown>;
      // If category is specified, only invalidate matching caches
      if (!category || data.filters?.category === category) {
        batch.delete(doc.ref);
        invalidated++;
      }
    });
    
    if (invalidated > 0) {
      await batch.commit();
      logger.info('Cache invalidated', { count: invalidated, category });
    }
  } catch (error) {
    logger.warn('Cache invalidation error', { error });
  }
}

/**
 * Get or compute analytics with caching
 * This is the main function to use for cached analytics
 */
export async function getOrComputeAnalytics<T>(
  analyticsType: string,
  filters: Record<string, unknown>,
  computeFn: () => Promise<T>
): Promise<T> {
  // Try to get from cache first
  const cached = await getCachedAnalytics<T>(analyticsType, filters);
  if (cached !== null) {
    return cached;
  }
  
  // Compute fresh data
  const data = await computeFn();
  
  // Store in cache (fire and forget)
  setCachedAnalytics(analyticsType, filters, data).catch(() => {
    // Ignore cache write errors
  });
  
  return data;
}

