# Players Module

**Purpose**: Player statistics, profiles, and comparison functionality.

## Exports

### Components
- `PlayersPage` - Player search and listing page
- `PlayerProfile` - Individual player profile with stats
- `PlayerComparison` - Compare multiple players side-by-side

### Hooks
- `usePlayerStats` - Fetch player statistics by name

### Services
- `playerService` - Player statistics operations
  - `getPlayerStats()` - Get comprehensive player stats
  - `searchPlayers()` - Search players by name
  - `comparePlayers()` - Compare multiple players
  - `normalizePlayerName()` - Normalize player names

### Types
- `PlayerStats` - Complete player statistics
- `PlayerProfile` - Player profile data
- `CategoryStats` - Statistics per game category
- `PlayerComparison` - Comparison data structure

## Usage

```typescript
import { usePlayerStats } from '@/features/modules/players';
import { searchPlayers, comparePlayers } from '@/features/modules/players/lib/playerService';

// Fetch player stats
const { stats, loading, error } = usePlayerStats('PlayerName');

// Search players
const results = await searchPlayers('Player');

// Compare players
const comparison = await comparePlayers(['Player1', 'Player2']);
```

## API Routes

- `GET /api/players` - List all players
- `GET /api/players/[name]` - Get player statistics
- `GET /api/players/search?q=query` - Search players
- `GET /api/players/compare?players=name1,name2` - Compare players

## Related Documentation

- [Firestore Collections Schema](../../../../docs/schemas/firestore-collections.md#playerstats-collection)
- [Game Stats Implementation](../../../../docs/systems/game-stats/implementation-plan.md)

