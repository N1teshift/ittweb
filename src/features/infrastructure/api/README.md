# API Infrastructure

**Purpose**: Core API infrastructure utilities for building Next.js API routes with standardized patterns for validation, error handling, and request/response management.

> Date: 2025-12-03

## Structure

The API infrastructure is organized into logical subdirectories:

- **`handlers/`** - Route handler utilities
- **`parsing/`** - Query parameter parsing utilities
- **`schemas/`** - Zod schemas for request validation
- **`zod/`** - Zod validation helpers and integrations
- **`firebase/`** - Firebase-related utilities

All exports are available through the main `index.ts` file for convenient importing.

## Usage

### Import Pattern

All utilities are exported from the main API module:

```typescript
import { 
  createApiHandler,
  parseQueryString,
  zodValidator,
  CreatePostSchema
} from '@/features/infrastructure/api';
```

## Route Handlers

Create standardized API route handlers with built-in error handling, authentication, and caching.

```typescript
import { createApiHandler, requireSession } from '@/features/infrastructure/api';

export default createApiHandler(
  async (req, res, context) => {
    // Handler logic
    return { data: 'result' };
  },
  {
    methods: ['GET', 'POST'],
    requireAuth: false,
    logRequests: true,
    cacheControl: {
      public: true,
      maxAge: 300,
      mustRevalidate: true,
    },
  }
);
```

See `handlers/routeHandlers.ts` for all available options.

### Convenience Helpers

- `createGetHandler()` - GET-only handlers
- `createPostHandler()` - POST-only handlers
- `createGetPostHandler()` - GET and POST handlers

## Validation

### Zod Validation (Recommended)

Use Zod schemas for type-safe request validation:

```typescript
import { zodValidator, CreatePostSchema } from '@/features/infrastructure/api';
import { createPostHandler } from '@/features/infrastructure/api';

export default createPostHandler(
  async (req, res, context) => {
    // Body is already validated
    const postData = req.body; // Fully typed!
    // ... handler logic
  },
  {
    validateBody: zodValidator(CreatePostSchema),
  }
);
```

Available schemas in `schemas/schemas.ts`:
- `CreatePostSchema`
- `CreateEntrySchema`
- `UpdatePostSchema`
- `UpdateEntrySchema`
- `CreateScheduledGameSchema`
- `CreateCompletedGameSchema`
- `RevalidateSchema`

## Query Parameter Parsing

Parse and validate query parameters from API requests:

```typescript
import { parseQueryString, parseQueryInt, parseQueryEnum } from '@/features/infrastructure/api';

export default createApiHandler(async (req) => {
  const searchTerm = parseQueryString(req, 'q');
  const page = parseQueryInt(req, 'page', 1);
  const status = parseQueryEnum(req, 'status', ['active', 'inactive'] as const);
  
  // Use parsed values...
});
```

Available parsers:
- `parseQueryString()` - Parse string query parameters
- `parseQueryInt()` - Parse integer query parameters
- `parseQueryBoolean()` - Parse boolean query parameters
- `parseQueryDate()` - Parse date query parameters
- `parseQueryEnum()` - Parse enum query parameters
- `parseQueryArray()` - Parse array query parameters
- `parsePagination()` - Parse pagination parameters (page, limit, offset)

See `parsing/queryParser.ts` for all available parsers.

## Directory Structure

```
api/
├── README.md (this file)
├── index.ts (main exports)
├── handlers/
│   └── routeHandlers.ts - Route handler utilities
├── parsing/
│   └── queryParser.ts - Query parameter parsing
├── schemas/
│   └── schemas.ts - Zod schemas for request validation
├── zod/
│   └── zodValidation.ts - Zod validation helpers
└── firebase/
    └── (Firebase-related utilities)
```

## Examples

### Complete API Route Example

```typescript
import type { NextApiRequest } from 'next';
import { 
  createGetPostHandler,
  parseQueryBoolean,
  zodValidator,
  CreatePostSchema 
} from '@/features/infrastructure/api';

export default createGetPostHandler(
  async (req: NextApiRequest, res, context) => {
    if (req.method === 'GET') {
      const includeUnpublished = parseQueryBoolean(req, 'includeUnpublished', false);
      // ... fetch posts
      return posts;
    }
    
    if (req.method === 'POST') {
      const session = requireSession(context);
      const postData = req.body; // Already validated
      // ... create post
      return { id: postId };
    }
  },
  {
    requireAuth: false, // GET is public, POST checks auth manually
    validateBody: zodValidator(CreatePostSchema),
    cacheControl: {
      public: true,
      maxAge: 600,
      mustRevalidate: true,
    },
  }
);
```

## Testing

Test files are located in:
- Individual API route tests in their respective route directories

