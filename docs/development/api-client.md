# API Client Usage Guide

How to use APIs from client-side code.

## Table of Contents

- [Basic Usage](#basic-usage)
- [Custom Hooks Pattern](#custom-hooks-pattern)
- [POST Requests](#post-requests)
- [PUT/DELETE Requests](#putdelete-requests)
- [Query Parameters](#query-parameters)
- [File Uploads](#file-uploads)
- [TypeScript Types](#typescript-types)
- [Error Handling Patterns](#error-handling-patterns)
- [Pagination](#pagination)
- [Common Patterns](#common-patterns)
- [Related Documentation](#related-documentation)

## Basic Usage

### Fetch Pattern

```typescript
// GET request
const response = await fetch('/api/games');
const data = await response.json();

if (!data.success) {
  throw new Error(data.error || 'Request failed');
}

const games = data.data;
```

### Error Handling

```typescript
async function fetchGames() {
  try {
    const response = await fetch('/api/games');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Request failed');
    }
    
    return data.data;
  } catch (error) {
    console.error('Failed to fetch games:', error);
    throw error;
  }
}
```

## Custom Hooks Pattern

### Standard Hook Structure

```typescript
import { useState, useEffect } from 'react';

interface UseMyDataResult {
  data: MyData[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useMyData(filters?: MyFilters): UseMyDataResult {
  const [data, setData] = useState<MyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (filters?.search) queryParams.append('search', filters.search);
      if (filters?.page) queryParams.append('page', filters.page.toString());

      const response = await fetch(`/api/my-data?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Request failed');
      }

      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters?.search, filters?.page]);

  return { data, loading, error, refetch: fetchData };
}
```

## POST Requests

### Creating Data

```typescript
async function createGame(gameData: CreateGame) {
  const response = await fetch('/api/games', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(gameData),
  });

  if (!response.ok) {
    throw new Error(`Failed to create game: ${response.statusText}`);
  }

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to create game');
  }

  return result.id; // or result.data
}
```

### With Authentication

```typescript
import { useSession } from 'next-auth/react';

function MyComponent() {
  const { data: session } = useSession();

  const createGame = async (gameData: CreateGame) => {
    if (!session) {
      throw new Error('Authentication required');
    }

    const response = await fetch('/api/games', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gameData),
    });

    // Handle response...
  };
}
```

## PUT/DELETE Requests

### Update

```typescript
async function updateGame(id: string, gameData: UpdateGame) {
  const response = await fetch(`/api/games/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(gameData),
  });

  if (!response.ok) {
    throw new Error(`Failed to update game: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
}
```

### Delete

```typescript
async function deleteGame(id: string) {
  const response = await fetch(`/api/games/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete game: ${response.statusText}`);
  }

  const result = await response.json();
  return result.success;
}
```

## Query Parameters

### Building Query Strings

```typescript
const filters = {
  category: 'ranked',
  startDate: '2025-01-01',
  page: 1,
  limit: 20,
};

const queryParams = new URLSearchParams();
if (filters.category) queryParams.append('category', filters.category);
if (filters.startDate) queryParams.append('startDate', filters.startDate);
if (filters.page) queryParams.append('page', filters.page.toString());
if (filters.limit) queryParams.append('limit', filters.limit.toString());

const url = `/api/games?${queryParams.toString()}`;
// Result: /api/games?category=ranked&startDate=2025-01-01&page=1&limit=20
```

### Reading Query Parameters

```typescript
// In API route
const category = req.query.category as string | undefined;
const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
```

## File Uploads

### FormData Pattern

```typescript
async function uploadReplay(gameId: string, file: File) {
  const formData = new FormData();
  formData.append('replay', file);

  const response = await fetch(`/api/scheduled-games/${gameId}/upload-replay`, {
    method: 'POST',
    body: formData,
    // Don't set Content-Type header - browser sets it with boundary
  });

  if (!response.ok) {
    throw new Error(`Failed to upload replay: ${response.statusText}`);
  }

  const result = await response.json();
  return result.replayUrl;
}
```

## TypeScript Types

### API Response Types

```typescript
// Define response types
interface GamesApiResponse {
  success: boolean;
  data: {
    games: Game[];
    hasMore: boolean;
    nextCursor?: string;
  };
  error?: string;
}

// Use in fetch
const response = await fetch('/api/games');
const data: GamesApiResponse = await response.json();

if (data.success) {
  const games = data.data.games;
  // TypeScript knows games is Game[]
}
```

### Generic API Client

```typescript
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Request failed');
  }

  return data.data as T;
}

// Usage
const games = await apiRequest<Game[]>('/api/games');
const game = await apiRequest<Game>(`/api/games/${id}`);
```

## Error Handling Patterns

**See [Error Handling Guide](../ERROR_HANDLING.md) for complete error handling patterns and best practices.**

### Component Error Handling

```typescript
function MyComponent() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: FormData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await fetch('/api/my-endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Request failed');
      }

      const result = await response.json();
      // Handle success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <div className="text-red-400">{error}</div>}
      {/* Form */}
    </div>
  );
}
```

## Pagination

### Cursor-Based

```typescript
const [items, setItems] = useState([]);
const [cursor, setCursor] = useState<string | undefined>();
const [hasMore, setHasMore] = useState(false);

const loadMore = async () => {
  const url = cursor 
    ? `/api/items?cursor=${cursor}`
    : '/api/items';
  
  const response = await fetch(url);
  const data = await response.json();
  
  setItems(prev => [...prev, ...data.data.items]);
  setCursor(data.data.nextCursor);
  setHasMore(data.data.hasMore);
};
```

### Page-Based

```typescript
const [items, setItems] = useState([]);
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);

const loadPage = async (pageNum: number) => {
  const response = await fetch(`/api/items?page=${pageNum}`);
  const data = await response.json();
  
  if (pageNum === 1) {
    setItems(data.data.items);
  } else {
    setItems(prev => [...prev, ...data.data.items]);
  }
  
  setHasMore(data.data.hasMore);
};
```

## Common Patterns

### Optimistic Updates

```typescript
const [items, setItems] = useState([]);

const addItem = async (newItem: CreateItem) => {
  // Optimistically add to UI
  const tempId = `temp-${Date.now()}`;
  setItems(prev => [...prev, { ...newItem, id: tempId }]);

  try {
    const response = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    });

    const result = await response.json();
    
    // Replace temp item with real item
    setItems(prev => prev.map(item => 
      item.id === tempId ? result.data : item
    ));
  } catch (error) {
    // Rollback on error
    setItems(prev => prev.filter(item => item.id !== tempId));
    throw error;
  }
};
```

### Retry Logic

```typescript
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 3
): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
}
```

## Related Documentation

- [API Reference](./api/README.md)
- [Code Patterns](./code-patterns.md)
- [Development Guide](./development-guide.md)


