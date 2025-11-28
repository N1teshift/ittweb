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

## `GET /api/icons/list`

List available icons.

**Response**:
```typescript
{
  success: true;
  data: string[]; // Icon IDs
}
```

