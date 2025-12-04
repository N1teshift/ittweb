/**
 * Analytics Cache Configuration
 * 
 * ITT-specific cache configurations for different analytics types.
 * These configs define TTL and versioning for cached analytics results.
 */

import type { CacheConfig } from '@/features/infrastructure/lib/cache/analyticsCache';

/** Default cache configurations by analytics type */
export const ANALYTICS_CACHE_CONFIGS: Record<string, CacheConfig> = {
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

