# Performance Monitoring

Tools and guidelines for monitoring application performance.

## Web Vitals

Monitor Core Web Vitals:
- **LCP** (Largest Contentful Paint) - < 2.5s
- **FID** (First Input Delay) - < 100ms
- **CLS** (Cumulative Layout Shift) - < 0.1

## Performance API

Use Performance API for measurements:

```typescript
// Measure API call
const start = performance.now();
await fetchData();
const duration = performance.now() - start;
console.log(`API call took ${duration}ms`);
```

## Firebase Performance

Enable Firebase Performance Monitoring:

```typescript
import { getPerformance } from 'firebase/performance';

const perf = getPerformance();
// Automatically tracks network requests
```

## Performance Review Guidelines

### Before Deployment

Ensure the following performance checks are completed:
- Bundle size analyzed using `ANALYZE=true npm run build`
- Firestore indexes created for all complex queries
- Images optimized (using Next.js Image component, WebP format when possible)
- Lazy loading implemented for heavy components (charts, large data tables)
- API responses cached where appropriate (see [Caching Guide](./caching.md))
- Performance tested with realistic data volumes
- Web Vitals checked (LCP < 2.5s, FID < 100ms, CLS < 0.1)

### Ongoing Monitoring

Regular performance maintenance should include:
- Monitor Firestore read/write counts to identify expensive operations
- Check API response times and optimize slow endpoints
- Review bundle size regularly and remove unused dependencies
- Optimize slow queries by adding indexes or refactoring
- Remove unused dependencies to reduce bundle size

## Related Documentation

- [Performance Guide](../../shared/PERFORMANCE.md)
- [Query Optimization](./query-optimization.md)
- [Caching Strategies](./caching.md)
- [Bundle Optimization](./bundle-optimization.md)

