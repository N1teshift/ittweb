# Games API

Game statistics and management endpoints.

## `GET /api/games`

List games with optional filters.

**Query Parameters**:
- `gameState` (string, optional) - `'scheduled' | 'completed'`
- `startDate` (string, optional) - ISO date string
- `endDate` (string, optional) - ISO date string
- `category` (string, optional) - Game category
- `player` (string, optional) - Filter by player name
- `ally` (string, optional) - Filter by ally name
- `enemy` (string, optional) - Filter by enemy name
- `teamFormat` (string, optional) - Team format
- `gameId` (number, optional) - Specific game ID
- `page` (number, optional) - Page number
- `limit` (number, optional) - Results per page
- `cursor` (string, optional) - Pagination cursor

**Example Request**:
```
GET /api/games?gameState=completed&category=3v3&startDate=2025-01-01&limit=10
```

**Response**:
```typescript
{
  success: true;
  data: {
    games: Game[];
    cursor?: string;
    hasMore: boolean;
  }
}
```

Example response:
```json
{
  "success": true,
  "data": {
    "games": [
      {
        "id": "abc123",
        "gameId": 1234,
        "gameState": "completed",
        "datetime": "2025-01-15T20:30:00Z",
        "duration": 2400,
        "gamename": "Game 1234",
        "map": "Island Troll Tribes",
        "category": "3v3",
        "creatorName": "Player1",
        "playerCount": 6,
        "createdAt": "2025-01-15T20:30:00Z",
        "updatedAt": "2025-01-15T20:30:00Z"
      }
    ],
    "cursor": "nextPageCursor",
    "hasMore": true
  }
}
```

## `GET /api/games/[id]`

Get single game by ID.

**Example Request**:
```
GET /api/games/abc123def456
```

**Response**:
```typescript
{
  success: true;
  data: Game;
}
```

Example response:
```json
{
  "success": true,
  "data": {
    "id": "abc123def456",
    "gameId": 1234,
    "gameState": "completed",
    "datetime": "2025-01-15T20:30:00Z",
    "duration": 2400,
    "gamename": "Game 1234",
    "map": "Island Troll Tribes",
    "category": "3v3",
    "creatorName": "Player1",
    "playerCount": 6,
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
    ],
    "createdAt": "2025-01-15T20:30:00Z",
    "updatedAt": "2025-01-15T20:30:00Z"
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "error": "Game not found"
}
```

## `POST /api/games`

Create a new game. **Requires authentication.**

**Authentication**: Session cookie required (Discord OAuth)

**Request Body**:

For scheduled games:
```typescript
{
  gameState: 'scheduled';
  scheduledDateTime: string; // ISO 8601 string in UTC
  timezone: string; // IANA timezone identifier (e.g., 'America/New_York')
  teamSize: '1v1' | '2v2' | '3v3' | '4v4' | '5v5' | '6v6' | 'custom';
  customTeamSize?: string; // Only when teamSize is 'custom'
  gameType: 'elo' | 'normal';
  gameVersion?: string; // e.g., 'v3.28'
  gameLength?: number; // Game length in seconds
  modes: string[]; // Array of game modes
  creatorName?: string; // Auto-filled from session if not provided
}
```

Example request:
```json
{
  "gameState": "scheduled",
  "scheduledDateTime": "2025-01-20T18:00:00Z",
  "timezone": "America/New_York",
  "teamSize": "3v3",
  "gameType": "elo",
  "gameVersion": "v3.28",
  "gameLength": 3600,
  "modes": ["standard"]
}
```

For completed games:
```typescript
{
  gameState: 'completed';
  gameId: number;
  datetime: string; // ISO string
  duration: number; // seconds
  gamename: string;
  map: string;
  creatorName: string;
  ownername: string; // Legacy field from replay file
  category?: string;
  replayUrl?: string;
  replayFileName?: string;
  playerNames?: string[];
  playerCount?: number;
  verified?: boolean;
  players: Array<{
    name: string;
    pid: number;
    flag: 'winner' | 'loser' | 'draw';
    class?: string;
    randomClass?: boolean;
    kills?: number;
    deaths?: number;
    assists?: number;
    gold?: number;
    damageDealt?: number;
    damageTaken?: number;
  }>;
}
```

Example request:
```json
{
  "gameState": "completed",
  "gameId": 1234,
  "datetime": "2025-01-15T20:30:00Z",
  "duration": 2400,
  "gamename": "Game 1234",
  "map": "Island Troll Tribes",
  "creatorName": "Player1",
  "ownername": "Player1",
  "category": "3v3",
  "playerCount": 6,
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

**Response**:
```typescript
{
  success: true;
  id: string; // Firestore document ID
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
```typescript
// 401 Unauthorized
{
  success: false;
  error: "Unauthorized";
}

// 400 Bad Request
{
  success: false;
  error: "Invalid request body";
}
```

## `PUT /api/games/[id]`

Update game. **Requires authentication.**

**Authentication**: Session cookie required (Discord OAuth)

**Request Body**:
```typescript
{
  // Common fields
  creatorName?: string;
  
  // Scheduled game updates
  scheduledDateTime?: string;
  timezone?: string;
  teamSize?: '1v1' | '2v2' | '3v3' | '4v4' | '5v5' | '6v6' | 'custom';
  customTeamSize?: string;
  gameType?: 'elo' | 'normal';
  gameVersion?: string;
  gameLength?: number;
  modes?: string[];
  
  // Completed game updates
  datetime?: string;
  duration?: number;
  gamename?: string;
  map?: string;
  category?: string;
  replayUrl?: string;
  verified?: boolean;
}
```

Example request:
```json
{
  "gamename": "Updated Game Name",
  "category": "4v4",
  "verified": true
}
```

**Response**:
```typescript
{
  success: true;
  data: Game;
}
```

**Error Responses**:
```json
// 401 Unauthorized
{
  "success": false,
  "error": "Unauthorized"
}

// 404 Not Found
{
  "success": false,
  "error": "Game not found"
}
```

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

## `DELETE /api/games/[id]`

Delete game. **Requires authentication (admin only).**

**Authentication**: Session cookie required, admin role only

**Example Request**:
```
DELETE /api/games/abc123def456
```

**Response**:
```typescript
{
  success: true;
}
```

Example response:
```json
{
  "success": true
}
```

**Error Responses**:
```json
// 401 Unauthorized
{
  "success": false,
  "error": "Unauthorized"
}

// 403 Forbidden (not admin)
{
  "success": false,
  "error": "Admin access required"
}

// 404 Not Found
{
  "success": false,
  "error": "Game not found"
}
```


