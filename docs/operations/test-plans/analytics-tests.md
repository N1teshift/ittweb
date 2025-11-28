# Analytics Tests

This document outlines all tests needed for the analytics module including service, API routes, and components.

## Analytics Service

### `src/features/modules/analytics/lib/analyticsService.ts`

- [ ] Test activity calculation
  - **What**: Verify game activity is calculated correctly
  - **Expected**: Activity aggregated by time period (day/week/month)
  - **Edge cases**: No games, many games, timezone boundaries

- [ ] Test ELO history aggregation
  - **What**: Verify ELO history is aggregated correctly
  - **Expected**: ELO changes aggregated over time periods
  - **Edge cases**: No ELO changes, many changes, missing data

- [ ] Test win rate calculation per category
  - **What**: Verify win rates calculated for each category
  - **Expected**: Win rates calculated separately for each category
  - **Edge cases**: No games in category, all wins, all losses

- [ ] Test class selection statistics
  - **What**: Verify class selection stats are calculated
  - **Expected**: Class selection frequency and win rates calculated
  - **Edge cases**: No class data, many classes, missing classes

- [ ] Test game length statistics
  - **What**: Verify game length distribution is calculated
  - **Expected**: Game lengths aggregated into distribution
  - **Edge cases**: Very short games, very long games, missing durations

- [ ] Test player activity statistics
  - **What**: Verify player activity is tracked
  - **Expected**: Player participation tracked over time
  - **Edge cases**: Inactive players, very active players, missing players

- [ ] Test date range filtering
  - **What**: Verify date range filters work
  - **Expected**: Analytics filtered by date range correctly
  - **Edge cases**: Invalid ranges, future dates, very old dates

- [ ] Test category filtering
  - **What**: Verify category filters work
  - **Expected**: Analytics filtered by category correctly
  - **Edge cases**: Invalid categories, multiple categories, no matches

## Analytics API Routes

### `src/pages/api/analytics/activity.ts`

- [ ] Test GET returns activity data
  - **What**: Verify activity endpoint returns data
  - **Expected**: Returns 200 with activity data
  - **Edge cases**: No activity, large datasets, date ranges

- [ ] Test GET with date range
  - **What**: Verify date range filtering works
  - **Expected**: Activity filtered by date range
  - **Edge cases**: Invalid ranges, no matches, boundary dates

- [ ] Test data aggregation
  - **What**: Verify data is aggregated correctly
  - **Expected**: Activity aggregated by time period
  - **Edge cases**: Different time periods, timezone issues, missing data

### `src/pages/api/analytics/elo-history.ts`

- [ ] Test GET returns ELO history
  - **What**: Verify ELO history endpoint returns data
  - **Expected**: Returns 200 with ELO history data
  - **Edge cases**: No history, many data points, missing data

- [ ] Test GET with player filter
  - **What**: Verify player filtering works
  - **Expected**: ELO history filtered by player
  - **Edge cases**: Invalid player, missing player, many players

- [ ] Test GET with category filter
  - **What**: Verify category filtering works
  - **Expected**: ELO history filtered by category
  - **Edge cases**: Invalid category, no matches, multiple categories

### `src/pages/api/analytics/meta.ts`

- [ ] Test GET returns meta statistics
  - **What**: Verify meta endpoint returns statistics
  - **Expected**: Returns 200 with meta statistics
  - **Edge cases**: No data, large datasets, missing fields

- [ ] Test data aggregation
  - **What**: Verify meta data is aggregated correctly
  - **Expected**: Statistics aggregated from all games
  - **Edge cases**: Empty database, many games, missing data

### `src/pages/api/analytics/win-rate.ts`

- [ ] Test GET returns win rate data
  - **What**: Verify win rate endpoint returns data
  - **Expected**: Returns 200 with win rate data
  - **Edge cases**: No games, many games, missing data

- [ ] Test GET with filters
  - **What**: Verify filtering works
  - **Expected**: Win rates filtered by provided criteria
  - **Edge cases**: Invalid filters, no matches, multiple filters

## Analytics Components

### `src/features/modules/analytics/components/ActivityChart.tsx`

- [ ] Test renders chart
  - **What**: Verify activity chart is rendered
  - **Expected**: Chart displayed with activity data
  - **Edge cases**: No data, many data points, chart library errors

- [ ] Test handles empty data
  - **What**: Verify empty data handling
  - **Expected**: Chart handles empty data gracefully
  - **Edge cases**: Null data, empty array, missing data

- [ ] Test handles date range
  - **What**: Verify date range affects chart
  - **Expected**: Chart updates when date range changes
  - **Edge cases**: Invalid ranges, rapid changes, timezone issues

### `src/features/modules/analytics/components/EloChart.tsx`

- [ ] Test renders ELO history chart
  - **What**: Verify ELO chart is rendered
  - **Expected**: Chart displayed with ELO history
  - **Edge cases**: No history, many data points, missing data

- [ ] Test handles multiple players
  - **What**: Verify multiple player lines work
  - **Expected**: Multiple player ELO lines displayed
  - **Edge cases**: Many players, overlapping lines, missing players

### `src/features/modules/analytics/components/WinRateChart.tsx`

- [ ] Test renders win rate pie chart
  - **What**: Verify win rate chart is rendered
  - **Expected**: Pie chart displayed with win rate data
  - **Edge cases**: No data, equal rates, missing categories

- [ ] Test calculates percentages
  - **What**: Verify percentage calculation
  - **Expected**: Percentages calculated and displayed correctly
  - **Edge cases**: Zero wins, all wins, rounding issues

### `src/features/modules/analytics/components/ClassSelectionChart.tsx`

- [ ] Test renders class selection data
  - **What**: Verify class selection chart is rendered
  - **Expected**: Chart displayed with class selection data
  - **Edge cases**: No data, many classes, missing classes

- [ ] Test handles empty data
  - **What**: Verify empty data handling
  - **Expected**: Chart handles empty data gracefully
  - **Edge cases**: Null data, empty array, missing data

### `src/features/modules/analytics/components/GameLengthChart.tsx`

- [ ] Test renders game length distribution
  - **What**: Verify game length chart is rendered
  - **Expected**: Chart displayed with game length distribution
  - **Edge cases**: No data, very varied lengths, missing durations

- [ ] Test handles time formatting
  - **What**: Verify time formatting works
  - **Expected**: Times formatted correctly (minutes, hours)
  - **Edge cases**: Very short games, very long games, formatting edge cases

### `src/features/modules/analytics/components/PlayerActivityChart.tsx`

- [ ] Test renders player activity over time
  - **What**: Verify player activity chart is rendered
  - **Expected**: Chart displayed with player activity over time
  - **Edge cases**: No activity, many players, missing data

- [ ] Test handles multiple players
  - **What**: Verify multiple players displayed
  - **Expected**: Multiple player activity lines displayed
  - **Edge cases**: Many players, overlapping activity, missing players

### `src/features/modules/analytics/components/ClassWinRateChart.tsx`

- [ ] Test renders class win rates
  - **What**: Verify class win rate chart is rendered
  - **Expected**: Chart displayed with class win rates
  - **Edge cases**: No data, many classes, missing classes

- [ ] Test compares classes
  - **What**: Verify class comparison works
  - **Expected**: Classes compared side-by-side
  - **Edge cases**: Equal rates, missing classes, many classes

