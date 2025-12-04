# Service Operation Wrapper

**Last Updated**: 2025-01-15  
**Purpose**: Standardized error handling and logging for service operations

## Overview

The Service Operation Wrapper provides a consistent way to wrap service operations with automatic error handling, logging, and optional timestamp factory injection. This abstraction eliminates repetitive try-catch-logError-throw patterns across service functions.

## Benefits

1. **Reduced Boilerplate**: Eliminates repetitive error handling code
2. **Consistent Logging**: Standardized error messages and context tracking
3. **Type Safety**: Full TypeScript support with proper type inference
4. **Flexible**: Supports operations with or without timestamp factories
5. **Nullable Operations**: Special handling for operations that may return null

## API Reference

### `withServiceOperation<T>`

Wraps an async service operation with error handling and logging.

```typescript
async function withServiceOperation<T>(
  operation: string,
  component: string,
  fn: (timestampFactory?: TimestampFactory) => Promise<T>,
  options?: ServiceOperationOptions
): Promise<T>
```

**Parameters:**
- `operation`: Operation name (e.g., 'getPostById', 'createEntry')
- `component`: Component/service name (e.g., 'postService', 'entryService')
- `fn`: The operation function to execute
- `options`: Optional configuration

**Options:**
- `provideTimestampFactory?: boolean` - Whether to inject timestamp factory (default: false)
- `context?: Record<string, unknown>` - Additional context for error logs
- `errorMessage?: string` - Custom error message (defaults to "Failed to {operation}")
- `rethrow?: boolean` - Whether to re-throw error after logging (default: true)

### `withServiceOperationSync<T>`

Synchronous version for operations that don't need timestamps.

```typescript
function withServiceOperationSync<T>(
  operation: string,
  component: string,
  fn: () => T,
  options?: Omit<ServiceOperationOptions, 'provideTimestampFactory'>
): T
```

### `withServiceOperationNullable<T>`

For operations that may return null/undefined. Logs errors but returns null instead of throwing.

```typescript
async function withServiceOperationNullable<T>(
  operation: string,
  component: string,
  fn: (timestampFactory?: TimestampFactory) => Promise<T | null>,
  options?: Omit<ServiceOperationOptions, 'rethrow'>
): Promise<T | null>
```

## Usage Examples

### Basic Operation (No Timestamp Factory)

```typescript
export async function getPostById(id: string): Promise<Post | null> {
  return withServiceOperationNullable(
    'getPostById',
    'postService',
    async () => {
      const docSnap = await getDocument(POSTS_COLLECTION, id);
      if (!docSnap?.exists) return null;
      return transformPostDoc(docSnap.data()!, docSnap.id);
    },
    { context: { id } }
  );
}
```

**Before:**
```typescript
export async function getPostById(id: string): Promise<Post | null> {
  try {
    const docSnap = await getDocument(POSTS_COLLECTION, id);
    if (!docSnap?.exists) return null;
    return transformPostDoc(docSnap.data()!, docSnap.id);
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to fetch post by ID', {
      component: 'postService',
      operation: 'getPostById',
      id,
    });
    throw err;
  }
}
```

### Operation with Timestamp Factory

```typescript
export async function createPost(data: CreatePost): Promise<string> {
  return withServiceOperation(
    'createPost',
    'postService',
    async (timestampFactory) => {
      logger.info('Creating post', { slug: data.slug });
      const firestoreData = preparePostDataForFirestore(data, timestampFactory);
      // ... create logic
      return docId;
    },
    { 
      provideTimestampFactory: true, 
      context: { slug: data.slug } 
    }
  );
}
```

### Nullable Operation (Returns null on error)

```typescript
export async function getPostBySlug(slug: string): Promise<Post | null> {
  return withServiceOperationNullable(
    'getPostBySlug',
    'postService',
    async () => {
      const db = getFirestoreInstance();
      const q = query(
        collection(db, POSTS_COLLECTION),
        where('slug', '==', slug),
        where('published', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      
      const docSnap = querySnapshot.docs[0];
      return transformPostDoc(docSnap.data(), docSnap.id);
    },
    { context: { slug } }
  );
}
```

### Synchronous Operation

```typescript
export function validateGameData(data: unknown): boolean {
  return withServiceOperationSync(
    'validateGameData',
    'gameService',
    () => {
      // validation logic
      if (!isValid(data)) {
        throw new Error('Invalid game data');
      }
      return true;
    },
    { context: { dataType: typeof data } }
  );
}
```

## Migration Guide

### Step 1: Import the wrapper

```typescript
import { withServiceOperation, withServiceOperationNullable } from '@/features/infrastructure/utils/service/serviceOperationWrapper';
// Or from the utils index:
import { withServiceOperation } from '@/features/infrastructure/utils';
```

### Step 2: Replace try-catch blocks

**Before:**
```typescript
export async function myOperation(param: string): Promise<Result> {
  try {
    // operation logic
    return result;
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to myOperation', {
      component: 'myService',
      operation: 'myOperation',
      param,
    });
    throw err;
  }
}
```

**After:**
```typescript
export async function myOperation(param: string): Promise<Result> {
  return withServiceOperation(
    'myOperation',
    'myService',
    async () => {
      // operation logic
      return result;
    },
    { context: { param } }
  );
}
```

### Step 3: Handle nullable operations

For operations that should return null on error (like getById when not found):

**Before:**
```typescript
export async function getById(id: string): Promise<Entity | null> {
  try {
    // fetch logic
    return entity;
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to getById', {
      component: 'myService',
      operation: 'getById',
      id,
    });
    throw err; // or return null
  }
}
```

**After:**
```typescript
export async function getById(id: string): Promise<Entity | null> {
  return withServiceOperationNullable(
    'getById',
    'myService',
    async () => {
      // fetch logic
      return entity;
    },
    { context: { id } }
  );
}
```

## When to Use Each Variant

- **`withServiceOperation`**: Standard operations that should throw on error
- **`withServiceOperationNullable`**: Operations that may legitimately return null (e.g., getById when not found)
- **`withServiceOperationSync`**: Synchronous operations that don't need timestamps
- **`provideTimestampFactory: true`**: Operations that need to create Firestore timestamps

## Integration with Existing Code

The wrapper integrates seamlessly with:
- ✅ Existing logging system (`logError` from `@/features/infrastructure/logging`)
- ✅ Timestamp utilities (`createTimestampFactoryAsync`)
- ✅ Error tracking (via `logError` which sends to Sentry)
- ✅ TypeScript type inference

## Best Practices

1. **Always provide context**: Include relevant parameters in the `context` option
2. **Use nullable variant for get operations**: Operations like `getById` should use `withServiceOperationNullable`
3. **Use standard variant for mutations**: Create/update/delete operations should use `withServiceOperation`
4. **Custom error messages**: Use `errorMessage` option when the default message isn't descriptive enough
5. **Don't wrap already-wrapped operations**: If using `createFirestoreCrudService`, those operations are already wrapped

## Related Documentation

- [Error Handling Guide](../ERROR_HANDLING.md)
- [Logging System](../infrastructure/logging/README.md)
- [Timestamp Utilities](../infrastructure/utils/timestampUtils.ts)

