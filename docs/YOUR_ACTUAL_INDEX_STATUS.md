# Your Actual Firestore Index Status

**Last Updated**: 2025-01-15  
**Verified Against**: Firebase Console screenshot

## What You Actually Have (5 Indexes)

### ✅ Index 1: Scheduled Games
**Collection**: `games`  
**Fields**: `isDeleted` (Asc), `gameState` (Asc), `scheduledDateTime` (Asc), `_name_` (Asc)  
**Status**: ✅ You have this

---

### ✅ Index 3: Completed Games
**Collection**: `games`  
**Fields**: `isDeleted` (Asc), `gameState` (Asc), `datetime` (Desc), `_name_` (Desc)  
**Status**: ✅ You have this

---

### ✅ Index 6: All Games (Default Ordering)
**Collection**: `games`  
**Fields**: `isDeleted` (Asc), `createdAt` (Desc), `_name_` (Desc)  
**Status**: ✅ You have this (I was wrong - you DO have Index 6!)

---

### ⚠️ Index 4 Variant: Games with Category (Different Field Order)
**Collection**: `games`  
**Your Fields**: `isDeleted` (Asc), `category` (Asc), `gameState` (Asc), `datetime` (Desc), `_name_` (Desc)  
**Documented Fields**: `isDeleted` (Asc), `gameState` (Asc), `category` (Asc), `datetime` (Desc)  

**Difference**: Your index has `category` before `gameState`, while documentation has `gameState` before `category`.

**Status**: ✅ You have this variant - works if your queries match this field order

---

### ✅ Index 7: Published Posts
**Collection**: `posts`  
**Fields**: `published` (Asc), `date` (Desc), `_name_` (Desc)  
**Status**: ✅ You have this

---

## What Needs to be Fixed/Created

### ⚠️ Index 4: Fix Field Order
**Current (WRONG)**: `isDeleted` → `category` → `gameState` → `datetime`  
**Should Be**: `isDeleted` → `gameState` → `category` → `datetime`  

**Why**: Your queries use `gameState` before `category`, but your index has `category` before `gameState`. Firestore indexes must match query field order exactly.

**Action**: Delete the current Index 4 and recreate it with the correct field order.

---

### ❌ Index 10: Player Category Stats (REQUIRED)
**Collection**: `playerCategoryStats`  
**Fields**: `category` (Asc), `games` (Asc), `score` (Desc)  
**Status**: ❌ **YOU NEED TO CREATE THIS** - Required for standings optimization

---

## Summary

**You Actually Have:**
- ✅ Index 1 (games - scheduled)
- ✅ Index 3 (games - completed)
- ✅ Index 4 variant (games - with category, different field order)
- ✅ Index 6 (games - all games) ← I was wrong, you DO have this!
- ✅ Index 7 (posts)

**You Need:**
- ❌ **Index 10** for `playerCategoryStats` collection ← CREATE THIS NOW

**Note**: The `_name_` field in your indexes is automatically added by Firestore and can be ignored - it's the document ID field.

---

## About Your Index 4 Variant

Your games-with-category index has fields in a different order than documented:
- **Your order**: `isDeleted` → `category` → `gameState` → `datetime`
- **Documented order**: `isDeleted` → `gameState` → `category` → `datetime`

**This is fine if your queries match your index order!** Firestore indexes must match query field order exactly. If your queries work, your index order is correct. If queries fail, you might need the documented order.

---

## Action Required

**Create Index 10 now** - This is the only missing index required for the standings optimization.

See `docs/FIRESTORE_INDEXES_SETUP_GUIDE.md` for step-by-step instructions.

