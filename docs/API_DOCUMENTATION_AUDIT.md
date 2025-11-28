# API Documentation Audit

**Date**: 2025-01-XX  
**Status**: In Progress

## Summary

This document audits API route documentation completeness and identifies missing or incomplete documentation.

## Documented API Namespaces

✅ **Fully Documented**:
- `games.md` - Games API
- `players.md` - Players API  
- `archives.md` - Archives API
- `scheduled-games.md` - Scheduled Games API
- `analytics.md` - Analytics API
- `standings.md` - Standings API
- `blog.md` - Blog API
- `classes.md` - Classes API
- `items.md` - Items API
- `user.md` - User API
- `admin.md` - Admin API

## Actual API Routes Found

### `/api/games/`
- ✅ `GET /api/games` - Documented
- ✅ `POST /api/games` - Documented
- ✅ `GET /api/games/[id]` - Documented
- ✅ `POST /api/games/[id]/join` - Documented
- ✅ `POST /api/games/[id]/leave` - Documented
- ✅ `POST /api/games/[id]/upload-replay` - Documented

### `/api/players/`
- ✅ `GET /api/players` - Documented
- ✅ `GET /api/players/[name]` - Documented
- ✅ `GET /api/players/compare` - Documented
- ✅ `GET /api/players/search` - Documented

### `/api/entries/`
- ✅ `GET /api/entries` - Documented (in archives.md)
- ✅ `POST /api/entries` - Documented (in archives.md)
- ✅ `GET /api/entries/[id]` - Documented (in archives.md)
- ✅ `PUT /api/entries/[id]` - Documented (in archives.md)
- ✅ `DELETE /api/entries/[id]` - Documented (in archives.md)

### `/api/scheduled-games/`
- ✅ `GET /api/scheduled-games` - Documented
- ✅ `GET /api/scheduled-games/[id]` - Documented (route exists)
- ✅ `POST /api/scheduled-games` - Documented
- ❌ `PUT /api/scheduled-games/[id]` - **REDUNDANT** (folder `[id]/` exists but is empty, functionality moved to `/api/games/[id]`)
- ❌ `DELETE /api/scheduled-games/[id]` - **REDUNDANT** (folder `[id]/` exists but is empty, functionality moved to `/api/games/[id]`)
- ❌ `POST /api/scheduled-games/[id]/join` - **REDUNDANT** (functionality moved to `/api/games/[id]/join`)
- ❌ `POST /api/scheduled-games/[id]/leave` - **REDUNDANT** (functionality moved to `/api/games/[id]/leave`)
- ❌ `POST /api/scheduled-games/[id]/upload-replay` - **REDUNDANT** (functionality moved to `/api/games/[id]/upload-replay`)

**Note**: The `scheduled-games/[id]/` folder exists but is empty. The join/leave/upload-replay functionality has been moved to `/api/games/[id]/*` routes. The empty folder should be removed, and API documentation should be updated to remove references to these routes.

### `/api/analytics/`
- ✅ `GET /api/analytics/activity` - Documented
- ✅ `GET /api/analytics/elo-history` - Documented
- ✅ `GET /api/analytics/meta` - Documented
- ✅ `GET /api/analytics/win-rate` - Documented

### `/api/standings/`
- ✅ `GET /api/standings` - Documented

### `/api/posts/`
- ✅ `GET /api/posts` - Documented (in blog.md)
- ✅ `POST /api/posts` - Documented (in blog.md)
- ✅ `GET /api/posts/[id]` - Documented (in blog.md)
- ✅ `PUT /api/posts/[id]` - Documented (in blog.md)
- ✅ `DELETE /api/posts/[id]` - Documented (in blog.md)

### `/api/classes/`
- ✅ `GET /api/classes` - Documented
- ✅ `GET /api/classes/[className]` - Documented

### `/api/items/`
- ✅ `GET /api/items` - Documented

### `/api/user/`
- ✅ `POST /api/user/accept-data-notice` - Documented
- ✅ `GET /api/user/data-notice-status` - Documented
- ✅ `DELETE /api/user/delete` - Documented

### `/api/admin/`
- ✅ `POST /api/admin/wipe-test-data` - Documented

### `/api/icons/`
- ❌ `GET /api/icons/list` - **NOT DOCUMENTED**
  - Returns list of icon files from `public/icons/itt/`
  - Response: `IconFile[]` (array of icon metadata)
  - No authentication required
  - **Action**: Create documentation or add to guides/items API docs

### `/api/revalidate/`
- ❌ `POST /api/revalidate` - **NOT DOCUMENTED** (Next.js ISR revalidation)
  - Requires authentication
  - Request body: `{ path: string }`
  - Response: `{ revalidated: true, path: string }`
  - **Action**: Document as internal/admin endpoint (may not need user-facing docs)

### `/api/auth/`
- ℹ️ `[...nextauth].ts` - NextAuth handler (not user-facing API, documented in ENVIRONMENT_SETUP.md)

## Missing Documentation

### Critical
1. **`/api/icons/list`** - Icon listing endpoint (no documentation found)
2. **`/api/revalidate`** - Revalidation endpoint (Next.js ISR, may not need user docs)

### Needs Verification
1. **Scheduled Games sub-routes** - `/api/scheduled-games/[id]/*` routes need verification:
   - Check if `[id]/index.ts`, `[id]/delete.ts`, `[id]/join.ts`, `[id]/leave.ts`, `[id]/upload-replay.ts` exist
   - Document any that exist

## Documentation Quality Issues

### Response Format Inconsistency
- Some docs show standardized format `{ success, data }`
- Some docs show legacy formats
- **Action**: Update all docs to reflect actual response formats (see KNOWN_ISSUES.md)

### Missing Details
- Some endpoints lack request/response examples
- Some endpoints lack error response documentation
- Authentication requirements not consistently documented

## Recommendations

1. **Create missing documentation**:
   - `/api/icons/list.md` or add to existing docs
   - Verify and document scheduled-games sub-routes

2. **Standardize documentation format**:
   - Use consistent template for all endpoints
   - Include: method, path, auth requirements, request body, response format, error responses

3. **Update response format docs**:
   - Document actual formats in use (see KNOWN_ISSUES.md)
   - Add migration notes for legacy formats

## Related Documentation

- [API Reference](./api/README.md)
- [Known Issues](./KNOWN_ISSUES.md)
- [API Client Usage](./API_CLIENT_USAGE.md)

