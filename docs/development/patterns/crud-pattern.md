# CRUD Feature Pattern

Complete pattern for creating a CRUD feature.

## 1. Types

```typescript
// types/index.ts
export interface MyEntity {
  id: string;
  name: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateMyEntity {
  name: string;
}

export interface UpdateMyEntity {
  name?: string;
}

export interface MyEntityFilters {
  search?: string;
  page?: number;
  limit?: number;
}
```

## 2. Service Layer

```typescript
// lib/myEntityService.ts
import { getFirestoreAdmin, getAdminTimestamp } from '@/features/infrastructure/api/firebase/admin';
import { logError } from '@/features/infrastructure/logging';
import type { CreateMyEntity, UpdateMyEntity, MyEntityFilters } from '../types';

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
  try {
    const db = getFirestoreAdmin();
    const doc = await db.collection('myEntities').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as MyEntity;
  } catch (error) {
    logError(error as Error, 'Failed to get entity', {
      component: 'myEntityService',
      operation: 'get',
      id,
    });
    throw error;
  }
}

export async function updateMyEntity(id: string, data: UpdateMyEntity): Promise<void> {
  try {
    const db = getFirestoreAdmin();
    await db.collection('myEntities').doc(id).update({
      ...data,
      updatedAt: getAdminTimestamp(),
    });
  } catch (error) {
    logError(error as Error, 'Failed to update entity', {
      component: 'myEntityService',
      operation: 'update',
      id,
    });
    throw error;
  }
}

export async function deleteMyEntity(id: string): Promise<void> {
  try {
    const db = getFirestoreAdmin();
    await db.collection('myEntities').doc(id).delete();
  } catch (error) {
    logError(error as Error, 'Failed to delete entity', {
      component: 'myEntityService',
      operation: 'delete',
      id,
    });
    throw error;
  }
}

export async function getMyEntities(filters: MyEntityFilters = {}): Promise<MyEntity[]> {
  try {
    const db = getFirestoreAdmin();
    let query: FirebaseFirestore.Query = db.collection('myEntities');

    if (filters.search) {
      query = query.where('name', '>=', filters.search)
                   .where('name', '<=', filters.search + '\uf8ff');
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MyEntity));
  } catch (error) {
    logError(error as Error, 'Failed to get entities', {
      component: 'myEntityService',
      operation: 'list',
    });
    throw error;
  }
}
```

## 3. Custom Hook

```typescript
// hooks/useMyEntities.ts
import { useState, useEffect } from 'react';
import type { MyEntity, MyEntityFilters } from '../types';

export function useMyEntities(filters: MyEntityFilters = {}) {
  const [entities, setEntities] = useState<MyEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEntities = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());

      const response = await fetch(`/api/my-entities?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch');
      }

      setEntities(data.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntities();
  }, [filters.search, filters.page, filters.limit]);

  return { entities, loading, error, refetch: fetchEntities };
}
```

## 4. API Route

```typescript
// src/pages/api/my-entities/index.ts
import type { NextApiRequest } from 'next';
import { createApiHandler } from '@/features/infrastructure/api/routeHandlers';
import { getMyEntities, createMyEntity } from '@/features/modules/my-entities/lib/myEntityService';

export default createApiHandler(
  async (req: NextApiRequest) => {
    if (req.method === 'GET') {
      const filters = {
        search: req.query.search as string | undefined,
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      };
      return await getMyEntities(filters);
    }

    if (req.method === 'POST') {
      return await createMyEntity(req.body);
    }

    throw new Error('Method not allowed');
  },
  {
    methods: ['GET', 'POST'],
    requireAuth: false, // Set to true if auth required
    logRequests: true,
  }
);
```

## Related Documentation

- [Code Patterns Index](../code-patterns.md)
- [Adding Features](../adding-features.md)
- [Adding API Routes](../adding-api-routes.md)

