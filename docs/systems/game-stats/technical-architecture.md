# Game Stats Technical Architecture

> Status: Source of truth · Maintainer: Systems Guild · Last reviewed: 2025-12-02

## Stack Overview
- **Frontend:** Next.js 15, React, TypeScript, Tailwind CSS
- **Backend/API:** Next.js route handlers using Firebase Admin SDK
- **Data:** Firestore (documents + subcollections) and Firebase Storage for future replay uploads
- **Charts:** Recharts (theme pieces live under `infrastructure/charts`)
- **Validation:** Zod schemas co-located with each API route
- **Date/Time:** `date-fns` for deterministic formatting and ranges

## Architecture Principles
1. **Feature-first modules:** Each domain (games, players, standings, analytics, classes) owns its components, hooks, `lib/` services, and types under `src/features/modules/**`.
2. **Thin API layer:** Route handlers parse input, validate with Zod, log via `loggerUtils.ts`, call services, and return typed responses.
3. **Deterministic jobs:** ELO calculations, migrations, and imports run through idempotent utilities so replaying data cannot corrupt Firestore.
4. **Shared primitives:** Filters, chart scaffolding, and Firestore helpers stay in `src/features/modules/shared/` to keep bundles lean.
5. **Observability by default:** Every mutation path emits structured logs with correlation IDs; validation failures never reach Firestore writes.

## Module Layout
```
src/features/modules/
├── games/
│   ├── components/
│   ├── hooks/
│   ├── lib/gameService.ts
│   └── types/
├── players/
├── standings/
├── analytics/
├── classes/
└── shared/
    ├── filters/
    ├── charts/
    ├── utils/eloCalculator.ts
    └── types/
```
- Keep barrel exports minimal; import concrete services for clearer dependency graphs.
- Shared state (e.g., filter context) lives in `shared/` with explicit typing to avoid hidden coupling.

## Cross-Cutting Services
- **`eloCalculator.ts`** – identical math for live updates and recalculations.
- **`playerService.ts` / `standingsService.ts`** – own Firestore queries, pagination, and normalization.
- **`loggerUtils.ts`** – required for every API handler, background job, and migration so diagnostics stay consistent.
- **Auth guard helpers** – admin mutations (create/update/delete game) enforce Discord auth; read endpoints stay public.

## Integration Points
1. **Scheduled Games** – link recorded results back to scheduled slots and mark completion.
2. **Guides / Classes** – surface class stats inside existing guide pages through shared hooks.
3. **User Profiles** – map Discord IDs to claimed player stats in a future release.
4. **Blog & Product Updates** – syndicate leaderboards/tournaments without duplicating logic.

## Dependency Checklist
| Package | Why | Notes |
| --- | --- | --- |
| `recharts` | Activity, ELO, win-rate, and class charts | Memoize props to prevent rerenders |
| `date-fns` | Date math + presets | Centralize helpers for filters + charts |
| `react-datepicker` | Admin creation + filter date pickers | Lazy-load client bundle, align with Tailwind theme |
| `zod` | Validation for APIs/forms | Share schemas between UI + API for type safety |

Keep this file updated whenever you touch architecture decisions; the implementation plan links here as the canonical reference.
