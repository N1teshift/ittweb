# Games API

Game statistics and management endpoints.

## Overview

The Games API provides endpoints for managing both scheduled and completed games. Games use a unified collection where `gameState` distinguishes between `'scheduled'` and `'completed'` games.

## Documentation

- **[CRUD Operations](./games/crud-operations.md)** - Create, read, update, and delete games
  - `GET /api/games` - List games with filters
  - `GET /api/games/[id]` - Get single game
  - `POST /api/games` - Create game (scheduled or completed)
  - `PUT /api/games/[id]` - Update game
  - `DELETE /api/games/[id]` - Delete game (admin only)

- **[Replay Operations](./games/replay-operations.md)** - Upload replay files
  - `POST /api/games/upload-replay` - Upload replay to create completed game
  - `POST /api/games/[id]/upload-replay` - Upload replay for scheduled game

## Game States

### Scheduled Games
Games that are planned but not yet played. Include:
- `scheduledDateTime` - When the game is scheduled
- `timezone` - Timezone for the scheduled time
- `teamSize` - Team format (1v1, 2v2, etc.)
- `gameType` - ELO or normal game
- `participants` - List of expected participants

### Completed Games
Games that have been played. Include:
- `datetime` - When the game was played
- `duration` - Game length in seconds
- `gamename` - Game name
- `map` - Map name
- `category` - Game category
- `players` - Array of player data with stats
- `replayUrl` - URL to replay file (if uploaded)

## Common Response Format

All endpoints use the standardized response format:

**Success**:
```typescript
{
  success: true;
  data: T; // Response data
}
```

**Error**:
```typescript
{
  success: false;
  error: string; // Error message
}
```

## Authentication

Most endpoints require authentication via Discord OAuth session cookie. Admin-only endpoints require both authentication and admin role.

## Related Documentation

- [API Reference](./README.md)
- [Database Schemas](../database/schemas.md)
- [Replay Parser System](../systems/replay-parser/)
