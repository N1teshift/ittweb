# UI Patterns

Common UI patterns for error handling, loading states, and filtering.

## Error Handling Pattern

Error handling patterns for service and component layers.

**See [Error Handling Guide](../../ERROR_HANDLING.md) for complete patterns, examples, and best practices.**

```typescript
function MyComponent() {
  const [error, setError] = useState<string | null>(null);

  const handleAction = async () => {
    try {
      setError(null);
      await performAction();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div>
      {error && (
        <div className="text-red-400 mb-4">{error}</div>
      )}
      {/* Component content */}
    </div>
  );
}
```

## Loading States Pattern

```typescript
function MyComponent() {
  const { data, loading, error } = useMyData();

  if (loading) {
    return <LoadingScreen message="Loading..." />;
  }

  if (error) {
    return <div className="text-red-400">Error: {error.message}</div>;
  }

  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  return (
    <div>
      {/* Render data */}
    </div>
  );
}
```

## Filtering/Search Pattern

```typescript
// Hook with filters
export function useFilteredItems() {
  const [filters, setFilters] = useState({ search: '', category: '' });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);

      const response = await fetch(`/api/items?${params}`);
      const data = await response.json();
      setItems(data.items);
      setLoading(false);
    };

    fetchItems();
  }, [filters.search, filters.category]);

  return { items, loading, filters, setFilters };
}

// Component
function FilteredList() {
  const { items, loading, filters, setFilters } = useFilteredItems();

  return (
    <div>
      <input
        type="text"
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        placeholder="Search..."
        className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-600 text-white"
      />
      <select
        value={filters.category}
        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-600 text-white"
      >
        {categoryOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {/* Render items */}
    </div>
  );
}
```

## Related Documentation

- [Code Patterns Index](../code-patterns.md)
- [Error Handling Guide](../../ERROR_HANDLING.md)
- [Component Library](../components.md)

