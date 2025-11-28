# Comprehensive Jest Test Plan

This document provides a comprehensive list of all Jest tests that could be created for the ITT Web project. Tests are organized by module and feature area.

## Table of Contents

1. [Infrastructure Tests](#infrastructure-tests)
2. [Utility Functions Tests](#utility-functions-tests)
3. [Service Layer Tests](#service-layer-tests)
4. [API Route Tests](#api-route-tests)
5. [Component Tests](#component-tests)
6. [Hook Tests](#hook-tests)
7. [Validation & Form Tests](#validation--form-tests)
8. [Game System Tests](#game-system-tests)
9. [Player System Tests](#player-system-tests)
10. [Blog System Tests](#blog-system-tests)
11. [Archive System Tests](#archive-system-tests)
12. [Scheduled Games Tests](#scheduled-games-tests)
13. [Standings System Tests](#standings-system-tests)
14. [Analytics System Tests](#analytics-system-tests)
15. [Guides System Tests](#guides-system-tests)
16. [Map Analyzer Tests](#map-analyzer-tests)
17. [Tools Tests](#tools-tests)
18. [Integration Tests](#integration-tests)
19. [E2E Scenario Tests](#e2e-scenario-tests)

---

## Infrastructure Tests

### Firebase Configuration
- [ ] `src/features/infrastructure/api/firebase/config.ts`
  - Test Firebase client configuration initialization
  - Test environment variable validation
  - Test Firebase app initialization error handling
  - Test Firebase app singleton behavior

### Firebase Admin
- [ ] `src/features/infrastructure/api/firebase/admin.ts`
  - Test admin SDK initialization
  - Test `getFirestoreAdmin()` returns singleton instance
  - Test `isServerSide()` detection
  - Test admin initialization error handling

### Firebase Client
- [ ] `src/features/infrastructure/api/firebase/firebaseClient.ts`
  - Test client SDK initialization
  - Test `getFirestoreInstance()` returns singleton
  - Test client initialization error handling

### API Route Handlers
- [ ] `src/features/infrastructure/api/routeHandlers.ts`
  - Test `createApiHandler` with GET method
  - Test `createApiHandler` with POST method
  - Test `createApiHandler` with multiple allowed methods
  - Test method validation (405 error for disallowed methods)
  - Test body validation with validator function
  - Test authentication requirement
  - Test error handling and logging
  - Test response format standardization
  - Test request logging when enabled/disabled
  - Test timing metrics

### Authentication
- [ ] `src/features/infrastructure/auth/index.ts`
  - Test session retrieval
  - Test authentication status checking
  - Test user data extraction from session

### Logging System
- [ ] `src/features/infrastructure/logging/logger.ts`
  - Test logger initialization
  - Test log levels (debug, info, warn, error)
  - Test log filtering based on environment
  - Test log formatting

- [ ] `src/features/shared/utils/loggerUtils.ts`
  - Test `createComponentLogger` factory
  - Test component logger prefixing
  - Test `logError` function
  - Test `logAndThrow` function
  - Test `determineErrorCategory` with various error types
  - Test error categorization (VALIDATION, NETWORK, DATABASE, etc.)
  - Test logger in development vs production modes

---

## Utility Functions Tests

### Object Utils
- [ ] `src/features/infrastructure/utils/objectUtils.ts`
  - Test `removeUndefined` removes undefined values
  - Test `removeUndefined` preserves null values
  - Test `removeUndefined` preserves other falsy values
  - Test `removeUndefined` with nested objects
  - Test `removeUndefined` with empty object
  - Test `removeUndefined` maintains type safety

### Timestamp Utils
- [ ] `src/features/infrastructure/utils/timestampUtils.ts`
  - Test `timestampToIso` with Firestore Timestamp
  - Test `timestampToIso` with Admin SDK Timestamp
  - Test `timestampToIso` with string timestamp
  - Test `timestampToIso` with Date object
  - Test `timestampToIso` with undefined (defaults to now)
  - Test `timestampToIso` with TimestampLike objects
  - Test ISO string format validation

### User Role Utils
- [ ] `src/features/shared/utils/userRoleUtils.ts`
  - Test `hasRole` with all role combinations
  - Test `hasRole` role hierarchy (developer > admin > moderator > premium > user)
  - Test `hasRole` with undefined user role (defaults to user)
  - Test `isAdmin` function
  - Test `isDeveloper` function
  - Test `isModerator` function
  - Test `isPremium` function
  - Test role comparison edge cases
  - Test DEFAULT_USER_ROLE constant

### Timezone Utils
- [ ] `src/features/modules/scheduled-games/utils/timezoneUtils.ts`
  - Test `getUserTimezone` in browser environment
  - Test `getUserTimezone` in server environment (returns UTC)
  - Test `convertToTimezone` converts UTC to target timezone
  - Test `formatDateTimeInTimezone` with various timezones
  - Test `formatDateTimeInTimezone` with custom options
  - Test `convertLocalToUTC` with various timezones
  - Test `convertLocalToUTC` handles DST correctly
  - Test `convertLocalToUTC` with edge cases (midnight, year boundaries)
  - Test `getCommonTimezones` returns expected list
  - Test `getTimezoneAbbreviation` returns correct abbreviation
  - Test `getTimezoneAbbreviation` handles invalid timezone gracefully

### Icon Mapper Utils
- [ ] `src/features/modules/tools/icon-mapper.utils.ts`
  - Test `formatCategoryForExport` formats category correctly
  - Test `formatCategoryForExport` sorts entries alphabetically
  - Test `formatCategoryForExport` with empty category
  - Test `exportMappingsAsCode` generates valid TypeScript code
  - Test `exportMappingsAsCode` includes all categories
  - Test `exportMarkedForDeletion` formats array as JSON
  - Test `exportMarkedForDeletion` sorts paths
  - Test `exportMappingsAndDeletions` combines mappings and deletions
  - Test export functions with special characters in keys/values

### Archive Form Utils
- [ ] `src/features/modules/archives/utils/archiveFormUtils.ts`
  - Test `buildDateInfo` with single date type
  - Test `buildDateInfo` with undated type
  - Test `buildDateInfo` includes approximateText when provided
  - Test `computeEffectiveSectionOrder` filters based on flags
  - Test `computeEffectiveSectionOrder` maintains order
  - Test `normalizeSectionOrder` removes duplicates
  - Test `normalizeSectionOrder` fills missing sections
  - Test `normalizeSectionOrder` with empty array
  - Test `normalizeSectionOrder` with invalid sections
  - Test `extractFilenameFromUrl` extracts filename from URL
  - Test `extractFilenameFromUrl` handles URL encoding
  - Test `extractFilenameFromUrl` handles invalid URLs
  - Test `extractFilenameFromUrl` returns 'File' for empty URL

---

## Service Layer Tests

### Game Service
- [ ] `src/features/modules/games/lib/gameService.ts`
  - Test `getAllGames` retrieves all games
  - Test `getGameById` retrieves game by ID
  - Test `getGameById` returns null for non-existent game
  - Test `createGame` creates new game
  - Test `createGame` validates required fields
  - Test `updateGame` updates existing game
  - Test `updateGame` handles non-existent game
  - Test `deleteGame` deletes game
  - Test `deleteGame` handles non-existent game
  - Test game player subcollection management
  - Test game validation logic
  - Test duplicate game detection
  - Test game filtering by category
  - Test game filtering by date range
  - Test game filtering by player

### Player Service
- [ ] `src/features/modules/players/lib/playerService.ts`
  - Test `normalizePlayerName` lowercases and trims
  - Test `normalizePlayerName` handles special characters
  - Test `getPlayerStats` retrieves player statistics
  - Test `getPlayerStats` returns empty stats for new player
  - Test `updatePlayerStats` calculates statistics correctly
  - Test `updatePlayerStats` handles win/loss/draw
  - Test `updatePlayerStats` updates ELO scores
  - Test `updatePlayerStats` updates category-based stats
  - Test `searchPlayers` searches by name
  - Test `searchPlayers` handles case-insensitive search
  - Test player comparison logic
  - Test peak ELO tracking

### Post Service
- [ ] `src/features/modules/blog/lib/postService.ts`
  - Test `getAllPosts` retrieves all posts
  - Test `getAllPosts` filters deleted posts
  - Test `getAllPosts` filters by published status
  - Test `getPostBySlug` retrieves post by slug
  - Test `getPostBySlug` returns null for non-existent post
  - Test `getLatestPost` returns most recent post
  - Test `createPost` creates new post
  - Test `createPost` validates required fields
  - Test `updatePost` updates existing post
  - Test `deletePost` soft deletes post
  - Test post slug uniqueness validation

### Archive Service
- [ ] `src/shared/lib/archiveService.ts` (client)
  - Test `getAllArchives` retrieves all archives
  - Test `getArchiveById` retrieves archive by ID
  - Test `createArchive` creates new archive
  - Test `updateArchive` updates existing archive
  - Test `deleteArchive` deletes archive
  - Test archive filtering

- [ ] `src/shared/lib/archiveService.server.ts` (server)
  - Test server-side archive operations
  - Test admin SDK usage

### Scheduled Game Service
- [ ] `src/features/modules/scheduled-games/lib/scheduledGameService.ts`
  - Test `getAllScheduledGames` retrieves all games
  - Test `getScheduledGameById` retrieves game by ID
  - Test `createScheduledGame` creates new scheduled game
  - Test `createScheduledGame` validates date/time
  - Test `updateScheduledGame` updates existing game
  - Test `deleteScheduledGame` deletes game
  - Test player join/leave functionality
  - Test replay upload handling
  - Test timezone conversion

### Entry Service
- [ ] `src/features/modules/entries/lib/entryService.ts`
  - Test `getEntryById` retrieves entry
  - Test `createEntry` creates new entry
  - Test entry validation

- [ ] `src/features/modules/entries/lib/entryService.server.ts`
  - Test server-side entry operations

### User Data Service
- [ ] `src/shared/lib/userDataService.ts`
  - Test `getUserData` retrieves user data
  - Test `updateUserData` updates user data
  - Test `acceptDataNotice` marks notice as accepted
  - Test `getDataNoticeStatus` retrieves status
  - Test user role updates

### Analytics Service
- [ ] `src/features/modules/analytics/lib/analyticsService.ts`
  - Test activity calculation
  - Test ELO history aggregation
  - Test win rate calculation
  - Test class selection statistics
  - Test game length statistics
  - Test player activity statistics
  - Test date range filtering
  - Test category filtering

---

## API Route Tests

### Games API
- [ ] `src/pages/api/games/index.ts`
  - Test GET returns list of games
  - Test GET with query filters (category, date, player)
  - Test POST creates new game
  - Test POST validates request body
  - Test POST requires authentication
  - Test error handling

- [ ] `src/pages/api/games/[id].ts`
  - Test GET returns game by ID
  - Test GET returns 404 for non-existent game
  - Test PUT updates game
  - Test PUT validates request body
  - Test PUT requires authentication
  - Test DELETE deletes game
  - Test DELETE requires authentication

### Players API
- [ ] `src/pages/api/players/index.ts`
  - Test GET returns list of players
  - Test GET with pagination
  - Test GET with sorting

- [ ] `src/pages/api/players/[name].ts`
  - Test GET returns player by name
  - Test GET returns 404 for non-existent player
  - Test name normalization

- [ ] `src/pages/api/players/search.ts`
  - Test GET searches players by name
  - Test GET with query parameter
  - Test case-insensitive search
  - Test empty query handling

- [ ] `src/pages/api/players/compare.ts`
  - Test GET compares multiple players
  - Test GET with player names query
  - Test comparison data structure

### Posts API
- [ ] `src/pages/api/posts/index.ts`
  - Test GET returns list of posts
  - Test GET filters published posts
  - Test POST creates new post
  - Test POST validates request body
  - Test POST requires authentication

- [ ] `src/pages/api/posts/[id].ts`
  - Test GET returns post by ID
  - Test GET returns 404 for non-existent post
  - Test PUT updates post
  - Test PUT validates request body
  - Test DELETE soft deletes post

### Scheduled Games API
- [ ] `src/pages/api/scheduled-games/index.ts`
  - Test GET returns list of scheduled games
  - Test POST creates new scheduled game
  - Test POST validates date/time
  - Test POST requires authentication

- [ ] `src/pages/api/scheduled-games/[id]/index.ts`
  - Test GET returns scheduled game by ID
  - Test PUT updates scheduled game
  - Test DELETE deletes scheduled game

- [ ] `src/pages/api/scheduled-games/[id]/join.ts`
  - Test POST adds player to game
  - Test POST validates player data
  - Test duplicate player handling

- [ ] `src/pages/api/scheduled-games/[id]/leave.ts`
  - Test POST removes player from game
  - Test POST handles non-existent player

- [ ] `src/pages/api/scheduled-games/[id]/upload-replay.ts`
  - Test POST uploads replay file
  - Test POST validates file type
  - Test POST validates file size

- [ ] `src/pages/api/scheduled-games/[id]/delete.ts`
  - Test DELETE removes scheduled game
  - Test DELETE requires authentication

### Archives API
- [ ] `src/pages/api/entries/index.ts`
  - Test GET returns list of archives
  - Test POST creates new archive
  - Test POST validates request body

- [ ] `src/pages/api/entries/[id].ts`
  - Test GET returns archive by ID
  - Test PUT updates archive
  - Test DELETE deletes archive

### Standings API
- [ ] `src/pages/api/standings/index.ts`
  - Test GET returns standings/leaderboard
  - Test GET with category filter
  - Test GET with minimum games threshold
  - Test GET with pagination
  - Test ranking calculation
  - Test ELO sorting

### Analytics API
- [ ] `src/pages/api/analytics/activity.ts`
  - Test GET returns activity data
  - Test GET with date range
  - Test data aggregation

- [ ] `src/pages/api/analytics/elo-history.ts`
  - Test GET returns ELO history
  - Test GET with player filter
  - Test GET with category filter

- [ ] `src/pages/api/analytics/meta.ts`
  - Test GET returns meta statistics
  - Test data aggregation

- [ ] `src/pages/api/analytics/win-rate.ts`
  - Test GET returns win rate data
  - Test GET with filters

### Classes API
- [ ] `src/pages/api/classes/index.ts`
  - Test GET returns list of classes

- [ ] `src/pages/api/classes/[className].ts`
  - Test GET returns class details
  - Test GET returns 404 for non-existent class

### Items API
- [ ] `src/pages/api/items/index.ts`
  - Test GET returns list of items
  - Test item data structure

### Icons API
- [ ] `src/pages/api/icons/list.ts`
  - Test GET returns list of icons
  - Test icon path formatting

### User API
- [ ] `src/pages/api/user/accept-data-notice.ts`
  - Test POST accepts data notice
  - Test POST requires authentication

- [ ] `src/pages/api/user/data-notice-status.ts`
  - Test GET returns notice status
  - Test GET requires authentication

- [ ] `src/pages/api/user/delete.ts`
  - Test DELETE removes user account
  - Test DELETE requires authentication

### Auth API
- [ ] `src/pages/api/auth/[...nextauth].ts`
  - Test NextAuth configuration
  - Test OAuth providers
  - Test session management
  - Test callback handling

### Admin API
- [ ] `src/pages/api/admin/wipe-test-data.ts`
  - Test DELETE wipes test data
  - Test DELETE requires admin authentication
  - Test DELETE validates environment (dev only)

### Revalidate API
- [ ] `src/pages/api/revalidate.ts`
  - Test POST revalidates pages
  - Test POST validates secret token
  - Test revalidation logic

---

## Component Tests

### Shared Components
- [ ] `src/features/shared/components/Header.tsx`
  - Test renders navigation links
  - Test renders user menu when authenticated
  - Test renders login button when not authenticated
  - Test responsive behavior

- [ ] `src/features/shared/components/Footer.tsx`
  - Test renders footer content
  - Test renders links

- [ ] `src/features/shared/components/Layout.tsx`
  - Test wraps children with Header and Footer
  - Test applies layout styles

- [ ] `src/features/shared/components/PageHero.tsx`
  - Test renders title
  - Test renders description
  - Test renders optional image

- [ ] `src/features/shared/components/DataCollectionNotice.tsx`
  - Test renders notice when not accepted
  - Test handles accept action
  - Test handles dismiss action

- [ ] `src/features/shared/components/DiscordButton.tsx`
  - Test renders Discord link
  - Test opens in new tab

- [ ] `src/features/shared/components/GitHubButton.tsx`
  - Test renders GitHub link
  - Test opens in new tab

### Game Components
- [ ] `src/features/modules/games/components/GameList.tsx`
  - Test renders list of games
  - Test handles empty state
  - Test handles loading state
  - Test handles error state
  - Test filters games
  - Test pagination

- [ ] `src/features/modules/games/components/GameCard.tsx`
  - Test renders game information
  - Test renders players
  - Test renders date
  - Test renders category

- [ ] `src/features/modules/games/components/GameDetail.tsx`
  - Test renders full game details
  - Test renders player list
  - Test renders ELO changes
  - Test handles non-existent game

### Player Components
- [ ] `src/features/modules/players/components/PlayersPage.tsx`
  - Test renders player list
  - Test handles search
  - Test handles pagination
  - Test handles loading state

- [ ] `src/features/modules/players/components/PlayerProfile.tsx`
  - Test renders player statistics
  - Test renders game history
  - Test renders ELO chart
  - Test handles non-existent player

- [ ] `src/features/modules/players/components/PlayerComparison.tsx`
  - Test compares multiple players
  - Test renders comparison table
  - Test handles different stat categories

### Blog Components
- [ ] `src/features/modules/blog/components/BlogPost.tsx`
  - Test renders post content
  - Test renders MDX content
  - Test renders metadata
  - Test renders edit button for author

- [ ] `src/features/modules/blog/components/NewPostForm.tsx`
  - Test renders form fields
  - Test validates required fields
  - Test handles form submission
  - Test handles errors

- [ ] `src/features/modules/blog/components/EditPostForm.tsx`
  - Test renders form with existing data
  - Test validates required fields
  - Test handles form submission
  - Test handles errors

- [ ] `src/features/modules/blog/components/PostDeleteDialog.tsx`
  - Test renders confirmation dialog
  - Test handles delete action
  - Test handles cancel action

### Archive Components
- [ ] `src/features/modules/archives/components/ArchivesContent.tsx`
  - Test renders archive list
  - Test handles empty state
  - Test handles loading state
  - Test handles error state

- [ ] `src/features/modules/archives/components/ArchiveForm.tsx`
  - Test renders all form sections
  - Test validates form data
  - Test handles form submission
  - Test handles media uploads

- [ ] `src/features/modules/archives/components/ArchiveEditForm.tsx`
  - Test renders form with existing data
  - Test updates archive
  - Test validates changes

- [ ] `src/features/modules/archives/components/ArchiveDeleteDialog.tsx`
  - Test renders confirmation dialog
  - Test handles delete action

- [ ] `src/features/modules/archives/components/ArchiveEntry.tsx`
  - Test renders archive entry
  - Test renders all sections
  - Test renders media embeds

- [ ] `src/features/modules/archives/components/YouTubeEmbed.tsx`
  - Test renders YouTube embed
  - Test handles video ID extraction

- [ ] `src/features/modules/archives/components/TwitchClipEmbed.tsx`
  - Test renders Twitch embed
  - Test handles clip URL parsing

### Scheduled Games Components
- [ ] `src/features/modules/scheduled-games/components/*`
  - Test scheduled game list rendering
  - Test scheduled game form
  - Test player join/leave UI
  - Test replay upload UI
  - Test timezone display

### Standings Components
- [ ] `src/features/modules/standings/components/*`
  - Test leaderboard rendering
  - Test ranking display
  - Test category filtering
  - Test pagination

### Analytics Components
- [ ] `src/features/modules/analytics/components/ActivityChart.tsx`
  - Test renders chart
  - Test handles empty data
  - Test handles date range

- [ ] `src/features/modules/analytics/components/EloChart.tsx`
  - Test renders ELO history chart
  - Test handles multiple players

- [ ] `src/features/modules/analytics/components/WinRateChart.tsx`
  - Test renders win rate pie chart
  - Test calculates percentages

- [ ] `src/features/modules/analytics/components/ClassSelectionChart.tsx`
  - Test renders class selection data
  - Test handles empty data

- [ ] `src/features/modules/analytics/components/GameLengthChart.tsx`
  - Test renders game length distribution
  - Test handles time formatting

- [ ] `src/features/modules/analytics/components/PlayerActivityChart.tsx`
  - Test renders player activity over time
  - Test handles multiple players

- [ ] `src/features/modules/analytics/components/ClassWinRateChart.tsx`
  - Test renders class win rates
  - Test compares classes

### Guides Components
- [ ] `src/features/modules/guides/components/GuideCard.tsx`
  - Test renders guide card
  - Test renders icon
  - Test handles navigation

- [ ] `src/features/modules/guides/components/ClassHeader.tsx`
  - Test renders class name
  - Test renders class icon
  - Test renders stats

- [ ] `src/features/modules/guides/components/ClassIcon.tsx`
  - Test renders icon with correct path
  - Test handles missing icon

- [ ] `src/features/modules/guides/components/GuideIcon.tsx`
  - Test renders guide icon
  - Test handles different icon types

- [ ] `src/features/modules/guides/components/StatsCard.tsx`
  - Test renders stat values
  - Test formats numbers correctly

- [ ] `src/features/modules/guides/components/ColoredText.tsx`
  - Test applies color codes
  - Test renders text correctly

### Map Analyzer Components
- [ ] `src/features/modules/map-analyzer/components/*`
  - Test map parsing
  - Test map data display
  - Test map visualization

### Tools Components
- [ ] `src/features/modules/tools/components/*`
  - Test icon mapper UI
  - Test duel simulator UI
  - Test tool interactions

### Shared Module Components
- [ ] `src/features/modules/shared/components/DateRangeFilter.tsx`
  - Test renders date inputs
  - Test handles date selection
  - Test validates date range
  - Test clears filters

### UI Components
- [ ] `src/features/infrastructure/shared/components/ui/*`
  - Test button component variants
  - Test input component validation
  - Test modal component open/close
  - Test dropdown component
  - Test loading spinner
  - Test error message display

---

## Hook Tests

### Game Hooks
- [ ] `src/features/modules/games/hooks/useGames.ts`
  - Test fetches games on mount
  - Test applies filters
  - Test handles loading state
  - Test handles error state
  - Test refetches on filter change

- [ ] `src/features/modules/games/hooks/useGame.ts`
  - Test fetches game by ID
  - Test handles loading state
  - Test handles error state
  - Test handles non-existent game

### Player Hooks
- [ ] `src/features/modules/players/hooks/usePlayerStats.ts`
  - Test fetches player statistics
  - Test handles loading state
  - Test handles error state
  - Test handles non-existent player

### Standings Hooks
- [ ] `src/features/modules/standings/hooks/useStandings.ts`
  - Test fetches standings
  - Test applies filters
  - Test handles pagination
  - Test handles loading state

### Archive Hooks
- [ ] `src/features/modules/archives/hooks/useArchiveBaseState.ts`
  - Test initializes state correctly
  - Test handles form field updates
  - Test handles section management
  - Test handles media management

- [ ] `src/features/modules/archives/hooks/useArchiveHandlers.ts`
  - Test handles form submission
  - Test handles form validation
  - Test handles errors

- [ ] `src/features/modules/archives/hooks/useArchiveMedia.ts`
  - Test handles image uploads
  - Test handles video URLs
  - Test handles Twitch clips
  - Test handles replay files

- [ ] `src/features/modules/archives/hooks/useArchivesActions.ts`
  - Test handles create action
  - Test handles update action
  - Test handles delete action

- [ ] `src/features/modules/archives/hooks/useArchivesPage.ts`
  - Test fetches archives
  - Test handles filters
  - Test handles loading/error states

### Blog Hooks
- [ ] `src/features/modules/blog/hooks/useNewPostForm.ts`
  - Test initializes form state
  - Test handles field updates
  - Test validates form
  - Test handles submission

- [ ] `src/features/modules/blog/hooks/useEditPostForm.ts`
  - Test initializes with post data
  - Test handles field updates
  - Test validates changes
  - Test handles submission

### Scheduled Games Hooks
- [ ] `src/features/modules/scheduled-games/hooks/*`
  - Test fetches scheduled games
  - Test handles join/leave actions
  - Test handles replay upload

### Guides Hooks
- [ ] `src/features/modules/guides/hooks/useItemsData.ts`
  - Test fetches items data
  - Test filters items
  - Test handles loading state

### Tools Hooks
- [ ] `src/features/modules/tools/useIconMapperData.ts`
  - Test fetches icon data
  - Test handles mapping updates
  - Test handles export

### Shared Hooks
- [ ] `src/features/shared/hooks/useFallbackTranslation.ts`
  - Test falls back to key when translation missing
  - Test uses translation when available

---

## Validation & Form Tests

### Archive Validation
- [ ] `src/features/modules/archives/utils/archiveValidation.ts`
  - Test `validateArchiveForm` requires title
  - Test `validateArchiveForm` requires creator name
  - Test `validateArchiveForm` validates single date format (YYYY)
  - Test `validateArchiveForm` validates single date format (YYYY-MM)
  - Test `validateArchiveForm` validates single date format (YYYY-MM-DD)
  - Test `validateArchiveForm` rejects invalid date formats
  - Test `validateArchiveForm` allows undated entries
  - Test `validateArchiveForm` validates approximate text for undated
  - Test returns null for valid form
  - Test returns error message for invalid form

---

## Game System Tests

### ELO Calculator
- [ ] `src/features/modules/games/lib/eloCalculator.ts`
  - Test `calculateEloChange` with win result
  - Test `calculateEloChange` with loss result
  - Test `calculateEloChange` with draw result
  - Test `calculateEloChange` with equal ELOs
  - Test `calculateEloChange` with high ELO difference
  - Test `calculateEloChange` with custom K-factor
  - Test `calculateEloChange` rounds to 2 decimal places
  - Test `calculateTeamElo` with multiple players
  - Test `calculateTeamElo` with single player
  - Test `calculateTeamElo` with empty array (returns STARTING_ELO)
  - Test `calculateTeamElo` rounds to 2 decimal places
  - Test `updateEloScores` updates all players correctly
  - Test `updateEloScores` handles winners vs losers
  - Test `updateEloScores` handles draws
  - Test `updateEloScores` handles multiple teams
  - Test `updateEloScores` handles non-existent game
  - Test `updateEloScores` handles game with insufficient players
  - Test `updateEloScores` updates game player documents
  - Test `updateEloScores` updates player stats
  - Test `recalculateFromGame` throws error (not implemented)
  - Test DEFAULT_K_FACTOR constant
  - Test STARTING_ELO constant

### Replay Parser
- [ ] `src/features/modules/games/lib/replayParser.ts`
  - Test parses W3G replay file
  - Test extracts player information
  - Test extracts game duration
  - Test extracts game mode
  - Test handles invalid replay file
  - Test handles corrupted replay file

### W3MMD Utils
- [ ] `src/features/modules/games/lib/w3mmdUtils.ts`
  - Test parses W3MMD data
  - Test extracts statistics
  - Test handles missing data

---

## Player System Tests

### Player Name Normalization
- [ ] Test case-insensitive normalization
- [ ] Test trims whitespace
- [ ] Test handles special characters
- [ ] Test handles unicode characters

### Player Statistics
- [ ] Test win rate calculation
- [ ] Test loss rate calculation
- [ ] Test total games count
- [ ] Test category-based statistics
- [ ] Test peak ELO tracking
- [ ] Test ELO history
- [ ] Test statistics aggregation across games

---

## Blog System Tests

### Post Loading & Serialization
- [ ] `src/features/modules/blog/lib/posts.ts`
  - Test `listPostSlugs` returns all slugs
  - Test `loadPostBySlug` loads post by slug
  - Test `loadPostBySlug` returns null for non-existent slug
  - Test `loadAllPosts` loads all posts
  - Test `loadLatestPostSerialized` loads latest post
  - Test `loadLatestPostSerialized` serializes MDX correctly
  - Test `postToMeta` converts Post to PostMeta
  - Test MDX serialization with plugins
  - Test MDX serialization with frontmatter

### Post Validation
- [ ] Test slug uniqueness
- [ ] Test required fields
- [ ] Test date format validation
- [ ] Test content validation

---

## Archive System Tests

### Archive Data Structure
- [ ] Test archive creation with all fields
- [ ] Test archive creation with minimal fields
- [ ] Test archive date info structure
- [ ] Test archive section ordering
- [ ] Test archive media embeds

### Archive Media Handling
- [ ] Test image URL extraction
- [ ] Test video URL parsing
- [ ] Test Twitch clip URL parsing
- [ ] Test replay file handling
- [ ] Test YouTube embed URL parsing

---

## Scheduled Games Tests

### Scheduled Game Logic
- [ ] Test game scheduling with timezone
- [ ] Test player capacity limits
- [ ] Test duplicate player prevention
- [ ] Test game start time validation
- [ ] Test past game prevention

### Scheduled Game State
- [ ] Test game state transitions
- [ ] Test player join validation
- [ ] Test player leave validation
- [ ] Test replay upload validation

---

## Standings System Tests

### Leaderboard Calculation
- [ ] Test ranking by ELO
- [ ] Test minimum games threshold
- [ ] Test category-based leaderboards
- [ ] Test tie-breaking logic
- [ ] Test pagination
- [ ] Test sorting

---

## Analytics System Tests

### Analytics Aggregation
- [ ] Test activity aggregation by day
- [ ] Test ELO history aggregation
- [ ] Test win rate calculation per category
- [ ] Test class selection statistics
- [ ] Test game length distribution
- [ ] Test player activity tracking

### Analytics Filtering
- [ ] Test date range filtering
- [ ] Test category filtering
- [ ] Test player filtering
- [ ] Test combined filters

---

## Guides System Tests

### Guide Data Loading
- [ ] Test abilities data loading
- [ ] Test items data loading
- [ ] Test units data loading
- [ ] Test classes data loading
- [ ] Test icon mapping

### Guide Utilities
- [ ] Test icon path resolution
- [ ] Test item ID mapping
- [ ] Test ability ID mapping
- [ ] Test icon utilities

---

## Map Analyzer Tests

### Map Parsing
- [ ] Test map file parsing
- [ ] Test map data extraction
- [ ] Test map validation
- [ ] Test error handling

### Map Utilities
- [ ] Test map data transformation
- [ ] Test map visualization data

---

## Tools Tests

### Icon Mapper
- [ ] Test icon mapping creation
- [ ] Test icon mapping updates
- [ ] Test icon mapping export
- [ ] Test icon deletion marking

### Duel Simulator
- [ ] Test simulation logic
- [ ] Test result calculation
- [ ] Test input validation

---

## Integration Tests

### Firebase Integration
- [ ] Test Firestore read operations
- [ ] Test Firestore write operations
- [ ] Test Firestore query operations
- [ ] Test Firestore transaction operations
- [ ] Test Firestore error handling
- [ ] Test Firestore offline handling
- [ ] Test Firestore security rules (if applicable)

### Next.js Integration
- [ ] Test API route integration
- [ ] Test static page generation
- [ ] Test server-side rendering
- [ ] Test client-side hydration
- [ ] Test routing

### NextAuth Integration
- [ ] Test authentication flow
- [ ] Test session management
- [ ] Test OAuth callback handling
- [ ] Test protected route access

### MDX Integration
- [ ] Test MDX content rendering
- [ ] Test MDX plugins
- [ ] Test MDX frontmatter parsing

---

## E2E Scenario Tests

### User Authentication Flow
- [ ] Test user login
- [ ] Test user logout
- [ ] Test session persistence
- [ ] Test protected route access

### Game Creation Flow
- [ ] Test complete game creation workflow
- [ ] Test game creation with players
- [ ] Test ELO update after game creation
- [ ] Test player stats update

### Post Creation Flow
- [ ] Test post creation by authorized user
- [ ] Test post editing by author
- [ ] Test post deletion
- [ ] Test post publishing workflow

### Archive Creation Flow
- [ ] Test archive creation with all sections
- [ ] Test archive creation with media
- [ ] Test archive editing
- [ ] Test archive deletion

### Scheduled Game Flow
- [ ] Test scheduled game creation
- [ ] Test player joining
- [ ] Test player leaving
- [ ] Test replay upload
- [ ] Test game completion

### Player Search Flow
- [ ] Test player search functionality
- [ ] Test player profile viewing
- [ ] Test player comparison
- [ ] Test leaderboard viewing

### Analytics Flow
- [ ] Test viewing analytics dashboard
- [ ] Test filtering analytics
- [ ] Test chart rendering
- [ ] Test data aggregation

---

## Performance Tests

### Database Query Performance
- [ ] Test game list query performance
- [ ] Test player stats query performance
- [ ] Test standings query performance
- [ ] Test archive query performance

### Component Rendering Performance
- [ ] Test large list rendering
- [ ] Test chart rendering performance
- [ ] Test image loading performance

### API Response Performance
- [ ] Test API response times
- [ ] Test API concurrent request handling
- [ ] Test API error recovery

---

## Edge Cases & Error Handling Tests

### Invalid Input Handling
- [ ] Test invalid game data
- [ ] Test invalid player names
- [ ] Test invalid dates
- [ ] Test invalid file uploads
- [ ] Test SQL injection prevention (if applicable)
- [ ] Test XSS prevention

### Network Error Handling
- [ ] Test offline behavior
- [ ] Test network timeout handling
- [ ] Test retry logic
- [ ] Test error recovery

### Database Error Handling
- [ ] Test connection failures
- [ ] Test query failures
- [ ] Test transaction failures
- [ ] Test permission errors

### Boundary Conditions
- [ ] Test empty data sets
- [ ] Test very large data sets
- [ ] Test date boundary conditions
- [ ] Test numeric boundary conditions
- [ ] Test string length limits

---

## Security Tests

### Authentication & Authorization
- [ ] Test unauthorized API access
- [ ] Test role-based access control
- [ ] Test session hijacking prevention
- [ ] Test CSRF protection

### Data Validation
- [ ] Test input sanitization
- [ ] Test output encoding
- [ ] Test file upload validation
- [ ] Test URL validation

---

## Accessibility Tests

### Component Accessibility
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility
- [ ] Test ARIA labels
- [ ] Test focus management
- [ ] Test color contrast

---

## Snapshot Tests

### Component Snapshots
- [ ] Test all component snapshots
- [ ] Test component variations
- [ ] Test component error states
- [ ] Test component loading states

---

## Migration & Compatibility Tests

### Data Migration
- [ ] Test data format migrations
- [ ] Test backward compatibility
- [ ] Test schema updates

### Browser Compatibility
- [ ] Test modern browser support
- [ ] Test polyfill requirements
- [ ] Test feature detection

---

## Test Coverage Goals

- **Unit Tests**: 80%+ coverage for utilities, services, and pure functions
- **Integration Tests**: 70%+ coverage for API routes and service integrations
- **Component Tests**: 60%+ coverage for React components
- **E2E Tests**: Critical user flows covered

---

## Test Organization

### File Structure
```
src/
├── __tests__/
│   ├── unit/
│   │   ├── utils/
│   │   ├── services/
│   │   └── lib/
│   ├── integration/
│   │   ├── api/
│   │   └── services/
│   └── e2e/
│       └── scenarios/
└── features/
    └── modules/
        └── [module]/
            ├── __tests__/
            │   ├── components/
            │   ├── hooks/
            │   ├── lib/
            │   └── utils/
```

### Test Naming Conventions
- Unit tests: `[module].test.ts` or `[module].spec.ts`
- Component tests: `[ComponentName].test.tsx`
- Integration tests: `[feature].integration.test.ts`
- E2E tests: `[scenario].e2e.test.ts`

---

## Notes

- Use `@testing-library/react` for component tests
- Use `@testing-library/user-event` for user interactions
- Mock Firebase/Firestore for isolated unit tests
- Use MSW (Mock Service Worker) for API mocking in integration tests
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests isolated and independent
- Use descriptive test names
- Test behavior, not implementation
- Maintain test data fixtures for consistency
