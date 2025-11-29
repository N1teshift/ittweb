# Firestore Indexes Setup Guide - Step by Step

**Created**: 2025-01-15  
**Purpose**: Detailed instructions for creating Firestore composite indexes for ITT Web

## Prerequisites

- Access to Firebase Console with admin permissions
- Your Firebase project selected in the console

---

## Quick Start: Standings Optimization Index (Index 10)

This is the index needed for the standings query optimization we just implemented.

### Step-by-Step Instructions

#### Step 1: Open Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. **Select your project** from the project list (or use the dropdown at the top)

#### Step 2: Navigate to Firestore Indexes

1. In the left sidebar, click **"Firestore Database"**
   - If you don't see it, click the hamburger menu (☰) first
2. Click on the **"Indexes"** tab at the top
   - You should see a list of existing indexes (or an empty list if this is your first)

#### Step 3: Create New Index

1. Click the **"Create Index"** button (usually blue, top-right)

#### Step 4: Configure Index 10 - Player Category Stats

You'll see a form to configure the index. Fill it out as follows:

**Collection ID:**
```
playerCategoryStats
```
- Type this exactly (case-sensitive)
- This is the name of the new denormalized collection

**Fields to Add:**

Click **"Add field"** button for each field below, in this exact order:

1. **First Field:**
   - Field path: `category`
   - Query scope: Select **"Collection"**
   - Order: Select **"Ascending** ⬆️

2. **Second Field:**
   - Click **"Add field"** again
   - Field path: `games`
   - Query scope: Select **"Collection"**
   - Order: Select **"Ascending** ⬆️

3. **Third Field:**
   - Click **"Add field"** again
   - Field path: `score`
   - Query scope: Select **"Collection"**
   - Order: Select **"Descending** ⬇️

**Your form should now show 3 fields:**
```
1. category     Ascending   Collection
2. games        Ascending   Collection
3. score        Descending  Collection
```

#### Step 5: Create the Index

1. Review the configuration:
   - Collection: `playerCategoryStats`
   - 3 fields in the correct order
   - Correct sort directions (Asc/Asc/Desc)
2. Click the **"Create"** button at the bottom

#### Step 6: Wait for Index to Build

1. You'll see the index appear in the list with status **"Building"** 🟡
   - Usually takes 1-5 minutes for small collections
   - Can take 15-30 minutes for large collections
2. Once complete, status will change to **"Enabled"** ✅ (green checkmark)

**You're done!** The index is now active and standings queries will use it automatically.

---

## Optional: Alternative Index (Index 11)

This is optional and only needed if you want to sort standings by games count first.

### Index 11 Configuration

**Collection ID:** `playerCategoryStats`

**Fields:**
1. `category` → Ascending
2. `games` → Descending (note: different from Index 10)
3. `score` → Descending

**Use Case:** Sorting by number of games played, then by score (for debugging/alternative views)

---

## Verifying the Index

### Method 1: Check Firebase Console

1. Go to Firestore → Indexes tab
2. Look for an index on `playerCategoryStats` collection
3. Status should be **"Enabled"** ✅

### Method 2: Test Standings Query

1. Go to your standings page in the app
2. Open browser DevTools → Network tab
3. Load standings - query should complete quickly (200-500ms)
4. Check application logs - should NOT see "falling back to legacy method"

---

## Troubleshooting

### "Collection doesn't exist" Error

**Problem:** The `playerCategoryStats` collection doesn't exist yet.

**Solution:** This is fine! Firestore will create the collection automatically when:
- First document is written (happens automatically when a game is processed)
- Or when you run the migration script

**Action:** You can still create the index now - it will start building once the collection exists.

### Index Stuck in "Building" Status

**Problem:** Index has been building for a long time (>30 minutes).

**Possible Causes:**
- Very large dataset (1000+ documents)
- Firebase console delay in updating status

**Solutions:**
1. **Wait longer** - Large indexes can take 30-60 minutes
2. **Check Firebase Console** - Refresh the page, status might have updated
3. **Check collection size** - If collection is empty, index builds instantly

### Query Still Slow After Index is Enabled

**Problem:** Index is enabled but standings query is still slow.

**Solutions:**
1. **Clear browser cache** - Old query results might be cached
2. **Check query logs** - Look for "Optimized standings query" vs "falling back"
3. **Verify index fields match exactly** - Field names and order must match query
4. **Check collection has data** - If `playerCategoryStats` is empty, query falls back to legacy method

### Can't Find "Create Index" Button

**Problem:** Don't see the Create Index button in Firebase Console.

**Solutions:**
1. **Check permissions** - You need Editor or Owner role
2. **Check correct tab** - Must be on Firestore → Indexes tab
3. **Try different browser** - Sometimes browser extensions block UI elements
4. **Check Firebase Console version** - Try refreshing the page

---

## Index Status Reference

| Status | Meaning | Action |
|--------|---------|--------|
| 🟡 **Building** | Index is being created | Wait for it to finish |
| ✅ **Enabled** | Index is ready to use | None - working correctly |
| ❌ **Error** | Index creation failed | Check error message, fix and recreate |
| ⚪ **Disabled** | Index was manually disabled | Enable it or delete and recreate |

---

## What Happens After Index is Created

1. ✅ **Standings queries automatically use the index** - No code changes needed
2. ✅ **Faster query performance** - 5-20x improvement (200-500ms vs 2-5 seconds)
3. ✅ **Fallback still works** - If index isn't ready, query falls back to legacy method
4. ✅ **Dual-write continues** - New games automatically populate both collections

---

## Reference: All Indexes

For other indexes needed by the application, see:
- `docs/FIRESTORE_INDEXES.md` - Complete index reference

### Summary of All Required Indexes

| Index | Collection | Purpose | Priority |
|-------|-----------|---------|----------|
| 1-4 | `games` | Scheduled and completed games queries | Already created by user |
| 10 | `playerCategoryStats` | **Standings optimization** | **Create this one** |
| 11 | `playerCategoryStats` | Alternative standings sorting | Optional |

---

## Quick Reference Card

**Collection:** `playerCategoryStats`  
**Fields:** `category` (Asc), `games` (Asc), `score` (Desc)  
**Location:** Firebase Console → Firestore Database → Indexes → Create Index  
**Time:** 1-5 minutes to build (for small collections)

---

## Need Help?

- **Firebase Console:** https://console.firebase.google.com/
- **Firestore Index Docs:** https://firebase.google.com/docs/firestore/query-data/indexing
- **Index Reference:** `docs/FIRESTORE_INDEXES.md`
- **Implementation Details:** `.workflow/progress/performance-agent/optimizations/standings-denormalization-implementation.md`

