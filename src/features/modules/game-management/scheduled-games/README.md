# Scheduled Games Module

> Date: 2025-12-02

**Purpose**: Schedule and manage upcoming games with timezone support and player signups.

## Exports

### Components
- `ScheduledGamesPage` - Main scheduled games page
- `ScheduledGameCard` - Card for individual scheduled game
- `ScheduledGameForm` - Create/edit scheduled game form
- `ScheduledGameDetail` - Detailed scheduled game view
- `JoinGameButton` - Join/leave game button
- `ScheduledGameFilters` - Filter scheduled games

### Services
- `scheduledGameService` - Scheduled game CRUD operations (split into focused modules: create, read, update, delete, participation, utils)
  - `getAllScheduledGames()` - Get all scheduled games
  - `getScheduledGameById()` - Get single scheduled game
  - `createScheduledGame()` - Create new scheduled game
  - `updateScheduledGame()` - Update scheduled game
  - `deleteScheduledGame()` - Delete scheduled game
  - `joinScheduledGame()` - Join a scheduled game
  - `leaveScheduledGame()` - Leave a scheduled game

**Note**: `scheduledGameService` has been split into multiple focused modules for maintainability:
- `scheduledGameService.ts` - Main entry point (re-exports all functions)
- `scheduledGameService.create.ts` - Create operations
- `scheduledGameService.read.ts` - Read operations
- `scheduledGameService.read.helpers.ts` - Read helper functions (data conversion, filtering)
- `scheduledGameService.update.ts` - Update operations
- `scheduledGameService.delete.ts` - Delete operations
- `scheduledGameService.participation.ts` - Join/leave game operations
- `scheduledGameService.utils.ts` - Helper functions

All functions are still available via the main `scheduledGameService` import for backward compatibility.

### Utils
- `timezoneUtils` - Timezone conversion utilities

## Usage

```typescript
import { getAllScheduledGames, createScheduledGame } from '@/features/modules/game-management/scheduled-games/lib/scheduledGameService';

// Get all scheduled games
const games = await getAllScheduledGames(true, false); // includePast, includeArchived

// Create scheduled game
const game = await createScheduledGame({
  scheduledDateTime: '2025-02-01T20:00:00Z',
  timezone: 'America/New_York',
  teamSize: '4v4',
  gameType: 'ranked',
  description: 'Weekly ranked game'
});
```

## API Routes

- `GET /api/scheduled-games` - List scheduled games
- `GET /api/scheduled-games/[id]` - Get scheduled game
- `POST /api/scheduled-games` - Create scheduled game (authenticated)
- `PUT /api/scheduled-games/[id]` - Update scheduled game (authenticated)
- `DELETE /api/scheduled-games/[id]` - Delete scheduled game (authenticated)
- `POST /api/scheduled-games/[id]/join` - Join scheduled game (authenticated)
- `POST /api/scheduled-games/[id]/leave` - Leave scheduled game (authenticated)
- `POST /api/games/[id]/upload-replay` - Upload replay file for a scheduled game and convert it to completed (authenticated)

## Related Documentation

- [Firestore Collections Schema](../../../../docs/schemas/firestore-collections.md#games-collection-unified---scheduled-and-completed-games) - Scheduled games are stored in the unified `games` collection with `gameState: 'scheduled'`


