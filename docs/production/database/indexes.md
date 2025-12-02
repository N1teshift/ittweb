# Firestore Indexes

**Purpose**: Complete guide to all Firestore indexes required for ITT Web.

## Quick Start

Firestore requires **composite indexes** for queries that combine:
- Multiple `where` clauses on different fields
- A `where` clause with `orderBy` on a different field
- Multiple `orderBy` clauses

**Without indexes**: Queries fail or use slow fallback logic (fetches all documents, sorts in memory).

**Status**: All critical indexes are created. See [Current Status](#current-status) below.

---

## Understanding Indexes

Each index supports **one specific query pattern**. The index fields must **exactly match** your query's field order and sort direction.

**Example:**
- Query: `WHERE isDeleted=false AND gameState='scheduled' ORDER BY scheduledDateTime ASC`
- Needs index: `[isDeleted, gameState, scheduledDateTime]` (all Ascending)

**Key Rules:**
1. **Field order matters** - Must match query exactly
2. **Sort direction matters** - Asc/Desc must match
3. **One index = one pattern** - Can't reuse one index for different patterns

**Range queries on the `orderBy` field are "free"** - they don't need separate indexes.

---

## How to Create Indexes

### Method 1: Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/) → Your Project
2. Navigate to **Firestore Database** → **Indexes** tab
3. Click **"Create Index"**
4. Add fields **in the exact order** shown in the index reference below
5. Set sort direction (Ascending/Descending) for each field
6. Click **"Create"** and wait for it to build (1-30 minutes depending on data size)

### Method 2: Error Link (Automatic)

When a query fails due to missing index, Firestore provides a link in the error message:
1. Run your application and trigger the query
2. Check error message for a link like: `https://console.firebase.google.com/.../indexes?create_composite=...`
3. Click the link - it pre-populates the index form
4. Click **"Create Index"**

---

## Complete Index Reference

### Games Collection (`games`)

#### Index 1: Scheduled Games
**Fields**: `isDeleted` (Asc), `gameState` (Asc), `scheduledDateTime` (Asc)  
**Query**: `WHERE isDeleted=false AND gameState='scheduled' ORDER BY scheduledDateTime ASC`  
**Priority**: Required  
**Location**: `src/features/modules/games/lib/gameService.read.ts` (line 148)

#### Index 3: Completed Games
**Fields**: `isDeleted` (Asc), `gameState` (Asc), `datetime` (Desc)  
**Query**: `WHERE isDeleted=false AND gameState='completed' ORDER BY datetime DESC`  
**Priority**: Required  
**Location**: `src/features/modules/games/lib/gameService.read.ts` (line 166)

#### Index 4: Completed Games by Category
**Fields**: `isDeleted` (Asc), `gameState` (Asc), `category` (Asc), `datetime` (Desc)  
**Query**: `WHERE isDeleted=false AND gameState='completed' AND category='1v1' ORDER BY datetime DESC`  
**Priority**: Required  
**Location**: `src/features/modules/games/lib/gameService.read.ts` (line 159)

#### Index 5: Game ID Ordering
**Fields**: `gameId` (Desc)  
**Query**: `ORDER BY gameId DESC LIMIT 1`  
**Priority**: Recommended  
**Status**: Auto-created by Firestore (single-field index)  
**Location**: `src/features/modules/games/lib/gameService.utils.ts` (lines 39, 89)  
**Note**: Firestore automatically creates single-field indexes. If query works, index exists.

#### Index 6: Scheduled Games - Game ID
**Fields**: `gameState` (Asc), `gameId` (Desc)  
**Query**: `WHERE gameState='scheduled' ORDER BY gameId DESC LIMIT 1`  
**Priority**: Required  
**Location**: `src/features/modules/scheduled-games/lib/scheduledGameService.ts` (lines 68, 85)

#### Index 8: All Games (No gameState filter)
**Fields**: `isDeleted` (Asc), `createdAt` (Desc)  
**Query**: `WHERE isDeleted=false ORDER BY createdAt DESC`  
**Priority**: Optional  
**Location**: `src/features/modules/games/lib/gameService.read.ts` (line 179)

---

### Posts Collection (`posts`)

#### Index 9: Published Posts
**Fields**: `published` (Asc), `date` (Desc)  
**Query**: `WHERE published=true ORDER BY date DESC`  
**Priority**: Required  
**Location**: `src/features/modules/blog/lib/postService.ts` (lines 203, 277)

---

### Player Category Stats Collection (`playerCategoryStats`)

> **Note**: This denormalized collection optimizes standings queries. Created 2025-01-15.

#### Index 10: Standings by Category
**Fields**: `category` (Asc), `games` (Asc), `score` (Desc)  
**Query**: `WHERE category='1v1' AND games>=10 ORDER BY score DESC`  
**Priority**: Required  
**Location**: `src/features/modules/standings/lib/standingsService.ts` (lines 85-90, 142-147)

#### Index 11: Standings - Alternative Sorting (Optional)
**Fields**: `category` (Asc), `games` (Desc), `score` (Desc)  
**Query**: `WHERE category='default' ORDER BY games DESC, score DESC`  
**Priority**: Optional  
**Note**: Only needed if sorting by games count first.

---

### Entries Collection (`entries`)

#### Index 12: Entries by Date
**Fields**: `isDeleted` (Asc), `date` (Desc)  
**Query**: `WHERE isDeleted=false ORDER BY date DESC`  
**Priority**: Optional  
**Location**: `src/features/modules/entries/lib/entryService.ts` (lines 119-121, 155-156)

#### Index 13: Entries by Content Type
**Fields**: `isDeleted` (Asc), `contentType` (Asc), `date` (Desc)  
**Query**: `WHERE isDeleted=false AND contentType='post' ORDER BY date DESC`  
**Priority**: Optional  
**Location**: `src/features/modules/entries/lib/entryService.ts` (lines 114-121, 159-161)

---

## Quick Reference Table

| Index | Collection | Fields | Priority | Status |
|-------|-----------|--------|----------|--------|
| 1 | `games` | `isDeleted` (Asc), `gameState` (Asc), `scheduledDateTime` (Asc) | Required | ✅ Created |
| 3 | `games` | `isDeleted` (Asc), `gameState` (Asc), `datetime` (Desc) | Required | ✅ Created |
| 4 | `games` | `isDeleted` (Asc), `gameState` (Asc), `category` (Asc), `datetime` (Desc) | Required | ✅ Created |
| 5 | `games` | `gameId` (Desc) | Recommended | ⚠️ Auto-created |
| 6 | `games` | `gameState` (Asc), `gameId` (Desc) | Required | ❌ Missing |
| 8 | `games` | `isDeleted` (Asc), `createdAt` (Desc) | Optional | ❌ Missing |
| 9 | `posts` | `published` (Asc), `date` (Desc) | Required | ✅ Created |
| 10 | `playerCategoryStats` | `category` (Asc), `games` (Asc), `score` (Desc) | Required | ✅ Created |
| 11 | `playerCategoryStats` | `category` (Asc), `games` (Desc), `score` (Desc) | Optional | ❌ Missing |
| 12 | `entries` | `isDeleted` (Asc), `date` (Desc) | Optional | ✅ Created |
| 13 | `entries` | `isDeleted` (Asc), `contentType` (Asc), `date` (Desc) | Optional | ✅ Created |

**Note**: Index 2 and 7 use the same indexes as 1 and 3 respectively (range filters on `orderBy` field don't need separate indexes).

---

## Current Status

**Last Updated**: 2025-01-15

### Summary
- ✅ **Created**: 7 required indexes
- ❌ **Missing**: 1 required index (Index 6)
- ⚠️ **Auto-created**: 1 index (Index 5 - single-field)
- ⚪ **Optional**: 3 indexes (Indexes 8, 11, 12, 13)

### Priority Actions

**High Priority:**
- **Index 6** (`games` - `gameState` + `gameId`) - Required for `getNextScheduledGameId()`. Query will fail without this index.

**Low Priority:**
- **Index 8** (`games` - `isDeleted` + `createdAt`) - Only needed when querying without `gameState` filter
- **Index 11** (`playerCategoryStats` - alternative sorting) - Only needed for alternative standings views
- **Index 12/13** (`entries`) - Optional, improves performance but has fallback logic

---

## Performance Notes

### Fallback Logic

Some queries have fallback logic that works without indexes but is inefficient:

1. **`getNextGameId()`** - Fetches up to 1000 games, sorts in memory
2. **`getGames()`** - Removes `orderBy`, fetches more results, sorts in memory
3. **`getStandings()`** - Fetches all matching documents, sorts in memory

**Impact**: Performance degrades as data grows. With 10,000+ documents, queries can take 5-10 seconds instead of 200-500ms.

### Index Building Time

- **Small collections** (< 1,000 docs): 1-5 minutes
- **Medium collections** (1,000-10,000 docs): 5-15 minutes
- **Large collections** (> 10,000 docs): 15-60 minutes

**Status indicators in Firebase Console:**
- 🟡 **Building** - Index is being created, wait for completion
- ✅ **Enabled** - Index is ready to use
- ❌ **Error** - Check error message and recreate

---

## Troubleshooting

### Query Still Slow After Index is Enabled

1. **Clear browser cache** - Old query results might be cached
2. **Check query logs** - Look for "Optimized query" vs "falling back" messages
3. **Verify index fields match exactly** - Field names and order must match query
4. **Check collection has data** - If collection is empty, query may fall back

### Index Stuck in "Building" Status

- **Wait longer** - Large indexes can take 30-60 minutes
- **Refresh Firebase Console** - Status might have updated
- **Check collection size** - If collection is empty, index builds instantly

### Can't Find "Create Index" Button

1. **Check permissions** - You need Editor or Owner role
2. **Check correct tab** - Must be on Firestore → Indexes tab
3. **Try different browser** - Browser extensions might block UI
4. **Refresh page** - Firebase Console might need refresh

---

## Field Order Rules

**⚠️ CRITICAL**: When creating indexes, field order must match exactly.

**Firestore Index Rules:**
1. **Equality filters** (`==`) come first
2. **Range filters** (`>=`, `<=`, `>`, `<`) come after equality
3. **OrderBy fields** come last

**Example for Index 10:**
- ✅ Correct: `category` (equality) → `games` (range) → `score` (orderBy)
- ❌ Wrong: `games` → `category` → `score`
- ❌ Wrong: `score` → `category` → `games`

---

## Related Documentation

- [Database Schemas](./schemas.md) - Firestore collection schemas
- [Firestore Index Documentation](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Composite Index Guide](https://firebase.google.com/docs/firestore/query-data/index-overview#composite_indexes)

