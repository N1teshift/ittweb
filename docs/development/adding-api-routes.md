# Adding API Routes

How to create API routes using `createApiHandler` or manual handlers.

## Using `createApiHandler` (Recommended)

### Public GET Endpoint

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

### Authenticated POST Endpoint

```typescript
// src/pages/api/my-entities/index.ts
import type { NextApiRequest } from 'next';
import { createPostHandler, requireSession } from '@/features/infrastructure/api/routeHandlers';
import { zodValidator } from '@/features/infrastructure/api/zodValidation';
import { z } from 'zod';
import { createMyEntity } from '@/features/modules/my-entities/lib/myEntityService';

// Define schema in src/features/infrastructure/api/schemas.ts
const CreateMyEntitySchema = z.object({
  name: z.string().min(1, 'name is required').max(100, 'name must be at most 100 characters'),
});

export default createPostHandler(
  async (req: NextApiRequest, res, context) => {
    // Session is guaranteed to be available due to requireAuth: true
    const session = requireSession(context);
    
    // Body is already validated by validateBody option
    const entityData = req.body as z.infer<typeof CreateMyEntitySchema>;
    
    const entityId = await createMyEntity({
      name: entityData.name,
      createdByDiscordId: session.discordId || '',
    });
    
    return { id: entityId };
  },
  {
    requireAuth: true, // Automatically checks authentication
    validateBody: zodValidator(CreateMyEntitySchema),
    logRequests: true,
  }
);
```

**📘 See [Zod Validation Migration Guide](../operations/zod-validation-migration.md) for more validation patterns.**

### Admin-Only Endpoint

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

## Manual Handler (Legacy)

If you're not using `createApiHandler`, use manual handlers:

```typescript
// src/pages/api/my-entities/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/features/infrastructure/auth';
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

**Note**: All API routes should use `createApiHandler` for consistent authentication and error handling.

## Related Documentation

- [Adding Features](./adding-features.md)
- [Code Conventions](./code-conventions.md)
- [Authentication & Authorization](../security/authentication-authorization.md)
- [Input Validation](../security/input-validation.md)

