/**
 * Zod validation helpers for API routes
 * 
 * Provides integration between Zod schemas and the existing validateBody pattern
 * used in routeHandlers.ts
 */

import { z } from 'zod';

/**
 * Convert a Zod schema to a validateBody-compatible function
 * 
 * @example
 * ```typescript
 * const CreatePostSchema = z.object({
 *   title: z.string().min(1),
 *   slug: z.string().min(1),
 *   content: z.string(),
 *   date: z.string().datetime(),
 * });
 * 
 * export default createPostHandler(
 *   async (req, res, context) => { ... },
 *   {
 *     validateBody: zodValidator(CreatePostSchema),
 *   }
 * );
 * ```
 */
export function zodValidator<T extends z.ZodTypeAny>(
  schema: T
): (body: unknown) => boolean | string {
  return (body: unknown): boolean | string => {
    const result = schema.safeParse(body);
    
    if (result.success) {
      return true;
    }
    
    // Format Zod errors into a readable string
    const errors = result.error.issues.map((err: z.ZodIssue) => {
      const path = err.path.length > 0 ? `${err.path.join('.')}: ` : '';
      return `${path}${err.message}`;
    });
    
    return errors.join('; ');
  };
}

/**
 * Validate a body against a Zod schema and return the parsed data
 * 
 * @example
 * ```typescript
 * const result = validateZodBody(req.body, CreatePostSchema);
 * if (!result.success) {
 *   return res.status(400).json({ error: result.error });
 * }
 * const postData = result.data; // Fully typed!
 * ```
 */
export function validateZodBody<T extends z.ZodTypeAny>(
  body: unknown,
  schema: T
): { success: true; data: z.infer<T> } | { success: false; error: string } {
  const result = schema.safeParse(body);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  // Format Zod errors into a readable string
  const errors = result.error.issues.map((err: z.ZodIssue) => {
    const path = err.path.length > 0 ? `${err.path.join('.')}: ` : '';
    return `${path}${err.message}`;
  });
  
  return { success: false, error: errors.join('; ') };
}

/**
 * Create a custom validator that handles discriminated unions or complex validation
 * 
 * @example
 * ```typescript
 * validateBody: createCustomValidator((body) => {
 *   // Try scheduled game first
 *   const scheduledResult = CreateScheduledGameSchema.safeParse(body);
 *   if (scheduledResult.success) return true;
 *   
 *   // Try completed game
 *   const completedResult = CreateCompletedGameSchema.safeParse(body);
 *   if (completedResult.success) return true;
 *   
 *   // Return combined errors
 *   return formatZodErrors([scheduledResult.error, completedResult.error]);
 * })
 * ```
 */
export function createCustomValidator(
  validator: (body: unknown) => boolean | string
): (body: unknown) => boolean | string {
  return validator;
}

/**
 * Format Zod errors into a readable string
 */
export function formatZodErrors(errors: z.ZodError[]): string {
  const allErrors: string[] = [];
  for (const error of errors) {
    const formatted = error.issues.map((err: z.ZodIssue) => {
      const path = err.path.length > 0 ? `${err.path.join('.')}: ` : '';
      return `${path}${err.message}`;
    });
    allErrors.push(...formatted);
  }
  return allErrors.join('; ');
}

