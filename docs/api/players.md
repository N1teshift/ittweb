# Players API

Player statistics and profile endpoints.

## `GET /api/players`

List all players.

**Response**:
```typescript
{
  success: true;
  data: PlayerStats[];
}
```

## `GET /api/players/[name]`

Get player statistics by name.

**Query Parameters**:
- `category` (string, optional) - Filter by category
- `startDate` (string, optional) - ISO date string
- `endDate` (string, optional) - ISO date string
- `includeGames` (boolean, optional) - Include game list

**Response**:
```typescript
PlayerStats
```

## `GET /api/players/search`

Search players by name.

**Query Parameters**:
- `q` (string, required) - Search query

**Response**:
```typescript
{
  success: true;
  data: PlayerStats[];
}
```

## `GET /api/players/compare`

Compare multiple players.

**Query Parameters**:
- `players` (string, required) - Comma-separated player names

**Response**:
```typescript
{
  success: true;
  data: PlayerComparison;
}
```

