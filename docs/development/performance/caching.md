# Caching Strategies

> Date: 2025-12-03

API and client-side caching strategies to reduce load and improve response times.

## Overview

The caching system uses a multi-layer approach optimized for serverless environments (Vercel):

1. **HTTP Cache Headers** - Browser/CDN caching
2. **Firestore Analytics Cache** - Pre-computed analytics stored in Firestore
3. **Batch Player Fetching** - Efficient database queries
4. **Request-Scoped Cache** - Prevents duplicate DB calls within a single request

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐     ┌──────────┐
│   Browser   │────▶│ Vercel CDN   │────▶│  API Handler    │────▶│ Firestore│
│  (HTTP      │     │ (HTTP Cache) │     │ (Firestore      │     │          │
│   Cache)    │     │              │     │  Analytics      │     │          │
│             │     │              │     │  Cache)         │     │          │
└─────────────┘     └──────────────┘     └─────────────────┘     └──────────┘
```

## HTTP Cache Headers

All API routes use the `cacheControl` option in `createApiHandler`:

```typescript
export default createApiHandler(
  async (req: NextApiRequest) => {
    return data;
  },
  {
    cacheControl: {
      maxAge: 300, // Cache for 5 minutes
      public: true, // Allow public caching
    },
  }
);
```

### Implemented Cache Durations

| Endpoint | Duration | Reason |
|----------|----------|--------|
| `/api/items` | 1 hour | Static game data |
| `/api/icons/list` | 1 hour | Static icon list |
| `/api/classes` | 5 minutes | Class stats |
| `/api/standings` | 5 minutes | Player rankings |
| `/api/analytics/*` | 5 minutes | Analytics (Firestore cached) |
| `/api/games` | 2 minutes | Game list |
| `/api/players` | 2 minutes | Player data |
| `/api/posts` | 10 minutes | News posts |

### Cache Control Options

```typescript
// Static data - long cache
cacheControl: { maxAge: 3600, public: true }

// Dynamic data - short cache
cacheControl: { maxAge: 300, public: true }

// Private data - no cache
cacheControl: { noCache: true }
```

## Firestore Analytics Cache

For expensive analytics computations, results are cached in Firestore's `analyticsCache` collection.

### How It Works

```typescript
import { getOrComputeAnalytics } from '@/features/infrastructure/lib/analyticsCache';

// Returns cached result if valid, otherwise computes and caches
const data = await getOrComputeAnalytics('classStats', filters, async () => {
  // Expensive computation here
  return computeClassStats();
});
```

### Cache Configuration

Located in `src/features/infrastructure/lib/analyticsCache.ts`:

```typescript
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
  eloHistory: { ttlSeconds: 300, version: 1 },     // 5 minutes
  winRate: { ttlSeconds: 300, version: 1 },        // 5 minutes
};
```

### Cache Invalidation

Cache is automatically invalidated when games are created, updated, or deleted:

```typescript
import { invalidateAnalyticsCache } from '@/features/infrastructure/lib/analyticsCache';

// Invalidate all analytics caches
await invalidateAnalyticsCache();

// Invalidate only caches for a specific category
await invalidateAnalyticsCache('1v1');
```

## Batch Player Fetching

The N+1 query problem was solved by batch fetching players:

### Before (N+1 Problem)
```typescript
// BAD: Fetches players individually for each game
const games = await getGames();
for (const game of games) {
  const gameWithPlayers = await getGameById(game.id); // N+1 queries!
}
```

### After (Batch Fetching)
```typescript
// GOOD: Fetches all players in one batch
const { games } = await getGamesWithPlayers(filters);
// games already include players
```

### Functions

| Function | Description |
|----------|-------------|
| `getGamesWithPlayers()` | Fetches games with players in batch |
| `batchGetPlayersForGames()` | Fetches players for multiple games in parallel |

## Request-Scoped Cache

Prevents duplicate database calls within a single API request:

```typescript
import { createRequestCache } from '@/features/infrastructure/lib/requestCache';

const cache = createRequestCache();

// First call fetches from DB
const game1 = await cache.getOrFetch('game:abc', () => getGameById('abc'));

// Second call returns cached result (no DB call)
const game2 = await cache.getOrFetch('game:abc', () => getGameById('abc'));
```

## Client-Side Caching (SWR)

SWR configuration in `src/features/infrastructure/lib/swrConfig.ts`:

```typescript
export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: false,    // Don't revalidate on window focus
  revalidateOnReconnect: true, // Revalidate when network reconnects
  dedupingInterval: 2000,      // Dedupe requests within 2 seconds
  errorRetryCount: 3,          // Retry failed requests up to 3 times
  errorRetryInterval: 5000,    // Wait 5 seconds between retries
};
```

## Performance Impact

### Before Optimization
- Single `/api/analytics/meta` request: ~2500+ Firestore reads (N+1 problem)
- No server-side caching
- 2-minute HTTP cache

### After Optimization
- Single `/api/analytics/meta` request: ~1-2 Firestore reads (cached or batch)
- 5-10 minute Firestore cache for analytics
- 5-minute HTTP cache
- Cache invalidation on data changes

## Best Practices

1. **Use batch fetching** when you need games with players
2. **Use Firestore cache** for expensive analytics computations
3. **Use request-scoped cache** to prevent duplicate DB calls in the same request
4. **Set appropriate HTTP cache durations** based on data volatility
5. **Call `invalidateAnalyticsCache()`** when game data changes

## Related Documentation

- [API Route Patterns](../patterns/api-route-patterns.md)
- [Performance Monitoring](./monitoring.md)
