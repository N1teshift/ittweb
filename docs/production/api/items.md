# Items API

Item data endpoints.

## `GET /api/items`

List all items.

**Query Parameters**:
- `type` (string, optional) - Filter by item type

**Response**:
```typescript
{
  success: true;
  data: Item[];
}
```

**Note**: For icon file listing, see [Icons API](./icons.md).


