# Icons API

API endpoints for listing available icon files.

## Endpoints

### GET /api/icons/list

List all available icon files in the system.

**Authentication**: Not required (public)

**Query Parameters**: None

**Response**:

```typescript
{
  success: true,
  data: IconFile[]
}
```

**IconFile**:
```typescript
{
  filename: string;      // Icon filename (e.g., "hero.png")
  path: string;          // Public path to icon (e.g., "/icons/itt/hero.png")
  category: string;      // Icon category (e.g., "icons")
}
```

**Example Request**:
```bash
GET /api/icons/list
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "filename": "hero.png",
      "path": "/icons/itt/hero.png",
      "category": "icons"
    },
    {
      "filename": "item.png",
      "path": "/icons/itt/item.png",
      "category": "icons"
    }
  ]
}
```

**Caching**: 
- Response is cached for 1 hour
- Cache-Control: `public, max-age=3600, must-revalidate`

**Notes**:
- Icons are stored in `/public/icons/itt/` directory
- Only `.png` files are returned
- Texture files and unit files are excluded
- Results are sorted by category, then by filename

