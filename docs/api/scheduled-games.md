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

**Authentication**: Session cookie required (Discord OAuth)

**Request Body**:
```typescript
{
  scheduledDateTime: string; // ISO 8601 string in UTC
  scheduledDateTimeString: string; // ISO 8601 string (for querying)
  timezone: string; // IANA timezone identifier (e.g., 'America/New_York')
  teamSize: '1v1' | '2v2' | '3v3' | '4v4' | '5v5' | '6v6' | 'custom';
  customTeamSize?: string; // Only when teamSize is 'custom'
  gameType: 'elo' | 'normal';
  gameVersion?: string; // e.g., 'v3.28'
  gameLength?: number; // Game length in seconds
  modes: string[]; // Array of game modes
  creatorName: string;
  createdByDiscordId: string;
  participants?: Array<{
    discordId: string;
    username: string;
    joinedAt: string;
  }>;
}
```

Example request:
```json
{
  "scheduledDateTime": "2025-01-20T18:00:00Z",
  "scheduledDateTimeString": "2025-01-20T18:00:00Z",
  "timezone": "America/New_York",
  "teamSize": "3v3",
  "gameType": "elo",
  "gameVersion": "v3.28",
  "gameLength": 3600,
  "modes": ["standard"],
  "creatorName": "Player1",
  "createdByDiscordId": "123456789"
}
```

**Response**:
```typescript
{
  success: true;
  id: string; // Firestore document ID
  archiveId?: string; // If status is 'archived'
}
```

Example response:
```json
{
  "success": true,
  "id": "abc123def456"
}
```

**Error Responses**:
```json
// 401 Unauthorized
{
  "success": false,
  "error": "Unauthorized"
}

// 400 Bad Request
{
  "success": false,
  "error": "Invalid request body"
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

## Replay Upload for Scheduled Games

**Note**: Replay upload functionality for scheduled games has been moved to the Games API.

To upload a replay for a scheduled game, use:
- **`POST /api/games/[id]/upload-replay`** - Upload replay and convert scheduled game to completed

See [Games API - Upload Replay for Scheduled Game](./games.md#post-apigamesidupload-replay) for complete documentation.

This endpoint:
- Uploads replay file for an existing scheduled game
- Converts the scheduled game to a completed game
- Updates ELO scores automatically
- Requires authentication


