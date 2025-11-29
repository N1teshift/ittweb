# Service Layer CRUD Patterns Audit

**Last Updated**: 2025-01-15  
**Purpose**: Audit all service files to document current CRUD patterns and identify standardization opportunities

---

## Standard CRUD Pattern

Based on `docs/CODE_COOKBOOK.md`, the standard pattern is:

```typescript
// Create
export async function create[Entity](data: Create[Entity]): Promise<string>

// Read - Single
export async function get[Entity](id: string): Promise<[Entity] | null>
// OR
export async function get[Entity]ById(id: string): Promise<[Entity] | null>

// Read - List
export async function list[Entities](filters?: Filters): Promise<[Entity][]>
// OR
export async function getAll[Entities](filters?: Filters): Promise<[Entity][]>

// Update
export async function update[Entity](id: string, data: Update[Entity]): Promise<void>

// Delete
export async function delete[Entity](id: string): Promise<void>
```

---

## Service Audit Results

### ✅ Games Service (`gameService.ts`)

**Status**: ✅ Well-structured, follows CRUD pattern  
**Structure**: Split into focused modules (create, read, update, delete, participation, utils)

**Functions**:
- ✅ `createScheduledGame(data: CreateScheduledGame): Promise<string>`
- ✅ `createCompletedGame(data: CreateCompletedGame): Promise<string>`
- ✅ `createGame(data: CreateGame): Promise<string>` (legacy)
- ✅ `getGameById(id: string): Promise<GameWithPlayers | null>`
- ✅ `getGames(filters?: GameFilters): Promise<GameListResponse>`
- ✅ `updateGame(id: string, updates: UpdateGame): Promise<void>`
- ✅ `deleteGame(id: string): Promise<void>`
- ✅ `joinGame(id: string, participant: Participant): Promise<void>`
- ✅ `leaveGame(id: string, discordId: string): Promise<void>`

**Notes**: 
- Excellent structure with split modules
- Follows standard naming conventions
- Has additional operations (join/leave) which is appropriate
- Uses proper error handling and logging

---

### ✅ Entries Service (`entryService.ts`)

**Status**: ✅ Follows CRUD pattern, minor naming inconsistencies

**Functions**:
- ✅ `createEntry(data: CreateEntry): Promise<string>`
- ✅ `getEntryById(id: string): Promise<Entry | null>`
- ⚠️ `getAllEntries(contentType?: 'post' | 'memory'): Promise<Entry[]>` - Should be `listEntries`
- ⚠️ `getLatestEntry(contentType?: 'post' | 'memory'): Promise<Entry | null>` - Specialized function, OK
- ✅ `updateEntry(id: string, updates: UpdateEntry): Promise<void>`
- ✅ `deleteEntry(id: string): Promise<void>`

**Recommendations**:
- Consider renaming `getAllEntries` to `listEntries` for consistency (or keep if widely used)
- Otherwise follows standard pattern well

---

### ✅ Posts Service (`postService.ts`)

**Status**: ✅ Follows CRUD pattern, has additional specialized functions

**Functions**:
- ✅ `createPost(data: CreatePost): Promise<string>`
- ✅ `getPostById(id: string): Promise<Post | null>`
- ✅ `getPostBySlug(slug: string): Promise<Post | null>` - Specialized, OK
- ⚠️ `getAllPosts(includeUnpublished?: boolean): Promise<Post[]>` - Should be `listPosts`
- ⚠️ `getLatestPost(): Promise<Post | null>` - Specialized function, OK
- ✅ `updatePost(id: string, updates: Partial<CreatePost>): Promise<void>`
- ✅ `deletePost(id: string): Promise<void>`

**Recommendations**:
- Consider renaming `getAllPosts` to `listPosts` for consistency
- Otherwise follows standard pattern well

---

### ⚠️ Players Service (`playerService.ts`)

**Status**: ⚠️ Partial CRUD - missing create/delete, has specialized operations

**Structure**: Split into focused modules (read, update, compare, utils)

**Functions**:
- ❌ No `createPlayer` - Players are created automatically when games are processed
- ✅ `getPlayerStats(name: string, filters?: PlayerSearchFilters): Promise<PlayerProfile | null>`
- ⚠️ `getAllPlayers(limit?: number): Promise<PlayerStats[]>` - Should be `listPlayers`
- ✅ `searchPlayers(searchTerm: string, limit?: number): Promise<PlayerStats[]>` - Specialized, OK
- ✅ `updatePlayerStats(gameId: string): Promise<void>` - Updates stats after game
- ❌ No `deletePlayer` - Players are not deleted (historical data)
- ✅ `comparePlayers(names: string[], filters?: PlayerSearchFilters): Promise<PlayerComparison>` - Specialized, OK

**Notes**:
- Players are auto-created, so no explicit create needed
- Players are not deleted (historical preservation)
- Has specialized operations (search, compare) which is appropriate
- Naming could be more consistent (`getAllPlayers` → `listPlayers`)

**Recommendations**:
- Consider renaming `getAllPlayers` to `listPlayers`
- Current structure is appropriate for the domain (players are derived data)

---

### ⚠️ Standings Service (`standingsService.ts`)

**Status**: ⚠️ Specialized service - not a standard CRUD entity

**Functions**:
- ✅ `getStandings(filters?: StandingsFilters): Promise<StandingsResponse>`

**Notes**:
- Standings are calculated/aggregated data, not a CRUD entity
- Current structure is appropriate
- No changes needed

---

### ⚠️ Scheduled Games Service (`scheduledGameService.ts`)

**Status**: ⚠️ Follows CRUD pattern but duplicates gameService functionality

**Functions**:
- ✅ `createScheduledGame(data: CreateScheduledGame): Promise<string>`
- ✅ `getScheduledGameById(id: string): Promise<ScheduledGame | null>`
- ⚠️ `getAllScheduledGames(includePast?: boolean, includeArchived?: boolean): Promise<ScheduledGame[]>`
- ✅ `updateScheduledGame(id: string, updates: Partial<CreateScheduledGame>): Promise<void>`
- ✅ `deleteScheduledGame(id: string): Promise<void>`

**Notes**:
- This service appears to be legacy/duplicate of `gameService.createScheduledGame`
- Scheduled games are now part of the unified `games` collection
- Should be consolidated into `gameService`

**Recommendations**:
- ⚠️ **High Priority**: Consolidate into `gameService` - scheduled games are now part of unified games collection
- Consider deprecating this service in favor of `gameService`

---

### ⚠️ Analytics Service (`analyticsService.ts`)

**Status**: ✅ Specialized service - not a standard CRUD entity

**Functions**:
- ✅ `getActivityData(filters?: ActivityFilters): Promise<ActivityData>`
- ✅ `getEloHistory(playerName: string, filters?: EloHistoryFilters): Promise<EloHistoryData>`
- ✅ `getWinRateData(filters?: WinRateFilters): Promise<WinRateData>`
- ✅ `getClassStats(category?: string): Promise<ClassStats[]>`
- ✅ `getGameLengthData(filters?: GameLengthFilters): Promise<GameLengthData>`
- ✅ `getPlayerActivityData(playerName: string, filters?: PlayerActivityFilters): Promise<PlayerActivityData>`
- ✅ `getClassSelectionData(filters?: ClassSelectionFilters): Promise<ClassSelectionData>`
- ✅ `getClassWinRateData(filters?: ClassWinRateFilters): Promise<ClassWinRateData>`

**Notes**:
- Analytics are calculated/aggregated data, not a CRUD entity
- Current structure is appropriate
- All functions follow consistent `get[DataType]` pattern
- No changes needed

---

### ⚠️ Archive Service (`archiveService.ts`)

**Status**: ⚠️ Partial CRUD - read-only operations

**Functions**:
- ✅ `getAllArchiveEntries(): Promise<ArchiveEntry[]>`

**Notes**:
- Archives are read-only (historical data)
- Missing `getArchiveEntryById` if needed
- Consider renaming to `listArchiveEntries` for consistency

**Recommendations**:
- Consider adding `getArchiveEntryById(id: string)` if single archive lookup is needed
- Consider renaming `getAllArchiveEntries` to `listArchiveEntries`

---

### ⚠️ User Data Service (`userDataService.ts`)

**Status**: ⚠️ Partial CRUD - missing standard operations

**Functions**:
- ✅ `getUserDataByDiscordId(discordId: string): Promise<UserData | null>`
- ✅ `saveUserData(data: CreateUserData): Promise<void>` - Acts as create/update

**Notes**:
- Uses `saveUserData` instead of separate `createUserData`/`updateUserData`
- This is appropriate for upsert pattern
- Missing `deleteUserData` if needed
- Missing `listUserData` if needed

**Recommendations**:
- Current pattern (upsert) is appropriate for user data
- Consider adding `deleteUserData` if user deletion is needed
- Consider adding `listUserData` if admin listing is needed

---

## Summary

### Services Following Standard CRUD Pattern ✅
1. **Games Service** - Excellent structure, split modules
2. **Entries Service** - Good, minor naming inconsistency
3. **Posts Service** - Good, minor naming inconsistency

### Services with Appropriate Variations ⚠️
1. **Players Service** - Auto-created, no delete (appropriate)
2. **Standings Service** - Aggregated data (appropriate)
3. **Analytics Service** - Calculated data (appropriate)
4. **Archive Service** - Read-only historical data (appropriate)
5. **User Data Service** - Upsert pattern (appropriate)

### Services Needing Attention ⚠️
1. **Scheduled Games Service** - Should be consolidated into gameService (HIGH PRIORITY)

---

## Standardization Recommendations

### High Priority

1. **Consolidate Scheduled Games Service**
   - Scheduled games are now part of unified `games` collection
   - `scheduledGameService.ts` duplicates `gameService` functionality
   - Action: Deprecate `scheduledGameService`, use `gameService` instead

### Medium Priority

2. **Standardize List Function Naming**
   - Current: `getAllEntries`, `getAllPosts`, `getAllPlayers`, `getAllScheduledGames`
   - Recommended: `listEntries`, `listPosts`, `listPlayers`, `listScheduledGames`
   - Action: Rename for consistency (or keep if widely used - document decision)

3. **Add Missing Operations**
   - `archiveService`: Add `getArchiveEntryById` if needed
   - `userDataService`: Add `deleteUserData` and `listUserData` if needed

### Low Priority

4. **Document Service Patterns**
   - Create guide for when to use upsert vs create/update
   - Document when services don't need full CRUD (auto-created, read-only, aggregated)

---

## Standardization Guide

### When to Use Full CRUD
- Entities that users can create, read, update, and delete
- Examples: Games, Entries, Posts

### When to Use Partial CRUD
- **Auto-created entities**: No `create` function (created automatically)
  - Example: Players (created when games are processed)
- **Read-only entities**: No `create`, `update`, or `delete` functions
  - Example: Archives (historical data)
- **Upsert pattern**: Single `save` function instead of separate `create`/`update`
  - Example: User Data (create or update in one operation)

### When CRUD Doesn't Apply
- **Aggregated/Calculated data**: Use specialized `get[DataType]` functions
  - Examples: Standings, Analytics
- **Derived data**: Data calculated from other entities
  - Examples: Player stats (derived from games)

---

## Implementation Checklist

- [ ] Consolidate scheduledGameService into gameService
- [ ] Document decision on `getAll*` vs `list*` naming convention
- [ ] Add missing operations to archiveService if needed
- [ ] Add missing operations to userDataService if needed
- [ ] Update CODE_COOKBOOK.md with service pattern guidelines
- [ ] Create service template for new services

---

## Related Documentation

- [CODE_COOKBOOK.md](./CODE_COOKBOOK.md) - CRUD Feature Pattern
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development workflow
- [schemas/firestore-collections.md](./schemas/firestore-collections.md) - Firestore schema

