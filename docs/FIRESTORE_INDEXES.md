# Firestore Index Configuration Guide

This document provides instructions for creating composite indexes in Firestore to optimize query performance.

> **New to Firestore indexes?** See [Understanding Firestore Indexes](./FIRESTORE_INDEXES_EXPLAINED.md) for a detailed explanation of how they work.

## Why Indexes Are Needed

Firestore requires composite indexes when queries use:
- Multiple `where` clauses on different fields
- A `where` clause combined with `orderBy` on a different field
- Multiple `orderBy` clauses

Without proper indexes, queries will fail or use inefficient fallback logic.

**Key Concept:** Each index supports a specific query pattern. Different query patterns (different filter/sort combinations) need different indexes. Firestore can't reuse one index for multiple different patterns - the index fields must match your query exactly.

## How to Create Indexes

### Method 1: Using Firebase Console (Recommended)

1. **Go to Firebase Console**
   - Visit [Firebase Console](https://console.firebase.google.com/)
   - Select your project

2. **Navigate to Firestore**
   - Click on "Firestore Database" in the left sidebar
   - Click on the "Indexes" tab

3. **Create Index**
   - Click the "Create Index" button
   - Select the collection name (e.g., `games`)
   - Add fields one by one in the exact order they appear in your query
   - Set the order (Ascending/Descending) for each field
   - Click "Create"

4. **Wait for Index to Build**
   - Indexes can take a few minutes to build
   - You'll see a status indicator (Building/Enabled)

### Method 2: Using Error Messages (Automatic)

When a query fails due to a missing index, Firestore provides a link in the error message:

1. Run your application and trigger a query that needs an index
2. Check the error message in your console/logs
3. Look for a link like: `https://console.firebase.google.com/project/.../database/firestore/indexes?create_composite=...`
4. Click the link - it will pre-populate the index form
5. Click "Create Index"

## Required Indexes for ITT Web

### Games Collection (`games`)

#### Index 1: Scheduled Games - Basic Ordering
**Use Case**: Listing scheduled games ordered by scheduled date

**Fields:**
- `isDeleted` → Ascending
- `gameState` → Ascending
- `scheduledDateTime` → Ascending

**Query Pattern:**
```typescript
.where('isDeleted', '==', false)
.where('gameState', '==', 'scheduled')
.orderBy('scheduledDateTime', 'asc')
```

**How to Create:**
1. Collection: `games`
2. Add field: `isDeleted` - Query scope: Collection, Order: Ascending
3. Add field: `gameState` - Query scope: Collection, Order: Ascending
4. Add field: `scheduledDateTime` - Query scope: Collection, Order: Ascending
5. Click "Create"

---

#### Index 2: Scheduled Games - With Date Range Filter
**Use Case**: Filtering scheduled games by date range

**Fields:**
- `isDeleted` → Ascending
- `gameState` → Ascending
- `scheduledDateTime` → Ascending

**Query Pattern:**
```typescript
.where('isDeleted', '==', false)
.where('gameState', '==', 'scheduled')
.where('scheduledDateTime', '>=', startDate)
.where('scheduledDateTime', '<=', endDate)
.orderBy('scheduledDateTime', 'asc')
```

**Note**: This uses the same index as Index 1. Range filters on the `orderBy` field don't require a separate index.

---

#### Index 3: Completed Games - Basic Ordering
**Use Case**: Listing completed games ordered by completion date

**Fields:**
- `isDeleted` → Ascending
- `gameState` → Ascending
- `datetime` → Descending

**Query Pattern:**
```typescript
.where('isDeleted', '==', false)
.where('gameState', '==', 'completed')
.orderBy('datetime', 'desc')
```

**How to Create:**
1. Collection: `games`
2. Add field: `isDeleted` - Query scope: Collection, Order: Ascending
3. Add field: `gameState` - Query scope: Collection, Order: Ascending
4. Add field: `datetime` - Query scope: Collection, Order: Descending
5. Click "Create"

---

#### Index 4: Completed Games - With Category Filter
**Use Case**: Filtering completed games by category

**Fields:**
- `isDeleted` → Ascending
- `gameState` → Ascending
- `category` → Ascending
- `datetime` → Descending

**Query Pattern:**
```typescript
.where('isDeleted', '==', false)
.where('gameState', '==', 'completed')
.where('category', '==', '1v1')
.orderBy('datetime', 'desc')
```

**How to Create:**
1. Collection: `games`
2. Add field: `isDeleted` - Query scope: Collection, Order: Ascending
3. Add field: `gameState` - Query scope: Collection, Order: Ascending
4. Add field: `category` - Query scope: Collection, Order: Ascending
5. Add field: `datetime` - Query scope: Collection, Order: Descending
6. Click "Create"

---

#### Index 5: Game ID Ordering - For Next Game ID
**Use Case**: Getting the next available game ID by finding the highest existing gameId

**Fields:**
- `gameId` → Descending

**Query Pattern:**
```typescript
.orderBy('gameId', 'desc')
.limit(1)
```

**How to Create:**
1. Collection: `games`
2. Add field: `gameId` - Query scope: Collection, Order: Descending
3. Click "Create"

**Note**: This is a simple single-field index. Currently uses fallback logic (fetches up to 1000 games and sorts in memory) if index is missing. Creating this index improves performance for game ID generation.

**Location in Code**: `src/features/modules/games/lib/gameService.utils.ts` (lines 39, 89)

---

#### Index 6: Scheduled Games - Game ID Ordering
**Use Case**: Getting the next available scheduled game ID

**Fields:**
- `gameState` → Ascending
- `gameId` → Descending

**Query Pattern:**
```typescript
.where('gameState', '==', 'scheduled')
.orderBy('gameId', 'desc')
.limit(1)
```

**How to Create:**
1. Collection: `games`
2. Add field: `gameState` - Query scope: Collection, Order: Ascending
3. Add field: `gameId` - Query scope: Collection, Order: Descending
4. Click "Create"

**Note**: Required for `getNextScheduledGameId()` function. Query will fail without this index (no fallback).

**Location in Code**: `src/features/modules/scheduled-games/lib/scheduledGameService.ts` (lines 68, 85)

---

#### Index 7: Completed Games - With Date Range Filter
**Use Case**: Filtering completed games by date range

**Fields:**
- `isDeleted` → Ascending
- `gameState` → Ascending
- `datetime` → Descending

**Query Pattern:**
```typescript
.where('isDeleted', '==', false)
.where('gameState', '==', 'completed')
.where('datetime', '>=', startDate)
.where('datetime', '<=', endDate)
.orderBy('datetime', 'desc')
```

**Note**: This uses the same index as Index 3. Range filters on the `orderBy` field don't require a separate index.

---

#### Index 8: All Games - Default Ordering
**Use Case**: Listing all games when gameState is not specified

**Fields:**
- `isDeleted` → Ascending
- `createdAt` → Descending

**Query Pattern:**
```typescript
.where('isDeleted', '==', false)
.orderBy('createdAt', 'desc')
```

**How to Create:**
1. Collection: `games`
2. Add field: `isDeleted` - Query scope: Collection, Order: Ascending
3. Add field: `createdAt` - Query scope: Collection, Order: Descending
4. Click "Create"

---

### Posts Collection (`posts`)

#### Index 9: Published Posts - Ordered by Date
**Use Case**: Listing published posts ordered by date

**Fields:**
- `published` → Ascending
- `date` → Descending

**Query Pattern:**
```typescript
.where('published', '==', true)
.orderBy('date', 'desc')
```

**How to Create:**
1. Collection: `posts`
2. Add field: `published` - Query scope: Collection, Order: Ascending
3. Add field: `date` - Query scope: Collection, Order: Descending
4. Click "Create"

---

### Player Category Stats Collection (`playerCategoryStats`)

> **New Collection (2025-01-15)**: This denormalized collection optimizes standings queries by storing category-specific player statistics as separate documents. Created for performance optimization.

#### Index 10: Standings by Category - Basic Query
**Use Case**: Fetching standings for a category with minimum games filter

**Fields:**
- `category` → Ascending
- `games` → Ascending
- `score` → Descending

**Query Pattern:**
```typescript
.where('category', '==', '1v1')
.where('games', '>=', 10)
.orderBy('score', 'desc')
```

**How to Create:**
1. Collection: `playerCategoryStats`
2. Add field: `category` - Query scope: Collection, Order: Ascending
3. Add field: `games` - Query scope: Collection, Order: Ascending
4. Add field: `score` - Query scope: Collection, Order: Descending
5. Click "Create"

**Note**: This index supports filtering by category and minimum games, then sorting by ELO score. The standings service will still perform final sorting in memory for multi-field sorting (score, winRate, wins), but this significantly reduces the dataset.

---

#### Index 11: Standings by Category - Alternative Sorting (Optional)
**Use Case**: Sorting standings by games count (for debugging or alternative views)

**Fields:**
- `category` → Ascending
- `games` → Descending
- `score` → Descending

**Query Pattern:**
```typescript
.where('category', '==', 'default')
.orderBy('games', 'desc')
.orderBy('score', 'desc')
```

**How to Create:**
1. Collection: `playerCategoryStats`
2. Add field: `category` - Query scope: Collection, Order: Ascending
3. Add field: `games` - Query scope: Collection, Order: Descending
4. Add field: `score` - Query scope: Collection, Order: Descending
5. Click "Create"

**Note**: This is optional and only needed if you want to sort by games count first.

---

### Entries Collection (`entries`)

#### Index 12: Entries - Ordered by Date
**Use Case**: Listing entries ordered by date

**Fields:**
- `isDeleted` → Ascending
- `date` → Descending

**Query Pattern:**
```typescript
.where('isDeleted', '==', false)
.orderBy('date', 'desc')
```

**How to Create:**
1. Collection: `entries`
2. Add field: `isDeleted` - Query scope: Collection, Order: Ascending
3. Add field: `date` - Query scope: Collection, Order: Descending
4. Click "Create"

---

#### Index 13: Entries - By Content Type
**Use Case**: Filtering entries by content type (post/memory)

**Fields:**
- `isDeleted` → Ascending
- `contentType` → Ascending
- `date` → Descending

**Query Pattern:**
```typescript
.where('isDeleted', '==', false)
.where('contentType', '==', 'post')
.orderBy('date', 'desc')
```

**How to Create:**
1. Collection: `entries`
2. Add field: `isDeleted` - Query scope: Collection, Order: Ascending
3. Add field: `contentType` - Query scope: Collection, Order: Ascending
4. Add field: `date` - Query scope: Collection, Order: Descending
5. Click "Create"

---

## Complete Index Reference

> **Note**: Index numbering (Index 1, Index 10, etc.) is for documentation reference only. The order you create indexes in Firebase Console doesn't matter - only the field order within each index matters.

### Quick Reference Table

| Index | Collection | Fields (in order) | Purpose | Priority |
|-------|-----------|-------------------|---------|----------|
| 1 | `games` | `isDeleted` (Asc), `gameState` (Asc), `scheduledDateTime` (Asc) | Scheduled games list | Required |
| 2 | `games` | `isDeleted` (Asc), `gameState` (Asc), `scheduledDateTime` (Asc) | Scheduled games with date filter (uses Index 1) | Required |
| 3 | `games` | `isDeleted` (Asc), `gameState` (Asc), `datetime` (Desc) | Completed games list | Required |
| 4 | `games` | `isDeleted` (Asc), `gameState` (Asc), `category` (Asc), `datetime` (Desc) | Completed games by category | Required |
| 5 | `games` | `gameId` (Desc) | Next game ID generation | Recommended |
| 6 | `games` | `gameState` (Asc), `gameId` (Desc) | Next scheduled game ID | Required |
| 7 | `games` | `isDeleted` (Asc), `gameState` (Asc), `datetime` (Desc) | Completed games with date filter (uses Index 3) | Required |
| 8 | `games` | `isDeleted` (Asc), `createdAt` (Desc) | All games (no gameState filter) | Optional |
| 9 | `posts` | `published` (Asc), `date` (Desc) | Published posts list | Required |
| 10 | `playerCategoryStats` | `category` (Asc), `games` (Asc), `score` (Desc) | Standings by category (optimized) | Required |
| 11 | `playerCategoryStats` | `category` (Asc), `games` (Desc), `score` (Desc) | Standings sorted by games (optional) | Optional |
| 12 | `entries` | `isDeleted` (Asc), `date` (Desc) | All entries list | Optional |
| 13 | `entries` | `isDeleted` (Asc), `contentType` (Asc), `date` (Desc) | Entries by content type | Optional |

### Field Order Rules

**⚠️ CRITICAL**: When creating indexes, the field order must match exactly as listed above.

**Firestore Index Rules**:
1. **Equality filters** (`==`) come first
2. **Range filters** (`>=`, `<=`, `>`, `<`) come after equality
3. **OrderBy fields** come last

**Example for Index 10:**
- ✅ Correct: `category` (equality) → `games` (range) → `score` (orderBy)
- ❌ Wrong: `games` → `category` → `score`
- ❌ Wrong: `score` → `category` → `games`

The order in the table above is the exact order you must add fields in Firebase Console.

## Verifying Indexes Are Working

1. **Check Index Status**
   - Go to Firestore → Indexes tab
   - Look for "Enabled" status (green checkmark)
   - Building indexes show a progress indicator

2. **Test Your Queries**
   - Run queries that use these patterns
   - Check that they don't trigger fallback logic
   - Monitor query performance in Firebase Console → Usage tab

3. **Check Logs**
   - If you see errors about missing indexes, create them
   - Fallback queries will still work but are slower

## Troubleshooting

### "Index building" but taking too long
- Large collections take longer to index
- Wait 15-30 minutes for large datasets
- Check Firebase Console for progress

### Query still fails after creating index
- Verify field names match exactly (case-sensitive)
- Verify field order matches query order
- Verify sort direction (Asc/Desc) matches
- Check that index status is "Enabled"

### Performance still slow
- Check if queries are using indexes (look for fallback warnings in logs)
- Consider creating additional indexes for common filter combinations
- Review query patterns - you may need more specific indexes

## Best Practices

1. **Create indexes proactively** - Don't wait for errors
2. **Use the error link method** - Firestore provides exact index config
3. **Monitor index usage** - Check which indexes are actually used
4. **Combine filters efficiently** - Create indexes for common filter combinations
5. **Limit index count** - Each index uses storage and costs money

## Cost Considerations

- Indexes don't cost extra per query
- They use storage space (usually minimal)
- Each document field in an index uses about 1KB
- Monitor index count and storage in Firebase Console

## Related Documentation

- [FIRESTORE_INDEXES_EXPLAINED.md](./FIRESTORE_INDEXES_EXPLAINED.md) - Understanding how indexes work
- [FIRESTORE_INDEXES_INVENTORY.md](./FIRESTORE_INDEXES_INVENTORY.md) - Current index status and inventory
- [FIRESTORE_INDEXES_SETUP_GUIDE.md](./FIRESTORE_INDEXES_SETUP_GUIDE.md) - Step-by-step setup instructions

## Additional Resources

- [Firestore Index Documentation](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Composite Index Guide](https://firebase.google.com/docs/firestore/query-data/index-overview#composite_indexes)
- [Firebase Console](https://console.firebase.google.com/)

