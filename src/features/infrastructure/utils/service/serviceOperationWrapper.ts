/**
 * Service Operation Wrapper
 * 
 * Provides a standardized way to wrap service operations with:
 * - Automatic error handling and logging
 * - Component/operation context tracking
 * - Optional timestamp factory injection
 * - Consistent error reporting
 * 
 * This abstraction reduces boilerplate in service functions by eliminating
 * repetitive try-catch-logError-throw patterns.
 */

import { logError } from '@/features/infrastructure/logging';
import { createTimestampFactoryAsync, type TimestampFactory } from '../time/timestampUtils';

/**
 * Context information for service operations
 */
export interface ServiceOperationContext {
  component: string;
  operation: string;
  [key: string]: unknown;
}

/**
 * Options for service operation wrapper
 */
export interface ServiceOperationOptions {
  /**
   * Whether to provide a timestamp factory to the operation function
   * @default false
   */
  provideTimestampFactory?: boolean;
  
  /**
   * Additional context to include in error logs
   */
  context?: Record<string, unknown>;
  
  /**
   * Custom error message prefix (defaults to "Failed to {operation}")
   */
  errorMessage?: string;
  
  /**
   * Whether to re-throw the error after logging
   * @default true
   */
  rethrow?: boolean;
}

/**
 * Wraps a service operation with error handling and logging
 * 
 * @param operation - The operation name (e.g., 'getPostById', 'createEntry')
 * @param component - The component/service name (e.g., 'postService', 'entryService')
 * @param fn - The operation function to execute
 * @param options - Optional configuration
 * @returns The result of the operation function
 * 
 * @example
 * ```typescript
 * export async function getPostById(id: string): Promise<Post | null> {
 *   return withServiceOperation(
 *     'getPostById',
 *     'postService',
 *     async () => {
 *       const docSnap = await getDocument(POSTS_COLLECTION, id);
 *       if (!docSnap?.exists) return null;
 *       return transformPostDoc(docSnap.data()!, docSnap.id);
 *     },
 *     { context: { id } }
 *   );
 * }
 * ```
 * 
 * @example With timestamp factory
 * ```typescript
 * export async function createPost(data: CreatePost): Promise<string> {
 *   return withServiceOperation(
 *     'createPost',
 *     'postService',
 *     async (timestampFactory) => {
 *       const firestoreData = preparePostDataForFirestore(data, timestampFactory);
 *       // ... create logic
 *     },
 *     { provideTimestampFactory: true, context: { slug: data.slug } }
 *   );
 * }
 * ```
 */
export async function withServiceOperation<T>(
  operation: string,
  component: string,
  fn: (timestampFactory?: TimestampFactory) => Promise<T>,
  options: ServiceOperationOptions = {}
): Promise<T> {
  const {
    provideTimestampFactory = false,
    context = {},
    errorMessage,
    rethrow = true,
  } = options;

  try {
    if (provideTimestampFactory) {
      const timestampFactory = await createTimestampFactoryAsync();
      return await fn(timestampFactory);
    } else {
      return await fn();
    }
  } catch (error) {
    const err = error as Error;
    const fullContext: ServiceOperationContext = {
      component,
      operation,
      ...context,
    };

    const message = errorMessage || `Failed to ${operation}`;
    logError(err, message, fullContext);

    if (rethrow) {
      throw err;
    }

    // If not rethrowing, return undefined (caller should handle this)
    // This is rarely used but provides flexibility
    return undefined as T;
  }
}

/**
 * Synchronous version of withServiceOperation (for operations that don't need timestamps)
 * 
 * @param operation - The operation name
 * @param component - The component/service name
 * @param fn - The operation function to execute
 * @param options - Optional configuration
 * @returns The result of the operation function
 * 
 * @example
 * ```typescript
 * export function validateGameData(data: unknown): boolean {
 *   return withServiceOperationSync(
 *     'validateGameData',
 *     'gameService',
 *     () => {
 *       // validation logic
 *       return true;
 *     }
 *   );
 * }
 * ```
 */
export function withServiceOperationSync<T>(
  operation: string,
  component: string,
  fn: () => T,
  options: Omit<ServiceOperationOptions, 'provideTimestampFactory'> = {}
): T {
  const {
    context = {},
    errorMessage,
    rethrow = true,
  } = options;

  try {
    return fn();
  } catch (error) {
    const err = error as Error;
    const fullContext: ServiceOperationContext = {
      component,
      operation,
      ...context,
    };

    const message = errorMessage || `Failed to ${operation}`;
    logError(err, message, fullContext);

    if (rethrow) {
      throw err;
    }

    return undefined as T;
  }
}

/**
 * Wraps a service operation that may return null/undefined (non-fatal errors)
 * Logs warnings instead of errors and returns null on failure
 * 
 * @param operation - The operation name
 * @param component - The component/service name
 * @param fn - The operation function to execute
 * @param options - Optional configuration
 * @returns The result of the operation or null on error
 * 
 * @example
 * ```typescript
 * export async function getPostBySlug(slug: string): Promise<Post | null> {
 *   return withServiceOperationNullable(
 *     'getPostBySlug',
 *     'postService',
 *     async () => {
 *       // fetch logic
 *       return post;
 *     },
 *     { context: { slug } }
 *   );
 * }
 * ```
 */
export async function withServiceOperationNullable<T>(
  operation: string,
  component: string,
  fn: (timestampFactory?: TimestampFactory) => Promise<T | null>,
  options: Omit<ServiceOperationOptions, 'rethrow'> = {}
): Promise<T | null> {
  const {
    provideTimestampFactory = false,
    context = {},
    errorMessage,
  } = options;

  try {
    if (provideTimestampFactory) {
      const timestampFactory = await createTimestampFactoryAsync();
      return await fn(timestampFactory);
    } else {
      return await fn();
    }
  } catch (error) {
    const err = error as Error;
    const fullContext: ServiceOperationContext = {
      component,
      operation,
      ...context,
    };

    const message = errorMessage || `Failed to ${operation}`;
    logError(err, message, fullContext);

    // Return null instead of throwing for nullable operations
    return null;
  }
}
