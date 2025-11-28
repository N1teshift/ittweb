# Scheduled Games API

Scheduled game management endpoints.

## `GET /api/scheduled-games`

List scheduled games.

**Query Parameters**:
- `includePast` (boolean, optional) - Include past games
- `includeArchived` (boolean, optional) - Include archived games

**Response**:
```typescript
{
  success: true;
  data: ScheduledGame[];
}
```

## `GET /api/scheduled-games/[id]`

Get scheduled game by ID.

**Response**:
```typescript
{
  success: true;
  data: ScheduledGame;
}
```

## `POST /api/scheduled-games`

Create scheduled game. **Requires authentication.**

**Request Body**:
```typescript
{
  scheduledDateTime: string; // ISO date string
  timezone: string;
  teamSize: number;
  gameType: string;
  description?: string;
  status?: 'scheduled' | 'awaiting_replay' | 'archived';
  // ... other fields
}
```

**Response**:
```typescript
{
  success: true;
  id: string;
  archiveId?: string; // If status is 'archived'
}
```

## `PUT /api/scheduled-games/[id]`

Update scheduled game. **Requires authentication.**

**Request Body**:
```typescript
Partial<ScheduledGame>
```

**Response**:
```typescript
{
  success: true;
  data: ScheduledGame;
}
```

## `DELETE /api/scheduled-games/[id]`

Delete scheduled game. **Requires authentication.**

**Response**:
```typescript
{
  success: true;
}
```

## `POST /api/scheduled-games/[id]/join`

Join scheduled game. **Requires authentication.**

**Response**:
```typescript
{
  success: true;
  data: ScheduledGame;
}
```

## `POST /api/scheduled-games/[id]/leave`

Leave scheduled game. **Requires authentication.**

**Response**:
```typescript
{
  success: true;
  data: ScheduledGame;
}
```

## `POST /api/scheduled-games/[id]/upload-replay`

Upload replay file. **Requires authentication.**

**Request**: Multipart form data with `replay` file

**Response**:
```typescript
{
  success: true;
  replayUrl: string;
}
```

