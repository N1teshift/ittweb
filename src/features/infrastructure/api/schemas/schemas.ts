/**
 * Generic Zod schemas for API request validation
 * 
 * These schemas define generic validation rules that are not domain-specific.
 * Domain-specific schemas should be in their respective modules.
 */

import { z } from 'zod';

/**
 * Schema for revalidate API endpoint
 */
export const RevalidateSchema = z.object({
  path: z.string().min(1, 'path must be a non-empty string'),
});
