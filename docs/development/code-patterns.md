# Code Cookbook

Common patterns and recipes for development.

## Table of Contents

- [CRUD Feature Pattern](#crud-feature-pattern)
- [Form Handling Pattern](#form-handling-pattern)
- [Pagination Pattern](#pagination-pattern)
- [Error Handling Pattern](#error-handling-pattern)
- [Loading States Pattern](#loading-states-pattern)
- [Filtering/Search Pattern](#filteringsearch-pattern)
- [Related Documentation](#related-documentation)

## CRUD Feature Pattern

Complete pattern for creating a CRUD feature.

### 1. Types

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

### 2. Service Layer

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

### 3. Custom Hook

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

### 4. API Route

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

## Form Handling Pattern

### Basic Form Hook

```typescript
// hooks/useMyForm.ts
import { useState, useMemo } from 'react';

interface FormState {
  name: string;
  email: string;
}

export function useMyForm(initialState: FormState) {
  const [formState, setFormState] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return formState.name.trim() !== '' && 
           formState.email.trim() !== '' && 
           !isSubmitting;
  }, [formState, isSubmitting]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof FormState]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    
    if (!formState.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formState.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Submit logic
      await submitForm(formState);
    } catch (error) {
      setErrors({ submit: 'Failed to submit form' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formState,
    errors,
    isSubmitting,
    canSubmit,
    handleChange,
    handleSubmit,
  };
}
```

## Pagination Pattern

### Cursor-Based Pagination

```typescript
// Service
export async function getItems(cursor?: string, limit = 20) {
  const db = getFirestoreAdmin();
  let query: FirebaseFirestore.Query = db.collection('items')
    .orderBy('createdAt', 'desc')
    .limit(limit + 1); // Fetch one extra to check if there's more

  if (cursor) {
    const cursorDoc = await db.collection('items').doc(cursor).get();
    query = query.startAfter(cursorDoc);
  }

  const snapshot = await query.get();
  const items = snapshot.docs.slice(0, limit).map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  const hasMore = snapshot.docs.length > limit;
  const nextCursor = hasMore ? snapshot.docs[limit].id : undefined;

  return { items, hasMore, nextCursor };
}

// Hook
export function useItems() {
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchItems = async (nextCursor?: string) => {
    setLoading(true);
    const response = await fetch(`/api/items?cursor=${nextCursor || ''}`);
    const data = await response.json();
    
    if (nextCursor) {
      setItems(prev => [...prev, ...data.items]);
    } else {
      setItems(data.items);
    }
    
    setCursor(data.nextCursor);
    setHasMore(data.hasMore);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchItems(cursor);
    }
  };

  return { items, loading, hasMore, loadMore };
}
```

## Error Handling Pattern

Error handling patterns for service and component layers.

**See [Error Handling Guide](./ERROR_HANDLING.md) for complete patterns, examples, and best practices.**

```typescript
function MyComponent() {
  const [error, setError] = useState<string | null>(null);

  const handleAction = async () => {
    try {
      setError(null);
      await performAction();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div>
      {error && (
        <div className="text-red-400 mb-4">{error}</div>
      )}
      {/* Component content */}
    </div>
  );
}
```

## Loading States Pattern

```typescript
function MyComponent() {
  const { data, loading, error } = useMyData();

  if (loading) {
    return <LoadingScreen message="Loading..." />;
  }

  if (error) {
    return <div className="text-red-400">Error: {error.message}</div>;
  }

  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  return (
    <div>
      {/* Render data */}
    </div>
  );
}
```

## Filtering/Search Pattern

```typescript
// Hook with filters
export function useFilteredItems() {
  const [filters, setFilters] = useState({ search: '', category: '' });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);

      const response = await fetch(`/api/items?${params}`);
      const data = await response.json();
      setItems(data.items);
      setLoading(false);
    };

    fetchItems();
  }, [filters.search, filters.category]);

  return { items, loading, filters, setFilters };
}

// Component
function FilteredList() {
  const { items, loading, filters, setFilters } = useFilteredItems();

  return (
    <div>
      <input
        type="text"
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        placeholder="Search..."
        className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-600 text-white"
      />
      <select
        value={filters.category}
        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-600 text-white"
      >
        {categoryOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {/* Render items */}
    </div>
  );
}
```

## API Route Patterns

### Authentication & Authorization

**Public Endpoint:**
```typescript
export default createGetHandler(
  async (req: NextApiRequest) => {
    // Public - no auth required
    return await getPublicData();
  },
  {
    requireAuth: false,
    cacheControl: { maxAge: 300, public: true },
  }
);
```

**Authenticated Endpoint:**
```typescript
export default createPostHandler(
  async (req: NextApiRequest, res, context) => {
    const session = requireSession(context); // Guaranteed to exist
    // Use session.discordId, session.user, etc.
    return await createData(req.body);
  },
  {
    requireAuth: true,
  }
);
```

**Admin-Only Endpoint:**
```typescript
export default createPostHandler(
  async (req: NextApiRequest, res, context) => {
    const session = requireSession(context); // Guaranteed to exist and be admin
    return await adminOperation(req.body);
  },
  {
    requireAdmin: true, // Automatically requires auth + admin role
  }
);
```

### Query Parameter Parsing

```typescript
import { parseQueryString, parseQueryInt, parsePagination } from '@/features/infrastructure/api/queryParser';

export default createGetHandler(
  async (req: NextApiRequest) => {
    const search = parseQueryString(req, 'q');
    const page = parseQueryInt(req, 'page', 1) || 1;
    const { limit, offset } = parsePagination(req, 20, 100);
    
    return await searchData(search, { limit, offset });
  }
);
```

### Request Validation

**📘 See [Zod Validation Migration Guide](./operations/zod-validation-migration.md) for comprehensive validation patterns.**

```typescript
import { zodValidator } from '@/features/infrastructure/api/zodValidation';
import { z } from 'zod';

// Define schema in src/features/infrastructure/api/schemas.ts
const CreateDataSchema = z.object({
  name: z.string().min(1).max(100, 'name must be at most 100 characters'),
  email: z.string().email('email must be a valid email address'),
});

export default createPostHandler(
  async (req: NextApiRequest, res, context) => {
    // Validation happens automatically via validateBody option
    const data = req.body as z.infer<typeof CreateDataSchema>; // Already validated and typed
    return await createData(data);
  },
  {
    requireAuth: true,
    validateBody: zodValidator(CreateDataSchema),
  }
);
```

### Resource Ownership Check

```typescript
import { checkResourceOwnership } from '@/features/infrastructure/api/routeHandlers';

export default createPostHandler(
  async (req: NextApiRequest, res, context) => {
    const session = requireSession(context);
    const resourceId = parseRequiredQueryString(req, 'id');
    
    const resource = await getResource(resourceId);
    if (!resource) {
      throw new Error('Resource not found');
    }
    
    // Check if user owns the resource or is admin
    const hasAccess = await checkResourceOwnership(resource, session);
    if (!hasAccess) {
      throw new Error('You do not have permission to modify this resource');
    }
    
    return await updateResource(resourceId, req.body);
  },
  {
    requireAuth: true,
  }
);
```

## Related Documentation

- [Development Guide](./development-guide.md)
- [Component Library](./components.md)
- [API Reference](./api/README.md)

