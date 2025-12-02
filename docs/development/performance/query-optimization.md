# Firestore Query Optimization

Strategies for optimizing Firestore database queries and operations.

## Use Indexes

Firestore requires composite indexes for complex queries. Create indexes in Firebase Console:

```typescript
// This query needs a composite index
db.collection('games')
  .where('category', '==', 'ranked')
  .where('createdAt', '>', startDate)
  .orderBy('createdAt', 'desc')
  .limit(20);

// Index: category (Ascending), createdAt (Descending)
```

**When to create indexes:**
- Multiple `where` clauses
- `where` + `orderBy` on different fields
- Multiple `orderBy` clauses

## Limit Results

Always limit query results:

```typescript
// Good
query.limit(20);

// Bad - fetches all documents
const snapshot = await query.get();
```

## Pagination

Use cursor-based pagination for large datasets:

```typescript
// First page
let query = db.collection('games')
  .orderBy('createdAt', 'desc')
  .limit(20);

const snapshot = await query.get();
const lastDoc = snapshot.docs[snapshot.docs.length - 1];

// Next page
query = db.collection('games')
  .orderBy('createdAt', 'desc')
  .startAfter(lastDoc)
  .limit(20);
```

## Select Only Needed Fields

```typescript
// Good - only fetch needed fields
const doc = await db.collection('games').doc(id).get();
const { title, createdAt } = doc.data()!;

// Avoid fetching entire document if only need a few fields
```

## Batch Operations

Use batch writes for multiple operations:

```typescript
const batch = db.batch();

games.forEach(game => {
  const ref = db.collection('games').doc();
  batch.set(ref, game);
});

await batch.commit(); // Single network request
```

## Database Optimization

### Denormalization

Denormalize data when reads > writes:

```typescript
// Store computed values
interface Game {
  id: string;
  playerCount: number; // Denormalized - computed on write
  // Instead of counting players subcollection on read
}
```

### Avoid Deep Queries

Limit subcollection queries:

```typescript
// Good - fetch parent, then subcollection if needed
const game = await db.collection('games').doc(id).get();
const players = await db.collection('games').doc(id).collection('players').get();

// Bad - avoid deep nested queries
```

## Related Documentation

- [Performance Guide](../../shared/PERFORMANCE.md)
- [Database Indexes](../../production/database/indexes.md)
- [Database Schemas](../../production/database/schemas.md)

