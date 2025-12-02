# Bundle Size Optimization

> Date: 2025-12-02

Strategies for reducing bundle size and optimizing code loading.

## Analyze Bundle

```bash
ANALYZE=true npm run build
```

## Tree Shaking

Import only what you need:

```typescript
// Good
import { Button } from '@/features/infrastructure/shared/components/ui';

// Bad - imports entire library
import * as UI from '@/features/infrastructure/shared/components/ui';
```

## Dynamic Imports

Use dynamic imports for large dependencies:

```typescript
// Load only when needed
const Chart = dynamic(() => import('recharts').then(mod => mod.LineChart));
```

## Code Splitting

Next.js automatically code-splits pages. For manual splitting:

```typescript
// Dynamic import
const MyComponent = dynamic(() => import('./MyComponent'), {
  loading: () => <LoadingScreen />,
});
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
const EloChart = lazy(() => import('@/features/modules/analytics-group/analytics/components/EloChart'));

function AnalyticsPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <EloChart data={eloData} />
    </Suspense>
  );
}
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

## Related Documentation

- [Performance Guide](../../shared/PERFORMANCE.md)
- [Component Library](./components.md)

