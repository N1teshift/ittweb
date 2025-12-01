# Documentation Audit: What Needs Documentation

**⚠️ NOTE**: This is an **inventory/audit document** that provides a complete inventory of what exists and what needs documentation.

## Summary

This audit identifies what exists in the codebase and what needs minimal documentation.

## What "Proper Minimal Documentation" Means

**Minimal** = Essential information only:
- **Purpose**: What does this module/API/component do?
- **Usage**: How do I use it? (one example)
- **Exports**: What can I import?
- **Dependencies**: What does it depend on?

**Proper** = Complete coverage:
- All modules documented
- All API routes documented
- All shared utilities documented
- Clear navigation between docs

## Current State Analysis

### ✅ Already Well Documented

1. **Firestore Schemas** (`docs/schemas/firestore-collections.md`)
   - Complete schema definitions
   - Field naming conventions
   - Collection structures

2. **Product Documentation** (`docs/product/`)
   - Status, summary, improvements
   - User roles

3. **Operations** (`docs/operations/`)
   - Testing guides
   - Test plans (comprehensive)

4. **Systems** (`docs/systems/`)
   - Game stats implementation
   - Replay parser integration

### ✅ Fully Documented

1. **Root README** (`README.md`)
   - ✅ Current feature list included
   - ✅ Architecture overview included
   - ✅ API overview included
   - ✅ Complete documentation index

2. **Module Features** (`src/features/modules/`)
   - ✅ All 13 modules have README files
   - ✅ Usage examples included
   - ✅ API route references included
   - ✅ Purpose, exports, and examples documented

3. **API Routes** (`src/pages/api/`)
   - ✅ All 13 API namespaces documented in `docs/api/`
   - ✅ Request/response examples included
   - ✅ Authentication requirements documented
   - ✅ Error responses documented

4. **Infrastructure Documentation**
   - ✅ `src/features/infrastructure/README.md` - Auth, Firebase, logging, API handlers, shared components, hooks, utilities

5. **API Reference**
   - ✅ Centralized API documentation in `docs/api/`
   - ✅ Request/response examples with TypeScript types
   - ✅ Authentication requirements documented

6. **Development Guides**
   - ✅ `DEVELOPMENT.md` - How to add features and API routes
   - ✅ `CONTRIBUTING.md` - Development standards
   - ✅ `ENVIRONMENT_SETUP.md` - Complete setup guide
   - ✅ `CODE_COOKBOOK.md` - Common patterns
   - ✅ `API_CLIENT_USAGE.md` - Client-side API usage
   - ✅ `COMPONENT_LIBRARY.md` - Shared components
   - ✅ `TROUBLESHOOTING.md` - Common issues

### ⚠️ Areas for Enhancement

1. **API Documentation Examples**
   - Could add more complete request/response body examples
   - Could add authentication header examples
   - Could add more error response examples

2. **Development Guide Examples**
   - Could add more complete service layer examples
   - Could add more advanced patterns to CODE_COOKBOOK.md
   - Could add more error handling scenarios

3. **Navigation Improvements**
   - Long documents could benefit from table of contents
   - Could improve cross-references between related docs

## Complete Feature Inventory

### Modules (13 total)

1. **analytics** - Analytics service, chart components
   - Components: ActivityChart, EloChart, WinRateChart, etc.
   - Service: analyticsService
   - API: `/api/analytics/*`

2. **archives** - Archive entry management
   - Components: ArchiveForm, ArchiveEntry, ArchivesContent
   - Hooks: useArchivesPage, useArchiveHandlers
   - Service: archiveService (in shared)
   - API: `/api/entries/*`

3. **blog** - Blog post system
   - Components: BlogPost, NewPostForm, EditPostForm
   - Hooks: useNewPostForm, useEditPostForm
   - Service: postService, posts
   - API: `/api/posts/*`

4. **classes** - Class information pages
   - Components: ClassesPage, ClassDetailPage
   - API: `/api/classes/*`

5. **entries** - Entry form system
   - Components: EntryFormModal
   - Service: entryService
   - API: `/api/entries/*`

6. **games** - Game statistics and management
   - Components: GameList, GameCard, GameDetail
   - Hooks: useGames, useGame
   - Services: gameService, eloCalculator, replayParser
   - API: `/api/games/*`

7. **guides** - Game guides and static data
   - Components: GuideCard, ClassIcon, StatsCard
   - Data: abilities, items, units, iconMap
   - Utils: iconUtils, itemIdMapper
   - API: `/api/items/*`, `/api/classes/*`

8. **map-analyzer** - Map visualization tools
   - Components: MapContainer, TerrainVisualizer, FlagVisualizer
   - Utils: mapUtils
   - Types: map types

9. **meta** - Analytics dashboard
   - Components: MetaPage
   - Page: `/meta`

10. **players** - Player statistics and profiles
    - Components: PlayersPage, PlayerProfile, PlayerComparison
    - Hooks: usePlayerStats
    - Service: playerService
    - API: `/api/players/*`

11. **scheduled-games** - Scheduled game management
    - Components: (7 components)
    - Service: scheduledGameService
    - Utils: timezoneUtils
    - API: `/api/scheduled-games/*`

12. **standings** - Leaderboards
    - Components: Leaderboard, CategorySelector
    - Hooks: useStandings
    - Service: standingsService
    - API: `/api/standings/*`

13. **tools** - Utility tools
    - Components: (10 components)
    - Utils: icon-mapper.utils
    - Page: `/tools/*`

### API Routes (31 routes total)

**Analytics** (`/api/analytics/`)
- `activity.ts` - Activity data
- `elo-history.ts` - ELO history
- `meta.ts` - Meta analytics
- `win-rate.ts` - Win rate data

**Auth** (`/api/auth/`)
- `[...nextauth].ts` - NextAuth configuration

**Classes** (`/api/classes/`)
- `index.ts` - List classes
- `[className].ts` - Get class details

**Entries** (`/api/entries/`)
- `index.ts` - List/create entries
- `[id].ts` - Get/update/delete entry

**Games** (`/api/games/`)
- `index.ts` - List/create games
- `[id].ts` - Get/update/delete game
- `[id]/join.ts` - Join game
- `[id]/leave.ts` - Leave game
- `[id]/upload-replay.ts` - Upload replay

**Icons** (`/api/icons/`)
- `list.ts` - List available icons

**Items** (`/api/items/`)
- `index.ts` - List items

**Players** (`/api/players/`)
- `index.ts` - List players
- `[name].ts` - Get player stats
- `compare.ts` - Compare players
- `search.ts` - Search players

**Posts** (`/api/posts/`)
- `index.ts` - List/create posts
- `[id].ts` - Get/update/delete post

**Scheduled Games** (`/api/scheduled-games/`)
- `index.ts` - List/create scheduled games
- `[id]/index.ts` - Get scheduled game
- **Note**: Join/leave/upload-replay functionality moved to `/api/games/[id]/*` routes

**Standings** (`/api/standings/`)
- `index.ts` - Get leaderboard

**User** (`/api/user/`)
- `accept-data-notice.ts` - Accept data notice
- `data-notice-status.ts` - Get data notice status
- `delete.ts` - Delete user account

**Admin** (`/api/admin/`)
- `wipe-test-data.ts` - Wipe test data (admin only)

**Other**
- `revalidate.ts` - Revalidation endpoint (Next.js ISR)

## API Documentation Status

### Documented API Namespaces

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

### Route-by-Route Documentation Status

#### `/api/games/`
- ✅ `GET /api/games` - Documented
- ✅ `POST /api/games` - Documented
- ✅ `GET /api/games/[id]` - Documented
- ✅ `POST /api/games/[id]/join` - Documented
- ✅ `POST /api/games/[id]/leave` - Documented
- ✅ `POST /api/games/[id]/upload-replay` - Documented

#### `/api/players/`
- ✅ `GET /api/players` - Documented
- ✅ `GET /api/players/[name]` - Documented
- ✅ `GET /api/players/compare` - Documented
- ✅ `GET /api/players/search` - Documented

#### `/api/entries/`
- ✅ `GET /api/entries` - Documented (in archives.md)
- ✅ `POST /api/entries` - Documented (in archives.md)
- ✅ `GET /api/entries/[id]` - Documented (in archives.md)
- ✅ `PUT /api/entries/[id]` - Documented (in archives.md)
- ✅ `DELETE /api/entries/[id]` - Documented (in archives.md)

#### `/api/scheduled-games/`
- ✅ `GET /api/scheduled-games` - Documented
- ✅ `GET /api/scheduled-games/[id]` - Documented
- ✅ `POST /api/scheduled-games` - Documented
- **Note**: The `scheduled-games/[id]/` folder exists but is empty. Join/leave/upload-replay functionality has been moved to `/api/games/[id]/*` routes.

#### `/api/analytics/`
- ✅ `GET /api/analytics/activity` - Documented
- ✅ `GET /api/analytics/elo-history` - Documented
- ✅ `GET /api/analytics/meta` - Documented
- ✅ `GET /api/analytics/win-rate` - Documented

#### `/api/standings/`
- ✅ `GET /api/standings` - Documented

#### `/api/posts/`
- ✅ `GET /api/posts` - Documented (in blog.md)
- ✅ `POST /api/posts` - Documented (in blog.md)
- ✅ `GET /api/posts/[id]` - Documented (in blog.md)
- ✅ `PUT /api/posts/[id]` - Documented (in blog.md)
- ✅ `DELETE /api/posts/[id]` - Documented (in blog.md)

#### `/api/classes/`
- ✅ `GET /api/classes` - Documented
- ✅ `GET /api/classes/[className]` - Documented

#### `/api/items/`
- ✅ `GET /api/items` - Documented

#### `/api/user/`
- ✅ `POST /api/user/accept-data-notice` - Documented
- ✅ `GET /api/user/data-notice-status` - Documented
- ✅ `DELETE /api/user/delete` - Documented

#### `/api/admin/`
- ✅ `POST /api/admin/wipe-test-data` - Documented

#### `/api/icons/`
- ❌ `GET /api/icons/list` - **NOT DOCUMENTED**
  - Returns list of icon files from `public/icons/itt/`
  - Response: `IconFile[]` (array of icon metadata)
  - No authentication required
  - **Action**: Create documentation or add to guides/items API docs

#### `/api/revalidate/`
- ❌ `POST /api/revalidate` - **NOT DOCUMENTED** (Next.js ISR revalidation)
  - Requires authentication
  - Request body: `{ path: string }`
  - Response: `{ revalidated: true, path: string }`
  - **Action**: Document as internal/admin endpoint (may not need user-facing docs)

#### `/api/auth/`
- ℹ️ `[...nextauth].ts` - NextAuth handler (not user-facing API, documented in ENVIRONMENT_SETUP.md)

### Missing API Documentation

**Critical**:
1. **`/api/icons/list`** - Icon listing endpoint (no documentation found)
2. **`/api/revalidate`** - Revalidation endpoint (Next.js ISR, may not need user docs)

### API Documentation Quality Issues

**Response Format Inconsistency**:
- Some docs show standardized format `{ success, data }`
- Some docs show legacy formats
- **Action**: Update all docs to reflect actual response formats (see KNOWN_ISSUES.md)

**Missing Details**:
- Some endpoints lack request/response examples
- Some endpoints lack error response documentation
- Authentication requirements not consistently documented

### API Documentation Recommendations

1. **Create missing documentation**:
   - `/api/icons/list.md` or add to existing docs
   - Verify and document scheduled-games sub-routes

2. **Standardize documentation format**:
   - Use consistent template for all endpoints
   - Include: method, path, auth requirements, request body, response format, error responses

3. **Update response format docs**:
   - Document actual formats in use (see KNOWN_ISSUES.md)
   - Add migration notes for legacy formats

### Infrastructure Components

**Auth** (`src/features/infrastructure/auth/`)
- NextAuth integration

**API** (`src/features/infrastructure/api/`)
- Firebase admin/client setup
- Route handlers utilities

**Logging** (`src/features/infrastructure/logging/`)
- Logger system
- Error categorization

**Shared UI** (`src/features/infrastructure/shared/components/ui/`)
- Button, Card, Input
- LoadingOverlay, LoadingScreen

**Utils** (`src/features/infrastructure/utils/`)
- objectUtils
- timestampUtils

### Shared Components & Utilities

**Components** (`src/features/infrastructure/shared/components/ui/`)
- Button, Card, Input, LoadingScreen, LoadingOverlay
- UI components library

**Services** (`src/features/infrastructure/lib/`)
- userDataService
- archiveService
- Other shared services

**Utils** (`src/features/infrastructure/utils/`)
- userRoleUtils (role checking)
- objectUtils (object manipulation)
- timestampUtils (timestamp conversion)
- Logging utilities (see infrastructure logging)

## Documentation Status Summary

### ✅ Complete Documentation
1. ✅ Module READMEs - All 13 modules documented with purpose, exports, examples
2. ✅ API Reference - All 13 API namespaces documented in `docs/api/` with examples
3. ✅ Infrastructure docs - Core systems documented in `src/features/infrastructure/README.md`
4. ✅ Shared utilities - Documented in `src/features/infrastructure/README.md` with examples
5. ✅ Component library - Documented in `COMPONENT_LIBRARY.md`
6. ✅ Development workflow - Documented in `DEVELOPMENT.md` and `CONTRIBUTING.md`
7. ✅ Root README - Updated with current features, architecture overview, and API overview

### Nice to Have
8. Architecture diagram - High-level system overview
9. Contributing guide - Development standards
10. Migration guides - How to migrate data/schemas

## Recommended Documentation Structure

```
docs/
├── README.md (index - already exists)
├── DOCUMENTATION_PLAN.md (this file)
├── DOCUMENTATION_AUDIT.md (this file)
│
├── api/ (NEW)
│   ├── README.md (API index)
│   ├── games.md
│   ├── players.md
│   ├── archives.md
│   ├── scheduled-games.md
│   ├── analytics.md
│   └── ... (one per namespace)
│
└── modules/ (NEW)
    ├── README.md (modules index)
    ├── games.md
    ├── players.md
    └── ... (one per module)

src/features/modules/[module]/
└── README.md (NEW - minimal module docs)

src/features/infrastructure/
└── README.md (NEW - includes all infrastructure and shared features)
```

## Next Steps

1. **Create module READMEs** - Start with core modules (games, players, archives)
2. **Create API reference** - Document all API endpoints
3. **Update root README** - Add current features, architecture overview
4. **Create infrastructure docs** - Auth, logging, Firebase setup
5. **Create shared docs** - Components, hooks, utilities

Each documentation file should be:
- **Under 200 lines** (per user preference)
- **Minimal** - Essential info only
- **Actionable** - Include usage examples
- **Maintainable** - Easy to update


