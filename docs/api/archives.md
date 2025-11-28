# Archives API

Archive entry management endpoints.

## `GET /api/entries`

List archive entries.

**Query Parameters**:
- `limit` (number, optional) - Results limit
- `cursor` (string, optional) - Pagination cursor

**Response**:
```typescript
{
  success: true;
  data: ArchiveEntry[];
  cursor?: string;
  hasMore: boolean;
}
```

## `GET /api/entries/[id]`

Get archive entry by ID.

**Response**:
```typescript
{
  success: true;
  data: ArchiveEntry;
}
```

## `POST /api/entries`

Create archive entry. **Requires authentication.**

**Request Body**:
```typescript
{
  title: string;
  description?: string;
  linkedGameDocumentId?: string;
  linkedArchiveDocumentId?: string;
  mediaUrl?: string;
  mediaType?: 'youtube' | 'twitch';
  // ... other fields
}
```

**Response**:
```typescript
{
  success: true;
  id: string;
}
```

## `PUT /api/entries/[id]`

Update archive entry. **Requires authentication.**

**Request Body**:
```typescript
Partial<ArchiveEntry>
```

**Response**:
```typescript
{
  success: true;
  data: ArchiveEntry;
}
```

## `DELETE /api/entries/[id]`

Delete archive entry. **Requires authentication.**

**Response**:
```typescript
{
  success: true;
}
```

