# Firestore Indexes Inventory

**Last Updated**: 2025-01-15  
**Purpose**: Complete inventory of all Firestore queries requiring indexes, their current status, and priority

> **Reference**: See [COMPLETE_INDEX_REFERENCE.md](./COMPLETE_INDEX_REFERENCE.md) for detailed index specifications and [FIRESTORE_INDEXES.md](./FIRESTORE_INDEXES.md) for creation instructions.

---

## Summary

| Status | Count | Priority |
|--------|-------|----------|
| ✅ Created | 5 | Required |
| ❌ Missing | 3 | High/Medium |
| ⚠️ Using Fallback | 2 | Medium |

---

## Index Inventory by Collection

### Games Collection (`games`)

#### Index 1: Scheduled Games - Basic Ordering ✅
**Query Pattern**:
```typescript
.where('isDeleted', '==', false)
.where('gameState', '==', 'scheduled')
.orderBy('scheduledDateTime', 'asc')
```
**Fields**: `isDeleted` (Asc), `gameState` (Asc), `scheduledDateTime` (Asc)  
**Status**: ✅ Created  
**Priority**: Required  
**Location**: `src/features/modules/games/lib/gameService.read.ts` (line 148)  
**Fallback**: Yes (in-memory sort)

---

#### Index 2: Completed Games - Basic Ordering ✅
**Query Pattern**:
```typescript
.where('isDeleted', '==', false)
.where('gameState', '==', 'completed')
.orderBy('datetime', 'desc')
```
**Fields**: `isDeleted` (Asc), `gameState` (Asc), `datetime` (Desc)  
**Status**: ✅ Created  
**Priority**: Required  
**Location**: `src/features/modules/games/lib/gameService.read.ts` (line 166)  
**Fallback**: Yes (in-memory sort)

---

#### Index 3: Completed Games - With Category Filter ✅
**Query Pattern**:
```typescript
.where('isDeleted', '==', false)
.where('gameState', '==', 'completed')
.where('category', '==', category)
.orderBy('datetime', 'desc')
```
**Fields**: `isDeleted` (Asc), `gameState` (Asc), `category` (Asc), `datetime` (Desc)  
**Status**: ✅ Created  
**Priority**: Required  
**Location**: `src/features/modules/games/lib/gameService.read.ts` (line 159)  
**Fallback**: Yes (in-memory sort)

---

#### Index 4: All Games - Default Ordering (Optional) ❌
**Query Pattern**:
```typescript
.where('isDeleted', '==', false)
.orderBy('createdAt', 'desc')
```
**Fields**: `isDeleted` (Asc), `createdAt` (Desc)  
**Status**: ❌ Missing  
**Priority**: Optional (only if querying without `gameState` filter)  
**Location**: `src/features/modules/games/lib/gameService.read.ts` (line 179)  
**Fallback**: Yes (in-memory sort)  
**Note**: Currently only used when no `gameState` filter is provided

---

#### Index 5: Game ID Ordering - For Next Game ID ❌
**Query Pattern**:
```typescript
.orderBy('gameId', 'desc')
.limit(1)
```
**Fields**: `gameId` (Desc)  
**Status**: ❌ Missing  
**Priority**: Medium  
**Location**: `src/features/modules/games/lib/gameService.utils.ts` (line 39, 89)  
**Fallback**: Yes (fetches up to 1000 games, sorts in memory)  
**Impact**: Performance degradation when generating new game IDs  
**Action Required**: Create index to eliminate fallback

---

#### Index 6: Scheduled Games - Game ID Ordering ❌
**Query Pattern**:
```typescript
.where('gameState', '==', 'scheduled')
.orderBy('gameId', 'desc')
.limit(1)
```
**Fields**: `gameState` (Asc), `gameId` (Desc)  
**Status**: ❌ Missing  
**Priority**: Medium  
**Location**: `src/features/modules/scheduled-games/lib/scheduledGameService.ts` (line 68, 85)  
**Fallback**: No (query will fail if index missing)  
**Impact**: `getNextScheduledGameId()` will fail without index  
**Action Required**: Create index for scheduled game ID generation

---

### Posts Collection (`posts`)

#### Index 7: Published Posts - Ordered by Date ✅
**Query Pattern**:
```typescript
.where('published', '==', true)
.orderBy('date', 'desc')
```
**Fields**: `published` (Asc), `date` (Desc)  
**Status**: ✅ Created  
**Priority**: Required  
**Location**: `src/features/modules/blog/lib/postService.ts` (line 203, 277)  
**Fallback**: No

---

### Entries Collection (`entries`)

#### Index 8: Entries - Ordered by Date ⭐ REQUIRED ❌
**Query Pattern**:
```typescript
.where('isDeleted', '==', false)
.orderBy('date', 'desc')
```
**Fields**: `isDeleted` (Asc), `date` (Desc)  
**Status**: ❌ Missing  
**Priority**: ⭐ High (Required - query fails without index)  
**Location**: `src/features/modules/entries/lib/entryService.ts` (line 119-121, 155-156), `entryService.server.ts` (line 31-33)  
**Fallback**: Yes (fetches all entries, filters and sorts in memory - inefficient)  
**Error**: `FAILED_PRECONDITION: The query requires an index`  
**Action Required**: 
- The error message provides a direct link to create the index
- Or create manually: Collection `entries`, fields: `isDeleted` (Asc), `date` (Desc)
- See `docs/FIRESTORE_INDEXES.md` Index 12 for detailed instructions

---

#### Index 9: Entries - By Content Type ⭐ REQUIRED ❌
**Query Pattern**:
```typescript
.where('isDeleted', '==', false)
.where('contentType', '==', contentType)
.orderBy('date', 'desc')
```
**Fields**: `isDeleted` (Asc), `contentType` (Asc), `date` (Desc)  
**Status**: ❌ Missing  
**Priority**: ⭐ High (Required when filtering by contentType)  
**Location**: `src/features/modules/entries/lib/entryService.ts` (line 114-121 with contentType, 159-161)  
**Fallback**: Yes (falls back to Index 8 query, then filters in memory - inefficient)  
**Action Required**: 
- Create manually: Collection `entries`, fields: `isDeleted` (Asc), `contentType` (Asc), `date` (Desc)
- See `docs/FIRESTORE_INDEXES.md` Index 13 for detailed instructions

---

### Player Stats Collection (`playerStats`)

#### Index 10: Players - Ordered by Name (Simple) ⚠️
**Query Pattern**:
```typescript
.orderBy('name')
.limit(limit)
```
**Fields**: `name` (Asc)  
**Status**: ⚠️ May need index (simple orderBy, but Firestore may require it)  
**Priority**: Low  
**Location**: `src/features/modules/players/lib/playerService.read.ts` (line 138, 163)  
**Fallback**: No  
**Note**: Simple orderBy queries typically don't require indexes unless combined with where clauses, but should be verified

---

### Player Category Stats Collection (`playerCategoryStats`)

#### Index 11: Standings by Category - Basic Query ⭐ REQUIRED ❌
**Query Pattern**:
```typescript
.where('category', '==', category)
.where('games', '>=', minGames)
// Note: Sorting by score happens in-memory after fetch
```
**Fields**: `category` (Asc), `games` (Asc), `score` (Desc)  
**Status**: ❌ Missing  
**Priority**: ⭐ High (Required for standings optimization)  
**Location**: `src/features/modules/standings/lib/standingsService.ts` (line 80-81)  
**Fallback**: Yes (fetches all, sorts in memory)  
**Impact**: Performance degradation with large player bases  
**Action Required**: Create index to enable efficient querying and sorting

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

### High Priority (Required for Performance)

1. **Index 8**: `entries` - `isDeleted` (Asc), `date` (Desc)
   - **Why**: Query fails with `FAILED_PRECONDITION` error, currently using inefficient fallback
   - **Action**: Use error link or create manually (see Index 12 in `FIRESTORE_INDEXES.md`)

2. **Index 9**: `entries` - `isDeleted` (Asc), `contentType` (Asc), `date` (Desc)
   - **Why**: Required when filtering entries by contentType, currently using inefficient fallback
   - **Action**: Create manually (see Index 13 in `FIRESTORE_INDEXES.md`)

3. **Index 11**: `playerCategoryStats` - `category` (Asc), `games` (Asc), `score` (Desc)
   - **Why**: Required for standings optimization, currently using inefficient fallback
   - **Impact**: High - affects standings page performance

### Medium Priority (Improve Performance)

2. **Index 5**: `games` - `gameId` (Desc)
   - **Why**: Eliminates fallback in `getNextGameId()`, improves game creation performance
   - **Impact**: Medium - affects game creation speed

3. **Index 6**: `games` - `gameState` (Asc), `gameId` (Desc)
   - **Why**: Required for `getNextScheduledGameId()`, currently may fail
   - **Impact**: Medium - affects scheduled game creation

### Low Priority (Optional)

4. **Index 8**: `entries` - `isDeleted` (Asc), `date` (Desc)
   - **Why**: Only needed if entries feature is actively used
   - **Impact**: Low - only affects entries listing

5. **Index 9**: `entries` - `isDeleted` (Asc), `contentType` (Asc), `date` (Desc)
   - **Why**: Only needed if filtering entries by content type
   - **Impact**: Low - only affects filtered entries queries

6. **Index 4**: `games` - `isDeleted` (Asc), `createdAt` (Desc)
   - **Why**: Only needed if querying games without `gameState` filter
   - **Impact**: Low - rarely used query pattern

---

## Query Analysis by Service

### `gameService.read.ts`
- **Queries**: 3 main query patterns (scheduled, completed, all games)
- **Indexes Needed**: 3 created, 1 optional missing
- **Fallback Logic**: Yes, handles missing indexes gracefully

### `gameService.utils.ts`
- **Queries**: 1 query pattern (`orderBy('gameId', 'desc')`)
- **Indexes Needed**: 1 missing (Index 5)
- **Fallback Logic**: Yes, but inefficient

### `scheduledGameService.ts`
- **Queries**: 1 query pattern (`where('gameState', '==', 'scheduled').orderBy('gameId', 'desc')`)
- **Indexes Needed**: 1 missing (Index 6)
- **Fallback Logic**: No (will fail if index missing)

### `standingsService.ts`
- **Queries**: 1 query pattern (`where('category', '==', category).where('games', '>=', minGames)`)
- **Indexes Needed**: 1 missing (Index 11) - HIGH PRIORITY
- **Fallback Logic**: Yes, but inefficient

### `playerService.read.ts`
- **Queries**: 1 query pattern (`orderBy('name')`)
- **Indexes Needed**: May need simple index (verify)
- **Fallback Logic**: No

### `entryService.ts` / `entryService.server.ts`
- **Queries**: 2 query patterns (with/without contentType filter)
- **Indexes Needed**: 2 optional missing (Indexes 8-9)
- **Fallback Logic**: No (queries may fail)

### `postService.ts`
- **Queries**: 1 query pattern (`where('published', '==', true).orderBy('date', 'desc')`)
- **Indexes Needed**: 1 created (Index 7)
- **Fallback Logic**: No

---

## Recommendations

1. **Immediate Action**: Create Index 11 (`playerCategoryStats`) - Required for standings optimization
2. **Short-term**: Create Index 5 and Index 6 for game ID queries - Improves game creation performance
3. **Long-term**: Monitor query performance and create optional indexes as needed based on usage patterns
4. **Best Practice**: Document all new queries and their index requirements before implementation

---

## Notes

- **Fallback Logic**: Some services have fallback logic that works without indexes but is inefficient
- **Query Failures**: Some queries will fail without indexes (no fallback), causing runtime errors
- **Performance Impact**: Missing indexes cause performance degradation, especially with large datasets
- **Index Building**: Indexes can take several minutes to build in Firebase Console
- **Field Order**: Index field order must match query field order exactly

---

## Related Documentation

- [COMPLETE_INDEX_REFERENCE.md](./COMPLETE_INDEX_REFERENCE.md) - Detailed index specifications
- [FIRESTORE_INDEXES.md](./FIRESTORE_INDEXES.md) - Step-by-step index creation guide
- [FIRESTORE_INDEXES_EXPLAINED.md](./FIRESTORE_INDEXES_EXPLAINED.md) - Understanding how indexes work

