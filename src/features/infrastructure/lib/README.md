# Infrastructure Library

> Date: 2025-01-27

This directory contains shared infrastructure utilities and services used across the application.

## Structure

The library is organized into the following subdirectories:

### `services/`

Data services for interacting with backend systems:

- **`userData/`** - User data service for managing user information
  - `userDataService.ts` - Client-side user data operations
  - `userDataService.server.ts` - Server-side user data operations (uses Admin SDK)

- **`archive/`** - Archive service for managing archive entries
  - `archiveService.ts` - Client-side archive operations
  - `archiveService.server.ts` - Server-side archive operations (uses Admin SDK)

### `cache/`

Caching utilities for optimizing data fetching:

- **`analyticsCache.ts`** - Firestore-based cache for analytics results
- **`requestCache.ts`** - Request-scoped cache for preventing duplicate API calls
- **`swrConfig.ts`** - SWR (stale-while-revalidate) configuration and key factories

### `nextjs/`

Next.js-specific utilities:

- **`getStaticProps.ts`** - Helper for creating `getStaticProps` functions with translations

### `context/`

React context providers:

- **`TranslationNamespaceContext.ts`** - Context for managing translation namespaces

## Usage

All exports are available through the main `index.ts` file:

```typescript
import { 
  getUserDataByDiscordId,
  getArchiveEntries,
  swrConfig,
  getStaticPropsWithTranslations,
  TranslationNamespaceContext
} from '@/features/infrastructure/lib';
```

## Organization Principles

- **Services** are grouped by domain (userData, archive)
- **Cache utilities** are centralized for consistent caching strategies
- **Framework-specific utilities** (Next.js) are isolated in their own directory
- **React contexts** are separated for clarity



