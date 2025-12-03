# Generic Data Fetching Hook Factory

A reusable abstraction for creating data fetching hooks that supports both SWR and non-SWR modes, with consistent error handling, logging, and API response format handling.

## Features

- ✅ **Dual Mode Support**: Works with both SWR (for cacheable data) and useState/useEffect (for dynamic data)
- ✅ **Standard API Format**: Automatically handles `{ success: boolean, data?: T, error?: string }` response format
- ✅ **Error Handling**: Consistent error logging using the infrastructure logging system
- ✅ **Conditional Fetching**: Support for enabling/disabling fetching based on conditions
- ✅ **Cache-Busting**: Built-in support for cache-busting query parameters
- ✅ **404 Handling**: Graceful handling of 404 errors (return null instead of error)
- ✅ **Type Safety**: Full TypeScript support with generic types
- ✅ **Data Transformation**: Optional data transformation before returning

## Basic Usage

### Non-SWR Mode (for dynamic data with cache-busting)

```typescript
import { createUrlDataFetchHook } from '@/features/infrastructure/hooks';

const useGame = createUrlDataFetchHook<Game, string>(
  (id: string) => `/api/games/${id}`,
  {
    useSWR: false,
    enabled: (id) => !!id,
    handle404: true,
    cacheBust: true,
    componentName: 'useGame',
    operationName: 'fetchGame',
  }
);

// Usage
const { data: game, loading, error, refetch } = useGame(id);
```

### SWR Mode (for cacheable/static data)

```typescript
import useSWR from 'swr';
import { createSwrFetcher } from '@/features/infrastructure/hooks';

function useItemsData() {
  const { data, error, isLoading, mutate } = useSWR<ItemsResponse>(
    '/api/items',
    createSwrFetcher<ItemsResponse>(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 600000, // 10 minutes
    }
  );

  return {
    items: data?.items ?? [],
    isLoading,
    error: error as Error | null,
    refetch: mutate,
  };
}
```

### Custom Fetch Function

```typescript
import { createDataFetchHook } from '@/features/infrastructure/hooks';

const useStandings = createDataFetchHook<StandingsResponse, StandingsFilters>({
  fetchFn: async (filters) => {
    const queryParams = new URLSearchParams();
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.page) queryParams.append('page', filters.page.toString());
    
    const response = await fetch(`/api/standings?${queryParams.toString()}`);
    return response.json();
  },
  useSWR: false,
  componentName: 'useStandings',
  operationName: 'fetchStandings',
});

// Usage
const { data, loading, error, refetch } = useStandings(filters);
```

## API Reference

### `createDataFetchHook<TData, TParams>`

Creates a data fetching hook with full control over the fetch function.

**Parameters:**
- `fetchFn`: Function that takes params and returns a Promise of API response or data
- `useSWR`: Whether to use SWR (default: false)
- `swrKey`: SWR cache key (required if useSWR is true)
- `swrConfig`: SWR configuration options
- `enabled`: Whether fetching is enabled (can be a function of params)
- `dependencies`: Dependencies array for non-SWR mode
- `transform`: Optional data transformation function
- `componentName`: Component name for logging
- `operationName`: Operation name for logging
- `handle404`: Handle 404 errors gracefully (default: false)
- `cacheBust`: Add cache-busting query parameter (default: false)
- `initialData`: Initial data value

**Returns:** A hook function that takes params and returns `{ data, loading, isLoading, error, refetch }`

### `createUrlDataFetchHook<TData, TParams>`

Convenience function for URL-based fetching.

**Parameters:**
- `urlPattern`: URL string with `:param` placeholders, or a function that builds the URL
- `buildUrl`: Alternative function to build URL from params
- `cacheBust`: Add cache-busting timestamp (default: false)
- `fetchOptions`: Additional fetch options
- All other options from `createDataFetchHook`

**Example:**
```typescript
const useGame = createUrlDataFetchHook<Game, string>(
  (id) => `/api/games/${id}`,
  { cacheBust: true, handle404: true }
);
```

### `createSwrFetcher<TData>`

Creates an SWR fetcher that handles the standard API response format.

**Example:**
```typescript
const { data } = useSWR('/api/games/123', createSwrFetcher<Game>());
```

### `createApiFetcher<TData>`

Creates a standard API fetcher function.

**Example:**
```typescript
const fetcher = createApiFetcher<Game>('/api/games/123');
const game = await fetcher();
```

## Migration Guide

### Before (75 lines)

```typescript
export function useGame(id: string): UseGameResult {
  const [game, setGame] = useState<GameWithPlayers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGame = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const cacheBuster = `?t=${Date.now()}`;
      const response = await fetch(`/api/games/${id}${cacheBuster}`, {
        cache: 'no-store',
      });
      if (!response.ok) {
        if (response.status === 404) {
          setGame(null);
          setLoading(false);
          return;
        }
        throw new Error(`Failed to fetch game: ${response.statusText}`);
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch game');
      }
      setGame(data.data as GameWithPlayers);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      logError(error, 'Failed to fetch game', {
        component: 'useGame',
        operation: 'fetchGame',
        gameId: id,
      });
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGame();
  }, [id]);

  return { game, loading, error, refetch: fetchGame };
}
```

### After (15 lines)

```typescript
const useGame = createUrlDataFetchHook<GameWithPlayers, string>(
  (id: string) => `/api/games/${id}`,
  {
    useSWR: false,
    enabled: (id) => !!id,
    handle404: true,
    cacheBust: true,
    componentName: 'useGame',
    operationName: 'fetchGame',
  }
);
```

## When to Use SWR vs Non-SWR

### Use SWR when:
- Data is relatively static or changes infrequently
- You want automatic cache sharing across components
- You want background revalidation
- You want automatic request deduplication

**Examples:** Items, classes, static configuration data

### Use Non-SWR when:
- Data changes frequently and needs cache-busting
- You need fine-grained control over when fetching occurs
- You're fetching user-specific data that shouldn't be cached
- You need to handle 404s gracefully

**Examples:** Game details, player stats, user-specific data

## Best Practices

1. **Use descriptive component and operation names** for better logging
2. **Enable handle404 for resources that may not exist** (like game details)
3. **Use cacheBust for dynamic data** that changes frequently
4. **Use SWR for static/cacheable data** to reduce API calls
5. **Provide initialData when you have it** to improve perceived performance
6. **Use transform to normalize data** before returning it to components

## See Also

- [Examples](./useDataFetch.examples.ts) - Reference implementations
- [SWR Configuration](../lib/swrConfig.ts) - Global SWR settings
- [Error Handling](../../../docs/ERROR_HANDLING.md) - Error handling patterns

