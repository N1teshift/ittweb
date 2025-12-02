# Game Stats Implementation Plan

> Status: In flight · Owner: Systems Guild · Last reviewed: 2025-12-02

## Purpose
This condensed plan explains why the Game Stats system exists, what "done" looks like, and where to find the living specs that replaced the former 1,300-line document. Use it as the landing page before diving into the focused references listed below.

## Scope Snapshot
- **Primary goals:** Track every Island Troll Tribes game, calculate & surface ELO, expose rich player stats, and integrate seamlessly with existing ittweb modules.
- **Out of scope for MVP:** Replay parsing, real-time submissions, automated result ingestion, and historical imports (see delivery plan for sequencing).
- **Success criteria:** Accurate ELO, trustworthy player/leaderboard views, filterable data that loads in <3s, and charts that render smoothly on mid-tier devices.

## Deliverable Tiers
**MVP (Phases 0-4)**
- Firestore schema + services for games, players, standings
- CRUD + list/detail UI for games and players
- Leaderboards with minimum games threshold and pagination

**Enhanced (Phases 5-7)**
- Advanced filtering (date, category, ally/enemy, team format)
- Analytics surfaces (activity, ELO, win-rate charts)
- Player comparison flows with head-to-head insights

**Complete (Phases 8-9)**
- Class statistics & detail pages
- Performance tuning, UX polish, documentation, and release hardening

## Document Map
| Topic | Purpose | Location |
| --- | --- | --- |
| Technical Architecture | Stack, module layout, shared services, integration points | [`technical-architecture.md`](./technical-architecture.md) |
| Data Model | Firestore collections, indexes, and security posture | [`data-model.md`](./data-model.md) |
| Feature Specification | User-facing capabilities, APIs, and UI components | [`feature-spec.md`](./feature-spec.md) |
| Delivery Plan | Phases, testing, migration, risks, metrics, timeline | [`delivery-plan.md`](./delivery-plan.md) |
| Legacy Full Plan | Archived reference of the original detailed document | [`../../archive/systems/game-stats/implementation-plan-legacy.md`](../../archive/systems/game-stats/implementation-plan-legacy.md) |

## Key Decisions & Principles
1. **Feature-first structure:** Keep business logic inside `src/features/modules/**` services and share primitives through infrastructure packages.
2. **Type-safe data flow:** Zod validation in API routes plus end-to-end TypeScript models guard every write before it reaches Firestore.
3. **Deterministic ELO:** Centralized calculators handle both live updates and replayed corrections; recalculation tooling is mandatory before launch.
4. **Audit-ready logging:** All APIs must use the `loggerUtils.ts` helpers so operational metrics stay consistent with the rest of ittweb.

## Execution Snapshot
- The optimistic plan is ~27 days (Phases 0-9) with a buffered 7-8 week realistic window; see the delivery plan for per-phase sequencing.
- Dependencies (`recharts`, `date-fns`, `react-datepicker`, `zod`) are already vetted; no additional runtime services are required beyond Firestore + Firebase Storage.
- Integration hooks exist for Scheduled Games, Guides/Classes, User profiles, and the Blog—treat them as acceptance criteria once MVP is stable.

## Risks at a Glance
- **ELO drift:** Mitigated via exhaustive unit tests plus the recalculation workflow (delivery plan §Risks).
- **Firestore spend:** Index discipline, pagination, and caching targets keep read/write limits predictable.
- **Name variance:** Normalization + planned alias management prevent duplicate player records.

## Immediate Next Steps
1. Confirm MVP scope and staffing for Phases 0-4.
2. Align design reviews with the feature spec (especially charts & comparison flows).
3. Schedule service and UI test coverage milestones alongside each phase exit.
4. Use the delivery plan checklist before calling the rollout "done".
