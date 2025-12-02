# Test Specifications - Service Layer Tests

Test specifications for service layer functions.

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

## Related Documentation

- [Test Specifications Index](./README.md)
- [Infrastructure & Utility Tests](./infrastructure-utility-tests.md)
- [API Route Tests](./api-route-tests.md)
- [Testing Guide](../testing-guide.md)
