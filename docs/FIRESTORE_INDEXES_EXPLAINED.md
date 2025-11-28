# Understanding Firestore Composite Indexes

## The Core Concept

**Yes, you're right!** Firestore indexes are pre-defined combinations of fields optimized for specific query patterns. Think of them like pre-built lookup tables for different filter/sort combinations.

## Why Multiple Indexes?

Each index supports a specific query pattern. Firestore requires an index that **exactly matches** your query's field order and filter/sort combination.

### Example: Why We Need Separate Indexes

Imagine you're querying a `games` collection. Here are different ways you might query it:

#### Query Pattern A: Get scheduled games, sorted by date
```typescript
.where('isDeleted', '==', false)
.where('gameState', '==', 'scheduled')
.orderBy('scheduledDateTime', 'asc')
```
**Needs Index 1**: `[isDeleted, gameState, scheduledDateTime]`

#### Query Pattern B: Get completed games, sorted by date
```typescript
.where('isDeleted', '==', false)
.where('gameState', '==', 'completed')
.orderBy('datetime', 'desc')
```
**Needs Index 2**: `[isDeleted, gameState, datetime]`

These are **different** because:
- Different `gameState` values ('scheduled' vs 'completed')
- Different date fields (`scheduledDateTime` vs `datetime`)
- Different sort directions (asc vs desc)

Firestore can't reuse Index 1 for Query Pattern B because the fields don't match!

## How Firestore Indexes Work

### Rule 1: Field Order Matters
The index fields must appear in the **same order** as your query filters/sorts.

**Index**: `[isDeleted, gameState, datetime]`

**✅ Works:**
```typescript
.where('isDeleted', '==', false)
.where('gameState', '==', 'completed')
.orderBy('datetime', 'desc')
```

**❌ Doesn't work:**
```typescript
.where('gameState', '==', 'completed')  // Wrong order!
.where('isDeleted', '==', false)
.orderBy('datetime', 'desc')
```

### Rule 2: Sort Direction Must Match
The index's sort direction must match your query's sort direction.

**Index**: `[isDeleted, gameState, datetime DESC]`

**✅ Works:**
```typescript
.where('isDeleted', '==', false)
.where('gameState', '==', 'completed')
.orderBy('datetime', 'desc')  // Matches index direction
```

**❌ Doesn't work:**
```typescript
.where('isDeleted', '==', false)
.where('gameState', '==', 'completed')
.orderBy('datetime', 'asc')  // Wrong direction!
```

### Rule 3: Additional Filters Need New Indexes
If you add more filters, you might need a new index.

**Index 2**: `[isDeleted, gameState, datetime]` - for basic completed games

**But if you want to filter by category too:**
```typescript
.where('isDeleted', '==', false)
.where('gameState', '==', 'completed')
.where('category', '==', '1v1')  // New filter!
.orderBy('datetime', 'desc')
```

**Needs Index 3**: `[isDeleted, gameState, category, datetime]`

The category filter comes BEFORE the sort field, so we need it in the index.

## Visual Explanation

Think of indexes like different filing systems:

```
📁 Index 1: "Scheduled Games by Date"
   └─ Files sorted by: [Deleted?] → [State] → [Schedule Date]
   └─ Use when: Finding scheduled games sorted by when they happen

📁 Index 2: "Completed Games by Date"  
   └─ Files sorted by: [Deleted?] → [State] → [Completion Date]
   └─ Use when: Finding completed games sorted by when they finished

📁 Index 3: "Completed Games by Category then Date"
   └─ Files sorted by: [Deleted?] → [State] → [Category] → [Date]
   └─ Use when: Finding 1v1 games sorted by date
```

## Do They Overlap?

**Partially, but not completely:**

1. **They share common fields** (`isDeleted`, `gameState`)
   - This is normal - many queries filter out deleted items
   
2. **But they differ in what comes after:**
   - Index 1: Uses `scheduledDateTime` (for scheduled games)
   - Index 2: Uses `datetime` (for completed games)
   - Index 3: Adds `category` before `datetime`

3. **Firestore can't combine indexes** - Each query needs its own complete index

## Why Not Just One Big Index?

You might think: "Why not create one index with all possible fields?"

**Problems with that approach:**

1. **Storage cost** - More fields = more storage per document
2. **Performance** - Larger indexes are slower to maintain
3. **Firestore limits** - Maximum index size constraints
4. **Unnecessary** - Only create indexes for queries you actually use

## Our 4 Priority Indexes Explained

### Index 1: Scheduled Games
```
Fields: [isDeleted, gameState, scheduledDateTime]
Purpose: "Show me all scheduled games, sorted by when they're scheduled"
Query: WHERE isDeleted=false AND gameState='scheduled' ORDER BY scheduledDateTime ASC
```

### Index 2: Completed Games  
```
Fields: [isDeleted, gameState, datetime]
Purpose: "Show me all completed games, sorted by completion date (newest first)"
Query: WHERE isDeleted=false AND gameState='completed' ORDER BY datetime DESC
```

### Index 3: Completed Games by Category
```
Fields: [isDeleted, gameState, category, datetime]
Purpose: "Show me 1v1 games (or other category), sorted by date"
Query: WHERE isDeleted=false AND gameState='completed' AND category='1v1' ORDER BY datetime DESC
```

### Index 4: All Games (no filter)
```
Fields: [isDeleted, createdAt]
Purpose: "Show me all games (regardless of state), sorted by creation date"
Query: WHERE isDeleted=false ORDER BY createdAt DESC
```

## What About Range Queries?

**Good news:** Range queries on the `orderBy` field don't need separate indexes!

**Index 2 works for:**
```typescript
// Basic query
.where('isDeleted', '==', false)
.where('gameState', '==', 'completed')
.orderBy('datetime', 'desc')

// AND this query (with date range)
.where('isDeleted', '==', false)
.where('gameState', '==', 'completed')
.where('datetime', '>=', startDate)  // Range filter!
.where('datetime', '<=', endDate)     // Range filter!
.orderBy('datetime', 'desc')
```

The range filters are on the same field as `orderBy`, so Index 2 covers both!

## Summary

**You're correct:** We're predefining different conditions for different combinations of attributes.

- Each index = one query pattern
- Different query patterns = different indexes needed
- Fields must match exactly (order, direction, filters)
- Range queries on sort field are "free" (no extra index)

**Think of it like:**
- Index = A specific filing system optimized for one type of lookup
- Query = A question you're asking
- Match = The index must exactly match your question's structure

## Quick Decision Tree

When you write a query, Firestore asks:
1. What fields are you filtering on? (where clauses)
2. What field are you sorting by? (orderBy)
3. What's the sort direction? (asc/desc)

Then it looks for an index that matches that **exact pattern**.

**No match?** → Query fails or uses slow fallback
**Match found?** → Fast query using the index! ✨

