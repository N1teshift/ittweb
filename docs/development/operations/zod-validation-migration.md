# Zod Validation Migration Guide

**Last Updated:** December 1, 2025

> **📚 Documentation Structure:** Validation is documented in multiple places for different contexts. See [Validation Documentation Structure](./validation-documentation-structure.md) to understand where to find what you need.

## Overview

This project has migrated from manual validation to **Zod-based schema validation** for API routes. Zod provides:

- **Type safety**: Automatic TypeScript type inference from schemas
- **Consistency**: Standardized validation across all routes
- **Better error messages**: Structured, detailed validation errors
- **Industry standard**: Widely used and well-documented

## What Changed

### Before (Manual Validation)

Routes used inline validation logic with custom validators:

```typescript
validateBody: (body: unknown) => {
  if (body && typeof body === 'object' && body !== null) {
    const requiredError = validateRequiredFields(body, ['title', 'content', 'slug', 'date']);
    if (requiredError) return requiredError;
    const bodyObj = body as { title?: unknown; slug?: unknown };
    const titleResult = validateString(bodyObj.title, 'title', 1);
    if (typeof titleResult === 'string' && titleResult.startsWith('title must be')) {
      return titleResult;
    }
    // ... more manual validation
  }
  return true;
}
```

### After (Zod Validation)

Routes now use declarative Zod schemas:

```typescript
import { zodValidator } from '@/features/infrastructure/api/zodValidation';
import { CreatePostSchema } from '@/features/infrastructure/api/schemas';

validateBody: zodValidator(CreatePostSchema),
```

## How to Use Zod Validation

### Step 1: Define Your Schema

Create a Zod schema in `src/features/infrastructure/api/schemas.ts`:

```typescript
import { z } from 'zod';

export const CreateGameSchema = z.object({
  gameId: z.number().int().positive('gameId must be a positive integer'),
  datetime: z.string().datetime('datetime must be a valid ISO 8601 datetime string'),
  players: z.array(z.object({
    name: z.string().min(1),
    flag: z.enum(['winner', 'loser', 'drawer']),
    pid: z.number().int(),
  })).min(2, 'At least 2 players are required'),
  category: z.string().optional(),
});
```

### Step 2: Use the Schema in Your Route

Import and use `zodValidator` with your schema:

```typescript
import { zodValidator } from '@/features/infrastructure/api/zodValidation';
import { CreateGameSchema } from '@/features/infrastructure/api/schemas';

export default createPostHandler(
  async (req, res, context) => {
    // Body is already validated - use it directly
    const gameData = req.body as z.infer<typeof CreateGameSchema>;
    // ... handler logic
  },
  {
    validateBody: zodValidator(CreateGameSchema),
  }
);
```

### Step 3: (Optional) Get Type-Safe Data

For better type safety, you can use `validateZodBody` to get typed data:

```typescript
import { validateZodBody } from '@/features/infrastructure/api/zodValidation';
import { CreateGameSchema } from '@/features/infrastructure/api/schemas';

export default createPostHandler(
  async (req, res, context) => {
    const result = validateZodBody(req.body, CreateGameSchema);
    if (!result.success) {
      // This shouldn't happen if validateBody is set, but useful for manual validation
      return res.status(400).json({ error: result.error });
    }
    
    // result.data is fully typed!
    const gameData = result.data;
    // ... handler logic
  },
  {
    validateBody: zodValidator(CreateGameSchema),
  }
);
```

## Migrating Existing Routes

### Example: Migrating a Route with Manual Validation

**Before:**

```typescript
import { validateRequiredFields, validateString, validateEnum } from '@/features/infrastructure/api/validators';

export default createPostHandler(
  async (req, res, context) => {
    const data = req.body;
    // ... handler logic
  },
  {
    validateBody: (body: unknown) => {
      if (body && typeof body === 'object' && body !== null) {
        const requiredError = validateRequiredFields(body, ['title', 'contentType', 'date']);
        if (requiredError) return requiredError;
        
        const bodyObj = body as { contentType?: unknown; title?: unknown };
        const contentTypeResult = validateEnum(bodyObj.contentType, 'contentType', ['post', 'memory']);
        if (contentTypeResult === null || ...) {
          return contentTypeResult || 'contentType must be a string';
        }
        
        const titleResult = validateString(bodyObj.title, 'title', 1);
        if (typeof titleResult === 'string' && titleResult.startsWith('title must be')) {
          return titleResult;
        }
      }
      return true;
    },
  }
);
```

**After:**

1. **Add schema to `schemas.ts`:**

```typescript
export const CreateEntrySchema = z.object({
  title: z.string().min(1, 'title must be a non-empty string'),
  contentType: z.enum(['post', 'memory'], {
    errorMap: () => ({ message: 'contentType must be either "post" or "memory"' }),
  }),
  date: z.string().datetime('date must be a valid ISO 8601 datetime string'),
  // ... other fields
});
```

2. **Update route:**

```typescript
import { zodValidator } from '@/features/infrastructure/api/zodValidation';
import { CreateEntrySchema } from '@/features/infrastructure/api/schemas';

export default createPostHandler(
  async (req, res, context) => {
    const data = req.body; // Already validated
    // ... handler logic
  },
  {
    validateBody: zodValidator(CreateEntrySchema),
  }
);
```

### Example: Migrating a Route with No Validation

**Before:**

```typescript
export default createPostHandler(
  async (req, res, context) => {
    const body = req.body as { gameId?: number; datetime?: string };
    
    // Manual validation in handler
    if (!body.gameId || !body.datetime) {
      throw new Error('Missing required fields: gameId and datetime are required');
    }
    // ... handler logic
  },
  {
    // No validateBody
  }
);
```

**After:**

1. **Add schema:**

```typescript
export const CreateGameSchema = z.object({
  gameId: z.number().int().positive(),
  datetime: z.string().datetime(),
  // ... other fields
});
```

2. **Update route:**

```typescript
import { zodValidator } from '@/features/infrastructure/api/zodValidation';
import { CreateGameSchema } from '@/features/infrastructure/api/schemas';

export default createPostHandler(
  async (req, res, context) => {
    // Body is validated - no need for manual checks
    const body = req.body as z.infer<typeof CreateGameSchema>;
    // ... handler logic
  },
  {
    validateBody: zodValidator(CreateGameSchema),
  }
);
```

## Common Zod Patterns

### Required vs Optional Fields

```typescript
z.object({
  required: z.string(),              // Required field
  optional: z.string().optional(),   // Optional field
  nullable: z.string().nullable(),    // Can be null
  optionalNullable: z.string().nullable().optional(), // Can be null or undefined
});
```

### String Validation

```typescript
z.string().min(1)                    // Non-empty string
z.string().min(1).max(100)          // String with length constraints
z.string().email()                   // Valid email
z.string().url()                     // Valid URL
z.string().datetime()                // ISO 8601 datetime string
z.string().uuid()                    // UUID string
```

### Number Validation

```typescript
z.number().int()                     // Integer
z.number().positive()                 // Positive number
z.number().min(0).max(100)           // Number in range
```

### Enum Validation

```typescript
z.enum(['option1', 'option2'])      // String enum
z.nativeEnum(MyEnum)                 // TypeScript enum
```

### Array Validation

```typescript
z.array(z.string())                  // Array of strings
z.array(z.string()).min(1)            // Non-empty array
z.array(z.string()).max(10)          // Max 10 items
z.array(z.object({ ... }))          // Array of objects
```

### Union Types

```typescript
z.union([z.string(), z.number()])    // String or number
z.string().or(z.literal(''))         // String or empty string
```

### Custom Validation

```typescript
z.string().refine(
  (val) => val.length > 5,
  { message: 'Must be longer than 5 characters' }
)
```

## Available Schemas

Current schemas in `src/features/infrastructure/api/schemas.ts`:

- `CreatePostSchema` - For creating blog posts
- `CreateEntrySchema` - For creating entries (posts/memories)
- `RevalidateSchema` - For revalidate API endpoint

## Benefits

1. **Type Safety**: Automatic TypeScript types from schemas
2. **Consistency**: All routes use the same validation pattern
3. **Maintainability**: Schemas are centralized and reusable
4. **Better Errors**: Structured, detailed error messages
5. **Documentation**: Schemas serve as API documentation

## Migration Steps

For each route that needs migration, follow these steps:

1. **Identify all fields that need validation** - Review the route handler to determine required and optional fields
2. **Create a Zod schema in `schemas.ts`** - Define the schema with appropriate validators (string, number, optional, etc.)
3. **Replace `validateBody` with `zodValidator(schema)`** - Update the route handler options
4. **Remove manual validation logic from handler** - Clean up any inline validation code
5. **Test the route with valid and invalid inputs** - Verify validation works correctly
6. **Update any related tests** - Ensure tests reflect the new validation approach

## Migration Status

### ✅ Completed Migrations

- `src/pages/api/posts/index.ts` - Uses `CreatePostSchema`
- `src/pages/api/entries/index.ts` - Uses `CreateEntrySchema`
- `src/pages/api/revalidate.ts` - Uses `RevalidateSchema`
- `src/pages/api/games/index.ts` - Uses `CreateScheduledGameSchema` and `CreateCompletedGameSchema` with custom validator
- `src/pages/api/entries/[id].ts` - Uses `UpdateEntrySchema` for PUT/PATCH
- `src/pages/api/posts/[id].ts` - Uses `UpdatePostSchema` for PUT/PATCH

### 📋 Remaining Routes

The following routes may need validation depending on their requirements:

- `src/pages/api/games/[id].ts` - GET/PUT/DELETE (may need UpdateGame schema)
- `src/pages/api/games/[id]/join.ts` - POST endpoint
- `src/pages/api/games/[id]/leave.ts` - POST endpoint
- `src/pages/api/games/[id]/upload-replay.ts` - POST endpoint (uses formidable for file uploads)
- `src/pages/api/user/*` - User management endpoints
- `src/pages/api/admin/*` - Admin endpoints
- `src/pages/api/analytics/*` - Analytics endpoints (mostly GET)
- Other routes that accept POST/PUT/PATCH requests

Note: Routes that only handle GET requests typically don't need body validation.

