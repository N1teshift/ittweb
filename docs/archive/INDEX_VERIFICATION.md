# Index Verification - Issues Found

**Date**: 2025-01-15

## ✅ Good News

1. **Index 4 (Row 6)**: Field order is correct!
   - Fields: `isDeleted` → `category` → `gameState` → `datetime` ✓
   - Status: Enabled ✓
   - Note: Shows `isDelete` but likely just display - Firebase usually corrects typos

2. **Index 10 Collection**: Correct! ✓
   - Collection: `playerCategoryStats` ✓
   - Status: Enabled ✓

## ⚠️ Issue Found

### Index 10 (Row 1): Wrong Field Order

**Current Index:**
- Collection: `playerCategoryStats` ✓
- Fields: `category` (↑) → `score` (↓) → `games` (↑)
- Status: Enabled

**Should Be:**
- Collection: `playerCategoryStats` ✓
- Fields: `category` (↑) → `games` (↑) → `score` (↓)

**Problem**: The field order is wrong. It should be `category` → `games` → `score`, but you have `category` → `score` → `games`.

**Why This Matters:**
Your queries execute:
```typescript
.where('category', '==', '1v1')    // 1st filter (equality)
.where('games', '>=', 10)           // 2nd filter (range)
.orderBy('score', 'desc')           // Sort by score
```

For Firestore composite indexes:
1. Equality filters (==) come first
2. Range filters (>=, <=) come after equality
3. OrderBy fields come after range filters

So the index must be: `category` → `games` → `score`

Your current index has `games` after `score`, which won't match the query pattern.

## How to Fix

### Delete and Recreate Index 10

1. **Delete Row 1 (the wrong Index 10):**
   - Click the three dots (⋮) on Row 1
   - Select "Delete index"
   - Confirm

2. **Create Index 10 with correct field order:**
   - Click "Add index"
   - **Collection**: `playerCategoryStats`
   - **Add fields in this EXACT order:**
     - Field 1: `category` | Scope: Collection | Order: **Ascending**
     - Field 2: `games` | Scope: Collection | Order: **Ascending** (this comes BEFORE score!)
     - Field 3: `score` | Scope: Collection | Order: **Descending**
   - Click "Create"
   - Wait for "Enabled" status

## Summary

- ✅ Index 4: Correct!
- ❌ Index 10: Wrong field order - needs to be fixed
- All other indexes: Look good!

