/**
 * Analytics Cache Helpers
 * 
 * Provides caching utilities specific to analytics operations.
 * Uses Firestore-based caching for serverless environments.
 */

import { 
  getOrComputeAnalytics, 
  invalidateAnalyticsCache as invalidateCache 
} from '@/features/infrastructure/lib/cache/analyticsCache.server';
import { createRequestCache, type RequestCache } from '@/features/infrastructure/lib';
import { getGamesWithPlayers } from '@/features/modules/game-management/games/lib/gameService';
import type { GameWithPlayers, GameFilters } from '@/features/modules/game-management/games/types';
import { createComponentLogger } from '@/features/infrastructure/logging';
import { ANALYTICS_CACHE_CONFIGS } from './analyticsCacheConfig';

const logger = createComponentLogger('analyticsCache');

/** Standard analytics filter parameters */
export interface AnalyticsFilters {
  category?: string;
  startDate?: string;
  endDate?: string;
  teamFormat?: string;
  playerName?: string;
}

/**
 * Fetch games with players using request-scoped cache
 * Prevents duplicate fetches within the same request
 */
export async function fetchGamesWithCache(
  filters: GameFilters,
  requestCache: RequestCache
): Promise<GameWithPlayers[]> {
  const cacheKey = `games:${JSON.stringify(filters)}`;
  
  return requestCache.getOrFetch(cacheKey, async () => {
    logger.debug('Fetching games with players', { filters });
    const result = await getGamesWithPlayers(filters);
    return result.games;
  });
}

/**
 * Get cached analytics or compute fresh
 * Uses ITT-specific cache configurations
 */
export async function getCachedAnalytics<T>(
  analyticsType: string,
  filters: AnalyticsFilters,
  computeFn: () => Promise<T>
): Promise<T> {
  return getOrComputeAnalytics(
    analyticsType, 
    filters as Record<string, unknown>, 
    computeFn,
    ANALYTICS_CACHE_CONFIGS
  );
}

/**
 * Invalidate analytics cache for a category
 */
export async function invalidateAnalytics(category?: string): Promise<void> {
  await invalidateCache(category);
}

/**
 * Create a request-scoped cache for analytics operations
 */
export function createAnalyticsRequestCache(): RequestCache {
  return createRequestCache();
}

/**
 * Filter games by team format
 * Used when teamFormat filter is specified
 */
export function filterGamesByTeamFormat(
  games: GameWithPlayers[],
  teamFormat: string
): GameWithPlayers[] {
  return games.filter(game => {
    if (!game.players) return false;
    const winners = game.players.filter(p => p.flag === 'winner').length;
    const losers = game.players.filter(p => p.flag === 'loser').length;
    const formatStr = `${winners}v${losers}`;
    return formatStr === teamFormat;
  });
}

