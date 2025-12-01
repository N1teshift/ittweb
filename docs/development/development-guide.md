# Development Guide

How to add features, API routes, and follow project conventions.

## Overview

This guide covers the essential workflows for developing in ITT Web. For detailed information on specific topics, see the focused guides:

- **[Adding Features](./adding-features.md)** - How to create a new feature module
- **[Adding API Routes](./adding-api-routes.md)** - How to create API endpoints
- **[Code Conventions](./code-conventions.md)** - Code patterns, TypeScript, Firebase, testing
- **[Code Patterns](./code-patterns.md)** - Common code patterns and recipes
- **[Architecture](./architecture.md)** - System architecture and design patterns

## Quick Start

### Adding a New Feature

1. Create module structure (see [Adding Features](./adding-features.md))
2. Define types following Firestore schema
3. Create service layer functions
4. Build React components
5. Create API routes if needed (see [Adding API Routes](./adding-api-routes.md))
6. Add tests
7. Document the module

### Adding an API Route

1. Create route file in `src/pages/api/`
2. Use `createApiHandler` for consistent error handling
3. Add validation with Zod schemas
4. Document in `docs/api/[module].md`

## Key Conventions

- **Error Handling**: Always use `logError()` or `logAndThrow()` from `@/features/infrastructure/logging`
- **File Size**: Keep files under 200 lines when possible
- **TypeScript**: Use strict mode, define types in `types/` directory
- **Authentication**: Use `createApiHandler` with `requireAuth: true` option
- **Testing**: Place tests next to source files

## Related Documentation

- [Architecture Overview](./architecture.md)
- [API Reference](../api/README.md)
- [Firestore Schemas](../database/schemas.md)
- [Error Handling Guide](../ERROR_HANDLING.md)
- [Security Best Practices](../SECURITY.md)
