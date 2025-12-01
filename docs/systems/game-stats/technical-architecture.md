# Game Stats Technical Architecture

> Status: Source of truth · Maintainer: Systems Guild · Last reviewed: 2025-12-02

## Stack Overview
- **Frontend:** Next.js 15, React, TypeScript, Tailwind CSS
- **Backend/API:** Next.js route handlers using Firebase Admin SDK
- **Data:** Firestore (documents + subcollections) and Firebase Storage for future replay uploads
- **Charts:** Recharts (standardized theme under infrastructure/charts)
- **Validation:** Zod schemas co-located with each API route
- **Date/Time:** date-fns for deterministic formatting and ranges

## Architecture Principles
1. **Feature-first modules:** Every domain (games, players, standings, analytics, classes) owns its components, hooks, lib/ services, and types under src/features/modules/**.
2. **Thin API layer:** Route handlers only parse input, call services, log via loggerUtils.ts, and return typed responses; all business rules live in services.
3. **Deterministic jobs:** ELO calculations, migrations, and imports run through idempotent utilities so replaying data cannot corrupt Firestore.
4. **Shared primitives:** Filters, chart scaffolding, and Firestore helpers live in src/features/modules/shared/ to keep bundle size low.
5. **Observability by default:** Every mutation path must log success/failure with correlation IDs; Bubble up validation issues before they hit Firestore writes.

## Module Layout
`
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
`
- Keep barrel exports small; import concrete services where used.
- Any shared state (e.g., filter context) belongs in shared/ with explicit typing.

## Cross-Cutting Services
- **eloCalculator.ts**: guarantees identical math for live updates and recalculations.
- **playerService.ts / standingsService.ts**: own Firestore queries, pagination, and normalization rules.
- **loggerUtils.ts**: mandatory for API handlers, background jobs, and migrations (consistent structured logs + error tagging).
- **Auth guard helpers**: only admin routes (create/update/delete game) enforce Discord auth; read endpoints stay public.

## Integration Points
1. **Scheduled Games** – allow admins to link a scheduled slot to the recorded result and mark completion.
2. **Guides / Classes** – expose class-level statistics inside existing guide pages via shared hooks.
3. **User Profiles** – future work can map Discord IDs to player stats when a user claims a profile.
4. **Blog & Product Updates** – highlight tournaments, patch notes, and top players without duplicating logic.

## Dependency Checklist
| Package | Why | Notes |
| --- | --- | --- |
| echarts | Activity, ELO, win-rate, and class charts | Memoize props to avoid rerenders |
| date-fns | Date math + formatting | Centralize presets for filters |
| eact-datepicker | Admin creation + filter date pickers | Lazy-load in client components |
| zod | Validation for APIs and forms | Share schemas between UI + API |

Keep this file updated whenever you touch architecture decisions; the implementation plan links here as the canonical reference.
