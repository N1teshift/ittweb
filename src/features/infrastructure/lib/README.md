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

Next.js-specific server-only utilities:

- **`getStaticProps.ts`** - Helper for creating `getStaticProps` functions with translations
  - **Note:** This is server-only code. Import from `lib/server` instead of `lib` when using in pages.

### `context/`

React context providers:

- **`TranslationNamespaceContext.ts`** - Context for managing translation namespaces

## Usage

### Client-Safe Exports

Client-safe exports (for use in React components, hooks, etc.) are available through the main `index.ts` file:

```typescript
import { 
  swrConfig,
  swrKeys,
  TranslationNamespaceContext,
  useTranslationNamespace
} from '@/features/infrastructure/lib';
```

### Server-Only Exports

Server-only exports (for use in `getStaticProps`, `getServerSideProps`, API routes) are available through `server.ts`:

```typescript
import { 
  getStaticPropsWithTranslations
} from '@/features/infrastructure/lib/server';
```

**Important:** Do not import from `server.ts` in client-side code, as it contains Node.js-only dependencies that will cause build errors.

## Organization Principles

- **Services** are grouped by domain (userData, archive)
- **Cache utilities** are centralized for consistent caching strategies
- **Framework-specific utilities** (Next.js) are isolated in their own directory
- **React contexts** are separated for clarity
- **Client/Server separation:** Server-only code is exported through `server.ts` to prevent bundling Node.js dependencies in client code



