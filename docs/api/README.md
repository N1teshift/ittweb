# API Reference

Complete API endpoint documentation for ITT Web.

## Authentication

Most POST/PUT/DELETE endpoints require authentication via NextAuth session. Include session cookie in requests.

## API Namespaces

- [Games](./games.md) - Game statistics and management
- [Players](./players.md) - Player statistics and profiles
- [Archives](./archives.md) - Archive entry management
- [Scheduled Games](./scheduled-games.md) - Scheduled game management
- [Analytics](./analytics.md) - Analytics data
- [Standings](./standings.md) - Leaderboards
- [Blog](./blog.md) - Blog posts
- [Classes](./classes.md) - Class information
- [Items](./items.md) - Item data
- [User](./user.md) - User account operations
- [Admin](./admin.md) - Admin operations

## Common Response Formats

**Note**: The codebase currently uses multiple response formats. This documentation reflects the actual formats in use.

### Standardized Format (createApiHandler)

Routes using `createApiHandler` return this format:

**Success Response:**
```typescript
{
  success: true,
  data: T  // Response data
}
```

**Error Response:**
```typescript
{
  success: false,
  error: string
}
```

### Legacy Formats (Manual Handlers)

Some routes use manual handlers with different formats:

**Success - Wrapped:**
```typescript
{
  success: true,
  data: T
}
// OR
{
  id: string,
  success: true
}
```

**Success - Direct Data:**
```typescript
T  // Direct data (no wrapper)
```

**Error:**
```typescript
{
  error: string
  // OR in development:
  error: string,
  details?: string
}
```

**Recommendation**: New routes should use `createApiHandler` for consistent formatting. Existing routes will be migrated over time.

### Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `405` - Method Not Allowed
- `500` - Internal Server Error

