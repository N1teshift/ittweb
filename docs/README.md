# Documentation Index

Use this index to jump to the latest, audience-focused docs.

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
- Module-level READMEs are planned but not yet implemented
- See [Documentation Plan](./DOCUMENTATION_PLAN.md) for status
- Module code is documented inline with TypeScript types and JSDoc comments

## Infrastructure (`src/features/infrastructure/`)
- `README.md` – Core systems (auth, Firebase, logging, API utilities)

## Shared Features (`src/features/shared/`)
- `README.md` – Shared components, hooks, utilities, and services

## Known Issues & Migration Status
- **`KNOWN_ISSUES.md`** – ⚠️ **Track technical debt, migration status, and known issues** - **Start here if you encounter problems or want to understand current technical debt**

## Supporting References
- `../scripts/README.md` – canonical instructions for regenerating data/icon maps (all commands are `node scripts/data/*.mjs`).
- `../scripts/data/REFACTORING_PLAN.md` – status + backlog for the pipeline scripts.
- `../DOCUMENTATION_PLAN.md` – Documentation strategy and templates
- `../DOCUMENTATION_AUDIT.md` – Complete documentation inventory

_Tip: start with `product/` when you want to impress someone, drop into `operations/` when you need to run/test, browse `api/` for API endpoints, check `src/features/modules/` for module docs, and browse `systems/` when you or an AI agent needs the full picture._

