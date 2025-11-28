# Security Best Practices

Security guidelines and patterns.

## Authentication

### Server-Side Checks

Always verify authentication server-side:

```typescript
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/features/infrastructure/auth';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Proceed with authenticated operation
}
```

### Using createApiHandler

```typescript
import { createApiHandler } from '@/features/infrastructure/api/routeHandlers';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/features/infrastructure/auth';

export default createApiHandler(
  async (req) => {
    // ⚠️ requireAuth option is not yet implemented
    // Authentication must be checked manually:
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      throw new Error('Authentication required');
    }
    
    // Handler logic
  },
  {
    methods: ['POST'],
    requireAuth: false, // ⚠️ Currently not implemented - check authentication manually
    logRequests: true,
  }
);
```

## Authorization

### Role-Based Access Control

Check user roles for admin operations:

```typescript
import { getUserDataByDiscordId } from '@/features/infrastructure/lib/userDataService';
import { isAdmin } from '@/features/infrastructure/utils/userRoleUtils';

const session = await getServerSession(req, res, authOptions);
if (!session) {
  return res.status(401).json({ error: 'Authentication required' });
}

const userData = await getUserDataByDiscordId(session.discordId || '');
if (!isAdmin(userData?.role)) {
  return res.status(403).json({ error: 'Admin access required' });
}
```

### Resource Ownership

Verify users can only modify their own resources:

```typescript
const resource = await getResource(id);

if (resource.createdByDiscordId !== session.discordId && !isAdmin(userData?.role)) {
  return res.status(403).json({ error: 'Access denied' });
}
```

## Input Validation

### Type Validation

Use TypeScript types and runtime validation:

```typescript
interface CreateGame {
  category: string;
  teamSize: number;
}

function validateCreateGame(data: unknown): boolean | string {
  if (typeof data !== 'object' || data === null) {
    return 'Request body must be an object';
  }
  
  const body = data as Record<string, unknown>;
  
  if (!('category' in body) || typeof body.category !== 'string') {
    return 'category is required and must be a string';
  }
  
  if (!('teamSize' in body) || typeof body.teamSize !== 'number' || body.teamSize <= 0) {
    return 'teamSize is required and must be a positive number';
  }
  
  return true; // Validation passed
}

export default createApiHandler(
  async (req) => {
    // Body is already validated by validateBody option
    const gameData = req.body as CreateGame;
    // Use validated data
  },
  {
    validateBody: validateCreateGame, // Returns boolean | string
  }
);
```

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

### Firestore Rules

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

## XSS Prevention

### React Escaping

React automatically escapes content:

```typescript
// Safe - React escapes HTML
<div>{userInput}</div>

// Dangerous - only use with sanitized content
<div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
```

### Content Security Policy

CSP is configured in `next.config.ts`:

```typescript
headers: [
  {
    source: '/(.*)',
    headers: [
      {
        key: 'Content-Security-Policy',
        value: "default-src 'self'; script-src 'self' 'unsafe-inline'; ..."
      }
    ]
  }
]
```

## SQL Injection Prevention

### Firestore Parameterized Queries

Firestore queries are parameterized by default:

```typescript
// Safe - Firestore handles escaping
db.collection('games')
  .where('category', '==', userInput)
  .get();

// No raw SQL queries - Firestore is NoSQL
```

## CSRF Protection

### Next.js Built-in Protection

Next.js provides CSRF protection for API routes. Ensure:

- API routes use proper HTTP methods
- State-changing operations use POST/PUT/DELETE
- GET requests are idempotent

## Secrets Management

### Environment Variables

Never commit secrets to repository:

```bash
# .env.local (in .gitignore)
NEXTAUTH_SECRET=your-secret
FIREBASE_SERVICE_ACCOUNT_KEY=...
DISCORD_CLIENT_SECRET=...
```

### Public vs Private

- `NEXT_PUBLIC_*` - Exposed to browser (Firebase client config)
- No prefix - Server-only (secrets, API keys)

## Error Handling

### Don't Expose Sensitive Info

```typescript
// Production
const errorMessage = process.env.NODE_ENV === 'production'
  ? 'Internal server error'
  : err.message;

return res.status(500).json({ error: errorMessage });
```

### Logging

Log detailed errors server-side only:

```typescript
logError(error, 'Operation failed', {
  component: 'myComponent',
  operation: 'myOperation',
  userId: session?.discordId, // Log for debugging
  // Don't return sensitive data to client
});
```

## File Uploads

### Validate File Types

```typescript
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/octet-stream'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

if (!ALLOWED_TYPES.includes(file.type)) {
  throw new Error('Invalid file type');
}

if (file.size > MAX_SIZE) {
  throw new Error('File too large');
}
```

### Scan Uploads

Consider scanning uploaded files for malware (production).

## Rate Limiting

### API Rate Limiting

Implement rate limiting for API routes:

```typescript
// Simple in-memory rate limiting
const rateLimit = new Map();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const window = 60000; // 1 minute
  const maxRequests = 100;
  
  const requests = rateLimit.get(ip) || [];
  const recent = requests.filter(time => now - time < window);
  
  if (recent.length >= maxRequests) {
    return false;
  }
  
  recent.push(now);
  rateLimit.set(ip, recent);
  return true;
}
```

## Security Headers

### Next.js Headers

Configure security headers in `next.config.ts`:

```typescript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
      ],
    },
  ];
}
```

## Checklist

### Before Deployment

- [ ] All API routes require authentication where needed
- [ ] Firestore security rules configured
- [ ] Input validation on all user inputs
- [ ] Error messages don't expose sensitive info
- [ ] Environment variables properly configured
- [ ] File uploads validated
- [ ] Security headers configured
- [ ] Secrets not committed to repository

### Ongoing

- [ ] Review Firestore rules regularly
- [ ] Audit user permissions
- [ ] Monitor for suspicious activity
- [ ] Keep dependencies updated
- [ ] Review security logs

## Related Documentation

- [Environment Setup](./ENVIRONMENT_SETUP.md)
- [Architecture Overview](./ARCHITECTURE.md)
- [Development Guide](./DEVELOPMENT.md)

