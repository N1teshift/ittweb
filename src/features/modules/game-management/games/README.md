# Games Module

> Date: 2025-12-02

**Purpose**: Game statistics tracking, ELO calculation, and game management system.

## Exports

### Components
- `GameList` - Displays paginated list of games with filters
- `GameCard` - Card component for individual game display
- `GameDetail` - Detailed game view with player information

### Filter Components (in `shared/components/`)
- `GameFiltersComponent` - Main filter UI component combining all filter types
- `PlayerFilter` - Filter games by player name
- `TeamFormatFilter` - Filter games by team format (e.g., "4v4", "3v3")
- `DateRangeFilter` - Filter games by date range (shared component)

### Hooks
- `useGames` - Fetch and filter games list
- `useGame` - Fetch single game by ID
- `useGameFilters` - Manage game filters with URL sync and localStorage persistence
  - Syncs filters with URL query parameters
  - Persists filters to localStorage
  - Provides `filters`, `setFilters`, `updateFilter`, `resetFilters`, `hasActiveFilters`, and `activeFilterCount`

### Services
- `gameService` - CRUD operations for games (split into focused modules: create, read, update, delete, participation, utils)
- `eloCalculator` - ELO rating calculations and recalculation utilities
- `replayParser` - Parse Warcraft 3 replay files
- `w3mmdUtils` - W3MMD (Warcraft 3 Multi-Map Data) utilities

**Note**: `gameService` has been split into multiple focused modules for maintainability:
- `gameService.ts` - Main entry point (re-exports all functions)
- `gameService.create.ts` - Create operations
- `gameService.read.ts` - Read operations
- `gameService.update.ts` - Update operations
- `gameService.delete.ts` - Delete operations
- `gameService.participation.ts` - Join/leave game operations
- `gameService.utils.ts` - Helper functions

All functions are still available via the main `gameService` import for backward compatibility.

### Types
- `Game` - Game document structure
- `GamePlayer` - Player data within a game
- `CreateGame` - Game creation payload
- `UpdateGame` - Game update payload
- `GameFilters` - Filter options for game queries

## Usage

```typescript
import { useGames } from '@/features/modules/game-management/games/hooks/useGames';
import { createGame } from '@/features/modules/game-management/games/lib/gameService';

// Fetch games with filters
const { games, loading, error } = useGames({
  category: 'ranked',
  dateRange: { start: '2025-01-01', end: '2025-01-31' }
});

// Create a new game
const newGame = await createGame({
  category: 'ranked',
  teamSize: '4v4',
  players: [
    { name: 'Player1', team: 1, result: 'win', elo: 1500 },
    { name: 'Player2', team: 1, result: 'win', elo: 1500 }
  ]
});

// Use game filters with URL sync and localStorage
import { useGameFilters } from '@/features/modules/game-management/games/hooks/useGameFilters';
import { GameFiltersComponent } from '@/features/modules/shared/components';

const { filters, setFilters, resetFilters, hasActiveFilters, activeFilterCount } = useGameFilters();

<GameFiltersComponent
  filters={filters}
  onFiltersChange={setFilters}
  onReset={resetFilters}
/>
```

## API Routes

- `GET /api/games` - List games (supports query filters)
- `GET /api/games/[id]` - Get single game
- `POST /api/games` - Create game (authenticated)
- `PUT /api/games/[id]` - Update game (authenticated)
- `DELETE /api/games/[id]` - Delete game (authenticated)

## ELO Calculator Functions

The `eloCalculator` module provides:

- `calculateEloChange()` - Calculate ELO change for a single game result
- `calculateTeamElo()` - Calculate average team ELO
- `updateEloScores()` - Update ELO scores for all players in a game
- `recalculateFromGame()` - Recalculate ELO from a specific game forward (useful for fixing incorrect games)

**Example: Recalculating ELO**
```typescript
import { recalculateFromGame } from '@/features/modules/game-management/games/lib/eloCalculator';

// Recalculate ELO starting from a specific game
// This rolls back ELO changes for affected players and recalculates
// all subsequent games in chronological order
await recalculateFromGame('game-id-123');
```

## Related Documentation

- [Firestore Collections Schema](../../../../docs/schemas/firestore-collections.md#games-collection)
- [Game Stats Implementation](../../../../docs/systems/game-stats/implementation-plan.md)
- [ELO Calculator](../../lib/eloCalculator.ts)


