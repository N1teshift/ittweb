# Error Handling Guide

**Complete guide to error handling patterns, logging, and error tracking in ITT Web.**

## Quick Reference

```typescript
import { logError, logAndThrow, createComponentLogger } from '@/features/infrastructure/logging';

// Basic error logging
logError(error as Error, 'Operation failed', {
  component: 'ComponentName',
  operation: 'operationName',
});

// Log and throw
logAndThrow(error, 'Operation failed', { component: 'ComponentName' });

// Component logger
const logger = createComponentLogger('ComponentName', 'methodName');
logger.error('Error message', error, { metadata });
```

## Table of Contents

- [Architecture](#architecture)
- [Service Layer Patterns](#service-layer-patterns)
- [API Layer Patterns](#api-layer-patterns)
- [Component Layer Patterns](#component-layer-patterns)
- [Error Tracking](#error-tracking)
- [Security Considerations](#security-considerations)
- [Best Practices](#best-practices)

## Architecture

### Three-Layer Pattern

1. **Service Layer**: Catch errors, log with context, handle or rethrow
2. **API Layer**: Handle errors, return appropriate status codes, log errors
3. **Component Layer**: Display user-friendly error messages, handle UI state

### Error Categories

The logging system automatically categorizes errors:

- `VALIDATION` - Input validation errors
- `NETWORK` - Network/timeout/connection errors
- `DATABASE` - Firestore/Firebase errors
- `AUTHENTICATION` - Auth failures
- `AUTHORIZATION` - Permission errors
- `BUSINESS_LOGIC` - Business rule violations
- `UNKNOWN` - Unclassified errors

## Service Layer Patterns

### Pattern 1: Log and Throw

Use when the error should propagate up:

```typescript
import { logAndThrow } from '@/features/infrastructure/logging';

export async function myOperation() {
  try {
    // operation
    return result;
  } catch (error) {
    logAndThrow(error as Error, 'Operation failed', {
      component: 'myService',
      operation: 'myOperation',
    });
  }
}
```

### Pattern 2: Log and Return Null/Empty

Use when you can gracefully handle the error:

```typescript
import { logError } from '@/features/infrastructure/logging';

export async function myOperation(): Promise<MyData | null> {
  try {
    // operation
    return data;
  } catch (error) {
    logError(error as Error, 'Operation failed', {
      component: 'myService',
      operation: 'myOperation',
    });
    return null;
  }
}
```

### Pattern 3: Log and Use Fallback

Use when you have a fallback strategy:

```typescript
import { logError } from '@/features/infrastructure/logging';

export async function myOperation(): Promise<MyData> {
  try {
    // operation
    return data;
  } catch (error) {
    logError(error as Error, 'Operation failed, using fallback', {
      component: 'myService',
      operation: 'myOperation',
    });
    return getFallbackData();
  }
}
```

## API Layer Patterns

### Using createApiHandler

All API routes should use `createApiHandler` for consistent error handling:

```typescript
import { createApiHandler } from '@/features/infrastructure/api/routeHandlers';

export default createApiHandler(async (req, res) => {
  // Your handler code
  // Errors are automatically caught, logged, and returned with appropriate status codes
  return { data: result };
});
```

### Custom Error Status Codes

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

### Production Error Messages

```typescript
// Errors are automatically sanitized in production
// Development: Full error message
// Production: Generic "Internal server error" for 500s
```

## Component Layer Patterns

### Basic Error Handling

```typescript
import { useState } from 'react';
import { logError } from '@/features/infrastructure/logging';

function MyComponent() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: FormData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await fetch('/api/my-endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Request failed');
      }

      const result = await response.json();
      // Handle success
    } catch (err) {
      const error = err as Error;
      logError(error, 'Failed to submit form', {
        component: 'MyComponent',
        operation: 'handleSubmit',
      });
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <div className="text-red-400">{error}</div>}
      {/* Form */}
    </div>
  );
}
```

### Component Logger

For components with multiple operations:

```typescript
import { createComponentLogger } from '@/features/infrastructure/logging';

const logger = createComponentLogger('MyComponent');

function MyComponent() {
  const handleAction = async () => {
    try {
      logger.info('Action started', { userId: user.id });
      // operation
      logger.info('Action completed');
    } catch (error) {
      logger.error('Action failed', error as Error, { userId: user.id });
    }
  };
}
```

## Error Tracking

### Automatic Error Capture

Errors logged with `logError()` are automatically sent to Sentry (if configured):

```typescript
import { logError } from '@/features/infrastructure/logging';

try {
  // operation
} catch (error) {
  logError(error as Error, 'Operation failed', {
    component: 'MyComponent',
    operation: 'fetchData',
    userId: session?.discordId, // Included in error context
  });
}
```

### Manual Error Capture

For non-error events or custom error handling:

```typescript
import { captureError, captureMessage } from '@/features/infrastructure/monitoring';

// Capture an error
captureError(new Error('Something went wrong'), {
  component: 'MyComponent',
  operation: 'processData',
});

// Capture a message
captureMessage('Important event occurred', 'info', {
  userId: 'user123',
});
```

### User Context

Set user context for better error tracking:

```typescript
import { setUserContext } from '@/features/infrastructure/monitoring';

setUserContext('user123', 'user@example.com', 'username');
```

See [Monitoring Guide](./operations/monitoring.md) for Sentry setup.

## Security Considerations

### Don't Expose Sensitive Information

**Production**: Generic error messages for 500 errors
**Development**: Full error details

```typescript
// Automatically handled by createApiHandler
// Production: "Internal server error"
// Development: Full error message
```

### Log Detailed Errors Server-Side Only

```typescript
logError(error, 'Operation failed', {
  component: 'myComponent',
  operation: 'myOperation',
  userId: session?.discordId, // Log for debugging
  sensitiveData: data, // Log server-side, don't return to client
});

// Return generic message to client
return { error: 'Operation failed' };
```

## Best Practices

### 1. Always Include Context

```typescript
logError(error, 'Operation failed', {
  component: 'ComponentName',  // Required
  operation: 'operationName', // Required
  userId: session?.discordId,  // Helpful
  additionalContext: value,   // As needed
});
```

### 2. Use Appropriate Log Levels

- `logger.debug()` - Development debugging
- `logger.info()` - Important events
- `logger.warn()` - Warnings that don't break functionality
- `logger.error()` - Errors that need attention

### 3. Never Use Direct Console Calls

❌ **Don't do this:**
```typescript
console.error('Error:', error);
console.log('Debug info:', data);
```

✅ **Do this:**
```typescript
logError(error as Error, 'Error message', { component: 'MyComponent' });
logger.debug('Debug info', { data });
```

### 4. Handle Errors at the Right Layer

- **Service Layer**: Log with full context, decide whether to throw
- **API Layer**: Catch service errors, return appropriate HTTP status
- **Component Layer**: Display user-friendly messages, handle UI state

### 5. Provide User-Friendly Messages

```typescript
// Service layer: Log technical details
logError(error, 'Database query failed', { component: 'UserService' });

// Component layer: Show user-friendly message
setError('Unable to load user data. Please try again.');
```

## Related Documentation

- [Monitoring Guide](./operations/monitoring.md) - Error tracking setup and Sentry integration
- [Architecture](./development/architecture.md) - System architecture and design patterns
- [API Client Usage](./development/api-client.md) - Client-side API error handling
- [Security](./SECURITY.md) - Security best practices for error handling
- [Code Patterns](./development/code-patterns.md) - Additional code patterns

