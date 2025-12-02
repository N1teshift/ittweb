# Caching Strategies

API and client-side caching strategies to reduce load and improve response times.

## API Response Caching Headers

Use HTTP caching headers to reduce API load and improve response times:

```typescript
// In API route handler
export default createApiHandler(
  async (req: NextApiRequest) => {
    return data;
  },
  {
    cacheControl: {
      maxAge: 3600, // Cache for 1 hour
      public: true, // Allow public caching
    },
  }
);
```

**Implemented Caching**:
- ✅ **Items API** (`/api/items`): 1 hour cache (static data)
- ✅ **Classes API** (`/api/classes`): 5 minutes cache (semi-static data)
- ✅ **Analytics/Meta APIs** (`/api/analytics/*`, `/api/meta`): 2 minutes cache (frequently changing data)

**Cache Control Options**:
- `maxAge`: Cache duration in seconds
- `public`: Allow public caching (CDN, browser)
- `private`: Only allow browser caching (no CDN)
- `noCache`: Disable caching

**Example**:
```typescript
// Static data - long cache
cacheControl: { maxAge: 3600, public: true }

// Dynamic data - short cache
cacheControl: { maxAge: 120, public: true }

// Private data - no cache
cacheControl: { noCache: true }
```

## Client-Side Caching

Cache API responses when appropriate:

```typescript
// Client-side caching
const cache = new Map();

async function fetchWithCache(key: string, fetcher: () => Promise<any>) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const data = await fetcher();
  cache.set(key, data);
  return data;
}
```

## Request Debouncing

Debounce search/filter requests to reduce API calls:

```typescript
import { useDebouncedCallback } from 'use-debounce';

const debouncedSearch = useDebouncedCallback((value: string) => {
  fetchData(value);
}, 300);
```

**Implemented Debouncing**:
- ✅ **Filter Inputs**: All filter inputs in MetaPage use 300ms debouncing
- ✅ **Impact**: Reduced API calls and improved UX (no requests on every keystroke)
- ✅ **Pattern**: Use `useDebouncedCallback` for all user input that triggers API calls

**Example**:
```typescript
import { useDebouncedCallback } from 'use-debounce';

function FilterComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const debouncedFetch = useDebouncedCallback((term: string) => {
    fetchFilteredData(term);
  }, 300);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedFetch(value); // Only calls API after 300ms of no typing
  };
  
  return <input value={searchTerm} onChange={handleChange} />;
}
```

**Best Practices**:
- Use 300ms debounce for search/filter inputs
- Use 500ms+ for expensive operations
- Consider immediate updates for simple UI state changes

## Request Batching

Batch multiple requests when possible:

```typescript
// Instead of multiple requests
const [games, players, standings] = await Promise.all([
  fetch('/api/games').then(r => r.json()),
  fetch('/api/players').then(r => r.json()),
  fetch('/api/standings').then(r => r.json()),
]);
```

## Related Documentation

- [Performance Guide](../../shared/PERFORMANCE.md)
- [API Client Usage](./api-client.md)

