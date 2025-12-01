# Pagination Pattern

Cursor-based pagination for large datasets.

## Cursor-Based Pagination

```typescript
// Service
export async function getItems(cursor?: string, limit = 20) {
  const db = getFirestoreAdmin();
  let query: FirebaseFirestore.Query = db.collection('items')
    .orderBy('createdAt', 'desc')
    .limit(limit + 1); // Fetch one extra to check if there's more

  if (cursor) {
    const cursorDoc = await db.collection('items').doc(cursor).get();
    query = query.startAfter(cursorDoc);
  }

  const snapshot = await query.get();
  const items = snapshot.docs.slice(0, limit).map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  const hasMore = snapshot.docs.length > limit;
  const nextCursor = hasMore ? snapshot.docs[limit].id : undefined;

  return { items, hasMore, nextCursor };
}

// Hook
export function useItems() {
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchItems = async (nextCursor?: string) => {
    setLoading(true);
    const response = await fetch(`/api/items?cursor=${nextCursor || ''}`);
    const data = await response.json();
    
    if (nextCursor) {
      setItems(prev => [...prev, ...data.items]);
    } else {
      setItems(data.items);
    }
    
    setCursor(data.nextCursor);
    setHasMore(data.hasMore);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchItems(cursor);
    }
  };

  return { items, loading, hasMore, loadMore };
}
```

## Related Documentation

- [Code Patterns Index](../code-patterns.md)
- [Performance Guide](../../PERFORMANCE.md)

