# API Error Handling Patterns

Error handling patterns for API routes.

## Using createApiHandler

All API routes should use `createApiHandler` for consistent error handling:

```typescript
import { createApiHandler } from '@/features/infrastructure/api/routeHandlers';

export default createApiHandler(async (req, res) => {
  // Your handler code
  // Errors are automatically caught, logged, and returned with appropriate status codes
  return { data: result };
});
```

## Custom Error Status Codes

```typescript
import { createApiHandler } from '@/features/infrastructure/api/routeHandlers';

export default createApiHandler(async (req, res) => {
  const item = await getItem(id);
  
  if (!item) {
    const error = new Error('Item not found') as Error & { statusCode?: number };
    error.statusCode = 404;
    throw error;
  }
  
  return { data: item };
});
```

## Production Error Messages

```typescript
// Errors are automatically sanitized in production
// Development: Full error message
// Production: Generic "Internal server error" for 500s
```

## Related Documentation

- [Error Handling Guide](./ERROR_HANDLING.md)
- [Component Error Patterns](./component-patterns.md)
- [Service Layer Patterns](./service-patterns.md)

