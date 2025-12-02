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

See [Service Layer Patterns](./error-handling/service-patterns.md) for detailed patterns:
- Log and Throw
- Log and Return Null/Empty
- Log and Use Fallback

## API Layer Patterns

See [API Error Patterns](./error-handling/api-patterns.md) for detailed patterns:
- Using createApiHandler
- Custom Error Status Codes
- Production Error Messages

## Component Layer Patterns

See [Component Error Patterns](./error-handling/component-patterns.md) for detailed patterns:
- Basic Error Handling
- Component Logger

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

See [Monitoring Guide](../development/operations/monitoring.md) for Sentry setup.

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

- [Monitoring Guide](../development/operations/monitoring.md) - Error tracking setup and Sentry integration
- [Architecture](../development/architecture.md) - System architecture and design patterns
- [API Client Usage](../development/api-client.md) - Client-side API error handling
- [Security](./SECURITY.md) - Security best practices for error handling
- [Code Patterns](../development/code-patterns.md) - Additional code patterns

