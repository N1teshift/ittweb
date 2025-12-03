# Infrastructure Hooks

> Date: 2025-12-03

Reusable React hooks for common infrastructure functionality.

## Structure

This directory contains organized hooks grouped by functionality:

- **`data-fetch/`** - Data fetching hooks and utilities
- **`translation/`** - Internationalization hooks
- **`accessibility/`** - Accessibility-focused hooks

## Available Hooks

### Data Fetching

The `data-fetch` directory contains hooks for data fetching with support for both SWR and non-SWR modes.

- `useDataFetch` - Generic data fetching hook factory
- `createDataFetchHook` - Factory function for creating custom data fetching hooks
- `createUrlDataFetchHook` - Convenience function for URL-based fetching
- `createSwrFetcher` - SWR fetcher with standard API response format handling
- `createApiFetcher` - Standard API fetcher function

See [data-fetch/useDataFetch.md](./data-fetch/useDataFetch.md) for detailed documentation.

### Translation

The `translation` directory contains hooks for internationalization.

- `useFallbackTranslation` - Translation hook with namespace fallback mechanism

### Accessibility

The `accessibility` directory contains hooks for improving accessibility.

- `useModalAccessibility` - Hook for modal accessibility features (Escape key, focus management, focus trap)

## Usage

All hooks are exported from the main `index.ts` file:

```typescript
import { 
  createDataFetchHook, 
  useFallbackTranslation, 
  useModalAccessibility 
} from '@/features/infrastructure/hooks';
```

## Direct Imports

For better tree-shaking, you can also import directly from subdirectories:

```typescript
import { createDataFetchHook } from '@/features/infrastructure/hooks/data-fetch/useDataFetch';
import { useFallbackTranslation } from '@/features/infrastructure/hooks/translation/useFallbackTranslation';
import { useModalAccessibility } from '@/features/infrastructure/hooks/accessibility/useModalAccessibility';
```

However, the recommended approach is to use the main index exports for consistency.

