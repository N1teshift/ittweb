# Fix Index 10 - Wrong Collection

**Problem**: Index 10 was created on `games` collection but should be on `playerCategoryStats` collection.

## Current (WRONG):
- **Collection**: `games`
- **Fields**: `category` (Asc), `games` (Asc), `score` (Desc)
- **Status**: Building...

## Should Be (CORRECT):
- **Collection**: `playerCategoryStats` ⭐
- **Fields**: `category` (Asc), `games` (Asc), `score` (Desc)
- **Status**: Building...

## How to Fix

### Step 1: Delete the Wrong Index
1. Go to Firebase Console → Firestore Database → Indexes tab
2. Find Row 6 (the one with `category`, `games`, `score` fields)
3. Click the three dots (⋮) on the right
4. Select "Delete index"
5. Confirm deletion

### Step 2: Create Index 10 on Correct Collection
1. Click "Create Index" button
2. **Collection ID**: `playerCategoryStats` ⭐ (NOT `games`)
3. **Add fields in this order:**
   - Field 1: `category` | Scope: Collection | Order: **Ascending**
   - Field 2: `games` | Scope: Collection | Order: **Ascending**
   - Field 3: `score` | Scope: Collection | Order: **Descending**
4. Click "Create"
5. Wait for status to change from "Building..." to "Enabled"

## Why It Matters

The standings optimization queries the `playerCategoryStats` collection, not the `games` collection. Having the index on the wrong collection means queries won't use it and will fall back to the slow method.

## Verification

After recreating:
- Collection should be: `playerCategoryStats`
- Fields should be: `category` (Asc), `games` (Asc), `score` (Desc)
- Status should show: "Building..." then "Enabled"

