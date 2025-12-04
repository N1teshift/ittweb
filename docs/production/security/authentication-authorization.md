# Authentication & Authorization

Authentication and authorization patterns for ITT Web.

## Authentication

### Server-Side Checks

Always verify authentication server-side:

```typescript
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/features/infrastructure/auth';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Proceed with authenticated operation
}
```

### Using createApiHandler (Recommended)

```typescript
import { createPostHandler, requireSession } from '@/features/infrastructure/api/routeHandlers';

export default createPostHandler(
  async (req, res, context) => {
    // Session is guaranteed to be available when requireAuth: true
    const session = requireSession(context);
    
    // Use session data
    const userId = session.discordId;
    
    // Handler logic
  },
  {
    requireAuth: true, // Automatically checks authentication
    logRequests: true,
  }
);
```

**How it works:**
- `requireAuth: true` automatically checks authentication
- Returns `401 Unauthorized` if not authenticated
- Session is available via `requireSession(context)` helper
- No need to manually check authentication

**Admin Access:**
```typescript
export default createPostHandler(
  async (req, res, context) => {
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

## Authorization

### Role-Based Access Control

Check user roles for admin operations:

```typescript
import { getUserDataByDiscordId } from '@/features/infrastructure/lib/userDataService';
import { isAdmin } from '@/features/infrastructure/utils/user/userRoleUtils';

const session = await getServerSession(req, res, authOptions);
if (!session) {
  return res.status(401).json({ error: 'Authentication required' });
}

const userData = await getUserDataByDiscordId(session.discordId || '');
if (!isAdmin(userData?.role)) {
  return res.status(403).json({ error: 'Admin access required' });
}
```

### Resource Ownership

Verify users can only modify their own resources:

```typescript
const resource = await getResource(id);

if (resource.createdByDiscordId !== session.discordId && !isAdmin(userData?.role)) {
  return res.status(403).json({ error: 'Access denied' });
}
```

## Related Documentation

- [Security Overview](../SECURITY.md)
- [Input Validation](./input-validation.md)
- [Error Handling](../ERROR_HANDLING.md)

