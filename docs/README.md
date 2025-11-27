# Documentation Index

Use this index to jump to the latest, audience-focused docs.

## Product & Delivery (`docs/product/`)
- `summary.md` – showcase of shipped features (great for stakeholders/recruiters) plus the `/meta` analytics overview.
- `status.md` – current roadmap + remaining phases.
- `improvements.md` – infra/DX upgrades you ported in.
- `user-roles.md` – who’s involved and what they can access.

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

## Supporting References
- `../scripts/README.md` – canonical instructions for regenerating data/icon maps (all commands are `node scripts/data/*.mjs`).
- `../scripts/data/REFACTORING_PLAN.md` – status + backlog for the pipeline scripts.
- `src/features/...` – feature-specific design notes live next to the code.

_Tip: start with `product/` when you want to impress someone, drop into `operations/` when you need to run/test, and browse `systems/` when you or an AI agent needs the full picture._

