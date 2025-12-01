# Games API - CRUD Operations

CRUD (Create, Read, Update, Delete) operations for games.

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

## Related Documentation

- [Games API Overview](../games.md)
- [Replay Operations](./replay-operations.md)
- [API Reference](../README.md)

