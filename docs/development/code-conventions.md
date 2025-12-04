# Code Conventions

Code patterns, conventions, and best practices for ITT Web.

## Error Handling

Always use infrastructure logging for error handling. All errors must be logged with `logError()` or `logAndThrow()` from `@/features/infrastructure/logging`.

**See [Error Handling Guide](../ERROR_HANDLING.md) for complete patterns, examples, and best practices.**

## File Size

Keep files under 200 lines when possible. Split large files into smaller modules.

## TypeScript

- Use strict TypeScript
- Define types in `types/` directory
- Use interfaces for data structures
- Use types for unions, utilities, etc.

## Firebase Operations

```typescript
// Server-side (API routes, server components)
import { getFirestoreAdmin, getAdminTimestamp } from '@/features/infrastructure/api/firebase/admin';

const db = getFirestoreAdmin();
const timestamp = getAdminTimestamp();

// Client-side (components, hooks)
import { db } from '@/features/infrastructure/api/firebase/firebaseClient';

const doc = await db.collection('games').doc('id').get();
```

## Authentication

### Using `createApiHandler` (Recommended)

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

### Manual Authentication (Legacy)

If you're not using `createApiHandler`, check authentication manually:

```typescript
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/features/infrastructure/auth';
import { isAdmin } from '@/features/infrastructure/utils/user/userRoleUtils';
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

## Component Patterns

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

- [Adding Features](./adding-features.md)
- [Adding API Routes](./adding-api-routes.md)
- [Code Patterns](./code-patterns.md)
- [Error Handling Guide](../ERROR_HANDLING.md)
- [Authentication & Authorization](../security/authentication-authorization.md)

