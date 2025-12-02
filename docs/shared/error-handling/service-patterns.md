# Service Layer Error Handling Patterns

Error handling patterns for service layer functions.

## Pattern 1: Log and Throw

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

## Pattern 2: Log and Return Null/Empty

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

## Pattern 3: Log and Use Fallback

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

## Related Documentation

- [Error Handling Guide](./ERROR_HANDLING.md)
- [API Error Patterns](./api-patterns.md)
- [Component Error Patterns](./component-patterns.md)

