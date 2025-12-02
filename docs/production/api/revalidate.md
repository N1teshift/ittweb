# Revalidation API

Next.js ISR (Incremental Static Regeneration) revalidation endpoint for manually triggering page revalidation.

## `POST /api/revalidate`

Manually trigger revalidation of a static page after content changes. This endpoint is used internally by the application to refresh static pages when content is created, updated, or deleted.

**Authentication**: Required (must be logged in)

**Request Body**:
```typescript
{
  path: string  // Path to revalidate (e.g., "/", "/posts/my-post")
}
```

**Response**:
```typescript
{
  revalidated: true,
  path: string
}
```

**Example Request**:
```typescript
POST /api/revalidate
Content-Type: application/json

{
  "path": "/"
}
```

**Example Response**:
```json
{
  "revalidated": true,
  "path": "/"
}
```

**Error Responses**:

**401 Unauthorized** (not authenticated):
```json
{
  "error": "Authentication required"
}
```

**400 Bad Request** (missing or invalid path):
```json
{
  "error": "Path is required"
}
```

**500 Internal Server Error** (revalidation failed):
```json
{
  "error": "Error revalidating path",
  "path": "/"
}
```

**Status Codes**:
- `200` - Revalidation successful
- `400` - Bad request (missing or invalid path)
- `401` - Unauthorized (authentication required)
- `405` - Method not allowed (only POST is supported)
- `500` - Internal server error (revalidation failed)

## Usage

This endpoint is used internally by the application in the following scenarios:

1. **Entry Creation** (`EntryFormModal.tsx`): Revalidates homepage (`/`) after creating a new archive entry
2. **Entry Deletion** (`entries/[id].tsx`): Revalidates homepage after deleting an entry
3. **Blog Post Creation** (`useNewPostForm.ts`): Revalidates blog pages after creating a new post
4. **Blog Post Update** (`useEditPostForm.ts`): Revalidates blog pages after updating a post
5. **Blog Post Deletion** (`posts/[slug].tsx`): Revalidates blog pages after deleting a post

## Notes

- **Internal Endpoint**: This is primarily an internal endpoint used by the application itself
- **Authentication Required**: All requests must be authenticated
- **Path Validation**: The path must be a valid Next.js route path
- **ISR**: Uses Next.js Incremental Static Regeneration to update static pages without rebuilding
- **Error Handling**: Revalidation failures are logged but don't block the main operation (e.g., entry creation still succeeds even if revalidation fails)

## Related Documentation

- [Next.js ISR Documentation](https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration)
- [Next.js revalidate API](https://nextjs.org/docs/api-reference/next.config.js/revalidate)

