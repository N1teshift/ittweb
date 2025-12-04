/**
 * Zod schemas for entry API request validation
 * 
 * These schemas define the validation rules for entry (post or memory) API request bodies.
 * They can be used with zodValidator() to integrate with routeHandlers.
 */

import { z } from 'zod';

/**
 * Schema for creating a new entry (post or memory)
 */
export const CreateEntrySchema = z.object({
  title: z.string().min(1, 'title must be a non-empty string'),
  content: z.string().min(1, 'content must be a non-empty string'),
  contentType: z.enum(['post', 'memory']),
  date: z.string().datetime('date must be a valid ISO 8601 datetime string'),
  creatorName: z.string().optional(), // Auto-filled from session if not provided
  createdByDiscordId: z.string().nullable().optional(), // Auto-filled from session if not provided
  submittedAt: z.string().datetime().optional(),
  // Memory-specific fields (optional)
  images: z.array(z.string()).optional(),
  videoUrl: z.union([
    z.string().url('videoUrl must be a valid URL'),
    z.literal(''),
  ]).optional(),
  twitchClipUrl: z.union([
    z.string().url('twitchClipUrl must be a valid URL'),
    z.literal(''),
  ]).optional(),
  sectionOrder: z.array(z.enum(['images', 'video', 'twitch', 'text'])).optional(),
});

/**
 * Schema for updating an entry
 */
export const UpdateEntrySchema = z.object({
  title: z.string().min(1, 'title must be a non-empty string').optional(),
  content: z.string().min(1, 'content must be a non-empty string').optional(),
  contentType: z.enum(['post', 'memory']).optional(),
  date: z.string().datetime('date must be a valid ISO 8601 datetime string').optional(),
  creatorName: z.string().optional(),
  createdByDiscordId: z.string().nullable().optional(),
  submittedAt: z.string().datetime().optional(),
  // Memory-specific fields (optional)
  images: z.array(z.string()).optional(),
  videoUrl: z.union([
    z.string().url('videoUrl must be a valid URL'),
    z.literal(''),
  ]).optional(),
  twitchClipUrl: z.union([
    z.string().url('twitchClipUrl must be a valid URL'),
    z.literal(''),
  ]).optional(),
  sectionOrder: z.array(z.enum(['images', 'video', 'twitch', 'text'])).optional(),
  updatedAt: z.string().datetime().optional(),
});

