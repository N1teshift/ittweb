# Documentation Audit: What Needs Documentation

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

### ⚠️ Partially Documented

1. **Root README** (`README.md`)
   - Basic project info exists
   - Missing: current feature list, architecture overview, API overview

2. **Module Features** (`src/features/modules/`)
   - Code exists but no README files
   - No usage examples
   - No API route references

3. **API Routes** (`src/pages/api/`)
   - Routes exist and work
   - No centralized API documentation
   - Some routes documented in test plans, but not user-friendly

### ❌ Missing Documentation

1. **Module READMEs** (13 modules need docs)
   - `analytics/` - Analytics service and charts
   - `archives/` - Archive management
   - `blog/` - Blog post system
   - `classes/` - Class pages
   - `entries/` - Entry forms
   - `games/` - Game statistics
   - `guides/` - Game guides
   - `map-analyzer/` - Map tools
   - `meta/` - Analytics dashboard
   - `players/` - Player stats
   - `scheduled-games/` - Scheduled games
   - `standings/` - Leaderboards
   - `tools/` - Utility tools

2. **Infrastructure Documentation**
   - `src/features/infrastructure/` - Auth, Firebase, logging, API handlers
   - `src/features/shared/` - Shared components, hooks, utilities

3. **API Reference**
   - Centralized API documentation
   - Request/response examples
   - Authentication requirements

4. **Development Guides**
   - How to add a new feature
   - How to add a new API route
   - How to use shared utilities
   - How to use the logger system

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
- `[id]/index.ts` - Get/update scheduled game
- `[id]/delete.ts` - Delete scheduled game
- `[id]/join.ts` - Join scheduled game
- `[id]/leave.ts` - Leave scheduled game
- `[id]/upload-replay.ts` - Upload replay

**Standings** (`/api/standings/`)
- `index.ts` - Get leaderboard

**User** (`/api/user/`)
- `accept-data-notice.ts` - Accept data notice
- `data-notice-status.ts` - Get data notice status
- `delete.ts` - Delete user account

**Admin** (`/api/admin/`)
- `wipe-test-data.ts` - Wipe test data (admin only)

**Other**
- `revalidate.ts` - Revalidation endpoint

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

### Shared Components

**Components** (`src/features/shared/components/`)
- Layout, Header, Footer
- PageHero
- DataCollectionNotice
- DiscordButton, GitHubButton

**Hooks** (`src/features/shared/hooks/`)
- useFallbackTranslation

**Services** (`src/features/shared/lib/`)
- userDataService
- archiveService
- getStaticProps

**Utils** (`src/features/shared/utils/`)
- loggerUtils (error handling)
- userRoleUtils

## Documentation Gaps

### Critical Gaps (Must Document)
1. Module READMEs - Developers can't understand what each module does
2. API Reference - No way to know what endpoints exist and how to use them
3. Infrastructure docs - Core systems (auth, logging, Firebase) undocumented
4. Shared utilities - No usage examples for common utilities

### Important Gaps (Should Document)
5. Component library - Shared components lack usage docs
6. Development workflow - How to add features/APIs
7. Root README - Outdated, missing current features

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
└── README.md (NEW)

src/features/shared/
└── README.md (NEW)
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

