# Documentation Index

Use this index to jump to the latest, audience-focused docs.

## Current Features

ITT Web is a Next.js application for Island Troll Tribes game statistics, community features, and content management.

### Core Features
- **Game Statistics** - Track games, calculate ELO ratings, manage game history
- **Player Profiles** - Player statistics, ELO tracking, win/loss records, player comparison
- **Leaderboards** - Category-based rankings with minimum games threshold
- **Analytics Dashboard** - Activity charts, ELO history, win rate analysis

### Community Features
- **Scheduled Games** - Schedule upcoming games with timezone support and player signups
- **Archive System** - Manage game replays, clips, and media content
- **Blog System** - Create and manage blog posts with MDX support

### Content & Tools
- **Game Guides** - Static game data (classes, items, abilities, units)
- **Class Information** - Detailed class pages with statistics
- **Map Analyzer** - Map visualization and analysis tools
- **Icon Mapper** - Utility for mapping game icons to entities
- **Entry Forms** - Create archive entries and content

### Technical Features
- **RESTful API** - 13 API namespaces with authentication
- **Firebase Integration** - Firestore database with real-time capabilities
- **Discord OAuth** - Authentication via NextAuth.js
- **Replay Parser** - Parse Warcraft 3 replay files for automatic game data extraction
- **ISR (Incremental Static Regeneration)** - Optimized static page generation

See [Module Documentation](#module-documentation-srcfeaturesmodules) for detailed module information.

## Architecture Overview

ITT Web follows a modular, feature-based architecture:

- **Framework**: Next.js 15.0.3 with React 18
- **Language**: TypeScript (strict mode)
- **Database**: Firebase Firestore
- **Authentication**: NextAuth.js (Discord OAuth)
- **Styling**: Tailwind CSS
- **Architecture Pattern**: Feature modules with service layer, component-based UI

**Key Architectural Principles**:
- Feature-based module organization (`src/features/modules/`)
- Service layer for business logic (`lib/` directories)
- Shared infrastructure (`src/features/infrastructure/`)
- Type-safe API routes with standardized handlers
- Minimal file size (target: under 200 lines per file)

For detailed architecture information, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## API Overview

Complete RESTful API with 13 namespaces:

- **Games** - Game CRUD, ELO calculations, replay uploads
- **Players** - Player profiles, statistics, search, comparison
- **Standings** - Leaderboards and rankings
- **Analytics** - Activity data, ELO history, win rates
- **Archives** - Archive entry management
- **Scheduled Games** - Game scheduling and management
- **Blog** - Blog post CRUD operations
- **Classes** - Class information endpoints
- **Items** - Item data and icon listing
- **User** - User account operations
- **Admin** - Administrative functions
- **Revalidate** - ISR revalidation (internal)

All API endpoints are documented with request/response formats, authentication requirements, and examples. See [API Reference](#api-reference-docsapi) for complete documentation.

## Product & Delivery (`docs/product/`)
- `summary.md` – showcase of shipped features (great for stakeholders/recruiters) plus the `/meta` analytics overview.
- `status.md` – current roadmap + remaining phases.
- `improvements.md` – infra/DX upgrades you ported in.
- `user-roles.md` – who’s involved and what they can access.

## Development (`docs/`)
- `DEVELOPMENT.md` – **How to add features, API routes, and follow project conventions.**
- `ENVIRONMENT_SETUP.md` – **Complete environment setup guide (Firebase, Discord OAuth, etc.).**
- `ARCHITECTURE.md` – **High-level system architecture and design patterns.**
- `TROUBLESHOOTING.md` – **Common issues and solutions.**
- `COMPONENT_LIBRARY.md` – **Shared UI components usage guide.**
- `CODE_COOKBOOK.md` – **Common code patterns and recipes.**
- `CONTRIBUTING.md` – **Development standards and contribution process.**
- `API_CLIENT_USAGE.md` – **How to use APIs from client-side code.**
- `PERFORMANCE.md` – **Performance optimization strategies.**
- `SECURITY.md` – **Security best practices and guidelines.**

## Operations (`docs/operations/`)
- `quick-start-testing.md` – launch the dev server, seed data, smoke-test flows (now points you straight to `/scheduled-games` and `/players`).
- `testing-guide.md` – deeper scenarios + API calls.
- Both docs link back to `scripts/README.md` so you always regenerate data before testing.

## Systems (`docs/systems/`)
- `game-stats/implementation-plan.md` – detailed breakdown of the game stats architecture.
- `replay-parser/` – integration plan + quick start for the parser.
- `scripts/` – icon mapping, extractor guides, plus an `archive/` folder for historical write-ups. All active scripts now live in `scripts/data/`.
- `/meta` (`src/pages/meta.tsx`) – live analytics dashboard backed by `src/features/modules/analytics`.

## Schemas (`docs/schemas/`)
- **`firestore-collections.md`** – **CRITICAL**: Standardized Firestore collection schemas. **ALL code MUST follow these schemas exactly. No backward compatibility or migration code allowed.** This is the single source of truth for all collection field names and structures.

## Archive (`docs/archive/`)
- `phase-0-complete.md` and the TWGB analyses live here once they’re purely historical.
- Use this folder to stash any doc that’s no longer the source of truth.

## API Reference (`docs/api/`)
- `README.md` – API documentation index
- Individual API namespace docs (games, players, archives, etc.)
- Request/response examples and authentication requirements

## Module Documentation (`src/features/modules/`)
- ✅ **All 13 modules have README files** - Complete module documentation
- Each module README includes: purpose, exports, usage examples, API routes
- See [Documentation Status](./DOCUMENTATION_STATUS.md) for complete status

## Infrastructure (`src/features/infrastructure/`)
- `README.md` – Core systems (auth, Firebase, logging, API utilities)

## Shared Features (`src/features/infrastructure/`)
- Shared components, hooks, utilities, and services are consolidated under infrastructure
- See `src/features/infrastructure/README.md` for details

## Known Issues & Migration Status
- **`KNOWN_ISSUES.md`** – ⚠️ **Track technical debt, migration status, and known issues** - **Start here if you encounter problems or want to understand current technical debt**

## Supporting References
- `../scripts/README.md` – canonical instructions for regenerating data/icon maps (all commands are `node scripts/data/*.mjs`).
- `../scripts/data/REFACTORING_PLAN.md` – status + backlog for the pipeline scripts.
- **`DOCUMENTATION_STYLE.md`** – **Single source of truth for documentation preferences and standards**
- `DOCUMENTATION_PLAN.md` – Documentation strategy and templates (reference document, not task list)
- `DOCUMENTATION_AUDIT.md` – Complete documentation inventory (reference document, not task list)

_Tip: start with `product/` when you want to impress someone, drop into `operations/` when you need to run/test, browse `api/` for API endpoints, check `src/features/modules/` for module docs, and browse `systems/` when you need the full picture._

