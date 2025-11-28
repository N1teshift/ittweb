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

Memoize expensive components:

```typescript
import React from 'react';

export const ExpensiveComponent = React.memo(({ data }: Props) => {
  // Expensive rendering
  return <div>{/* ... */}</div>;
});
```

### useMemo and useCallback

Memoize expensive calculations and callbacks:

```typescript
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

### Lazy Loading

Lazy load heavy components:

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

### Caching

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

Debounce search/filter requests:

```typescript
import { useDebouncedCallback } from 'use-debounce';

const debouncedSearch = useDebouncedCallback((value: string) => {
  fetchData(value);
}, 300);
```

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

- [Architecture Overview](./ARCHITECTURE.md)
- [Development Guide](./DEVELOPMENT.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)

