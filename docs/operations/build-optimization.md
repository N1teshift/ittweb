# Build Optimization Guide

Complete guide for optimizing bundle size and build performance in ITT Web.

## Overview

Bundle optimization is critical for:
- **Faster page loads**: Smaller bundles = faster downloads
- **Better Core Web Vitals**: Improved LCP (Largest Contentful Paint)
- **Lower bandwidth costs**: Reduced data transfer
- **Better mobile experience**: Faster on slower connections

## Bundle Analysis

### Running Bundle Analysis

**Local Analysis**:
```bash
ANALYZE=true npm run build
```

This will:
1. Build the application with bundle analyzer enabled
2. Generate interactive HTML reports in `.next/analyze/`
3. Open browser automatically with bundle visualization
4. Show size breakdown by chunk and dependency

**CI/CD Analysis**:
- Automatically runs on pull requests via `.github/workflows/bundle-size.yml`
- Results uploaded as artifacts
- PR comments include bundle size information

### Understanding Bundle Analysis Reports

The bundle analyzer shows:

1. **Chunk Sizes**: Size of each code-split chunk
   - `_app.js`: Main application bundle
   - `pages/[page].js`: Page-specific bundles
   - `commons.js`: Shared code between pages

2. **Dependency Sizes**: Size of each npm package
   - Visual representation (larger = bigger)
   - Tree structure showing nested dependencies

3. **Duplicate Dependencies**: Same package in multiple chunks
   - Indicates opportunities for optimization

### Reading the Reports

**Good Signs**:
- ✅ Most chunks under 200KB (gzipped)
- ✅ Large dependencies are code-split (lazy loaded)
- ✅ No duplicate large dependencies
- ✅ Shared code in commons chunk

**Warning Signs**:
- ⚠️ Chunks over 500KB
- ⚠️ Large dependencies in initial bundle
- ⚠️ Duplicate dependencies across chunks
- ⚠️ Unused dependencies included

## Bundle Size Targets

### Recommended Targets

| Bundle Type | Target Size (gzipped) | Max Size (gzipped) |
|------------|---------------------|-------------------|
| Initial JS | < 200KB | < 300KB |
| Page Chunk | < 100KB | < 150KB |
| Total JS | < 500KB | < 800KB |
| CSS | < 50KB | < 100KB |

**Note**: These are guidelines. Actual targets depend on:
- Application complexity
- Required features
- Target audience (mobile vs desktop)
- Performance requirements

### Current Bundle Status

To check current bundle sizes:
```bash
ANALYZE=true npm run build
# Check .next/analyze/ directory for reports
```

## Optimization Strategies

### 1. Code Splitting

**Automatic Code Splitting**:
Next.js automatically code-splits by:
- Pages (each page is a separate chunk)
- Dynamic imports
- Route-based splitting

**Manual Code Splitting**:
```typescript
import dynamic from 'next/dynamic';

// Lazy load heavy components
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <LoadingScreen />,
  ssr: false, // Disable SSR if not needed
});
```

**Already Implemented**:
- ✅ Recharts chart components are lazy loaded
- ✅ Reduces initial bundle by ~300KB

### 2. Tree Shaking

**Import Only What You Need**:
```typescript
// ✅ Good - imports only Button
import { Button } from '@/features/infrastructure/shared/components/ui';

// ❌ Bad - imports entire library
import * as UI from '@/features/infrastructure/shared/components/ui';
```

**Check for Unused Imports**:
```bash
# Use ESLint to find unused imports
npm run lint
```

### 3. Dynamic Imports

**Lazy Load Large Dependencies**:
```typescript
// ✅ Good - loads only when needed
const Chart = dynamic(() => 
  import('recharts').then(mod => mod.LineChart)
);

// ❌ Bad - loads immediately
import { LineChart } from 'recharts';
```

**When to Use Dynamic Imports**:
- Large libraries (> 50KB)
- Components not needed on initial render
- Third-party widgets
- Heavy visualization libraries

**Examples in Codebase**:
- Recharts components (already implemented)
- Map analyzer components
- Heavy utility libraries

### 4. Remove Unused Dependencies

**Identify Unused Dependencies**:
```bash
# Use depcheck to find unused dependencies
npx depcheck

# Or use npm-check
npx npm-check
```

**Remove Carefully**:
1. Check if dependency is used in:
   - Build scripts
   - Configuration files
   - Type definitions
2. Test thoroughly after removal
3. Update package.json

### 5. Optimize Dependencies

**Use Smaller Alternatives**:
- Consider lighter alternatives for large dependencies
- Use tree-shakeable versions when available
- Prefer ESM over CommonJS when possible

**Example**:
```typescript
// If using date-fns, import specific functions
import { format, parseISO } from 'date-fns';

// Instead of importing entire library
import * as dateFns from 'date-fns';
```

### 6. Image Optimization

**Use Next.js Image Component**:
```typescript
import Image from 'next/image';

<Image
  src="/path/to/image.png"
  alt="Description"
  width={500}
  height={300}
  loading="lazy"
/>
```

**Benefits**:
- Automatic image optimization
- Lazy loading
- Responsive images
- WebP format when supported

### 7. CSS Optimization

**Tailwind CSS**:
- Already configured with PurgeCSS
- Only includes used classes in production
- Minimal CSS bundle size

**Check CSS Size**:
```bash
# After build, check .next/static/css/ directory
ls -lh .next/static/css/
```

## Identifying Large Dependencies

### Using Bundle Analyzer

1. **Run Analysis**:
   ```bash
   ANALYZE=true npm run build
   ```

2. **Open Report**:
   - Browser opens automatically
   - Or open `.next/analyze/client.html` manually

3. **Identify Large Dependencies**:
   - Look for large blocks in visualization
   - Check dependency names
   - Note size in tooltip

### Common Large Dependencies

**Known Large Dependencies in ITT Web**:
- `recharts` (~300KB) - ✅ Already lazy loaded
- `firebase` (~200KB) - Required for core functionality
- `next` (~150KB) - Framework, required
- `react` + `react-dom` (~130KB) - Framework, required

**Optimization Status**:
- ✅ Recharts: Lazy loaded
- ⚠️ Firebase: Consider code-splitting if possible
- ✅ Next.js: Framework, minimal optimization possible
- ✅ React: Framework, minimal optimization possible

### Analyzing Specific Dependencies

**Check Dependency Size**:
```bash
# Install bundle-phobia
npx bundle-phobia [package-name]

# Example
npx bundle-phobia recharts
```

**Compare Alternatives**:
```bash
# Compare multiple packages
npx bundle-phobia recharts chart.js victory
```

## Build Performance

### Optimizing Build Time

**Current Build Time**: ~5-8 minutes (CI/CD)

**Optimization Strategies**:

1. **Cache Dependencies**:
   ```yaml
   # Already implemented in workflows
   - uses: actions/setup-node@v4
     with:
       cache: 'npm'
   ```

2. **Parallel Jobs**:
   - Run tests and builds in parallel
   - Use matrix strategy for multiple Node versions

3. **Incremental Builds**:
   - Next.js uses incremental builds automatically
   - `.next/cache/` directory caches build artifacts

4. **TypeScript Optimization**:
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "incremental": true,
       "tsBuildInfoFile": ".next/cache/.tsbuildinfo"
     }
   }
   ```

## Monitoring Bundle Size

### Automated Monitoring

**CI/CD Integration**:
- Bundle size workflow runs on every PR
- Comments on PR with bundle size info
- Artifacts uploaded for detailed analysis

**Check PR Comments**:
- Look for bundle size analysis comment
- Download artifacts for detailed reports
- Review bundle size changes

### Manual Monitoring

**Regular Checks**:
```bash
# Weekly bundle size check
ANALYZE=true npm run build

# Compare with previous build
# Track size trends over time
```

**Track Size Trends**:
- Document bundle sizes in release notes
- Track size changes over time
- Set alerts for significant increases

## Best Practices

### Development

1. **Regular Analysis**: Run bundle analysis before major releases
2. **Monitor PRs**: Review bundle size changes in PRs
3. **Test Optimizations**: Verify optimizations don't break functionality
4. **Document Changes**: Document bundle size improvements

### Code Review

1. **Check Bundle Impact**: Review bundle size for new dependencies
2. **Prefer Lazy Loading**: Use dynamic imports for large components
3. **Avoid Duplicates**: Check for duplicate dependencies
4. **Tree Shaking**: Ensure imports are tree-shakeable

### Release Process

1. **Pre-Release Check**: Run bundle analysis before release
2. **Document Changes**: Note bundle size changes in release notes
3. **Monitor Post-Release**: Check bundle size after deployment
4. **Track Trends**: Maintain bundle size history

## Troubleshooting

### Bundle Size Increased Unexpectedly

**Check**:
1. New dependencies added?
2. Dependencies updated?
3. Code splitting removed?
4. Dynamic imports removed?

**Fix**:
1. Review recent changes
2. Check bundle analyzer report
3. Identify large new dependencies
4. Apply optimization strategies

### Build Fails with Bundle Analyzer

**Issue**: Build fails when `ANALYZE=true`

**Solution**:
1. Check environment variables are set (even dummy values work)
2. Verify `@next/bundle-analyzer` is installed
3. Check Next.js version compatibility
4. Review build logs for specific errors

### Large Initial Bundle

**Issue**: Initial bundle is too large

**Solutions**:
1. Identify large dependencies in analyzer
2. Lazy load large components
3. Split large dependencies
4. Remove unused code
5. Optimize imports (tree shaking)

## Related Documentation

- [Performance Guide](../PERFORMANCE.md) - Performance optimization strategies
- [CI/CD Guide](./ci-cd.md) - CI/CD pipeline documentation
- [Architecture](../development/architecture.md) - System architecture
- [Development Guide](../development/development-guide.md) - Development practices

## Tools and Resources

- **Bundle Analyzer**: `@next/bundle-analyzer`
- **Bundle Phobia**: `npx bundle-phobia [package]`
- **Depcheck**: `npx depcheck` - Find unused dependencies
- **Webpack Bundle Analyzer**: Alternative analyzer
- **Lighthouse**: Performance auditing

## Build Optimization Review Guidelines

### Before Release

Ensure the following build checks are completed:
- Run bundle analysis: `ANALYZE=true npm run build`
- Review bundle size reports for any unexpected increases
- Check for large dependencies that could be optimized
- Verify lazy loading is working correctly
- Check bundle size targets are met
- Document bundle size in release notes

### Regular Maintenance

Ongoing build optimization should include:
- Monthly bundle size review to track trends
- Check for unused dependencies and remove them
- Update large dependencies if smaller alternatives are available
- Monitor bundle size trends over time
- Review PR bundle size changes in CI/CD

