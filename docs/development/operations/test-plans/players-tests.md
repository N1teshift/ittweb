# Players Tests

This document outlines all tests needed for the players module including services, API routes, components, hooks, and player system logic.

## Player Service

### `src/features/modules/players/lib/playerService.ts`

- [ ] Test `normalizePlayerName` lowercases and trims
  - **What**: Verify player names are normalized to lowercase and trimmed
  - **Expected**: Names converted to lowercase, whitespace removed
  - **Edge cases**: All caps, mixed case, leading/trailing spaces, multiple spaces

- [ ] Test `normalizePlayerName` handles special characters
  - **What**: Verify special characters in names are handled
  - **Expected**: Special characters preserved or normalized appropriately
  - **Edge cases**: Unicode, emoji, symbols, control characters

- [ ] Test `getPlayerStats` retrieves player statistics
  - **What**: Verify player statistics are retrieved from Firestore
  - **Expected**: Returns player stats object with wins, losses, ELO, etc.
  - **Edge cases**: New player (no stats), missing fields, very large stats

- [ ] Test `getPlayerStats` returns empty stats for new player
  - **What**: Verify new players get default/empty stats
  - **Expected**: Returns stats object with zeros/defaults
  - **Edge cases**: Player document doesn't exist, partial stats

- [ ] Test `updatePlayerStats` calculates statistics correctly
  - **What**: Verify stats are calculated and updated correctly
  - **Expected**: Win/loss counts, ELO, win rate calculated accurately
  - **Edge cases**: First game, many games, stat aggregation errors

- [ ] Test `updatePlayerStats` handles win/loss/draw
  - **What**: Verify different game outcomes update stats correctly
  - **Expected**: Wins increment win count, losses increment loss count, draws handled
  - **Edge cases**: Multiple outcomes, concurrent updates, missing outcome data

- [ ] Test `updatePlayerStats` updates ELO scores
  - **What**: Verify ELO is updated in player stats
  - **Expected**: Current ELO and peak ELO updated correctly
  - **Edge cases**: ELO decreases, ELO increases, peak ELO tracking

- [ ] Test `updatePlayerStats` updates category-based stats
  - **What**: Verify category-specific statistics are updated
  - **Expected**: Stats per category (1v1, 2v2, etc.) updated correctly
  - **Edge cases**: Multiple categories, unknown categories, category transitions

- [ ] Test `searchPlayers` searches by name
  - **What**: Verify player search by name works
  - **Expected**: Returns players matching search query
  - **Edge cases**: Partial matches, no matches, many matches

- [ ] Test `searchPlayers` handles case-insensitive search
  - **What**: Verify search is case-insensitive
  - **Expected**: Matches found regardless of case
  - **Edge cases**: Mixed case queries, all caps, all lowercase

- [ ] Test player comparison logic
  - **What**: Verify player comparison functionality
  - **Expected**: Players compared by stats, returns comparison data
  - **Edge cases**: Same stats, very different stats, missing stats

- [ ] Test peak ELO tracking
  - **What**: Verify peak ELO is tracked and updated
  - **Expected**: Peak ELO updated when current ELO exceeds it
  - **Edge cases**: First game, ELO decreases, equal ELOs

## Players API Routes

### `src/pages/api/players/index.ts`

- [ ] Test GET returns list of players
  - **What**: Verify GET endpoint returns player list
  - **Expected**: Returns 200 with array of player objects
  - **Edge cases**: Empty list, large datasets, permission errors

- [ ] Test GET with pagination
  - **What**: Verify pagination works correctly
  - **Expected**: Returns paginated results with page info
  - **Edge cases**: First page, last page, invalid page numbers

- [ ] Test GET with sorting
  - **What**: Verify sorting options work
  - **Expected**: Players sorted by specified field (ELO, name, etc.)
  - **Edge cases**: Invalid sort fields, descending/ascending, ties

### `src/pages/api/players/[name].ts`

- [ ] Test GET returns player by name
  - **What**: Verify player is retrieved by normalized name
  - **Expected**: Returns 200 with player data
  - **Edge cases**: Case variations, special characters, name normalization

- [ ] Test GET returns 404 for non-existent player
  - **What**: Verify missing player returns 404
  - **Expected**: Returns 404 Not Found
  - **Edge cases**: Similar names, deleted players, invalid name format

- [ ] Test name normalization
  - **What**: Verify player name is normalized in lookup
  - **Expected**: Name normalized before query (lowercase, trimmed)
  - **Edge cases**: Case variations, whitespace, special characters

### `src/pages/api/players/search.ts`

- [ ] Test GET searches players by name
  - **What**: Verify search endpoint returns matching players
  - **Expected**: Returns players matching search query
  - **Edge cases**: Partial matches, no matches, many matches

- [ ] Test GET with query parameter
  - **What**: Verify query parameter is used for search
  - **Expected**: Search uses query parameter correctly
  - **Edge cases**: Missing query, empty query, special characters in query

- [ ] Test case-insensitive search
  - **What**: Verify search ignores case
  - **Expected**: Matches found regardless of query case
  - **Edge cases**: Mixed case queries, all caps, all lowercase

- [ ] Test empty query handling
  - **What**: Verify empty query is handled
  - **Expected**: Returns empty array or all players, doesn't error
  - **Edge cases**: Whitespace-only query, null query, undefined query

### `src/pages/api/players/compare.ts`

- [ ] Test GET compares multiple players
  - **What**: Verify comparison endpoint works with multiple players
  - **Expected**: Returns comparison data for all specified players
  - **Edge cases**: Many players, missing players, duplicate players

- [ ] Test GET with player names query
  - **What**: Verify player names are parsed from query
  - **Expected**: Multiple names parsed and used for comparison
  - **Edge cases**: Single player, many players, invalid names

- [ ] Test comparison data structure
  - **What**: Verify comparison returns correct data structure
  - **Expected**: Returns structured comparison with stats for each player
  - **Edge cases**: Missing stats, different stat categories, formatting

## Player Components

### `src/features/modules/players/components/PlayersPage.tsx`

- [ ] Test renders player list
  - **What**: Verify players are rendered in list format
  - **Expected**: All players displayed with correct information
  - **Edge cases**: Empty list, large lists, malformed player data

- [ ] Test handles search
  - **What**: Verify search functionality works
  - **Expected**: Players filtered based on search input
  - **Edge cases**: No matches, many matches, rapid typing

- [ ] Test handles pagination
  - **What**: Verify pagination controls work
  - **Expected**: Players paginated, navigation works
  - **Edge cases**: First/last page, page size changes, rapid navigation

- [ ] Test handles loading state
  - **What**: Verify loading indicator shown while fetching
  - **Expected**: Loading spinner/skeleton shown during fetch
  - **Edge cases**: Slow network, timeout, rapid mount/unmount

### `src/features/modules/players/components/PlayerProfile.tsx`

- [ ] Test renders player statistics
  - **What**: Verify player stats are displayed correctly
  - **Expected**: All stats (wins, losses, ELO, etc.) rendered
  - **Edge cases**: Missing stats, zero values, very large numbers

- [ ] Test renders game history
  - **What**: Verify game history is displayed
  - **Expected**: List of games with details rendered
  - **Edge cases**: Many games, no games, paginated history

- [ ] Test renders ELO chart
  - **What**: Verify ELO history chart is displayed
  - **Expected**: Chart rendered with ELO data over time
  - **Edge cases**: No ELO history, single data point, many data points

- [ ] Test handles non-existent player
  - **What**: Verify 404 state is handled
  - **Expected**: Shows error message or redirects
  - **Edge cases**: Deleted player, invalid name, loading to 404 transition

### `src/features/modules/players/components/PlayerComparison.tsx`

- [ ] Test compares multiple players
  - **What**: Verify multiple players are compared
  - **Expected**: Comparison table/data displayed for all players
  - **Edge cases**: Many players, missing players, duplicate players

- [ ] Test renders comparison table
  - **What**: Verify comparison table is rendered correctly
  - **Expected**: Table shows stats side-by-side for each player
  - **Edge cases**: Many stats, missing stats, formatting differences

- [ ] Test handles different stat categories
  - **What**: Verify different stat types are compared
  - **Expected**: All stat categories included in comparison
  - **Edge cases**: Missing categories, category-specific stats, aggregated stats

## Player Hooks

### `src/features/modules/players/hooks/usePlayerStats.ts`

- [ ] Test fetches player statistics
  - **What**: Verify player stats are fetched when hook mounts
  - **Expected**: Stats fetched and available in state
  - **Edge cases**: Network errors, missing player, slow responses

- [ ] Test handles loading state
  - **What**: Verify loading state is managed
  - **Expected**: Loading true during fetch, false after
  - **Edge cases**: Multiple rapid fetches, timeout, cancellation

- [ ] Test handles error state
  - **What**: Verify errors are captured and exposed
  - **Expected**: Error state set on failure, error message available
  - **Edge cases**: Network errors, 404 errors, permission errors

- [ ] Test handles non-existent player
  - **What**: Verify 404 handling
  - **Expected**: Error state set or null returned
  - **Edge cases**: Deleted player, invalid name, loading to 404 transition

## Player System Tests

### Player Name Normalization

- [ ] Test case-insensitive normalization
  - **What**: Verify names are normalized to same case
  - **Expected**: "Player" and "player" normalize to same value
  - **Edge cases**: Mixed case, all caps, all lowercase, unicode case

- [ ] Test trims whitespace
  - **What**: Verify leading/trailing whitespace is removed
  - **Expected**: " Player " becomes "player"
  - **Edge cases**: Multiple spaces, tabs, newlines, unicode whitespace

- [ ] Test handles special characters
  - **What**: Verify special characters are handled appropriately
  - **Expected**: Special characters preserved or normalized
  - **Edge cases**: Unicode, emoji, symbols, control characters

- [ ] Test handles unicode characters
  - **What**: Verify unicode characters in names are handled
  - **Expected**: Unicode characters preserved correctly
  - **Edge cases**: Emoji, accented characters, CJK characters, RTL text

### Player Statistics

- [ ] Test win rate calculation
  - **What**: Verify win rate is calculated correctly
  - **Expected**: Win rate = wins / (wins + losses) as percentage
  - **Edge cases**: Zero games, only wins, only losses, division by zero

- [ ] Test loss rate calculation
  - **What**: Verify loss rate is calculated correctly
  - **Expected**: Loss rate = losses / (wins + losses) as percentage
  - **Edge cases**: Zero games, only wins, only losses

- [ ] Test total games count
  - **What**: Verify total games count is accurate
  - **Expected**: Total = wins + losses + draws
  - **Edge cases**: Zero games, only one type of outcome, very large numbers

- [ ] Test category-based statistics
  - **What**: Verify statistics are tracked per category
  - **Expected**: Separate stats for each category (1v1, 2v2, etc.)
  - **Edge cases**: Multiple categories, unknown categories, category transitions

- [ ] Test peak ELO tracking
  - **What**: Verify peak ELO is tracked correctly
  - **Expected**: Peak ELO updated when current exceeds it, never decreases
  - **Edge cases**: First game, ELO decreases, equal ELOs, concurrent updates

- [ ] Test ELO history
  - **What**: Verify ELO history is maintained
  - **Expected**: Historical ELO values stored and retrievable
  - **Edge cases**: Many games, missing history, history cleanup

- [ ] Test statistics aggregation across games
  - **What**: Verify stats are aggregated correctly from multiple games
  - **Expected**: Totals and averages calculated correctly
  - **Edge cases**: Many games, concurrent updates, missing game data

