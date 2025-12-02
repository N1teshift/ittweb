# Players Module

> Date: 2025-12-02

**Purpose**: Player statistics, profiles, and comparison functionality.

## Exports

### Components
- `PlayersPage` - Player search and listing page (main component, ~172 lines)
- `PlayerCard` - Individual player card component (extracted from PlayersPage)
- `PlayersActionBar` - Action bar with search and comparison controls (extracted from PlayersPage)
- `ComparisonResults` - Side-by-side player comparison results display (extracted from PlayersPage)
- `PlayerProfile` - Individual player profile with stats
- `PlayerComparison` - Compare multiple players side-by-side

### Hooks
- `usePlayerStats` - Fetch player statistics by name (in `hooks/usePlayerStats.ts`)
- `usePlayerComparison` - Player comparison state management hook (in `components/usePlayerComparison.ts`)

### Services
- `playerService` - Player statistics operations
  - `getPlayerStats()` - Get comprehensive player stats
  - `searchPlayers()` - Search players by name
  - `comparePlayers()` - Compare multiple players
  - `normalizePlayerName()` - Normalize player names
  - `getPlayersPaginated()` - Get paginated list of players (cursor-based pagination using player name)

### Types
- `PlayerStats` - Complete player statistics
- `PlayerProfile` - Player profile data
- `CategoryStats` - Statistics per game category
- `PlayerComparison` - Comparison data structure

## Usage

```typescript
import { usePlayerStats } from '@/features/modules/community/players/hooks/usePlayerStats';
import { searchPlayers, comparePlayers } from '@/features/modules/community/players/lib/playerService';

// Fetch player stats
const { stats, loading, error } = usePlayerStats('PlayerName');

// Search players
const results = await searchPlayers('Player');

// Compare players
const comparison = await comparePlayers(['Player1', 'Player2']);
```

## API Routes

- `GET /api/players` - List players with pagination (supports `limit` and `lastPlayerName` query parameters)
- `GET /api/players/[name]` - Get player statistics
- `GET /api/players/search?q=query` - Search players
- `GET /api/players/compare?players=name1,name2` - Compare players

**Pagination**: The `/api/players` endpoint supports cursor-based pagination:
- `limit` (number, optional) - Number of players to return (default: 50)
- `lastPlayerName` (string, optional) - Cursor for pagination (player name to start after)

## Related Documentation

- [Firestore Collections Schema](../../../../docs/schemas/firestore-collections.md#playerstats-collection)
- [Game Stats Implementation](../../../../docs/systems/game-stats/implementation-plan.md)


