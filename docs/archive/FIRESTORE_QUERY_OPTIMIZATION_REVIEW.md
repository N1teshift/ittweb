# Firestore Query Optimization Review

**Date**: 2025-01-28  
**Status**: Review Complete  
**Priority**: Medium

## Summary

This document reviews Firestore query patterns across the codebase and provides optimization recommendations. The review focuses on `gameService.getGames()`, `playerService` queries, and `standingsService` queries.

---

## Current Query Patterns

### 1. `gameService.getGames()` - Game List Queries

**File**: `src/features/modules/games/lib/gameService.read.ts`

#### Query Patterns Identified:

1. **Scheduled Games Query**:
   ```typescript
   .where('isDeleted', '==', false)
   .where('gameState', '==', 'scheduled')
   .where('scheduledDateTime', '>=', startDate)  // Optional
   .where('scheduledDateTime', '<=', endDate)    // Optional
   .orderBy('scheduledDateTime', 'asc')
   ```

2. **Completed Games Query**:
   ```typescript
   .where('isDeleted', '==', false)
   .where('gameState', '==', 'completed')
   .where('datetime', '>=', startDate)  // Optional
   .where('datetime', '<=', endDate)    // Optional
   .where('category', '==', category)    // Optional
   .orderBy('datetime', 'desc')
   ```

3. **All Games Query (no gameState)**:
   ```typescript
   .where('isDeleted', '==', false)
   .orderBy('createdAt', 'desc')
   ```

#### Current Issues:

1. **Fallback Logic**: Queries have fallback logic that removes `orderBy` and fetches `limit * 2` documents, then sorts in memory. This is inefficient but necessary when indexes are missing.

2. **Player Filtering**: Player name filtering (line 274-280) is commented out and not implemented. This would require fetching players subcollection for each game, which is very inefficient.

3. **Missing Indexes**: Several composite indexes are required but may be missing:
   - `isDeleted` (Asc) + `gameState` (Asc) + `scheduledDateTime` (Asc)
   - `isDeleted` (Asc) + `gameState` (Asc) + `datetime` (Desc)
   - `isDeleted` (Asc) + `gameState` (Asc) + `category` (Asc) + `datetime` (Desc)
   - `isDeleted` (Asc) + `createdAt` (Desc)

4. **Data Fetched**: Currently fetches full game documents. Could optimize by using field selection if only specific fields are needed.

#### Optimization Opportunities:

1. **✅ Already Implemented**: Fallback logic handles missing indexes gracefully
2. **⚠️ Needs Work**: Player filtering is not implemented - consider denormalizing player names to game document
3. **⚠️ Needs Work**: Create missing composite indexes (see `docs/FIRESTORE_INDEXES.md`)
4. **💡 Future Enhancement**: Use field selection for list views (only fetch fields needed for cards)

---

### 2. `playerService` - Player Queries

**File**: `src/features/modules/players/lib/playerService.read.ts`

#### Query Patterns Identified:

1. **Get Player Stats** (by document ID):
   ```typescript
   // Direct document lookup - very efficient
   .doc(normalizedName).get()
   ```

2. **Get All Players**:
   ```typescript
   .orderBy('name')
   .limit(limit)
   ```

3. **Search Players**:
   ```typescript
   .where('name', '>=', searchTerm)
   .where('name', '<=', searchTerm + '\uf8ff')
   .orderBy('name')
   .limit(20)
   ```

#### Current Issues:

1. **Client-side limit**: In `getAllPlayers()` (line 164), the `limit()` is commented out for client-side queries, and results are sliced in memory. This is inefficient but may be due to Firestore SDK limitations.

2. **Search Query**: The search query uses prefix matching which is efficient, but requires an index on `name`.

3. **Recent Games**: When `includeGames` is true, `getPlayerStats()` calls `getGames()` which may fetch many games. This could be optimized with a dedicated query.

#### Optimization Opportunities:

1. **✅ Already Optimized**: Direct document lookup for player stats is optimal
2. **⚠️ Minor Issue**: Client-side limit handling could be improved
3. **💡 Future Enhancement**: Cache recent games or use a dedicated query with better filters
4. **💡 Future Enhancement**: Consider pagination for `getAllPlayers()` if player count grows large

---

### 3. `standingsService` - Standings Queries

**File**: `src/features/modules/standings/lib/standingsService.ts`

#### Query Pattern:

```typescript
.where('category', '==', category)
.where('games', '>=', minGames)
// Sorting happens in memory after fetch
```

#### Current Issues:

1. **In-Memory Sorting**: All matching documents are fetched and sorted in memory (line 88-95). This is inefficient for large player bases.

2. **Missing Index**: The query requires a composite index:
   - `category` (Asc) + `games` (Asc) + `score` (Desc)
   - Currently documented as missing in `docs/FIRESTORE_INDEXES_INVENTORY.md` (Index 11)

3. **No Limit**: Query fetches all matching documents without limit, which could be problematic with thousands of players.

#### Optimization Opportunities:

1. **🔴 High Priority**: Create composite index for standings query (Index 11)
2. **⚠️ Needs Work**: Add limit to query to prevent fetching too many documents
3. **💡 Future Enhancement**: Use Firestore's native sorting when index is available
4. **💡 Future Enhancement**: Consider cursor-based pagination for standings

---

## Index Status

### Required Indexes (from `docs/FIRESTORE_INDEXES_INVENTORY.md`):

#### High Priority (Missing):
1. **Index 8**: `entries` - `isDeleted` (Asc), `date` (Desc) - ✅ Documented
2. **Index 9**: `entries` - `isDeleted` (Asc), `contentType` (Asc), `date` (Desc) - ✅ Documented
3. **Index 11**: `playerCategoryStats` - `category` (Asc), `games` (Asc), `score` (Desc) - ⚠️ **MISSING**

#### Medium Priority (May be missing):
4. **Index 5**: `games` - `gameId` (Desc) - For `getNextGameId()` optimization
5. **Index 6**: `games` - `gameState` (Asc), `gameId` (Desc) - For scheduled games ordering

#### Existing Indexes (from `docs/FIRESTORE_INDEXES.md`):
- Index 1-4: Games collection indexes (scheduled/completed games)
- Index 7: Posts collection index
- Index 10: Player category stats (wrong field order - needs fixing)

---

## Recommendations

### Immediate Actions (High Priority)

1. **Create Missing Standings Index** (Index 11):
   - Collection: `playerCategoryStats`
   - Fields: `category` (Asc), `games` (Asc), `score` (Desc)
   - **Impact**: Eliminates in-memory sorting for standings, improves performance significantly
   - **Action**: Create in Firebase Console (see `docs/FIRESTORE_INDEXES.md`)

2. **Create Missing Entries Indexes** (Index 8 & 9):
   - Already documented in task list
   - **Action**: Use error link from Firestore or create manually

### Short-term Improvements (Medium Priority)

3. **Add Limit to Standings Query**:
   ```typescript
   // In standingsService.ts, add limit before fetching
   const standingsQuery = adminDb
     .collection(PLAYER_CATEGORY_STATS_COLLECTION)
     .where('category', '==', category)
     .where('games', '>=', minGames)
     .orderBy('score', 'desc')  // After index is created
     .limit(pageLimit * 2);  // Fetch more for pagination
   ```

4. **Fix Client-side Limit in `getAllPlayers()`**:
   ```typescript
   // In playerService.read.ts, ensure limit is applied
   const playersQuery = query(
     collection(db, PLAYER_STATS_COLLECTION),
     orderBy('name'),
     limit(limit)  // Add limit back
   );
   ```

5. **Implement Player Name Filtering in Games**:
   - Option A: Denormalize player names to game document (`playerNames` array)
   - Option B: Use array-contains query (requires index)
   - Option C: Keep current approach but optimize with proper indexing

### Long-term Enhancements (Low Priority)

6. **Field Selection for List Views**:
   - Use Firestore field selection to fetch only needed fields for game cards
   - Reduces data transfer and improves performance

7. **Cursor-based Pagination**:
   - Implement proper cursor-based pagination for games list
   - Currently partially implemented (cursor field exists but not used)

8. **Query Result Caching**:
   - Consider caching frequently accessed queries (standings, recent games)
   - Use React Query or similar for client-side caching

9. **Batch Queries**:
   - For `getPlayerStats()` with `includeGames`, use a dedicated query instead of calling `getGames()`
   - Could use a games subcollection or denormalized player games list

---

## Performance Metrics to Monitor

1. **Query Latency**: Monitor average query response times
2. **Index Usage**: Check Firebase Console for index usage statistics
3. **Fallback Frequency**: Log when fallback queries are used (indicates missing indexes)
4. **Document Reads**: Monitor Firestore read counts to identify expensive queries
5. **In-Memory Sort Frequency**: Track how often in-memory sorting is used

---

## Testing Recommendations

1. **Load Testing**: Test queries with large datasets (1000+ games, 100+ players)
2. **Index Verification**: Verify all required indexes exist and are enabled
3. **Fallback Testing**: Test queries when indexes are missing/building
4. **Performance Profiling**: Profile query execution times in production

---

## Related Documentation

- [Firestore Indexes Documentation](./FIRESTORE_INDEXES.md) - Index creation guide
- [Firestore Indexes Inventory](./FIRESTORE_INDEXES_INVENTORY.md) - Current index status
- [Backend Agent Tasks](../.workflow/tasks/backend-agent-tasks.md) - Task tracking

---

## Conclusion

The current query implementation is **generally well-optimized** with good fallback logic. The main optimization opportunities are:

1. **Create missing indexes** (especially Index 11 for standings)
2. **Add limits to queries** that fetch all documents
3. **Implement player name filtering** in games queries (requires denormalization or indexing)

Most queries already have fallback logic to handle missing indexes gracefully, which is good for development but should be replaced with proper indexes for production.

