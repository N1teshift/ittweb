# Firestore Indexes Inventory

**Last Updated**: 2025-01-15  
**Purpose**: Complete inventory of all Firestore queries requiring indexes, their current status, and priority

> **Reference**: See [FIRESTORE_INDEXES.md](./FIRESTORE_INDEXES.md) for complete index reference and creation instructions.

---

## Summary

| Status | Count | Priority |
|--------|-------|----------|
| ✅ Created | 7 | Required |
| ❌ Missing | 0 | - |
| ⚠️ Using Fallback | 1 | Low |

---

## Index Inventory by Collection

### Games Collection (`games`)

#### Index 1: Scheduled Games - Basic Ordering ✅
**Fields**: `isDeleted` (Asc), `gameState` (Asc), `scheduledDateTime` (Asc)  
**Status**: ✅ Created  
**Priority**: Required  
**Location**: `src/features/modules/games/lib/gameService.read.ts` (line 148)  
**Fallback**: Yes (in-memory sort)  
**Reference**: See [FIRESTORE_INDEXES.md](./FIRESTORE_INDEXES.md#index-1-scheduled-games---basic-ordering) for query pattern and creation instructions

---

#### Index 2: Completed Games - Basic Ordering ✅
**Fields**: `isDeleted` (Asc), `gameState` (Asc), `datetime` (Desc)  
**Status**: ✅ Created  
**Priority**: Required  
**Location**: `src/features/modules/games/lib/gameService.read.ts` (line 166)  
**Fallback**: Yes (in-memory sort)  
**Reference**: See [FIRESTORE_INDEXES.md](./FIRESTORE_INDEXES.md#index-3-completed-games---basic-ordering) for query pattern and creation instructions

---

#### Index 3: Completed Games - With Category Filter ✅
**Fields**: `isDeleted` (Asc), `gameState` (Asc), `category` (Asc), `datetime` (Desc)  
**Status**: ✅ Created  
**Priority**: Required  
**Location**: `src/features/modules/games/lib/gameService.read.ts` (line 159)  
**Fallback**: Yes (in-memory sort)  
**Reference**: See [FIRESTORE_INDEXES.md](./FIRESTORE_INDEXES.md#index-4-completed-games---with-category-filter) for query pattern and creation instructions

---

#### Index 4: All Games - Default Ordering (Optional) ❌
**Fields**: `isDeleted` (Asc), `createdAt` (Desc)  
**Status**: ❌ Missing  
**Priority**: Optional (only if querying without `gameState` filter)  
**Location**: `src/features/modules/games/lib/gameService.read.ts` (line 179)  
**Fallback**: Yes (in-memory sort)  
**Note**: Currently only used when no `gameState` filter is provided  
**Reference**: See [FIRESTORE_INDEXES.md](./FIRESTORE_INDEXES.md#index-8-all-games---default-ordering) for query pattern and creation instructions

---

#### Index 5: Game ID Ordering - For Next Game ID ⚠️ Auto-Created
**Fields**: `gameId` (Desc)  
**Status**: ⚠️ Auto-created by Firestore (single-field index)  
**Priority**: Low  
**Location**: `src/features/modules/games/lib/gameService.utils.ts` (line 39, 89)  
**Fallback**: Yes (fetches up to 1000 games, sorts in memory)  
**Note**: Firestore automatically creates single-field indexes when queries are executed. The Firebase Console UI doesn't allow manual creation of single-field indexes, but the index exists automatically if the query works. If `getNextGameId()` is working without fallback errors, the index is already active.  
**Reference**: See [FIRESTORE_INDEXES.md](./FIRESTORE_INDEXES.md#index-5-game-id-ordering---for-next-game-id) for query pattern and creation instructions

---

#### Index 6: Scheduled Games - Game ID Ordering ❌
**Fields**: `gameState` (Asc), `gameId` (Desc)  
**Status**: ❌ Missing  
**Priority**: Medium  
**Location**: `src/features/modules/scheduled-games/lib/scheduledGameService.ts` (line 68, 85)  
**Fallback**: No (query will fail if index missing)  
**Impact**: `getNextScheduledGameId()` will fail without index  
**Reference**: See [FIRESTORE_INDEXES.md](./FIRESTORE_INDEXES.md#index-6-scheduled-games---game-id-ordering) for query pattern and creation instructions

---

### Posts Collection (`posts`)

#### Index 7: Published Posts - Ordered by Date ✅
**Fields**: `published` (Asc), `date` (Desc)  
**Status**: ✅ Created  
**Priority**: Required  
**Location**: `src/features/modules/blog/lib/postService.ts` (line 203, 277)  
**Fallback**: No  
**Reference**: See [FIRESTORE_INDEXES.md](./FIRESTORE_INDEXES.md#index-9-published-posts---ordered-by-date) for query pattern and creation instructions

---

### Entries Collection (`entries`)

#### Index 8: Entries - Ordered by Date ✅
**Fields**: `isDeleted` (Asc), `date` (Desc)  
**Status**: ✅ Created  
**Priority**: Required  
**Location**: `src/features/modules/entries/lib/entryService.ts` (line 119-121, 155-156), `entryService.server.ts` (line 31-33)  
**Fallback**: Yes (fetches all entries, filters and sorts in memory - inefficient)  
**Note**: Index created - queries should now use indexed queries instead of fallback  
**Reference**: See [FIRESTORE_INDEXES.md](./FIRESTORE_INDEXES.md#index-12-entries---ordered-by-date) for query pattern and creation instructions

---

#### Index 9: Entries - By Content Type ✅
**Fields**: `isDeleted` (Asc), `contentType` (Asc), `date` (Desc)  
**Status**: ✅ Created  
**Priority**: Required when filtering by contentType  
**Location**: `src/features/modules/entries/lib/entryService.ts` (line 114-121 with contentType, 159-161)  
**Fallback**: Yes (falls back to Index 8 query, then filters in memory - inefficient)  
**Note**: Index created - queries should now use indexed queries instead of fallback  
**Reference**: See [FIRESTORE_INDEXES.md](./FIRESTORE_INDEXES.md#index-13-entries---by-content-type) for query pattern and creation instructions

---

### Player Stats Collection (`playerStats`)

#### Index 10: Players - Ordered by Name (Simple) ⚠️
**Fields**: `name` (Asc)  
**Status**: ⚠️ May need index (simple orderBy, but Firestore may require it)  
**Priority**: Low  
**Location**: `src/features/modules/players/lib/playerService.read.ts` (line 138, 163)  
**Fallback**: No  
**Note**: Simple orderBy queries typically don't require indexes unless combined with where clauses, but should be verified

---

### Player Category Stats Collection (`playerCategoryStats`)

#### Index 11: Standings by Category - Basic Query ✅
**Fields**: `category` (Asc), `games` (Asc), `score` (Desc)  
**Status**: ✅ Created  
**Priority**: Required for standings optimization  
**Location**: `src/features/modules/standings/lib/standingsService.ts` (line 85-90, 142-147)  
**Fallback**: Yes (fetches all, sorts in memory)  
**Note**: Index created - `getStandings()` should now use indexed queries instead of fallback  
**Reference**: See [FIRESTORE_INDEXES.md](./FIRESTORE_INDEXES.md#index-10-standings-by-category---basic-query) for query pattern and creation instructions

---

## Queries Using Fallback Logic

The following queries have fallback logic to handle missing indexes:

1. **`getNextGameId()`** - `gameService.utils.ts`
   - Fallback: Fetches up to 1000 games, sorts in memory
   - Impact: Performance issue with large game collections

2. **`getGames()`** - `gameService.read.ts`
   - Fallback: Removes `orderBy`, fetches more results, sorts in memory
   - Impact: Performance issue, may return incorrect results if limit exceeded

3. **`getStandings()`** - `standingsService.ts`
   - Fallback: Fetches all matching documents, sorts in memory
   - Impact: Performance degradation with large player bases

---

## Priority Actions

### ✅ All Critical Indexes Created

All required indexes (8, 9, and 11) have been created. The system should now use indexed queries instead of fallback logic.

### Notes on Index 5 (Single-Field Index)

**Index 5**: `games` - `gameId` (Desc) - Single-field index

**Status**: ⚠️ Auto-created by Firestore

**Why you couldn't create it manually**:
- Firestore automatically creates single-field indexes when you execute queries
- The Firebase Console UI doesn't allow manual creation of single-field indexes (requires at least 2 fields for composite indexes)
- If `getNextGameId()` is working without errors, the index already exists automatically

**How to verify**:
1. Run `getNextGameId()` and check logs
2. If you see "Missing Firestore index" warnings, the auto-created index may not be active yet
3. If no warnings appear, the index is working correctly

**If fallback is still being used**:
- The query might need to be executed once to trigger auto-creation
- Wait a few minutes after first execution for the index to build
- Check Firebase Console → Indexes tab to see if a single-field index on `gameId` appears

---

## Query Analysis by Service

### `gameService.read.ts`
- **Queries**: 3 main query patterns (scheduled, completed, all games)
- **Indexes Needed**: 3 created, 1 optional missing
- **Fallback Logic**: Yes, handles missing indexes gracefully

### `gameService.utils.ts`
- **Queries**: 1 query pattern (`orderBy('gameId', 'desc')`)
- **Indexes Needed**: 1 auto-created (Index 5) ⚠️
- **Fallback Logic**: Yes, but inefficient (may still be used if auto-created index not active)

### `scheduledGameService.ts`
- **Queries**: 1 query pattern (`where('gameState', '==', 'scheduled').orderBy('gameId', 'desc')`)
- **Indexes Needed**: 1 missing (Index 6)
- **Fallback Logic**: No (will fail if index missing)

### `standingsService.ts`
- **Queries**: 1 query pattern (`where('category', '==', category).where('games', '>=', minGames).orderBy('score', 'desc')`)
- **Indexes Needed**: 1 created (Index 11) ✅
- **Fallback Logic**: Yes, but inefficient (should no longer be used)

### `playerService.read.ts`
- **Queries**: 1 query pattern (`orderBy('name')`)
- **Indexes Needed**: May need simple index (verify)
- **Fallback Logic**: No

### `entryService.ts` / `entryService.server.ts`
- **Queries**: 2 query patterns (with/without contentType filter)
- **Indexes Needed**: 2 created (Indexes 8-9) ✅
- **Fallback Logic**: Yes (should no longer be used)

### `postService.ts`
- **Queries**: 1 query pattern (`where('published', '==', true).orderBy('date', 'desc')`)
- **Indexes Needed**: 1 created (Index 7)
- **Fallback Logic**: No

---

## Recommendations

1. ✅ **Completed**: All critical indexes (8, 9, 11) have been created
2. **Monitor Performance**: Check logs to verify queries are using indexes instead of fallback logic
3. **Verify Index 5**: If `getNextGameId()` still uses fallback, execute the query once to trigger auto-creation
4. **Long-term**: Monitor query performance and create optional indexes as needed based on usage patterns
5. **Best Practice**: Document all new queries and their index requirements before implementation

---

## Notes

- **Fallback Logic**: Some services have fallback logic that works without indexes but is inefficient
- **Query Failures**: Some queries will fail without indexes (no fallback), causing runtime errors
- **Performance Impact**: Missing indexes cause performance degradation, especially with large datasets
- **Index Building**: Indexes can take several minutes to build in Firebase Console
- **Field Order**: Index field order must match query field order exactly

---

## Related Documentation

- [FIRESTORE_INDEXES.md](./FIRESTORE_INDEXES.md) - Complete index reference with query patterns and creation instructions
- [FIRESTORE_INDEXES_EXPLAINED.md](./FIRESTORE_INDEXES_EXPLAINED.md) - Understanding how indexes work
- [FIRESTORE_INDEXES_SETUP_GUIDE.md](./FIRESTORE_INDEXES_SETUP_GUIDE.md) - Step-by-step setup instructions for specific indexes

