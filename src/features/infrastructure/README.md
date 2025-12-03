# Infrastructure

**Purpose**: Core infrastructure systems including authentication, Firebase, logging, and API utilities.

## Exports

### Auth (`auth/`)
- NextAuth configuration and session management
- Authentication options and providers

### API (`api/`)
- **Firebase** (`api/firebase/`)
  - `admin.ts` - Firebase Admin SDK setup
  - `config.ts` - Firebase configuration
  - `firebaseClient.ts` - Client-side Firebase setup
  - `firestoreHelpers.ts` - Helper utilities for server/client Firestore operations
    - `withFirestore()` - Abstract server/client Firestore routing
    - `getDocument()` - Get single document (server/client aware)
    - `getCollectionSnapshot()` - Get collection snapshot (server/client aware)
- **Route Handlers** (`api/routeHandlers.ts`)
  - Standardized API route handler utilities
  - Error handling patterns
  - Response formatting
- **Validation Helpers** (`api/validationHelpers.ts`)
  - Reusable validation functions for common API request patterns
  - `validateApiRequest()` - Validate request body against a schema
  - `validatePaginationParams()` - Validate pagination parameters
  - `validateDateRange()` - Validate date range parameters
  - Validator creators: `createStringValidator()`, `createIntValidator()`, `createEnumValidator()`, etc.

### Logging (`logging/`)
- `logger.ts` - Logger implementation
- Component-specific logger creation
- Error categorization and logging

### Components (`components/`)
- **Layout Components**: `Layout`, `Header`, `Footer`, `PageHero`, `DataCollectionNotice`, `DiscordButton`, `GitHubButton`
- **UI Components** (`components/ui/`): `Button`, `Card`, `Input`, `LoadingOverlay`, `LoadingScreen`, `EmptyState`, `Tooltip`
- **Skeleton Components** (`components/ui/`): `GameCardSkeleton`, `PlayerCardSkeleton`, `LeaderboardSkeleton` - Loading placeholders for async content

### Services (`lib/`)
- `userDataService` - User data CRUD operations
- `archiveService` - Archive entry service
- `getStaticProps` - Next.js static props utilities
- `TranslationNamespaceContext` - i18n namespace context

### Utils (`utils/`)
- `objectUtils` - Object manipulation utilities
- `timestampUtils` - Timestamp conversion utilities
- `userRoleUtils` - User role checking utilities
- `accessibility/helpers` - Accessibility testing utilities
- `loggerUtils` - Error logging utilities (deprecated, use `logging/`)

### Hooks (`hooks/`)
- `useFallbackTranslation` - Translation fallback handling

## Usage

### Authentication
```typescript
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/features/infrastructure/auth';

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
import { zodValidator, CreatePostSchema } from '@/features/infrastructure/api';
import { z } from 'zod';

// Define Zod schema
const CreateGameSchema = z.object({
  gameId: z.number().int().positive(),
  datetime: z.string().datetime(),
  players: z.array(z.object({
    name: z.string().min(1),
    flag: z.enum(['winner', 'loser', 'drawer']),
  })).min(2),
});

// Use with route handler
export default createPostHandler(
  async (req, res, context) => {
    // Body is already validated
    const gameData = req.body as z.infer<typeof CreateGameSchema>;
    // ... handler logic
  },
  {
    validateBody: zodValidator(CreateGameSchema),
  }
);
```

See [Zod Validation Migration Guide](../../../docs/operations/zod-validation-migration.md) for more details.

#### Legacy Validation Helpers (Deprecated)

The old `validateApiRequest` helper is still available but deprecated in favor of Zod:

```typescript
import { validateApiRequest, createStringValidator, createEnumValidator } from '@/features/infrastructure/api';

// Define validation schema
const schema = [
  { name: 'title', required: true, validator: createStringValidator(1, 100) },
  { name: 'category', required: true, validator: createEnumValidator(['ranked', 'casual']) },
];

// Validate request body
const result = validateApiRequest(req.body, schema);
if (!result.valid) {
  return res.status(400).json({ error: result.errors?.join(', ') });
}

// Use validated data
const { title, category } = result.data;
```

### Skeleton Components
```typescript
import { GameCardSkeleton, PlayerCardSkeleton, LeaderboardSkeleton } from '@/features/infrastructure/components/ui';

// Show loading placeholders while data loads
{loading && (
  <>
    <GameCardSkeleton />
    <GameCardSkeleton />
    <GameCardSkeleton />
  </>
)}
```

## Related Documentation

- [Error Handling Guide](../../../docs/operations/testing-guide.md)

