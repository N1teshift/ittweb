# Security Best Practices

Security guidelines and patterns for ITT Web.

## Overview

This document provides an overview of security best practices. For detailed information on specific topics, see the focused security documentation:

- **[Authentication & Authorization](./security/authentication-authorization.md)** - Authentication patterns, role-based access control
- **[Input Validation](./security/input-validation.md)** - Zod validation, sanitization, Firestore rules
- **[Web Security](./security/web-security.md)** - XSS prevention, CSRF protection, security headers
- **[Secrets Management](./security/secrets-management.md)** - Environment variables, file uploads, rate limiting
- **[Automated Security Scanning](./security/automated-scanning.md)** - Dependency scanning, secrets detection

## Security Review Guidelines

### Before Deployment

Ensure the following security checks are completed:
- All API routes require authentication where needed (use `requireAuth: true` in `createApiHandler`)
- Firestore security rules configured and tested
- Input validation on all user inputs (use Zod schemas via `validateBody` option)
- Error messages don't expose sensitive information (handled automatically by `createApiHandler` in production)
- Environment variables properly configured (secrets in `.env.local`, not committed)
- File uploads validated (type, size, scanned if applicable)
- Security headers configured in `next.config.ts`
- Secrets not committed to repository (verified with Gitleaks scan)

### Ongoing Security Maintenance

Regular security maintenance should include:
- Review Firestore rules regularly for access control accuracy
- Audit user permissions and roles
- Monitor for suspicious activity (unusual API patterns, failed auth attempts)
- Keep dependencies updated (automated via security scanning workflow)
- Review security logs and error tracking (Sentry, Firebase logs)

## Quick Reference

### Authentication
```typescript
// Using createApiHandler (recommended)
export default createPostHandler(
  async (req, res, context) => {
    const session = requireSession(context);
    // Session guaranteed when requireAuth: true
  },
  { requireAuth: true }
);
```

### Input Validation
```typescript
import { zodValidator } from '@/features/infrastructure/api/zodValidation';
import { CreateGameSchema } from '@/features/infrastructure/api/schemas';

export default createApiHandler(
  async (req) => {
    const data = req.body as z.infer<typeof CreateGameSchema>;
  },
  { validateBody: zodValidator(CreateGameSchema) }
);
```

### Error Handling
```typescript
// Errors automatically sanitized in production
logError(error, 'Operation failed', {
  component: 'MyComponent',
  operation: 'myOperation',
});
```

## Related Documentation

- [Environment Setup](./getting-started/setup.md)
- [Architecture Overview](./development/architecture.md)
- [Development Guide](./development/development-guide.md)
- [Error Handling Guide](./ERROR_HANDLING.md)
- [CI/CD Pipeline](./operations/ci-cd.md)
