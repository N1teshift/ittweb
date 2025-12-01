# Adding a New Feature Module

How to create a new feature module following ITT Web conventions.

## Module Structure

Create the following structure:

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

## Step 1: Create Types

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

**Important**: Follow [Firestore Collections Schema](../database/schemas.md) exactly.

## Step 2: Create Service Layer

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

## Step 3: Create Components

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

## Step 4: Create Hooks (Optional)

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

## Step 5: Create Barrel Exports

Create `index.ts` files:

```typescript
// index.ts
export * from './components';
export * from './hooks';
export * from './lib';
export * from './types';
```

## Step 6: Create Module README

Create `README.md` following the template in [Documentation Plan](../archive/meta-documentation/DOCUMENTATION_PLAN.md).

## Related Documentation

- [Adding API Routes](./adding-api-routes.md)
- [Code Conventions](./code-conventions.md)
- [Firestore Schemas](../database/schemas.md)
- [Architecture Overview](./architecture.md)

