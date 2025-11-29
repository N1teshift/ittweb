# How to Fix Index 4 - Correct Field Order

**Issue**: Your current Index 4 has fields in wrong order for the query pattern.

## Current Index 4 (Wrong Order)
```
Collection: games
Fields: isDeleted → category → gameState → datetime
```

## Required Index 4 (Correct Order)
```
Collection: games
Fields: isDeleted → gameState → category → datetime
```

## Step-by-Step Fix

### Option 1: Delete and Recreate (Recommended)

1. **Delete the existing Index 4:**
   - Go to Firebase Console → Firestore Database → Indexes tab
   - Find the index with fields: `isDeleted`, `category`, `gameState`, `datetime`
   - Click the three dots (⋮) on the right
   - Select "Delete index"
   - Confirm deletion

2. **Create the correct Index 4:**
   - Click "Create Index" button
   - **Collection ID**: `games`
   
   **Add fields in this exact order:**
   - Field 1: `isDeleted` | Scope: Collection | Order: **Ascending**
   - Field 2: `gameState` | Scope: Collection | Order: **Ascending**
   - Field 3: `category` | Scope: Collection | Order: **Ascending**
   - Field 4: `datetime` | Scope: Collection | Order: **Descending**
   
   - Click "Create"
   - Wait for it to build (1-5 minutes)

### Option 2: Keep Both (Not Recommended)

If you want to keep the old one temporarily, create a new index with correct order. But you should delete the old one once the new one is enabled to avoid confusion.

## Why the Order Matters

Your queries execute in this order:
```typescript
.where('isDeleted', '==', false)      // 1st
.where('gameState', '==', 'completed') // 2nd
.where('category', '==', '1v1')        // 3rd
.orderBy('datetime', 'desc')           // 4th
```

The index fields must match this exact order. Your current index has `category` (2nd) and `gameState` (3rd) swapped, which won't work for these queries.

## Verification

After recreating the index:
1. Status should show "Enabled" ✅
2. Test a query with category filter - should work without fallback
3. Check logs - should not see "fallback" warnings for category queries

