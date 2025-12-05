# Infrastructure

**Purpose**: Core infrastructure systems including authentication, Firebase, logging, and API utilities.

## Infrastructure Principles

This folder contains **generic, reusable code** that:
- ✅ Can be extracted to a separate package/library
- ✅ Works across different projects
- ✅ Has no business logic dependencies
- ✅ Is framework-aware but domain-agnostic

**If code is project-specific**, it belongs in `modules/` instead.

See [Architecture Documentation](../../../docs/production/architecture/infrastructure-vs-modules.md) for detailed guidelines on when to use infrastructure vs modules.

## Migration to Shared Packages

**Most infrastructure functionality has been migrated to `@websites/infrastructure` and `@websites/ui` packages.**

This folder now primarily contains:
- **Project-specific wrappers** (e.g., `api/handlers/routeHandlers.ts` - ittweb auth config wrapper)
- **Project-specific components** (e.g., `Header`, `PageHero`, `DiscordButton`, `GitHubButton`)
- **Local configuration** (e.g., `lib/nextjs/getStaticProps.ts` - uses local next-i18next.config)

## Exports

### API (`api/`)

See [API README](./api/README.md) for detailed documentation.

- **Handlers** (`api/handlers/`)
  - `routeHandlers.ts` - **ITTWeb-specific wrapper** with auth configuration
  - Re-exports from `@websites/infrastructure/api` for parsing, zod, schemas
- **Firebase** (`api/firebase/`)
  - Firebase Admin SDK setup and client configuration
  - Firestore helper utilities
  - **Note**: Consider migrating to `@websites/infrastructure/firebase` if compatible

### Logging (`logging/`) - **MIGRATED**
- ✅ Now uses `@websites/infrastructure/logging`
- All imports automatically re-exported from shared package

### Monitoring (`monitoring/`) - **MIGRATED**
- ✅ Now uses `@websites/infrastructure/monitoring`
- All imports automatically re-exported from shared package

### Components (`components/`)
- **Project-Specific Layout Components**: `Header`, `PageHero`, `DiscordButton`, `GitHubButton`
- **Generic Components**: `Button`, `Card`, `ErrorBoundary`, `LoadingOverlay`, `LoadingScreen`, `EmptyState`, `Tooltip`
- **Note**: Generic components available in `@websites/ui` - consider migrating

### Services (`lib/`)
- `getStaticProps` - Next.js static props utilities (uses local next-i18next.config)
- `TranslationNamespaceContext` - i18n namespace context
- Cache utilities - re-exported from `@websites/infrastructure/cache`

### Utils (`utils/`) - **MIGRATED**
- ✅ Now uses `@websites/infrastructure/utils` for:
  - `objectUtils` - Object manipulation utilities
  - `timestampUtils` - Timestamp conversion utilities
  - `accessibility/helpers` - Accessibility testing utilities
  - `className` utility (cn function)
- **Project-specific**: `service/serviceOperationWrapper.ts`

### Hooks (`hooks/`) - **MIGRATED**
- ✅ Now uses `@websites/infrastructure/hooks`:
  - `useDataFetch` - Data fetching hook
  - `useFallbackTranslation` - Translation fallback handling
  - `useModalAccessibility` - Modal accessibility hook

## Usage

### Authentication
```typescript
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

const session = await getServerSession(req, res, authOptions);
```

### Firebase
```typescript
import { getFirestoreAdmin } from '@/features/infrastructure/api/firebase/admin';
import { db } from '@/features/infrastructure/api/firebase/firebaseClient';
import { getDocument, getCollectionSnapshot } from '@/features/infrastructure/api/firebase/firestoreHelpers';

// Server-side
const adminDb = getFirestoreAdmin();

// Client-side
const doc = await db.collection('games').doc('id').get();

// Using helpers (server/client aware)
const gameDoc = await getDocument('games', 'game-id');
const gamesSnapshot = await getCollectionSnapshot('games');
```

### Logging
```typescript
// Now uses @websites/infrastructure/logging (automatically re-exported)
import { createComponentLogger, logError } from '@/features/infrastructure/logging';

const logger = createComponentLogger('my-component');
logger.info('Message', { meta: 'data' });

logError(error, 'Operation failed', { component: 'my-component' });
```

### Route Handlers
```typescript
import { createApiHandler, createPostHandler, requireSession } from '@/features/infrastructure/api';

// Using createApiHandler (supports multiple methods)
export default createApiHandler(
  async (req, res, context) => {
    // Handler logic
    return { data: 'result' };
  },
  {
    methods: ['GET', 'POST'],
    requireAuth: false, // Set to true to require authentication
    logRequests: true,
  }
);

// Using createPostHandler (POST only, convenience function)
export default createPostHandler(
  async (req, res, context) => {
    // Session available if requireAuth: true
    const session = requireSession(context);
    return { success: true };
  },
  {
    requireAuth: true, // Automatically checks authentication
    logRequests: true,
  }
);
```

### Validation Helpers

#### Zod Validation (Recommended)

```typescript
import { zodValidator } from '@/features/infrastructure/api';
import { CreatePostSchema } from '@/features/modules/content/blog/lib';

// Use with route handler
export default createPostHandler(
  async (req, res, context) => {
    // Body is already validated
    const postData = req.body as z.infer<typeof CreatePostSchema>;
    // ... handler logic
  },
  {
    validateBody: zodValidator(CreatePostSchema),
  }
);
```

See [Zod Validation Migration Guide](../../../docs/operations/zod-validation-migration.md) for more details.


## Related Documentation

- [Error Handling Guide](../../../docs/operations/testing-guide.md)

