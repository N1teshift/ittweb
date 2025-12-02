# Web Security

XSS prevention, CSRF protection, and security headers.

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

## Related Documentation

- [Security Overview](../SECURITY.md)
- [Authentication & Authorization](./authentication-authorization.md)
- [Input Validation](./input-validation.md)

