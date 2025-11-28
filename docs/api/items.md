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

List all available icon files from the `public/icons/itt/` directory.

**Authentication**: Not required

**Response**: Returns array of icon file metadata (direct response, no wrapper):
```typescript
IconFile[]
```

**IconFile Type**:
```typescript
{
  filename: string;      // Icon filename (e.g., "BTNIcon.png")
  path: string;          // Public path to icon (e.g., "/icons/itt/BTNIcon.png")
  category: string;      // Icon category (e.g., "icons")
  subdirectory?: string; // Optional subdirectory (currently unused)
}[]
```

**Example Response**:
```json
[
  {
    "filename": "BTNIcon.png",
    "path": "/icons/itt/BTNIcon.png",
    "category": "icons"
  },
  {
    "filename": "BTNItem.png",
    "path": "/icons/itt/BTNItem.png",
    "category": "icons"
  }
]
```

**Error Response**:
```typescript
{
  error: string
}
```

**Status Codes**:
- `200` - Success
- `405` - Method not allowed (only GET is supported)
- `500` - Internal server error

**Usage**:
Primarily used by the Icon Mapper tool (`/tools/icon-mapper`) to load available icons for mapping to game entities (abilities, items, buildings, trolls, units).

**Notes**:
- Icons are stored in a flat directory structure
- Texture files and unit files are automatically excluded
- Results are sorted by category, then by filename

