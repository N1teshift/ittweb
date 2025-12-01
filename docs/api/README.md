# API Reference

Complete API endpoint documentation for ITT Web.

## Authentication

Most POST/PUT/DELETE endpoints require authentication via NextAuth session. Include session cookie in requests.

## API Namespaces

- [Games](./games.md) - Game statistics and management
  - [CRUD Operations](./games/crud-operations.md)
  - [Replay Operations](./games/replay-operations.md)
- [Players](./players.md) - Player statistics and profiles
- [Archives](./archives.md) - Archive entry management
- [Scheduled Games](./scheduled-games.md) - Scheduled game management
- [Analytics](./analytics.md) - Analytics data
- [Standings](./standings.md) - Leaderboards
- [Blog](./blog.md) - Blog posts
- [Classes](./classes.md) - Class information
- [Items](./items.md) - Item data
- [Icons](./icons.md) - Icon file listing
- [User](./user.md) - User account operations
- [Admin](./admin.md) - Admin operations
- [Revalidate](./revalidate.md) - ISR revalidation (internal)

## Common Response Formats

### Standardized Format

**All API routes use the standardized response format via `createApiHandler`:**

**Success Response:**
```typescript
{
  success: true,
  data: T  // Response data from handler
}
```

**Error Response:**
```typescript
{
  success: false,
  error: string
}
```

### Handler Return Values

When using `createApiHandler`, your handler should return the data directly (not wrapped in `{ success: true }`). The handler automatically wraps it:

**Creation Endpoints:**
```typescript
// Handler returns:
return { id: gameId };

// Client receives:
{
  success: true,
  data: { id: gameId }
}
```

**Update/Delete Endpoints:**
```typescript
// Handler returns:
return {}; // or return { success: true };

// Client receives:
{
  success: true,
  data: {} // or { success: true, data: { success: true } }
}
```

**Data Endpoints:**
```typescript
// Handler returns:
return { items: [...], meta: {...} };

// Client receives:
{
  success: true,
  data: { items: [...], meta: {...} }
}
```

**Note**: Avoid returning `{ success: true, ... }` from handlers as it creates redundant nesting. The `createApiHandler` automatically adds the `success` field.

**Standardization Complete**: All API routes have been migrated to use `createApiHandler` and the standardized response format. This ensures consistent error handling, authentication, and response structure across all endpoints.

### Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `405` - Method Not Allowed
- `500` - Internal Server Error

