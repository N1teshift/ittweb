# Test Specifications - Module Tests

Test specifications for feature modules: Games, Players, Blog, Archives, Scheduled Games, Standings, Analytics, Guides, Map Analyzer, and Tools.

### ELO Calculator
- [x] `src/features/modules/games/lib/eloCalculator.ts`
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
- [x] `src/features/modules/games/lib/replayParser.ts`
  - Test parses W3G replay file
  - Test extracts player information
  - Test extracts game duration
  - Test extracts game mode
  - Test handles invalid replay file
  - Test handles corrupted replay file

### W3MMD Utils
- [x] `src/features/modules/games/lib/w3mmdUtils.ts`
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

### Scheduled Game Service
- [ ] `src/features/modules/scheduled-games/lib/scheduledGameService.ts`
  - Test `deriveGameStatus` returns scheduled/ongoing/awaiting_replay based on start and duration
  - Test `deriveGameStatus` respects stored archived/awaiting_replay/cancelled statuses
  - Test `deriveGameStatus` handles invalid timestamps gracefully
  - Test `getNextScheduledGameId` increments highest ID and falls back when index queries fail
  - Test `createScheduledGame` sets default creator fields and timestamps on server/client SDKs
  - Test `createScheduledGame` preserves provided participants and modes
  - Test `createScheduledGame` converts scheduledDateTime string to Timestamp/admin Timestamp
  - Test `getAllScheduledGames` filters past/archived games based on flags
  - Test `getAllScheduledGames` sorts by scheduled date ascending and derives statuses
  - Test `getAllScheduledGames` returns empty array when Firestore setup errors occur
  - Test `getScheduledGameById` returns null for missing game
  - Test `getScheduledGameById` normalizes participant timestamps and derived status
  - Test `updateScheduledGame` updates team size/custom size/modes/version/length
  - Test `updateScheduledGame` removes undefined fields via `removeUndefined`
  - Test `updateScheduledGame` updates timestamps in admin/client environments
  - Test `deleteScheduledGame` removes document and handles non-existent IDs
  - Test `joinScheduledGame` prevents duplicate participants and appends join timestamp
  - Test `joinScheduledGame` rejects unknown game ID
  - Test `leaveScheduledGame` removes participant by discordId and updates timestamp
  - Test `leaveScheduledGame` handles leaving non-existent or already-left users

### Scheduled Games API Routes
- [ ] `src/pages/api/scheduled-games/index.ts`
  - Test GET returns upcoming games by default and honors includePast/includeArchived flags
  - Test POST requires authentication and validates required fields
  - Test POST rejects past dates for non-admin users and allows admins/manual entries
  - Test POST adds creator as participant when addCreatorToParticipants is true/undefined
  - Test POST preserves provided participants when addCreatorToParticipants is false
  - Test POST returns 201 with scheduled game ID on success
  - Test POST handles archived status flow: creates scheduled game and attempts game/archive linking
  - Test POST surfaces internal errors as 500 with redacted production message
  - Test method not allowed returns 405 for unsupported verbs
- [ ] `src/pages/api/scheduled-games/[id]/index.ts`
  - Test GET returns single game or 404 when missing
  - Test PUT/PATCH require authentication and creator ownership
  - Test PUT/PATCH validate required update fields (teamSize, gameType)
  - Test PUT/PATCH support custom team size and optional version/length/modes
  - Test method not allowed for DELETE/POST/etc.
  - Test server error path returns 500 with environment-specific messaging
- [ ] `src/pages/api/scheduled-games/[id]/join.ts`
  - Test POST requires authentication and discordId
  - Test joining adds participant and prevents duplicates
  - Test join rejects missing game or cancelled/archived game
  - Test method not allowed for non-POST verbs
- [ ] `src/pages/api/scheduled-games/[id]/leave.ts`
  - Test POST requires authentication and discordId
  - Test leaving removes participant and is idempotent when user absent
  - Test leave rejects missing game
  - Test method not allowed for non-POST verbs
- [ ] `src/pages/api/scheduled-games/[id]/upload-replay.ts`
  - Test POST requires authentication and creator ownership
  - Test replay upload rejects oversized files and invalid MIME types
  - Test replay upload stores metadata and links to archive/game IDs
  - Test replay upload updates scheduled game status to archived
  - Test upload rejects missing game or missing file payload
  - Test method not allowed for non-POST verbs
- [ ] `src/pages/api/scheduled-games/[id]/delete.ts`
  - Test POST requires authentication and creator ownership
  - Test deletion removes scheduled game and returns success payload
  - Test deletion handles missing game with 404
  - Test method not allowed for non-POST verbs

### Scheduled Games Components
- [ ] `src/features/modules/scheduled-games/components/ScheduleGameForm.tsx`
  - Test form renders available team sizes, types, and timezones
  - Test validation for required date/time/timezone/teamSize fields
  - Test manual entry toggle allows past dates and archived status selection
  - Test add/remove participant rows and validation requiring winner/loser mix
  - Test submission calls `/api/scheduled-games` with assembled payload
  - Test success and error alert rendering
- [ ] `src/features/modules/scheduled-games/components/EditGameForm.tsx`
  - Test initial values populate from selected game
  - Test editing fields updates local state and payload structure
  - Test submit enforces creator-only updates and handles API errors
  - Test cancel action restores view without saving
- [ ] `src/features/modules/scheduled-games/components/ScheduledGamesList.tsx`
  - Test list renders grouped by status with derived badges
  - Test loading/error states while fetching games
  - Test join/leave buttons visibility based on participation and status
  - Test edit/delete/upload buttons show for creator only
  - Test filtering to include past/archived games when toggled
- [ ] `src/features/modules/scheduled-games/components/GameDeleteDialog.tsx`
  - Test confirmation dialog shows game info and disables buttons while deleting
  - Test confirm triggers delete API and closes on success
  - Test cancel/close actions dismiss dialog without calling API
- [ ] `src/features/modules/scheduled-games/components/UploadReplayModal.tsx`
  - Test replay file selection and size validation messaging
  - Test upload button triggers `/api/scheduled-games/{id}/upload-replay`
  - Test progress/disabled states during upload
  - Test success closes modal and shows toast/message
  - Test error responses display inline feedback
- [ ] `src/features/modules/scheduled-games/components/CreateGameInlineForm.tsx`
  - Test default date/time/timezone initialization from user context
  - Test participant generation enforces at least one winner and one loser
  - Test custom team size is required when teamSize is `custom`
  - Test form rejects submissions without two named participants
  - Test successful submit archives game immediately and closes modal

### Scheduled Games Pages
- [ ] `src/pages/scheduled-games/index.tsx`
  - Test initial fetch calls includePast=true to populate list
  - Test Create Game modal toggles visibility and passes callbacks
  - Test join/leave/edit/delete/upload flows update list after completion
  - Test error states render when API requests fail
  - Test loading skeleton/placeholder while fetching
- [ ] `src/pages/scheduled-games/[id]/upload-replay.tsx`
  - Test page fetches scheduled game details and handles 404 redirects
  - Test form submission uploads replay and navigates back on success
  - Test validation errors surface when no file chosen or upload fails

---

## Standings System Tests

### Leaderboard Calculation
- [ ] `src/features/modules/standings/lib/standingsService.ts` ranks players by score (ELO) descending
- [ ] `standingsService.getStandings` applies tie-breakers by win rate, then wins when scores are equal
- [ ] `standingsService.getStandings` calculates win rate percentage to two decimals
- [ ] `standingsService.getStandings` assigns sequential ranks after sorting

### Filters & Category Handling
- [ ] `standingsService.getStandings` enforces the default minimum games threshold (10)
- [ ] `standingsService.getStandings` respects custom `minGames` filter values
- [ ] `standingsService.getStandings` excludes players missing stats for the requested category
- [ ] `standingsService.getStandings` falls back to player ID when name is missing
- [ ] Category-based leaderboards return distinct results per category

### Pagination & Response Metadata
- [ ] `standingsService.getStandings` paginates correctly for the first page
- [ ] `standingsService.getStandings` paginates correctly for middle/end pages
- [ ] `standingsService.getStandings` returns accurate `total` counts irrespective of pagination
- [ ] `standingsService.getStandings` sets `hasMore` true/false based on remaining records

### Environment-Specific Behavior
- [ ] Server-side execution uses Firebase Admin (`getFirestoreAdmin`) when `isServerSide` is true
- [ ] Client-side execution uses Firebase client (`getFirestoreInstance`) when `isServerSide` is false
- [ ] Standings fetch logs errors and rethrows for calling code to handle

### Standings API Route
- [ ] `pages/api/standings/index.ts` accepts default filters when no query params provided
- [ ] `pages/api/standings/index.ts` forwards category/minGames/page/limit query params to the service
- [ ] `pages/api/standings/index.ts` returns 200 with payload shape `{ standings, total, page, hasMore }`
- [ ] `pages/api/standings/index.ts` returns appropriate error status when the service throws

### Hooks & Components
- [ ] `src/features/modules/standings/hooks/useStandings.ts` sets loading state during fetch
- [ ] `useStandings` handles successful responses and stores standings data
- [ ] `useStandings` surfaces fetch errors and resets loading state
- [ ] `src/features/modules/standings/components/Leaderboard.tsx` renders loading, empty, error, and populated states
- [ ] `Leaderboard` displays rank, name, score, wins, losses, win rate, and games for each entry
- [ ] `src/features/modules/standings/components/CategorySelector.tsx` renders category options and triggers filter updates

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
- [ ] `src/features/modules/guides/data/abilities/index.ts`
  - Test `ABILITIES` aggregates all category arrays
  - Test `getAbilitiesByCategory` filters by category
  - Test `getAbilitiesByClass` filters by class requirement
  - Test `getAbilityById` returns exact ability match
  - Test `searchAbilities` matches name, description, and ID fields

- [ ] `src/features/modules/guides/data/items/index.ts`
  - Test `ITEMS_DATA` concatenates all item groups (raw materials, weapons, armor, potions, scrolls, buildings, unknown)
  - Test `ITEMS_BY_CATEGORY` groups items by category
  - Test `getItemById` returns undefined for missing IDs and matches by slug
  - Test `getItemsByCategory` returns empty array for categories without entries
  - Test `getItemsBySubcategory` filters by subcategory
  - Test `searchItems` matches name, description, and recipe ingredients (case-insensitive)

- [ ] `src/features/modules/guides/data/units/classes.ts`
  - Test `BASE_TROLL_CLASS_SLUGS` lists every base class slug
  - Test `getClassBySlug` returns correct class data and undefined for invalid slug
  - Test base class entries include subclass and superclass relationships
  - Test growth stats and base stats are preserved for each class

- [ ] `src/features/modules/guides/data/units/derivedClasses.ts`
  - Test derived classes inherit correct parent slug and type (sub vs super)
  - Test derived class entries include growth and base stat fields
  - Test derived classes include optional metadata (tips, iconSrc) when provided

- [ ] `src/features/modules/guides/hooks/useItemsData.ts`
  - Test initial state uses cached values when available
  - Test successful fetch updates `items`, `meta`, and clears errors
  - Test fetch failure sets error and stops loading state
  - Test in-flight request is reused across mounts
  - Test `refetch` clears caches and reloads data
  - Test cleanup prevents state updates after unmount

- [ ] `src/features/modules/guides/data/iconMap.ts`
  - Test ICON_MAP contains required categories (abilities, items, buildings, trolls, units)
  - Test entries map to filenames (no directory prefixes) and are serializable
  - Test icon lookups can round-trip known keys from each category

### Guide Utilities
- [ ] `src/features/modules/guides/utils/iconMap.ts`
  - Test `resolveExplicitIcon` returns category-specific matches
  - Test `resolveExplicitIcon` searches across categories when not found in requested category
  - Test `resolveExplicitIcon` returns undefined when key is missing everywhere
  - Test resolved paths include `/icons/itt/` prefix

- [ ] `src/features/modules/guides/utils/iconUtils.ts`
  - Test `getDefaultIconPath` returns default fallback path
  - Test default path is used when icon mapping is missing

- [ ] `src/features/modules/guides/utils/itemIdMapper.ts`
  - Test `itemConstantToId` strips ITEM_ prefix and converts to kebab-case
  - Test `itemIdToConstant` prefixes ITEM_ and uppercases
  - Test `mapCraftingStation` maps known stations and capitalizes unknown values
  - Test `normalizeIngredientName` applies `INGREDIENT_NAME_MAP` overrides

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

## Related Documentation

- [Test Specifications Index](./README.md)
- [Service Layer Tests](./service-layer-tests.md)
- [Component Tests](./component-tests.md)
- [Hook Tests](./hook-tests.md)
- [Integration & E2E Tests](./integration-e2e-tests.md)
- [Testing Guide](../testing-guide.md)

