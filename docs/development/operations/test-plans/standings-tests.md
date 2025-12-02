# Standings Tests

This document outlines all tests needed for the standings module including service, API routes, hooks, and components.

## Standings Service

### `src/features/modules/standings/lib/standingsService.ts`

- [ ] Test ranks players by score (ELO) descending
  - **What**: Verify players are sorted by ELO in descending order
  - **Expected**: Highest ELO players first, lowest last
  - **Edge cases**: Equal ELOs, missing ELOs, negative ELOs

- [ ] Test applies tie-breakers by win rate, then wins when scores are equal
  - **What**: Verify tie-breaking logic works
  - **Expected**: When ELOs equal, sorted by win rate, then by wins
  - **Edge cases**: All equal, missing stats, zero games

- [ ] Test calculates win rate percentage to two decimals
  - **What**: Verify win rate calculation and formatting
  - **Expected**: Win rate calculated as (wins / total games) * 100, rounded to 2 decimals
  - **Edge cases**: Zero games, all wins, all losses, division by zero

- [ ] Test assigns sequential ranks after sorting
  - **What**: Verify rank assignment works
  - **Expected**: Ranks assigned sequentially (1, 2, 3...) after sorting
  - **Edge cases**: Ties, many players, missing players

- [ ] Test enforces the default minimum games threshold (10)
  - **What**: Verify default minimum games filter
  - **Expected**: Only players with at least 10 games included
  - **Edge cases**: Exactly 10 games, 9 games, many games

- [ ] Test respects custom `minGames` filter values
  - **What**: Verify custom minimum games threshold works
  - **Expected**: Custom threshold applied correctly
  - **Edge cases**: Zero threshold, very high threshold, invalid threshold

- [ ] Test excludes players missing stats for the requested category
  - **What**: Verify category filtering works
  - **Expected**: Players without stats for category excluded
  - **Edge cases**: All players missing, some missing, category transitions

- [ ] Test falls back to player ID when name is missing
  - **What**: Verify fallback for missing names
  - **Expected**: Player ID used when name is missing
  - **Edge cases**: All players missing names, partial names, invalid IDs

- [ ] Test category-based leaderboards return distinct results per category
  - **What**: Verify category filtering produces distinct results
  - **Expected**: Different categories return different leaderboards
  - **Edge cases**: Overlapping categories, empty categories, invalid categories

- [ ] Test paginates correctly for the first page
  - **What**: Verify first page pagination
  - **Expected**: First page returns correct number of results
  - **Edge cases**: Fewer results than page size, exactly page size, empty results

- [ ] Test paginates correctly for middle/end pages
  - **What**: Verify middle and last page pagination
  - **Expected**: Middle and last pages return correct results
  - **Edge cases**: Last page with partial results, page beyond available data

- [ ] Test returns accurate `total` counts irrespective of pagination
  - **What**: Verify total count accuracy
  - **Expected**: Total count reflects all matching players, not just current page
  - **Edge cases**: Large totals, zero totals, filtered totals

- [ ] Test sets `hasMore` true/false based on remaining records
  - **What**: Verify hasMore flag accuracy
  - **Expected**: hasMore true when more pages exist, false on last page
  - **Edge cases**: Exactly one page, many pages, no results

- [ ] Test server-side execution uses Firebase Admin when `isServerSide` is true
  - **What**: Verify server-side SDK usage
  - **Expected**: Admin SDK used on server
  - **Edge cases**: SDK initialization, permission differences, error handling

- [ ] Test client-side execution uses Firebase client when `isServerSide` is false
  - **What**: Verify client-side SDK usage
  - **Expected**: Client SDK used in browser
  - **Edge cases**: SDK initialization, offline mode, error handling

- [ ] Test standings fetch logs errors and rethrows for calling code to handle
  - **What**: Verify error handling and logging
  - **Expected**: Errors logged and rethrown for caller to handle
  - **Edge cases**: Network errors, permission errors, query errors

## Standings API Route

### `pages/api/standings/index.ts`

- [ ] Test accepts default filters when no query params provided
  - **What**: Verify default filter behavior
  - **Expected**: Default filters applied when no query params
  - **Edge cases**: Empty query, undefined params, null params

- [ ] Test forwards category/minGames/page/limit query params to the service
  - **What**: Verify query parameter forwarding
  - **Expected**: All query params forwarded to service correctly
  - **Edge cases**: Invalid params, missing params, extra params

- [ ] Test returns 200 with payload shape `{ standings, total, page, hasMore }`
  - **What**: Verify response format
  - **Expected**: Returns 200 with correct payload structure
  - **Edge cases**: Empty standings, large payloads, missing fields

- [ ] Test returns appropriate error status when the service throws
  - **What**: Verify error handling
  - **Expected**: Appropriate status codes returned for different errors
  - **Edge cases**: Network errors, validation errors, server errors

## Standings Hooks

### `src/features/modules/standings/hooks/useStandings.ts`

- [ ] Test sets loading state during fetch
  - **What**: Verify loading state management
  - **Expected**: Loading true during fetch, false after
  - **Edge cases**: Rapid fetches, timeout, cancellation

- [ ] Test handles successful responses and stores standings data
  - **What**: Verify success handling
  - **Expected**: Standings data stored in state on success
  - **Edge cases**: Empty results, large datasets, malformed data

- [ ] Test surfaces fetch errors and resets loading state
  - **What**: Verify error handling
  - **Expected**: Errors exposed in state, loading reset on error
  - **Edge cases**: Network errors, validation errors, timeout

## Standings Components

### `src/features/modules/standings/components/Leaderboard.tsx`

- [ ] Test renders loading, empty, error, and populated states
  - **What**: Verify all component states render correctly
  - **Expected**: Loading, empty, error, and populated states all render appropriately
  - **Edge cases**: State transitions, rapid state changes, edge state combinations

- [ ] Test displays rank, name, score, wins, losses, win rate, and games for each entry
  - **What**: Verify all data fields are displayed
  - **Expected**: All required fields shown for each player
  - **Edge cases**: Missing data, very long names, zero values

### `src/features/modules/standings/components/CategorySelector.tsx`

- [ ] Test renders category options and triggers filter updates
  - **What**: Verify category selector functionality
  - **Expected**: Categories rendered, selection triggers filter update
  - **Edge cases**: No categories, many categories, invalid selection

