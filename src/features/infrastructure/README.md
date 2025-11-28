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
- **Route Handlers** (`api/routeHandlers.ts`)
  - Standardized API route handler utilities
  - Error handling patterns
  - Response formatting

### Logging (`logging/`)
- `logger.ts` - Logger implementation
- Component-specific logger creation
- Error categorization and logging

### Components (`components/`)
- **Layout Components**: `Layout`, `Header`, `Footer`, `PageHero`, `DataCollectionNotice`, `DiscordButton`, `GitHubButton`
- **UI Components** (`components/ui/`): `Button`, `Card`, `Input`, `LoadingOverlay`, `LoadingScreen`

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

// Server-side
const adminDb = getFirestoreAdmin();

// Client-side
const doc = await db.collection('games').doc('id').get();
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
import { handleApiRequest } from '@/features/infrastructure/api/routeHandlers';

export default async function handler(req, res) {
  return handleApiRequest(req, res, {
    GET: async () => {
      // GET handler
    },
    POST: async () => {
      // POST handler
    }
  });
}
```

## Related Documentation

- [Error Handling Guide](../../../docs/operations/testing-guide.md)

