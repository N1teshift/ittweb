# Input Validation & Firestore Rules

Input validation and database security rules.

## Input Validation

**📘 See [Zod Validation Migration Guide](../operations/zod-validation-migration.md) for comprehensive validation documentation.**

### Type Validation with Zod

Use Zod schemas for type-safe runtime validation:

```typescript
import { z } from 'zod';
import { zodValidator } from '@/features/infrastructure/api/zodValidation';

// Define schema in src/features/infrastructure/api/schemas.ts
export const CreateGameSchema = z.object({
  category: z.string().min(1, 'category is required'),
  teamSize: z.number().int().positive('teamSize must be a positive integer'),
});

export default createApiHandler(
  async (req) => {
    // Body is already validated by validateBody option
    const gameData = req.body as z.infer<typeof CreateGameSchema>;
    // Use validated data
  },
  {
    validateBody: zodValidator(CreateGameSchema),
  }
);
```

**Benefits:**
- Automatic TypeScript type inference
- Consistent validation across all routes
- Better error messages
- Centralized schema definitions

### Sanitization

Sanitize user input before storing:

```typescript
import DOMPurify from 'isomorphic-dompurify';

function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html);
}

// For text fields
function sanitizeText(text: string): string {
  return text.trim().slice(0, 1000); // Limit length
}
```

## Firestore Rules

Always set up Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read, authenticated write
    match /games/{gameId} {
      allow read: if true;
      allow write: if request.auth != null;
      
      match /players/{playerId} {
        allow read: if true;
        allow write: if request.auth != null;
      }
    }
    
    // Server-only writes
    match /playerStats/{playerId} {
      allow read: if true;
      allow write: if false; // Only server can write
    }
    
    // User-specific data
    match /userData/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      request.auth.uid == userId;
    }
  }
}
```

## Related Documentation

- [Security Overview](../SECURITY.md)
- [Authentication & Authorization](./authentication-authorization.md)
- [Zod Validation Migration Guide](../operations/zod-validation-migration.md)

