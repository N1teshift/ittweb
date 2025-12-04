/**
 * Analytics Cache Service (Server-Only)
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
import type { CacheEntry, CacheConfig } from './analyticsCache';
import { generateCacheKey } from './analyticsCache';

const logger = createComponentLogger('analyticsCache');
const CACHE_COLLECTION = 'analyticsCache';

/** Default cache configuration */
const DEFAULT_CACHE_CONFIG: CacheConfig = { ttlSeconds: 300, version: 1 };

/**
 * Get cached analytics result
 * Returns null if cache miss or expired
 * 
 * @param analyticsType - Type of analytics (e.g., 'meta', 'activity')
 * @param filters - Filter parameters for the analytics query
 * @param configs - Optional cache configurations map. If not provided, uses default config.
 */
export async function getCachedAnalytics<T>(
  analyticsType: string,
  filters: Record<string, unknown>,
  configs?: Record<string, CacheConfig>
): Promise<T | null> {
  if (!isServerSide()) {
    return null;
  }

  try {
    const cacheKey = generateCacheKey(analyticsType, filters);
    const config = configs?.[analyticsType] || DEFAULT_CACHE_CONFIG;
    
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
 * 
 * @param analyticsType - Type of analytics (e.g., 'meta', 'activity')
 * @param filters - Filter parameters for the analytics query
 * @param data - The analytics data to cache
 * @param configs - Optional cache configurations map. If not provided, uses default config.
 */
export async function setCachedAnalytics<T>(
  analyticsType: string,
  filters: Record<string, unknown>,
  data: T,
  configs?: Record<string, CacheConfig>
): Promise<void> {
  if (!isServerSide()) {
    return;
  }

  try {
    const cacheKey = generateCacheKey(analyticsType, filters);
    const config = configs?.[analyticsType] || DEFAULT_CACHE_CONFIG;
    
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
 * 
 * @param analyticsType - Type of analytics (e.g., 'meta', 'activity')
 * @param filters - Filter parameters for the analytics query
 * @param computeFn - Function to compute fresh analytics data if cache miss
 * @param configs - Optional cache configurations map. If not provided, uses default config.
 */
export async function getOrComputeAnalytics<T>(
  analyticsType: string,
  filters: Record<string, unknown>,
  computeFn: () => Promise<T>,
  configs?: Record<string, CacheConfig>
): Promise<T> {
  // Try to get from cache first
  const cached = await getCachedAnalytics<T>(analyticsType, filters, configs);
  if (cached !== null) {
    return cached;
  }
  
  // Compute fresh data
  const data = await computeFn();
  
  // Store in cache (fire and forget)
  setCachedAnalytics(analyticsType, filters, data, configs).catch(() => {
    // Ignore cache write errors
  });
  
  return data;
}

