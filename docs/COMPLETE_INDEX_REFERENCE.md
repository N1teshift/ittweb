# Complete Firestore Index Reference

**Last Updated**: 2025-01-15

## Important: About Index Numbering

**The numbers (Index 1, Index 10, etc.) are ONLY for our documentation reference.**

- ❌ **Order in Firebase Console doesn't matter** - You can create indexes in any order
- ❌ **Firebase Console doesn't use these numbers** - It just shows your indexes by collection/fields
- ✅ **What matters**: The collection name, field names, and field order must match exactly
- ✅ **The numbering is just for us** - To track which indexes are documented and needed

**Example**: You could create Index 10 before Index 6, and it would work fine. The numbers are just labels in our docs.

---

## Complete Index List

### Games Collection (`games`)

#### Index 1: Scheduled Games - Basic Ordering
**Collection**: `games`  
**Fields** (in this exact order):
1. `isDeleted` → **Ascending**
2. `gameState` → **Ascending**
3. `scheduledDateTime` → **Ascending**

**Status**: ✅ You have this (1 of your 4 games indexes)

---

#### Index 2: Scheduled Games - With Date Range Filter
**Collection**: `games`  
**Fields** (in this exact order):
1. `isDeleted` → **Ascending**
2. `gameState` → **Ascending**
3. `scheduledDateTime` → **Ascending**

**Note**: Uses the same index as Index 1 (range filters on `orderBy` field don't need separate index)

**Status**: ✅ You have this (uses Index 1)

---

#### Index 3: Completed Games - Basic Ordering
**Collection**: `games`  
**Fields** (in this exact order):
1. `isDeleted` → **Ascending**
2. `gameState` → **Ascending**
3. `datetime` → **Descending**

**Status**: ✅ You have this (1 of your 4 games indexes)

---

#### Index 4: Completed Games - With Category Filter
**Collection**: `games`  
**Fields** (in this exact order):
1. `isDeleted` → **Ascending**
2. `gameState` → **Ascending**
3. `category` → **Ascending**
4. `datetime` → **Descending**

**Status**: ✅ You have this (1 of your 4 games indexes)

---

#### Index 5: Completed Games - With Date Range Filter
**Collection**: `games`  
**Fields** (in this exact order):
1. `isDeleted` → **Ascending**
2. `gameState` → **Ascending**
3. `datetime` → **Descending**

**Note**: Uses the same index as Index 3 (range filters on `orderBy` field don't need separate index)

**Status**: ⚠️ Not needed separately (uses Index 3)

---

#### Index 6: All Games - Default Ordering
**Collection**: `games`  
**Fields** (in this exact order):
1. `isDeleted` → **Ascending**
2. `createdAt` → **Descending**

**Status**: ❌ You don't have this (optional - only needed if you query games without `gameState` filter)

---

### Posts Collection (`posts`)

#### Index 7: Published Posts - Ordered by Date
**Collection**: `posts`  
**Fields** (in this exact order):
1. `published` → **Ascending**
2. `date` → **Descending**

**Status**: ✅ You have this (your 1 posts index)

---

### Entries Collection (`entries`)

#### Index 8: Entries - Ordered by Date
**Collection**: `entries`  
**Fields** (in this exact order):
1. `isDeleted` → **Ascending**
2. `date` → **Descending**

**Status**: ❌ You don't have this (optional - only needed if you use entries/blog features)

---

#### Index 9: Entries - By Content Type
**Collection**: `entries`  
**Fields** (in this exact order):
1. `isDeleted` → **Ascending**
2. `contentType` → **Ascending**
3. `date` → **Descending**

**Status**: ❌ You don't have this (optional - only needed if you filter entries by content type)

---

### Player Category Stats Collection (`playerCategoryStats`)

#### Index 10: Standings by Category - Basic Query ⭐ REQUIRED
**Collection**: `playerCategoryStats`  
**Fields** (in this exact order):
1. `category` → **Ascending**
2. `games` → **Ascending**
3. `score` → **Descending**

**Status**: ❌ **YOU NEED TO CREATE THIS** - Required for standings optimization

---

#### Index 11: Standings by Category - Alternative Sorting
**Collection**: `playerCategoryStats`  
**Fields** (in this exact order):
1. `category` → **Ascending**
2. `games` → **Descending**
3. `score` → **Descending**

**Status**: ❌ You don't have this (optional - only for alternative sorting by games count)

---

## Summary Table

| Index # | Collection | Fields (Order & Direction) | Status | Priority |
|---------|-----------|---------------------------|--------|----------|
| 1 | `games` | `isDeleted` (Asc), `gameState` (Asc), `scheduledDateTime` (Asc) | ✅ Have | Required |
| 2 | `games` | Same as Index 1 (uses Index 1) | ✅ Have | Required |
| 3 | `games` | `isDeleted` (Asc), `gameState` (Asc), `datetime` (Desc) | ✅ Have | Required |
| 4 | `games` | `isDeleted` (Asc), `gameState` (Asc), `category` (Asc), `datetime` (Desc) | ✅ Have | Required |
| 5 | `games` | Same as Index 3 (uses Index 3) | ⚠️ N/A | Not needed |
| 6 | `games` | `isDeleted` (Asc), `createdAt` (Desc) | ❌ Missing | Optional |
| 7 | `posts` | `published` (Asc), `date` (Desc) | ✅ Have | Required |
| 8 | `entries` | `isDeleted` (Asc), `date` (Desc) | ❌ Missing | Optional |
| 9 | `entries` | `isDeleted` (Asc), `contentType` (Asc), `date` (Desc) | ❌ Missing | Optional |
| **10** | **`playerCategoryStats`** | **`category` (Asc), `games` (Asc), `score` (Desc)** | **❌ MISSING** | **⭐ REQUIRED** |
| 11 | `playerCategoryStats` | `category` (Asc), `games` (Desc), `score` (Desc) | ❌ Missing | Optional |

---

## Your Current Status

**You Have**: 5 indexes
- 4 for `games` collection (Indexes 1-4)
- 1 for `posts` collection (Index 7)

**You Need**: 1 index
- ⭐ **Index 10** for `playerCategoryStats` collection (REQUIRED for standings optimization)

**Optional** (create later if needed):
- Index 6: Only if you query games without `gameState` filter
- Indexes 8-9: Only if you use entries/blog features

---

## Field Order Matters!

**⚠️ CRITICAL**: When creating indexes, the field order must match exactly as listed above.

**Example for Index 10:**
- ✅ Correct: `category` → `games` → `score`
- ❌ Wrong: `games` → `category` → `score`
- ❌ Wrong: `score` → `category` → `games`

The order in the list above is the order you must add fields in Firebase Console.

---

## Quick Copy-Paste Reference

### Index 10 (REQUIRED - Create This Now)

**Collection**: `playerCategoryStats`

**Fields to add** (in this order):
1. Field: `category` | Scope: Collection | Order: **Ascending**
2. Field: `games` | Scope: Collection | Order: **Ascending**
3. Field: `score` | Scope: Collection | Order: **Descending**

---

## Notes

- **Index numbering is just for documentation** - Order in Firebase Console doesn't matter
- **Field order in the index DOES matter** - Must match query order exactly
- **Collection name is case-sensitive** - `playerCategoryStats` not `playercategorystats`
- **Field names are case-sensitive** - `category` not `Category`

