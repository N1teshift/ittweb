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
  content: string;
  contentType: 'post' | 'memory';
  date: string; // ISO date string
  creatorName?: string; // Auto-filled from session if not provided
  createdByDiscordId?: string; // Auto-filled from session if not provided
  entryType?: 'story' | 'changelog';
  images?: string[];
  videoUrl?: string; // YouTube video URL
  twitchClipUrl?: string; // Twitch clip URL
  replayUrl?: string; // Replay file URL
  linkedGameDocumentId?: string; // Link to Game document
  sectionOrder?: Array<'images' | 'video' | 'twitch' | 'replay' | 'game' | 'text'>;
  dateInfo?: {
    type: 'single' | 'interval' | 'undated';
    singleDate?: string;
    startDate?: string;
    endDate?: string;
    approximateText?: string;
  };
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


