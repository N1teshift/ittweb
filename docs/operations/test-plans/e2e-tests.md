# E2E Scenario Tests

This document outlines all end-to-end scenario tests needed for critical user flows.

## User Authentication Flow

- [ ] Test user login
  - **What**: Verify complete login flow works
  - **Expected**: User can log in successfully, session created
  - **Edge cases**: Invalid credentials, OAuth errors, network errors

- [ ] Test user logout
  - **What**: Verify logout flow works
  - **Expected**: User logged out, session destroyed
  - **Edge cases**: Already logged out, session errors, cleanup

- [ ] Test session persistence
  - **What**: Verify session persists across page reloads
  - **Expected**: User remains logged in after page reload
  - **Edge cases**: Expired sessions, browser storage, session refresh

- [ ] Test protected route access
  - **What**: Verify protected routes require authentication
  - **Expected**: Unauthenticated users redirected, authenticated users allowed
  - **Edge cases**: Expired sessions, role-based access, middleware

## Game Creation Flow

- [ ] Test complete game creation workflow
  - **What**: Verify end-to-end game creation works
  - **Expected**: Game created, ELO updated, stats updated
  - **Edge cases**: Validation errors, network errors, concurrent creation

- [ ] Test game creation with players
  - **What**: Verify game creation with multiple players works
  - **Expected**: Players added, ELO calculated, stats updated
  - **Edge cases**: Many players, missing players, invalid player data

- [ ] Test ELO update after game creation
  - **What**: Verify ELO updates after game creation
  - **Expected**: All player ELOs updated correctly
  - **Edge cases**: ELO calculation errors, missing players, concurrent updates

- [ ] Test player stats update
  - **What**: Verify player stats updated after game
  - **Expected**: Win/loss counts, ELO, other stats updated
  - **Edge cases**: Stat calculation errors, missing stats, concurrent updates

## Post Creation Flow

- [ ] Test post creation by authorized user
  - **What**: Verify authorized users can create posts
  - **Expected**: Post created successfully, visible to users
  - **Edge cases**: Unauthorized attempts, validation errors, network errors

- [ ] Test post editing by author
  - **What**: Verify authors can edit their posts
  - **Expected**: Post updated successfully, changes visible
  - **Edge cases**: Non-author attempts, concurrent edits, validation errors

- [ ] Test post deletion
  - **What**: Verify posts can be deleted
  - **Expected**: Post soft-deleted, no longer visible
  - **Edge cases**: Non-author attempts, already deleted, permission errors

- [ ] Test post publishing workflow
  - **What**: Verify post publishing works
  - **Expected**: Post published, visible to users
  - **Edge cases**: Draft posts, publishing errors, visibility changes

## Archive Creation Flow

- [ ] Test archive creation with all sections
  - **What**: Verify archive creation with all sections works
  - **Expected**: Archive created with all sections, data preserved
  - **Edge cases**: Missing sections, invalid data, validation errors

- [ ] Test archive creation with media
  - **What**: Verify archive creation with media works
  - **Expected**: Media uploaded and linked to archive
  - **Edge cases**: Large files, invalid formats, upload errors

- [ ] Test archive editing
  - **What**: Verify archive editing works
  - **Expected**: Archive updated, changes saved
  - **Edge cases**: Concurrent edits, validation errors, permission errors

- [ ] Test archive deletion
  - **What**: Verify archive deletion works
  - **Expected**: Archive deleted, no longer visible
  - **Edge cases**: Permission errors, already deleted, cascading deletes

## Scheduled Game Flow

**Note**: Scheduled games are now managed through the main games collection with `gameState: 'scheduled'`. The dedicated scheduled games collection and pages have been removed. These tests should be integrated into the Game Creation Flow tests above, focusing on games with `gameState: 'scheduled'`.

- [ ] Test scheduled game creation (via games API with gameState: 'scheduled')
  - **What**: Verify scheduled game creation works through main games API
  - **Expected**: Game created with gameState: 'scheduled', visible in appropriate views
  - **Edge cases**: Past dates, validation errors, timezone issues

- [ ] Test player joining scheduled games
  - **What**: Verify players can join scheduled games
  - **Expected**: Player added to game, list updated
  - **Edge cases**: Already joined, game full, cancelled game

- [ ] Test player leaving scheduled games
  - **What**: Verify players can leave scheduled games
  - **Expected**: Player removed from game, list updated
  - **Edge cases**: Not in game, already left, game started

- [ ] Test replay upload for scheduled games
  - **What**: Verify replay upload works for scheduled games
  - **Expected**: Replay uploaded, game state updated appropriately
  - **Edge cases**: Large files, invalid formats, upload errors

- [ ] Test scheduled game completion
  - **What**: Verify scheduled game completion flow works
  - **Expected**: Game state updated, stats updated
  - **Edge cases**: Missing replay, completion errors, stat updates

## Player Search Flow

- [ ] Test player search functionality
  - **What**: Verify player search works end-to-end
  - **Expected**: Search returns matching players
  - **Edge cases**: No matches, many matches, search errors

- [ ] Test player profile viewing
  - **What**: Verify player profiles can be viewed
  - **Expected**: Profile displayed with correct data
  - **Edge cases**: Missing player, missing data, loading errors

- [ ] Test player comparison
  - **What**: Verify player comparison works
  - **Expected**: Players compared, comparison data displayed
  - **Edge cases**: Missing players, missing stats, comparison errors

- [ ] Test leaderboard viewing
  - **What**: Verify leaderboard can be viewed
  - **Expected**: Leaderboard displayed with correct rankings
  - **Edge cases**: Empty leaderboard, large datasets, loading errors

## Analytics Flow

- [ ] Test viewing analytics dashboard
  - **What**: Verify analytics dashboard loads and displays data
  - **Expected**: Dashboard rendered with analytics data
  - **Edge cases**: No data, large datasets, loading errors

- [ ] Test filtering analytics
  - **What**: Verify analytics filtering works
  - **Expected**: Analytics filtered by selected criteria
  - **Edge cases**: Invalid filters, no matches, filter combinations

- [ ] Test chart rendering
  - **What**: Verify analytics charts render correctly
  - **Expected**: Charts displayed with correct data
  - **Edge cases**: Empty data, chart library errors, rendering errors

- [ ] Test data aggregation
  - **What**: Verify analytics data is aggregated correctly
  - **Expected**: Data aggregated by time period/category correctly
  - **Edge cases**: Missing data, timezone issues, aggregation errors

