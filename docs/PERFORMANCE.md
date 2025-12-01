# Performance Optimization Guide

Strategies for optimizing application performance.

## Firestore Query Optimization

### Use Indexes

Firestore requires composite indexes for complex queries. Create indexes in Firebase Console:

```typescript
// This query needs a composite index
db.collection('games')
  .where('category', '==', 'ranked')
  .where('createdAt', '>', startDate)
  .orderBy('createdAt', 'desc')
  .limit(20);

// Index: category (Ascending), createdAt (Descending)
```

**When to create indexes:**
- Multiple `where` clauses
- `where` + `orderBy` on different fields
- Multiple `orderBy` clauses

### Limit Results

Always limit query results:

```typescript
// Good
query.limit(20);

// Bad - fetches all documents
const snapshot = await query.get();
```

### Pagination

Use cursor-based pagination for large datasets:

```typescript
// First page
let query = db.collection('games')
  .orderBy('createdAt', 'desc')
  .limit(20);

const snapshot = await query.get();
const lastDoc = snapshot.docs[snapshot.docs.length - 1];

// Next page
query = db.collection('games')
  .orderBy('createdAt', 'desc')
  .startAfter(lastDoc)
  .limit(20);
```

### Select Only Needed Fields

```typescript
// Good - only fetch needed fields
const doc = await db.collection('games').doc(id).get();
const { title, createdAt } = doc.data()!;

// Avoid fetching entire document if only need a few fields
```

### Batch Operations

Use batch writes for multiple operations:

```typescript
const batch = db.batch();

games.forEach(game => {
  const ref = db.collection('games').doc();
  batch.set(ref, game);
});

await batch.commit(); // Single network request
```

## Component Optimization

### React.memo

Memoize expensive components to prevent unnecessary re-renders:

```typescript
import React from 'react';

export const ExpensiveComponent = React.memo(({ data }: Props) => {
  // Expensive rendering
  return <div>{/* ... */}</div>;
});
```

**Implemented Optimizations**:
- ✅ **Chart Components**: All analytics chart components wrapped with `React.memo`
- ✅ **Impact**: Reduced unnecessary chart re-renders when parent components update
- ✅ **Pattern**: Use `React.memo` for components that receive stable props but have expensive rendering

**Example**:
```typescript
// Chart component with React.memo
export const EloChart = React.memo(({ data, category }: EloChartProps) => {
  // Expensive chart rendering
  return <LineChart data={data} />;
});
```

### useMemo and useCallback

Memoize expensive calculations and callbacks to prevent unnecessary recalculations:

```typescript
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

**Implemented Optimizations**:
- ✅ **Filtered Lists**: PlayersPage uses `useMemo` for filtered player list computation
- ✅ **Impact**: Prevents unnecessary re-filtering when unrelated state changes
- ✅ **Pattern**: Use `useMemo` for filtered/transformed data, `useCallback` for event handlers passed to child components

**Example**:
```typescript
// Memoize filtered list
const filteredPlayers = useMemo(() => {
  return players.filter(player => 
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
}, [players, searchTerm]);
```

### Lazy Loading

Lazy load heavy components to reduce initial bundle size:

```typescript
import { lazy, Suspense } from 'react';
import LoadingScreen from '@/features/infrastructure/shared/components/ui/LoadingScreen';

const HeavyChart = lazy(() => import('./HeavyChart'));

function MyPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <HeavyChart />
    </Suspense>
  );
}
```

**Implemented Optimizations**:
- ✅ **Recharts Chart Components**: All chart components (ActivityChart, EloChart, WinRateChart, etc.) are lazy loaded
- ✅ **Impact**: Reduced initial bundle size by ~300KB on pages with charts
- ✅ **Pattern**: Use dynamic imports with Suspense fallbacks for all chart components

**Example**:
```typescript
// Lazy load chart component
const EloChart = lazy(() => import('@/features/modules/analytics/components/EloChart'));

function AnalyticsPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <EloChart data={eloData} />
    </Suspense>
  );
}
```

### Code Splitting

Next.js automatically code-splits pages. For manual splitting:

```typescript
// Dynamic import
const MyComponent = dynamic(() => import('./MyComponent'), {
  loading: () => <LoadingScreen />,
});
```

## Image Optimization

### Next.js Image Component

Always use Next.js Image component:

```typescript
import Image from 'next/image';

<Image
  src="/path/to/image.png"
  alt="Description"
  width={500}
  height={300}
  loading="lazy" // Lazy load images
/>
```

### Image Formats

- Use WebP when possible
- Provide fallbacks for older browsers
- Optimize image sizes before upload

## Bundle Size Optimization

### Analyze Bundle

```bash
ANALYZE=true npm run build
```

### Tree Shaking

Import only what you need:

```typescript
// Good
import { Button } from '@/features/infrastructure/shared/components/ui';

// Bad - imports entire library
import * as UI from '@/features/infrastructure/shared/components/ui';
```

### Dynamic Imports

Use dynamic imports for large dependencies:

```typescript
// Load only when needed
const Chart = dynamic(() => import('recharts').then(mod => mod.LineChart));
```

## API Optimization

### Response Caching Headers

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

### Client-Side Caching

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

### Request Debouncing

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

### Request Batching

Batch multiple requests when possible:

```typescript
// Instead of multiple requests
const [games, players, standings] = await Promise.all([
  fetch('/api/games').then(r => r.json()),
  fetch('/api/players').then(r => r.json()),
  fetch('/api/standings').then(r => r.json()),
]);
```

## Database Optimization

### Denormalization

Denormalize data when reads > writes:

```typescript
// Store computed values
interface Game {
  id: string;
  playerCount: number; // Denormalized - computed on write
  // Instead of counting players subcollection on read
}
```

### Avoid Deep Queries

Limit subcollection queries:

```typescript
// Good - fetch parent, then subcollection if needed
const game = await db.collection('games').doc(id).get();
const players = await db.collection('games').doc(id).collection('players').get();

// Bad - avoid deep nested queries
```

## State Management

### Local State vs Global State

- Use local state for component-specific data
- Use global state (Context/Redux) only when needed
- Avoid prop drilling with Context

### State Updates

Batch state updates:

```typescript
// Good - single re-render
setState(prev => ({
  ...prev,
  field1: value1,
  field2: value2,
}));

// Bad - multiple re-renders
setField1(value1);
setField2(value2);
```

## Monitoring Performance

### Web Vitals

Monitor Core Web Vitals:
- **LCP** (Largest Contentful Paint) - < 2.5s
- **FID** (First Input Delay) - < 100ms
- **CLS** (Cumulative Layout Shift) - < 0.1

### Performance API

Use Performance API for measurements:

```typescript
// Measure API call
const start = performance.now();
await fetchData();
const duration = performance.now() - start;
console.log(`API call took ${duration}ms`);
```

### Firebase Performance

Enable Firebase Performance Monitoring:

```typescript
import { getPerformance } from 'firebase/performance';

const perf = getPerformance();
// Automatically tracks network requests
```

## Checklist

### Before Deployment

- [ ] Bundle size analyzed (`ANALYZE=true npm run build`)
- [ ] Firestore indexes created
- [ ] Images optimized
- [ ] Lazy loading implemented for heavy components
- [ ] API responses cached where appropriate
- [ ] Performance tested with realistic data volumes
- [ ] Web Vitals checked

### Ongoing

- [ ] Monitor Firestore read/write counts
- [ ] Check API response times
- [ ] Review bundle size regularly
- [ ] Optimize slow queries
- [ ] Remove unused dependencies

## Related Documentation

- [Architecture Overview](./development/architecture.md)
- [Development Guide](./development/development-guide.md)
- [Troubleshooting Guide](./getting-started/troubleshooting.md)


