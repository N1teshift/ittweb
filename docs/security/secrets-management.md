# Secrets Management

Managing secrets, environment variables, and file uploads.

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

**See [Error Handling Guide](../ERROR_HANDLING.md) for complete error handling patterns and best practices.**

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

## Related Documentation

- [Security Overview](../SECURITY.md)
- [Error Handling Guide](../ERROR_HANDLING.md)
- [Automated Security Scanning](./automated-scanning.md)

