/**
 * Request-Scoped Cache
 * 
 * Provides caching within a single API request to prevent duplicate
 * database calls. Works in serverless environments like Vercel.
 * 
 * Usage:
 * ```typescript
 * const cache = createRequestCache();
 * 
 * // First call fetches from DB
 * const game1 = await cache.getOrFetch('game:abc', () => getGameById('abc'));
 * 
 * // Second call returns cached result
 * const game2 = await cache.getOrFetch('game:abc', () => getGameById('abc'));
 * ```
 */

export interface RequestCache {
  /** Get cached value or fetch and cache it */
  getOrFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T>;
  /** Get cached value if exists */
  get<T>(key: string): T | undefined;
  /** Set a value in cache */
  set<T>(key: string, value: T): void;
  /** Check if key exists in cache */
  has(key: string): boolean;
  /** Get all cached keys */
  keys(): string[];
  /** Get cache stats */
  stats(): { hits: number; misses: number; size: number };
}

/**
 * Creates a request-scoped cache instance.
 * Each API request should create its own cache instance.
 */
export function createRequestCache(): RequestCache {
  const cache = new Map<string, unknown>();
  let hits = 0;
  let misses = 0;

  return {
    async getOrFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
      if (cache.has(key)) {
        hits++;
        return cache.get(key) as T;
      }

      misses++;
      const value = await fetcher();
      cache.set(key, value);
      return value;
    },

    get<T>(key: string): T | undefined {
      if (cache.has(key)) {
        hits++;
        return cache.get(key) as T;
      }
      return undefined;
    },

    set<T>(key: string, value: T): void {
      cache.set(key, value);
    },

    has(key: string): boolean {
      return cache.has(key);
    },

    keys(): string[] {
      return Array.from(cache.keys());
    },

    stats(): { hits: number; misses: number; size: number } {
      return { hits, misses, size: cache.size };
    },
  };
}

/**
 * Helper to create cache keys for common entities
 */
export const cacheKeys = {
  game: (id: string) => `game:${id}`,
  gameWithPlayers: (id: string) => `gameWithPlayers:${id}`,
  player: (name: string) => `player:${name.toLowerCase()}`,
  games: (filters: Record<string, unknown>) => `games:${JSON.stringify(filters)}`,
  analytics: (type: string, filters: Record<string, unknown>) => 
    `analytics:${type}:${JSON.stringify(filters)}`,
};

