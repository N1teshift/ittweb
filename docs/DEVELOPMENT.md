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
import { getFirestoreAdmin } from '@/features/infrastructure/api/firebase/admin';
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

**Note**: The `requireAuth` option is currently not implemented. Authentication checks must be done manually in the handler. See [TODO: Implement authentication in createApiHandler](#) for tracking.

```typescript
// src/pages/api/my-entities/[id].ts
import type { NextApiRequest } from 'next';
import { createApiHandler } from '@/features/infrastructure/api/routeHandlers';
import { getMyEntity } from '@/features/modules/my-entities/lib/myEntityService';

export default createApiHandler(
  async (req: NextApiRequest) => {
    const id = req.query.id as string;
    if (!id) {
      throw new Error('ID is required');
    }

    const entity = await getMyEntity(id);
    if (!entity) {
      throw new Error('Entity not found');
    }

    return entity;
  },
  {
    methods: ['GET'],
    requireAuth: false, // ⚠️ Currently not implemented - authentication must be checked manually
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

Always use `loggerUtils` for error handling:

```typescript
import { logError, logAndThrow } from '@/features/shared/utils/loggerUtils';

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

```typescript
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/features/infrastructure/auth';
import { isAdmin } from '@/features/shared/utils/userRoleUtils';
import { getUserDataByDiscordId } from '@/features/shared/lib/userDataService';

const session = await getServerSession(req, res, authOptions);
if (!session) {
  return res.status(401).json({ error: 'Authentication required' });
}

// Check admin role
const userData = await getUserDataByDiscordId(session.discordId || '');
if (!isAdmin(userData?.role)) {
  return res.status(403).json({ error: 'Admin access required' });
}
```

### Component Patterns

```typescript
// Use shared UI components
import { Button, Card, Input } from '@/features/infrastructure/shared/components/ui';

// Use Layout wrapper
import { Layout } from '@/features/shared';

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
- [Shared Features](../src/features/shared/README.md)

