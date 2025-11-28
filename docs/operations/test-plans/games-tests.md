# Games Tests

This document outlines all tests needed for the games module including services, API routes, components, hooks, and game system logic.

## Game Service

### `src/features/modules/games/lib/gameService.ts`

- [ ] Test `getAllGames` retrieves all games
  - **What**: Verify all games are retrieved from Firestore
  - **Expected**: Returns array of all game documents
  - **Edge cases**: Empty collection, very large collection, permission errors

- [ ] Test `getGameById` retrieves game by ID
  - **What**: Verify game is retrieved by its document ID
  - **Expected**: Returns game document matching the ID
  - **Edge cases**: Invalid ID format, malformed document, missing fields

- [ ] Test `getGameById` returns null for non-existent game
  - **What**: Verify non-existent game ID returns null
  - **Expected**: Returns null when game doesn't exist
  - **Edge cases**: Deleted game, invalid ID format, permission denied

- [ ] Test `createGame` creates new game
  - **What**: Verify new game document is created in Firestore
  - **Expected**: Game document created with provided data and generated ID
  - **Edge cases**: Missing required fields, duplicate game, permission errors

- [ ] Test `createGame` validates required fields
  - **What**: Verify required fields are validated before creation
  - **Expected**: Throws error or returns validation failure for missing fields
  - **Edge cases**: Partial data, invalid field types, null values

- [ ] Test `updateGame` updates existing game
  - **What**: Verify game document is updated with new data
  - **Expected**: Game document updated, old data replaced/merged correctly
  - **Edge cases**: Non-existent game, concurrent updates, permission errors

- [ ] Test `updateGame` handles non-existent game
  - **What**: Verify updating non-existent game is handled
  - **Expected**: Returns error or null, doesn't create new document
  - **Edge cases**: Deleted game, invalid ID, race conditions

- [ ] Test `deleteGame` deletes game
  - **What**: Verify game document is deleted from Firestore
  - **Expected**: Game document removed, subcollections handled appropriately
  - **Edge cases**: Non-existent game, permission errors, cascading deletes

- [ ] Test `deleteGame` handles non-existent game
  - **What**: Verify deleting non-existent game is handled gracefully
  - **Expected**: Returns success or appropriate error, doesn't throw
  - **Edge cases**: Already deleted, invalid ID, race conditions

- [ ] Test game player subcollection management
  - **What**: Verify player subcollection operations work correctly
  - **Expected**: Players added/removed from subcollection correctly
  - **Edge cases**: Empty subcollection, duplicate players, large subcollections

- [ ] Test game validation logic
  - **What**: Verify game data validation rules are enforced
  - **Expected**: Invalid games rejected with appropriate error messages
  - **Edge cases**: Edge values, type mismatches, business rule violations

- [ ] Test duplicate game detection
  - **What**: Verify duplicate games are detected and prevented
  - **Expected**: Duplicate games rejected or flagged appropriately
  - **Edge cases**: Similar but not identical games, timing issues

- [ ] Test game filtering by category
  - **What**: Verify games can be filtered by category
  - **Expected**: Returns only games matching specified category
  - **Edge cases**: Invalid category, multiple categories, no matches

- [ ] Test game filtering by date range
  - **What**: Verify games can be filtered by date range
  - **Expected**: Returns games within specified date range
  - **Edge cases**: Invalid date ranges, timezone issues, boundary dates

- [ ] Test game filtering by player
  - **What**: Verify games can be filtered by participating player
  - **Expected**: Returns games where specified player participated
  - **Edge cases**: Player not found, multiple players, case sensitivity

## Games API Routes

### `src/pages/api/games/index.ts`

- [ ] Test GET returns list of games
  - **What**: Verify GET endpoint returns array of games
  - **Expected**: Returns 200 with array of game objects
  - **Edge cases**: Empty list, large datasets, pagination

- [ ] Test GET with query filters (category, date, player)
  - **What**: Verify query parameters filter results correctly
  - **Expected**: Returns filtered games matching query parameters
  - **Edge cases**: Invalid filters, multiple filters, no matches

- [ ] Test POST creates new game
  - **What**: Verify POST endpoint creates new game
  - **Expected**: Returns 201 with created game data
  - **Edge cases**: Missing fields, invalid data, duplicate game

- [ ] Test POST validates request body
  - **What**: Verify request body validation works
  - **Expected**: Invalid bodies return 400 with error message
  - **Edge cases**: Missing required fields, wrong types, extra fields

- [ ] Test POST requires authentication
  - **What**: Verify unauthenticated requests are rejected
  - **Expected**: Returns 401 for unauthenticated requests
  - **Edge cases**: Expired tokens, invalid tokens, missing auth header

- [ ] Test error handling
  - **What**: Verify errors are handled and returned appropriately
  - **Expected**: Errors return appropriate status codes with error messages
  - **Edge cases**: Database errors, validation errors, network errors

### `src/pages/api/games/[id].ts`

- [ ] Test GET returns game by ID
  - **What**: Verify GET endpoint returns single game
  - **Expected**: Returns 200 with game object
  - **Edge cases**: Invalid ID format, missing game

- [ ] Test GET returns 404 for non-existent game
  - **What**: Verify non-existent game returns 404
  - **Expected**: Returns 404 Not Found
  - **Edge cases**: Invalid ID format, deleted game

- [ ] Test PUT updates game
  - **What**: Verify PUT endpoint updates game
  - **Expected**: Returns 200 with updated game data
  - **Edge cases**: Non-existent game, invalid data, permission errors

- [ ] Test PUT validates request body
  - **What**: Verify request body validation
  - **Expected**: Invalid bodies return 400
  - **Edge cases**: Missing fields, wrong types, immutable fields

- [ ] Test PUT requires authentication
  - **What**: Verify authentication requirement
  - **Expected**: Returns 401 for unauthenticated requests
  - **Edge cases**: Expired tokens, insufficient permissions

- [ ] Test DELETE deletes game
  - **What**: Verify DELETE endpoint removes game
  - **Expected**: Returns 200 or 204 on success
  - **Edge cases**: Non-existent game, permission errors, cascading deletes

- [ ] Test DELETE requires authentication
  - **What**: Verify authentication requirement
  - **Expected**: Returns 401 for unauthenticated requests
  - **Edge cases**: Expired tokens, insufficient permissions

## Game Components

### `src/features/modules/games/components/GameList.tsx`

- [ ] Test renders list of games
  - **What**: Verify games are rendered in list format
  - **Expected**: All games displayed with correct information
  - **Edge cases**: Empty list, large lists, malformed game data

- [ ] Test handles empty state
  - **What**: Verify empty state is displayed when no games
  - **Expected**: Shows appropriate empty state message/UI
  - **Edge cases**: Loading to empty transition, filtered empty results

- [ ] Test handles loading state
  - **What**: Verify loading indicator is shown while fetching
  - **Expected**: Loading spinner/skeleton shown during fetch
  - **Edge cases**: Slow network, timeout, rapid mount/unmount

- [ ] Test handles error state
  - **What**: Verify error state is displayed on failure
  - **Expected**: Error message displayed with retry option
  - **Edge cases**: Network errors, permission errors, malformed responses

- [ ] Test filters games
  - **What**: Verify game filtering works in component
  - **Expected**: Games filtered based on selected criteria
  - **Edge cases**: Multiple filters, no matches, filter combinations

- [ ] Test pagination
  - **What**: Verify pagination controls work correctly
  - **Expected**: Games paginated, navigation works, page state maintained
  - **Edge cases**: First/last page, page size changes, rapid navigation

### `src/features/modules/games/components/GameCard.tsx`

- [ ] Test renders game information
  - **What**: Verify game data is displayed correctly
  - **Expected**: All game fields rendered in card format
  - **Edge cases**: Missing fields, long text, special characters

- [ ] Test renders players
  - **What**: Verify player information is displayed
  - **Expected**: Player names/avatars shown correctly
  - **Edge cases**: Many players, missing player data, long names

- [ ] Test renders date
  - **What**: Verify game date is formatted and displayed
  - **Expected**: Date formatted correctly for locale
  - **Edge cases**: Different timezones, relative dates, invalid dates

- [ ] Test renders category
  - **What**: Verify game category is displayed
  - **Expected**: Category badge/label shown correctly
  - **Edge cases**: Unknown category, missing category, custom categories

### `src/features/modules/games/components/GameDetail.tsx`

- [ ] Test renders full game details
  - **What**: Verify all game details are displayed
  - **Expected**: Complete game information rendered
  - **Edge cases**: Missing optional fields, very long descriptions

- [ ] Test renders player list
  - **What**: Verify player list is displayed with details
  - **Expected**: All players shown with stats/ELO changes
  - **Edge cases**: Many players, missing player data, ELO calculations

- [ ] Test renders ELO changes
  - **What**: Verify ELO changes are calculated and displayed
  - **Expected**: ELO deltas shown for each player
  - **Edge cases**: Zero change, large changes, missing ELO data

- [ ] Test handles non-existent game
  - **What**: Verify 404 state is handled
  - **Expected**: Shows error message or redirects
  - **Edge cases**: Deleted game, invalid ID, loading to 404 transition

## Game Hooks

### `src/features/modules/games/hooks/useGames.ts`

- [ ] Test fetches games on mount
  - **What**: Verify games are fetched when hook mounts
  - **Expected**: Games fetched and state updated
  - **Edge cases**: Network errors, empty results, slow responses

- [ ] Test applies filters
  - **What**: Verify filters trigger refetch
  - **Expected**: Games refetched when filters change
  - **Edge cases**: Rapid filter changes, invalid filters, filter combinations

- [ ] Test handles loading state
  - **What**: Verify loading state is managed
  - **Expected**: Loading state true during fetch, false after
  - **Edge cases**: Multiple rapid fetches, timeout, cancellation

- [ ] Test handles error state
  - **What**: Verify errors are captured and exposed
  - **Expected**: Error state set on failure, error message available
  - **Edge cases**: Network errors, validation errors, permission errors

- [ ] Test refetches on filter change
  - **What**: Verify filter changes trigger refetch
  - **Expected**: New fetch initiated when filters change
  - **Edge cases**: Debouncing, rapid changes, same filter value

### `src/features/modules/games/hooks/useGame.ts`

- [ ] Test fetches game by ID
  - **What**: Verify game is fetched by ID
  - **Expected**: Game data loaded and available in state
  - **Edge cases**: Invalid ID, missing game, network errors

- [ ] Test handles loading state
  - **What**: Verify loading state management
  - **Expected**: Loading true during fetch, false after
  - **Edge cases**: ID changes, rapid ID switches, timeout

- [ ] Test handles error state
  - **What**: Verify error handling
  - **Expected**: Error state set on failure
  - **Edge cases**: 404 errors, network errors, malformed data

- [ ] Test handles non-existent game
  - **What**: Verify 404 handling
  - **Expected**: Error state set or null returned
  - **Edge cases**: Deleted game, invalid ID format

## Game System Tests

### ELO Calculator

### `src/features/modules/games/lib/eloCalculator.ts`

- [ ] Test `calculateEloChange` with win result
  - **What**: Verify ELO change calculation for wins
  - **Expected**: Winner gains ELO, loser loses ELO based on rating difference
  - **Edge cases**: Very high ELO difference (>400), equal ELOs, minimum K-factor

- [ ] Test `calculateEloChange` with loss result
  - **What**: Verify ELO change calculation for losses
  - **Expected**: Loser loses more ELO when expected to win
  - **Edge cases**: Upset losses, very low ELO difference, maximum change limits

- [ ] Test `calculateEloChange` with draw result
  - **What**: Verify ELO change calculation for draws
  - **Expected**: Smaller ELO changes for draws, based on expected outcome
  - **Edge cases**: Equal ELOs drawing, large ELO difference drawing

- [ ] Test `calculateEloChange` with equal ELOs
  - **What**: Verify calculation when both players have same ELO
  - **Expected**: Equal changes for win/loss, minimal change for draw
  - **Edge cases**: Exactly equal, very close ELOs, rounding

- [ ] Test `calculateEloChange` with high ELO difference
  - **What**: Verify calculation with large rating gaps
  - **Expected**: Smaller changes for expected results, larger for upsets
  - **Edge cases**: >400 difference, maximum difference, K-factor limits

- [ ] Test `calculateEloChange` with custom K-factor
  - **What**: Verify custom K-factor is applied
  - **Expected**: ELO changes scaled by K-factor
  - **Edge cases**: Very high K-factor, zero K-factor, negative K-factor

- [ ] Test `calculateEloChange` rounds to 2 decimal places
  - **What**: Verify results are rounded correctly
  - **Expected**: All ELO changes rounded to 2 decimal places
  - **Edge cases**: Exact halves, very small values, precision limits

- [ ] Test `calculateTeamElo` with multiple players
  - **What**: Verify team ELO calculation with multiple players
  - **Expected**: Average ELO calculated correctly for team
  - **Edge cases**: Many players, very different ELOs, empty teams

- [ ] Test `calculateTeamElo` with single player
  - **What**: Verify single player team ELO
  - **Expected**: Returns player's ELO
  - **Edge cases**: New player (starting ELO), very high/low ELO

- [ ] Test `calculateTeamElo` with empty array (returns STARTING_ELO)
  - **What**: Verify empty team handling
  - **Expected**: Returns default starting ELO
  - **Edge cases**: Null array, undefined, empty array

- [ ] Test `calculateTeamElo` rounds to 2 decimal places
  - **What**: Verify rounding of team ELO
  - **Expected**: Team ELO rounded to 2 decimals
  - **Edge cases**: Exact averages, precision limits

- [ ] Test `updateEloScores` updates all players correctly
  - **What**: Verify all players' ELOs are updated
  - **Expected**: All players in game have ELO updated in database
  - **Edge cases**: Many players, concurrent updates, missing players

- [ ] Test `updateEloScores` handles winners vs losers
  - **What**: Verify winner/loser distinction
  - **Expected**: Winners gain ELO, losers lose ELO
  - **Edge cases**: Draws, multiple teams, unclear winners

- [ ] Test `updateEloScores` handles draws
  - **What**: Verify draw handling
  - **Expected**: Smaller ELO changes for all players
  - **Edge cases**: Multi-team draws, partial draws

- [ ] Test `updateEloScores` handles multiple teams
  - **What**: Verify multi-team game handling
  - **Expected**: All teams' ELOs calculated and updated correctly
  - **Edge cases**: Many teams, uneven teams, team ELO calculation

- [ ] Test `updateEloScores` handles non-existent game
  - **What**: Verify error handling for missing game
  - **Expected**: Returns error or null, doesn't crash
  - **Edge cases**: Deleted game, invalid ID, race conditions

- [ ] Test `updateEloScores` handles game with insufficient players
  - **What**: Verify validation for minimum players
  - **Expected**: Returns error or skips update for invalid games
  - **Edge cases**: Single player, zero players, missing team data

- [ ] Test `updateEloScores` updates game player documents
  - **What**: Verify player subcollection is updated
  - **Expected**: Player documents in game subcollection updated with new ELO
  - **Edge cases**: Missing subcollection, many players, concurrent updates

- [ ] Test `updateEloScores` updates player stats
  - **What**: Verify player statistics are updated
  - **Expected**: Player win/loss/draw counts and ELO updated
  - **Edge cases**: First game, many games, stat aggregation

- [ ] Test `recalculateFromGame` throws error (not implemented)
  - **What**: Verify unimplemented function throws
  - **Expected**: Throws "not implemented" error
  - **Edge cases**: Different error types, error messages

- [ ] Test DEFAULT_K_FACTOR constant
  - **What**: Verify default K-factor value
  - **Expected**: Constant has correct default value
  - **Edge cases**: Constant usage, type checking

- [ ] Test STARTING_ELO constant
  - **What**: Verify starting ELO value
  - **Expected**: Constant has correct starting ELO value
  - **Edge cases**: Constant usage, new player initialization

### Replay Parser

### `src/features/modules/games/lib/replayParser.ts`

- [ ] Test parses W3G replay file
  - **What**: Verify W3G replay file format is parsed correctly
  - **Expected**: Replay data extracted and structured correctly
  - **Edge cases**: Different W3G versions, large files, compressed files

- [ ] Test extracts player information
  - **What**: Verify player data is extracted from replay
  - **Expected**: All players with names, teams, colors extracted
  - **Edge cases**: Many players, missing player data, special characters in names

- [ ] Test extracts game duration
  - **What**: Verify game duration is calculated correctly
  - **Expected**: Duration in seconds/minutes extracted accurately
  - **Edge cases**: Very long games, very short games, paused games

- [ ] Test extracts game mode
  - **What**: Verify game mode/type is identified
  - **Expected**: Correct game mode extracted (1v1, 2v2, FFA, etc.)
  - **Edge cases**: Custom modes, unknown modes, mode variations

- [ ] Test handles invalid replay file
  - **What**: Verify invalid files are handled gracefully
  - **Expected**: Returns error or null, doesn't crash
  - **Edge cases**: Wrong file type, corrupted headers, truncated files

- [ ] Test handles corrupted replay file
  - **What**: Verify corrupted files are handled
  - **Expected**: Error returned or partial data extracted safely
  - **Edge cases**: Partial corruption, missing sections, malformed data

### W3MMD Utils

### `src/features/modules/games/lib/w3mmdUtils.ts`

- [ ] Test parses W3MMD data
  - **What**: Verify W3MMD (Warcraft 3 Map Meta Data) is parsed
  - **Expected**: W3MMD data extracted and structured
  - **Edge cases**: Different W3MMD versions, missing data, custom fields

- [ ] Test extracts statistics
  - **What**: Verify game statistics are extracted
  - **Expected**: Player stats (kills, deaths, gold, etc.) extracted
  - **Edge cases**: Missing stats, zero values, very large values

- [ ] Test handles missing data
  - **What**: Verify missing W3MMD data is handled
  - **Expected**: Returns null or partial data, doesn't crash
  - **Edge cases**: No W3MMD block, partial data, malformed W3MMD

