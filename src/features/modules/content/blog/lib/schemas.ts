/**
 * Zod schemas for blog post API request validation
 * 
 * These schemas define the validation rules for blog post API request bodies.
 * They can be used with zodValidator() to integrate with routeHandlers.
 */

import { z } from 'zod';

/**
 * Schema for creating a new post
 */
export const CreatePostSchema = z.object({
  title: z.string().min(1, 'title must be a non-empty string'),
  content: z.string().min(1, 'content must be a non-empty string'),
  slug: z.string().min(1, 'slug must be a non-empty string'),
  date: z.string().datetime('date must be a valid ISO 8601 datetime string'),
  excerpt: z.string().optional(),
  creatorName: z.string().optional(), // Auto-filled from session if not provided
  createdByDiscordId: z.string().nullable().optional(), // Auto-filled from session if not provided
  submittedAt: z.string().datetime().optional(),
  published: z.boolean().optional(),
});

/**
 * Schema for updating a post
 */
export const UpdatePostSchema = z.object({
  title: z.string().min(1, 'title must be a non-empty string').optional(),
  content: z.string().min(1, 'content must be a non-empty string').optional(),
  slug: z.string().min(1, 'slug must be a non-empty string').optional(),
  date: z.string().datetime('date must be a valid ISO 8601 datetime string').optional(),
  excerpt: z.string().optional(),
  creatorName: z.string().optional(),
  createdByDiscordId: z.string().nullable().optional(),
  submittedAt: z.string().datetime().optional(),
  published: z.boolean().optional(),
});

