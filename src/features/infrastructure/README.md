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

### Shared UI Components (`shared/components/ui/`)
- `Button` - Standard button component
- `Card` - Card container component
- `Input` - Form input component
- `LoadingOverlay` - Loading overlay component
- `LoadingScreen` - Full-page loading screen

### Utils (`utils/`)
- `objectUtils` - Object manipulation utilities
- `timestampUtils` - Timestamp conversion utilities

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

- [Shared Utilities](../shared/README.md)
- [Logger Utils](../shared/utils/loggerUtils.ts)

