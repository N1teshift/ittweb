# Games Module

**Purpose**: Game statistics tracking, ELO calculation, and game management system.

## Exports

### Components
- `GameList` - Displays paginated list of games with filters
- `GameCard` - Card component for individual game display
- `GameDetail` - Detailed game view with player information

### Hooks
- `useGames` - Fetch and filter games list
- `useGame` - Fetch single game by ID

### Services
- `gameService` - CRUD operations for games
- `eloCalculator` - ELO rating calculations
- `replayParser` - Parse Warcraft 3 replay files
- `w3mmdUtils` - W3MMD (Warcraft 3 Multi-Map Data) utilities

### Types
- `Game` - Game document structure
- `GamePlayer` - Player data within a game
- `CreateGame` - Game creation payload
- `UpdateGame` - Game update payload
- `GameFilters` - Filter options for game queries

## Usage

```typescript
import { useGames } from '@/features/modules/games';
import { createGame } from '@/features/modules/games/lib/gameService';

// Fetch games with filters
const { games, loading, error } = useGames({
  category: 'ranked',
  dateRange: { start: '2025-01-01', end: '2025-01-31' }
});

// Create a new game
const newGame = await createGame({
  category: 'ranked',
  teamSize: 4,
  players: [
    { name: 'Player1', team: 1, result: 'win', elo: 1500 },
    { name: 'Player2', team: 1, result: 'win', elo: 1500 }
  ]
});
```

## API Routes

- `GET /api/games` - List games (supports query filters)
- `GET /api/games/[id]` - Get single game
- `POST /api/games` - Create game (authenticated)
- `PUT /api/games/[id]` - Update game (authenticated)
- `DELETE /api/games/[id]` - Delete game (authenticated)

## Related Documentation

- [Firestore Collections Schema](../../../../docs/schemas/firestore-collections.md#games-collection)
- [Game Stats Implementation](../../../../docs/systems/game-stats/implementation-plan.md)
- [ELO Calculator](../../lib/eloCalculator.ts)


