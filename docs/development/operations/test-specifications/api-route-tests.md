# Test Specifications - API Route Tests

Test specifications for API route handlers.

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

## Related Documentation

- [Test Specifications Index](./README.md)
- [Service Layer Tests](./service-layer-tests.md)
- [Component Tests](./component-tests.md)
- [Testing Guide](../testing-guide.md)

## Component Tests
