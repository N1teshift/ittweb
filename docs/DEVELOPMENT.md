# Development Workflow Guide

How to add features, API routes, and follow project conventions.

## Adding a New Feature Module

### 1. Create Module Structure

```bash
src/features/modules/[module-name]/
├── README.md          # Module documentation
├── index.ts          # Barrel exports
├── components/       # React components
│   └── index.ts
├── hooks/           # Custom hooks
│   └── index.ts
├── lib/             # Service layer
│   └── [module]Service.ts
└── types/           # TypeScript types
    └── index.ts
```

### 2. Create Types

Define types in `types/index.ts`:

```typescript
export interface MyEntity {
  id: string;
  name: string;
  createdAt: Timestamp;
  // ... other fields following Firestore schema
}

export interface CreateMyEntity {
  name: string;
  // ... creation fields
}
```

**Important**: Follow [Firestore Collections Schema](../schemas/firestore-collections.md) exactly.

### 3. Create Service Layer

Create service in `lib/[module]Service.ts`:

```typescript
import { getFirestoreAdmin, getAdminTimestamp } from '@/features/infrastructure/api/firebase/admin';
import { logError } from '@/features/infrastructure/logging';
import type { CreateMyEntity, MyEntity } from '../types';

export async function createMyEntity(data: CreateMyEntity): Promise<string> {
  try {
    const db = getFirestoreAdmin();
    const docRef = await db.collection('myEntities').add({
      ...data,
      createdAt: getAdminTimestamp(),
      updatedAt: getAdminTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    logError(error as Error, 'Failed to create entity', {
      component: 'myEntityService',
      operation: 'create',
    });
    throw error;
  }
}

export async function getMyEntity(id: string): Promise<MyEntity | null> {
  // Implementation
}
```

### 4. Create Components

Create components in `components/`:

```typescript
// components/MyEntityList.tsx
import { useState, useEffect } from 'react';
import { getMyEntities } from '../lib/myEntityService';
import type { MyEntity } from '../types';

export function MyEntityList() {
  const [entities, setEntities] = useState<MyEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntities();
  }, []);

  const loadEntities = async () => {
    try {
      const data = await getMyEntities();
      setEntities(data);
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {entities.map(entity => (
        <div key={entity.id}>{entity.name}</div>
      ))}
    </div>
  );
}
```

### 5. Create Hooks (Optional)

Create custom hooks in `hooks/`:

```typescript
// hooks/useMyEntities.ts
import { useState, useEffect } from 'react';
import { getMyEntities } from '../lib/myEntityService';
import type { MyEntity } from '../types';

export function useMyEntities() {
  const [entities, setEntities] = useState<MyEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadEntities();
  }, []);

  const loadEntities = async () => {
    try {
      setLoading(true);
      const data = await getMyEntities();
      setEntities(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { entities, loading, error, refetch: loadEntities };
}
```

### 6. Create Barrel Exports

Create `index.ts` files:

```typescript
// index.ts
export * from './components';
export * from './hooks';
export * from './lib';
export * from './types';
```

### 7. Create Module README

Create `README.md` following the template in [Documentation Plan](../DOCUMENTATION_PLAN.md).

## Adding a New API Route

### Option 1: Using `createApiHandler` (Recommended)

```typescript
// src/pages/api/my-entities/[id].ts
import type { NextApiRequest } from 'next';
import { createApiHandler, requireSession } from '@/features/infrastructure/api/routeHandlers';
import { parseRequiredQueryString } from '@/features/infrastructure/api/queryParser';
import { getMyEntity } from '@/features/modules/my-entities/lib/myEntityService';

// Public GET endpoint
export default createApiHandler(
  async (req: NextApiRequest) => {
    const id = parseRequiredQueryString(req, 'id');
    const entity = await getMyEntity(id);
    if (!entity) {
      throw new Error('Entity not found');
    }
    return entity;
  },
  {
    methods: ['GET'],
    requireAuth: false, // Public endpoint
    logRequests: true,
    cacheControl: {
      maxAge: 300, // Cache for 5 minutes
      public: true,
    },
  }
);
```

**With Authentication:**
```typescript
// src/pages/api/my-entities/index.ts
import type { NextApiRequest } from 'next';
import { createPostHandler, requireSession } from '@/features/infrastructure/api/routeHandlers';
import { validateRequiredFields, validateString } from '@/features/infrastructure/api/validators';
import { createMyEntity } from '@/features/modules/my-entities/lib/myEntityService';

export default createPostHandler(
  async (req: NextApiRequest, res, context) => {
    // Session is guaranteed to be available due to requireAuth: true
    const session = requireSession(context);
    
    // Validate request body
    const validationError = validateRequiredFields(req.body, ['name']);
    if (validationError) {
      throw new Error(validationError);
    }
    
    const nameError = validateString(req.body.name, 'name', 1, 100);
    if (nameError) {
      throw new Error(nameError);
    }
    
    const entityId = await createMyEntity({
      name: req.body.name,
      createdByDiscordId: session.discordId || '',
    });
    
    return { id: entityId };
  },
  {
    requireAuth: true, // Automatically checks authentication
    validateBody: (body) => {
      const requiredError = validateRequiredFields(body, ['name']);
      if (requiredError) return requiredError;
      return validateString(body.name, 'name', 1, 100) || true;
    },
    logRequests: true,
  }
);
```

**With Admin Access:**
```typescript
// src/pages/api/admin/my-entities/[id].ts
import type { NextApiRequest } from 'next';
import { createPostHandler, requireSession } from '@/features/infrastructure/api/routeHandlers';
import { parseRequiredQueryString } from '@/features/infrastructure/api/queryParser';
import { deleteMyEntity } from '@/features/modules/my-entities/lib/myEntityService';

export default createPostHandler(
  async (req: NextApiRequest, res, context) => {
    // Session is guaranteed and user is admin due to requireAdmin: true
    const session = requireSession(context);
    const id = parseRequiredQueryString(req, 'id');
    
    await deleteMyEntity(id);
    return { success: true };
  },
  {
    requireAdmin: true, // Automatically requires auth AND admin role
    logRequests: true,
  }
);
```

### Option 2: Manual Handler

```typescript
// src/pages/api/my-entities/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import { createMyEntity } from '@/features/modules/my-entities/lib/myEntityService';

const logger = createComponentLogger('api/my-entities');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      // GET handler
      return res.status(200).json({ success: true, data: [] });
    }

    if (req.method === 'POST') {
      // Require authentication
      const session = await getServerSession(req, res, authOptions);
      if (!session) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const data = req.body;
      const id = await createMyEntity(data);
      return res.status(201).json({ success: true, id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    const err = error as Error;
    logError(err, 'API request failed', {
      component: 'api/my-entities',
      method: req.method,
      url: req.url,
    });
    
    return res.status(500).json({ 
      error: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message 
    });
  }
}
```

## Code Patterns and Conventions

### Error Handling

Always use infrastructure logging for error handling:

```typescript
import { logError, logAndThrow } from '@/features/infrastructure/logging';

try {
  // operation
} catch (error) {
  logError(error as Error, 'Operation failed', {
    component: 'myComponent',
    operation: 'create',
  });
  throw error; // or handle gracefully
}

// Or throw after logging
logAndThrow(error, 'Operation failed', { component: 'myComponent' });
```

### File Size

Keep files under 200 lines when possible. Split large files into smaller modules.

### TypeScript

- Use strict TypeScript
- Define types in `types/` directory
- Use interfaces for data structures
- Use types for unions, utilities, etc.

### Firebase Operations

```typescript
// Server-side (API routes, server components)
import { getFirestoreAdmin, getAdminTimestamp } from '@/features/infrastructure/api/firebase/admin';

const db = getFirestoreAdmin();
const timestamp = getAdminTimestamp();

// Client-side (components, hooks)
import { db } from '@/features/infrastructure/api/firebase/firebaseClient';

const doc = await db.collection('games').doc('id').get();
```

### Authentication

#### Using `createApiHandler` (Recommended)

When using `createApiHandler`, authentication is handled automatically:

```typescript
export default createPostHandler(
  async (req: NextApiRequest, res, context) => {
    // Session is guaranteed to be available when requireAuth: true
    const session = requireSession(context);
    
    // Use session data
    const userId = session.discordId;
    // ... rest of handler
  },
  {
    requireAuth: true, // Automatically checks authentication
    // Returns 401 Unauthorized if not authenticated
  }
);
```

**How it works**:
- `requireAuth: true` automatically calls `getServerSession(req, res, authOptions)`
- If no session exists, returns `401 Unauthorized` with `{ success: false, error: 'Authentication required' }`
- If session exists, it's available via `requireSession(context)` helper
- No need to manually check authentication

**Admin Access**:
```typescript
export default createPostHandler(
  async (req: NextApiRequest, res, context) => {
    const session = requireSession(context);
    // User is guaranteed to be admin when requireAdmin: true
    // ... admin-only operations
  },
  {
    requireAuth: true,
    requireAdmin: true, // Also checks admin role
    // Returns 403 Forbidden if not admin
  }
);
```

#### Manual Authentication (Legacy)

If you're not using `createApiHandler`, check authentication manually:

```typescript
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/features/infrastructure/auth';
import { isAdmin } from '@/features/infrastructure/utils/userRoleUtils';
import { getUserDataByDiscordId } from '@/features/infrastructure/lib/userDataService';

const session = await getServerSession(req, res, authOptions);
if (!session) {
  return res.status(401).json({ 
    success: false,
    error: 'Authentication required' 
  });
}

// Check admin role
const userData = await getUserDataByDiscordId(session.discordId || '');
if (!isAdmin(userData?.role)) {
  return res.status(403).json({ 
    success: false,
    error: 'Admin access required' 
  });
}
```

**Note**: All API routes should use `createApiHandler` for consistent authentication and error handling.

### Component Patterns

```typescript
// Use shared UI components
import { Button, Card, Input } from '@/features/infrastructure/shared/components/ui';

// Use Layout wrapper
import { Layout } from '@/features/infrastructure';

export default function MyPage() {
  return (
    <Layout>
      <Card>
        <h1>My Page</h1>
        <Button variant="primary">Click me</Button>
      </Card>
    </Layout>
  );
}
```

## Testing

### Unit Tests

Place tests next to the code:

```typescript
// lib/myEntityService.test.ts
import { describe, it, expect } from '@jest/globals';
import { createMyEntity } from './myEntityService';

describe('myEntityService', () => {
  describe('createMyEntity', () => {
    it('should create entity', async () => {
      // Test implementation
    });
  });
});
```

### Component Tests

```typescript
// components/MyEntityList.test.tsx
import { render, screen } from '@testing-library/react';
import { MyEntityList } from './MyEntityList';

describe('MyEntityList', () => {
  it('should render entities', () => {
    render(<MyEntityList />);
    // Assertions
  });
});
```

## Documentation Requirements

1. **Module README**: Create `README.md` in module directory
2. **API Documentation**: Add to `docs/api/[module].md`
3. **Update Index**: Update `src/features/modules/README.md` if needed

## Related Documentation

- [Module Documentation](../src/features/modules/README.md)
- [API Reference](./api/README.md)
- [Firestore Schemas](./schemas/firestore-collections.md)
- [Infrastructure](../src/features/infrastructure/README.md)
- [Infrastructure & Shared Features](../src/features/infrastructure/README.md)

