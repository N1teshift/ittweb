# Games API - Replay Operations

Replay file upload endpoints for creating and completing games.

## `POST /api/games/upload-replay`

Upload a Warcraft 3 replay file to create a completed game. **Requires authentication.**

**Authentication**: Session cookie required (Discord OAuth)

**Request**: Multipart form data

**Content-Type**: `multipart/form-data`

**Form Fields**:
- `replay` (file, required) - Warcraft 3 replay file (.w3g, .w3x)
- `scheduledGameId` (string, optional) - Numeric ID of scheduled game to link to
- `gameData` (string, optional) - JSON string with game data (fallback if replay parsing fails)

**File Size Limit**: 50MB

**Example Request** (using fetch):
```typescript
const formData = new FormData();
formData.append('replay', fileInput.files[0]);
// Optional: Link to scheduled game
formData.append('scheduledGameId', '1234');

const response = await fetch('/api/games/upload-replay', {
  method: 'POST',
  body: formData,
  credentials: 'include' // Include session cookie
});
```

**What It Does**:
1. Parses the replay file to extract game data (players, stats, duration, etc.)
2. Uploads replay file to Firebase Storage
3. Creates a completed game with extracted data
4. Links to scheduled game if `scheduledGameId` provided
5. Updates ELO scores for all players
6. Returns the created game ID

**Response**:
```typescript
{
  success: true;
  id: string; // Firestore document ID
  gameId: number; // Numeric game ID
  message: string; // Success message
}
```

Example response:
```json
{
  "success": true,
  "id": "abc123def456",
  "gameId": 1234,
  "message": "Game created successfully from replay"
}
```

**Error Responses**:
```json
// 401 Unauthorized
{
  "success": false,
  "error": "Authentication required"
}

// 400 Bad Request - Missing file
{
  "success": false,
  "error": "Replay file is required (field name: replay)"
}

// 400 Bad Request - Parsing failed
{
  "success": false,
  "error": "Replay parsing failed. Please supply gameData JSON or try again later."
}

// 400 Bad Request - Game already exists
{
  "success": false,
  "error": "Game with this gameId already exists"
}

// 413 Payload Too Large
{
  "success": false,
  "error": "File too large (max 50MB)"
}
```

**Note**: If replay parsing fails, you can provide `gameData` as a JSON string with the following structure:
```json
{
  "gameId": 1234,
  "datetime": "2025-01-15T20:30:00Z",
  "duration": 2400,
  "gamename": "Game 1234",
  "map": "Island Troll Tribes",
  "creatorName": "Player1",
  "ownername": "Player1",
  "category": "3v3",
  "players": [
    {
      "name": "Player1",
      "pid": 0,
      "flag": "winner",
      "class": "Troll",
      "kills": 5,
      "deaths": 2,
      "assists": 3,
      "gold": 15000
    }
  ]
}
```

## `POST /api/games/[id]/upload-replay`

Upload replay file for a scheduled game and convert it to completed. **Requires authentication.**

**Authentication**: Session cookie required (Discord OAuth)

**Request**: Multipart form data

**Content-Type**: `multipart/form-data`

**Form Fields**:
- `replay` (file, required) - Warcraft 3 replay file (.w3g, .w3x)
- `gameData` (string, optional) - JSON string with game data (fallback if replay parsing fails)

**File Size Limit**: 50MB

**Example Request** (using fetch):
```typescript
const formData = new FormData();
formData.append('replay', fileInput.files[0]);
// Optional: Provide game data if replay parsing fails
// formData.append('gameData', JSON.stringify({ ... }));

const response = await fetch('/api/games/abc123def456/upload-replay', {
  method: 'POST',
  body: formData,
  credentials: 'include' // Include session cookie
});
```

**What It Does**:
1. Validates the game exists and is in `'scheduled'` state
2. Uploads replay file to Firebase Storage
3. Parses replay to extract game data
4. Converts scheduled game to completed game (updates `gameState` to `'completed'`)
5. Adds completed game fields (datetime, duration, players, etc.)
6. Adds players to subcollection
7. Updates ELO scores for all players
8. Returns success message

**Response**:
```typescript
{
  success: true;
  gameId: string; // Firestore document ID
  message: string; // Success message
}
```

Example response:
```json
{
  "success": true,
  "gameId": "abc123def456",
  "message": "Replay uploaded and game completed successfully"
}
```

**Error Responses**:
```json
// 401 Unauthorized
{
  "success": false,
  "error": "Authentication required"
}

// 400 Bad Request - Game not found
{
  "success": false,
  "error": "Game not found"
}

// 400 Bad Request - Not a scheduled game
{
  "success": false,
  "error": "Can only upload replay for scheduled games"
}

// 400 Bad Request - Missing file
{
  "success": false,
  "error": "Replay file is required (field name: replay)"
}

// 400 Bad Request - Parsing failed
{
  "success": false,
  "error": "Replay parsing failed. Please supply gameData JSON or try again later."
}

// 400 Bad Request - Invalid game data
{
  "success": false,
  "error": "Invalid game data: at least 2 players are required"
}

// 413 Payload Too Large
{
  "success": false,
  "error": "File too large (max 50MB)"
}
```

**Note**: This endpoint is different from `/api/games/upload-replay`:
- This endpoint works with **existing scheduled games** (converts them to completed)
- The standalone endpoint creates **new completed games** from scratch
- Both endpoints parse replays and update ELO scores

**Note**: If replay parsing fails, you can provide `gameData` as a JSON string with the following structure:
```json
{
  "gameId": 1234,
  "datetime": "2025-01-15T20:30:00Z",
  "duration": 2400,
  "gamename": "Game 1234",
  "map": "Island Troll Tribes",
  "creatorName": "Player1",
  "ownername": "Player1",
  "category": "3v3",
  "players": [
    {
      "name": "Player1",
      "pid": 0,
      "flag": "winner",
      "class": "Troll",
      "kills": 5,
      "deaths": 2,
      "assists": 3,
      "gold": 15000
    }
  ]
}
```

## Related Documentation

- [Games API Overview](../games.md)
- [CRUD Operations](./crud-operations.md)
- [API Reference](../README.md)
- [Replay Parser System](../../systems/replay-parser/)

