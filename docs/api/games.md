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

## `GET /api/games/[id]`

Get single game by ID.

**Response**:
```typescript
{
  success: true;
  data: Game;
}
```

## `POST /api/games`

Create a new game. **Requires authentication.**

**Request Body**:
```typescript
{
  gameState?: 'scheduled' | 'completed';
  // For scheduled games: CreateScheduledGame
  // For completed games: CreateCompletedGame
}
```

**Response**:
```typescript
{
  success: true;
  id: string;
}
```

## `PUT /api/games/[id]`

Update game. **Requires authentication.**

**Request Body**:
```typescript
UpdateGame
```

**Response**:
```typescript
{
  success: true;
  data: Game;
}
```

## `DELETE /api/games/[id]`

Delete game. **Requires authentication (admin only).**

**Response**:
```typescript
{
  success: true;
}
```

