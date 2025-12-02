# Game Stats Delivery Plan

> Status: Execution guide · Maintainer: Delivery Team · Last reviewed: 2025-12-02

## Phase Roadmap
| Phase | Days | Focus | Exit Criteria |
| --- | --- | --- | --- |
| 0 | 1-2 | Directory structure, types, indexes, deps | Modules scaffolded, rules + indexes deployed |
| 1 | 3-5 | Core services (games, ELO, players) + APIs | CRUD endpoints green, unit tests for ELO + normalization |
| 2 | 3-4 | Games UI (list/detail, creation form, hooks) | `/games` + `/games/[id]` live with loading/error states |
| 3 | 4-5 | Player profiles + search | `/players` + `/players/[name]` fully functional |
| 4 | 2-3 | Leaderboards | `/standings` shipped with pagination + thresholds |
| 5 | 3-4 | Advanced filters + query builder | Filter panel synced to URL, queries covered by tests |
| 6 | 4-5 | Analytics & charts | Activity/ELO/win-rate/class charts integrated and memoized |
| 7 | 2-3 | Player comparison | Comparison page + head-to-head APIs |
| 8 | 3-4 | Class statistics | `/classes` surfaces + integration links |
| 9 | 2-3 | Polish, perf, docs, E2E | Performance targets met, docs + release checklist complete |

**Optimistic:** ~27 days. **Realistic:** 7-8 weeks with review + hardening buffers.

## Testing Strategy
- **Unit:** ELO math, name normalization, query builders, filter utilities.
- **Integration:** Game creation/update/delete, player stat refresh, filter permutations.
- **E2E:** Game submission → list/detail, player search/profile, leaderboard drill-down, comparison flows.
- **Performance:** 1k+ games, complex filters, chart rendering in low-end devices.
- **Tooling:** Reuse existing Playwright/Cypress harness and logger assertions.

## Data Migration Path
1. **Manual entry (Phase 1):** Seed curated games to validate UX + ELO.
2. **Import script:** Map `twgb-website` exports to Firestore, replaying through `eloCalculator.updateEloScores`.
3. **Replay parser (future):** Automate ingestion once parser MVP is ready; treat as a separate project.

## Risks & Mitigations
| Risk | Impact | Mitigation |
| --- | --- | --- |
| ELO calculation errors | High | Unit tests, sample verification vs twgb data, rollback + recalc tooling |
| Firestore costs/perf | High | Proper indexes, pagination, caching/lazy loading, billing alerts |
| Data integrity | High | Strict validation, transactional updates, audit logging |
| Player name variance | Medium | Normalization + aliases, admin merge tooling |

## Success Metrics
- Functional: games recorded & visible, ELO accurate, filters + charts behave as spec.
- Performance: `/games` < 2s, `/players/[name]` < 3s, leaderboards < 2s, charts < 1s render time.
- User value: players find their data, comparisons make sense, admins can correct mistakes fast.

## Timeline & Release Strategy
1. Ship **MVP (Phases 0-4)** to internal testers → validate core UX and ELO trust.
2. Enable **Enhanced (5-7)** capabilities once analytics + filters pass design review.
3. Finish **Complete (8-9)** work, run regression + load tests, then announce via Blog/Product docs.
4. Post-launch, monitor metrics (Firestore spend, latency, error rates) and plan replay automation separately.
