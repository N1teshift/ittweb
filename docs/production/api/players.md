# Players API

Player statistics and profile endpoints.

## `GET /api/players`

List all players with cursor-based pagination.

**Query Parameters**:
- `limit` (number, optional) - Maximum number of players to return (default: 50)
- `lastPlayerName` (string, optional) - Cursor for pagination (player name to start after)

**Example Request**:
```
GET /api/players?limit=50
GET /api/players?limit=50&lastPlayerName=Player50
```

**Response**:
```typescript
{
  success: true;
  data: PlayerStats[];
}
```

**Pagination**: The endpoint supports cursor-based pagination using `lastPlayerName`. To get the next page, use the name of the last player from the previous response as the `lastPlayerName` parameter.

## `GET /api/players/[name]`

Get player statistics by name.

**Query Parameters**:
- `category` (string, optional) - Filter by category
- `startDate` (string, optional) - ISO date string
- `endDate` (string, optional) - ISO date string
- `includeGames` (boolean, optional) - Include game list

**Example Request**:
```
GET /api/players/Player1?category=3v3&includeGames=true
```

**Response**:
```typescript
PlayerStats
```

Example response:
```json
{
  "id": "player1",
  "name": "Player1",
  "categories": {
    "3v3": {
      "wins": 45,
      "losses": 30,
      "draws": 5,
      "score": 1520,
      "games": 80,
      "rank": 5,
      "peakElo": 1650,
      "peakEloDate": "2025-01-10T00:00:00Z"
    }
  },
  "totalGames": 80,
  "lastPlayed": "2025-01-15T20:30:00Z",
  "firstPlayed": "2024-06-01T00:00:00Z",
  "createdAt": "2024-06-01T00:00:00Z",
  "updatedAt": "2025-01-15T20:30:00Z"
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "error": "Player not found"
}
```

## `GET /api/players/search`

Search players by name.

**Query Parameters**:
- `q` (string, required) - Search query

**Example Request**:
```
GET /api/players/search?q=Player
```

**Response**:
```typescript
{
  success: true;
  data: PlayerStats[];
}
```

Example response:
```json
{
  "success": true,
  "data": [
    {
      "id": "player1",
      "name": "Player1",
      "categories": {
        "3v3": {
          "wins": 45,
          "losses": 30,
          "score": 1520,
          "games": 80
        }
      },
      "totalGames": 80
    },
    {
      "id": "player2",
      "name": "Player2",
      "categories": {
        "3v3": {
          "wins": 30,
          "losses": 45,
          "score": 1480,
          "games": 80
        }
      },
      "totalGames": 80
    }
  ]
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "error": "Search query required"
}
```

## `GET /api/players/compare`

Compare multiple players.

**Query Parameters**:
- `players` (string, required) - Comma-separated player names

**Example Request**:
```
GET /api/players/compare?players=Player1,Player2,Player3
```

**Response**:
```typescript
{
  success: true;
  data: PlayerComparison;
}
```

Example response:
```json
{
  "success": true,
  "data": {
    "players": [
      {
        "id": "player1",
        "name": "Player1",
        "categories": {
          "3v3": {
            "wins": 45,
            "losses": 30,
            "score": 1520,
            "games": 80
          }
        },
        "totalGames": 80
      },
      {
        "id": "player2",
        "name": "Player2",
        "categories": {
          "3v3": {
            "wins": 30,
            "losses": 45,
            "score": 1480,
            "games": 80
          }
        },
        "totalGames": 80
      }
    ],
    "headToHead": {
      "player1": {
        "player2": {
          "wins": 8,
          "losses": 5
        }
      }
    },
    "eloComparison": [
      {
        "date": "2025-01-01",
        "Player1": 1500,
        "Player2": 1480
      },
      {
        "date": "2025-01-15",
        "Player1": 1520,
        "Player2": 1480
      }
    ]
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "error": "At least two players required for comparison"
}
```


