# Data Generation Scripts – Refactoring Status

_Last updated: 2025-11-27_

This document now combines the original refactoring plan with the optimization summary so there is a single source of truth for what has been completed and what remains.

## Snapshot

- Goal: keep the four-step pipeline easy to maintain, consistent, and fast to run.
- Scope: files under `scripts/data/` plus the shared `utils.mjs`.
- Approach: finish the high-priority cleanup already mapped out, then tackle deeper structural work only if it becomes a bottleneck.

## ✅ Completed Improvements

### Shared Utilities (utils.mjs)
- Consolidated `slugify`, `loadJson`, `writeJson`, `stripColorCodes`, `escapeString`, `convertIconPath`, `getField`, `getFieldFlexible`, `getRootDir`.
- Eliminated ~150 lines of duplication across the pipeline.
- Result: common behavior lives in one place; fixes propagate everywhere instantly.

### `extract-metadata.mjs`
- Imports all helpers from `utils.mjs`.
- Removed placeholder functions (`extractRecipesFromJASS`, `extractRecipesFromItems`) and unused logic.
- Simplified field extraction and error handling; file reduced to ~250 lines.

### `extract-from-w3x.mjs`
- Removed unused `MAP_FILE` constant and cleaned imports/order.
- Prepares the file for the next round of validations without altering behavior.

## 🎯 Active Priorities

| Priority | Item | Notes |
| --- | --- | --- |
| High | Finish integrating shared utilities | `regenerate-iconmap.mjs`, `convert-extracted-to-typescript.mjs`, and orchestrator helpers still re-declare simple functions. |
| High | Remove unused/placeholder code | Audit remaining TODOs (especially in converters) and drop dead branches. |
| Medium | Standardize error handling | Adopt a single pattern (throw with context + fail-fast logging) across all scripts. |
| Medium | Input validation | After each JSON load, validate the expected shape (arrays with ids, etc.) to catch corrupt data early. |
| Low | Performance optimizations | Batch file reads and cache heavy regex only if generation time becomes an issue. |
| Low | Split massive files | `convert-extracted-to-typescript.mjs` is still long; consider extracting domain-specific modules if edits remain painful. |

## File-by-File Checklist

- `utils.mjs` – ✅ baseline in place; add helpers only when multiple scripts need them.
- `extract-metadata.mjs` – ✅ refactored (keep regression tests handy).
- `extract-from-w3x.mjs` – ✅ unused code removed; next step is validation/error pass.
- `regenerate-iconmap.mjs` – ⏳ move string helpers + path handling to utils; add validation for missing icons.
- `convert-extracted-to-typescript.mjs` – ⏳ biggest refactor target; start by importing helpers, then evaluate splitting.
- `generate-from-work.mjs` – ⏳ ensure consistent error bubbling/logging once downstream scripts are updated.

## Implementation Guidelines

- Stick to ES modules; no CommonJS.
- Keep scripts runnable in isolation (imports must resolve relative to project root via `getRootDir()`).
- Maintain backwards-compatible output formats; downstream TypeScript modules should not need to change.
- After each refactor, re-run `node scripts/data/generate-from-work.mjs` and sanity-check the outputs listed in `scripts/README.md`.

## Related Docs

- Operational guide: `scripts/README.md`.
- Historical analysis + deep-dive notes: `docs/systems/scripts/`.
- Testing references that depend on this pipeline: `docs/operations/quick-start-testing.md`, `docs/operations/testing-guide.md`.

Need to link someone to status? Point them here—this file now replaces the old `OPTIMIZATION_SUMMARY.md`, which is kept only as a pointer.