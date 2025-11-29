# Fix Index 10 - Correct Field Order

## Current (WRONG):
**Collection**: `playerCategoryStats`  
**Fields**: `category` (↑) → `score` (↓) → `games` (↑)  
**Status**: Enabled

## Should Be (CORRECT):
**Collection**: `playerCategoryStats`  
**Fields**: `category` (↑) → `games` (↑) → `score` (↓)  
**Status**: Enabled

## Why the Order Matters

Your query executes in this order:
```typescript
.where('category', '==', '1v1')    // 1st: Equality filter
.where('games', '>=', 10)          // 2nd: Range filter
.orderBy('score', 'desc')          // 3rd: Sort field
```

Firestore composite index rules:
- **Equality filters** (==) come first
- **Range filters** (>=, <=, >, <) come after equality
- **OrderBy fields** come last

So index must match: `category` → `games` → `score`

## Step-by-Step Fix

### Step 1: Delete Wrong Index
1. Find **Row 1** in Firebase Console (the `playerCategoryStats` index)
2. Click the **three dots (⋮)** on the right
3. Click **"Delete index"**
4. Confirm deletion

### Step 2: Create Correct Index
1. Click **"Add index"** button
2. **Collection ID**: `playerCategoryStats`

3. **Add fields in this EXACT order:**

   **Field 1:**
   - Field path: `category`
   - Query scope: **Collection**
   - Order: **Ascending** ⬆️

   **Field 2:**
   - Click "Add field"
   - Field path: `games`
   - Query scope: **Collection**
   - Order: **Ascending** ⬆️

   **Field 3:**
   - Click "Add field"
   - Field path: `score`
   - Query scope: **Collection**
   - Order: **Descending** ⬇️

4. Click **"Create"**

5. Wait for status to change from **"Building..."** to **"Enabled"**

## Verification

After recreating, your index should show:
- Collection: `playerCategoryStats`
- Fields: `category` (↑), `games` (↑), `score` (↓) ← **games before score!**
- Status: Enabled

## Important

⚠️ The field order is critical! Make sure `games` comes BEFORE `score`, not after.

