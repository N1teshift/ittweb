# Game Stats Feature Specification

> Status: Product-ready reference · Maintainer: Systems + Product · Last reviewed: 2025-12-02

## Capability Matrix
| Feature | Surface | Primary APIs | Notes |
| --- | --- | --- | --- |
| Game Management | Admin creation form, `/games`, `/games/[id]` | `POST/GET/PUT/DELETE /api/games` | Normalizes players, calculates ELO, cascades updates |
| Player Statistics | `/players`, `/players/[name]` | `GET /api/players`, `GET /api/players/[name]` | Lifetime + category stats, recent games, charts |
| Player Comparison | `/players/compare` | `GET /api/players/compare` | Head-to-head record, ELO comparison, stat deltas |
| Leaderboards | `/standings`, `/standings/[category]` | `GET /api/standings` | Category selector, min-game threshold, pagination |
| Advanced Filtering | Shared filter panel on `/games` & player timelines | Query params on `GET /api/games` | Date presets, ally/enemy, team format, URL sync |
| Analytics & Charts | Player profile widgets, optional home highlights | `/api/players` (with `includeGames`, `activity` flags) | Activity area chart, ELO line chart, win-rate pie, class stats chart |
| Class Statistics | `/classes`, `/classes/[className]` | `GET /api/classes`, `GET /api/classes/[className]` | Popularity, win rate, top players per class |

## UI Component Checklist
- `GameList`, `GameCard`, `GameDetail` – shared loading/error/empty states.
- `PlayerProfile`, `PlayerStats`, `PlayerCharts`, `PlayerGames` – compose the profile view.
- `Leaderboard` – sortable table with rank, wins/losses, win rate, current ELO.
- `PlayerComparison` – side-by-side metrics plus shared chart legend.
- `ClassOverview` / `ClassDetail` – reuse card layout from guides for consistency.

## Filters & State
- `DateRangeFilter`, `CategoryFilter`, `PlayerFilter`, `TeamFormatFilter`, `GameFilters` container, and `useGameFilters` hook.
- Filters persist via URL query params + `localStorage` so deep links reproduce state.
- Build Firestore queries through `buildGameQuery(filters)` to centralize validation and index usage.

## Analytics Surfaces
- `ActivityChart` (area) – games per day with zoom + brush.
- `EloChart` (line) – multi-player overlay.
- `WinRateChart` (pie) – win/loss/draw distribution.
- `ClassStatsChart` (bar/pie) – frequency + win-rate combos.
- All charts live in `shared/charts/` and are wrapped with `React.memo`.

## Admin & DX Notes
- Creation/update/delete endpoints are admin-only and must log via `loggerUtils.ts`.
- Hooks expose loading + optimistic states so admin flows stay responsive.
- Reference `delivery-plan.md` for the rollout order; each phase adds the components listed here.
