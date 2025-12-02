# Standings Module

> Date: 2025-12-02

**Purpose**: Leaderboard and rankings system with category-based filtering.

## Exports

### Components
- `Leaderboard` - Main leaderboard display
- `CategorySelector` - Category filter component

### Hooks
- `useStandings` - Fetch standings data

### Services
- `standingsService` - Leaderboard operations
  - `getStandings()` - Get leaderboard for category
  - `calculateRank()` - Calculate player rank

### Types
- `StandingsEntry` - Leaderboard entry
- `StandingsResponse` - Standings API response
- `StandingsFilters` - Filter options

## Usage

```typescript
import { useStandings } from '@/features/modules/community/standings/hooks/useStandings';
import { getStandings } from '@/features/modules/community/standings/lib/standingsService';

// Fetch standings with hook
const { standings, loading, error } = useStandings('ranked');

// Fetch standings directly
const standings = await getStandings({
  category: 'ranked',
  minGames: 10,
  limit: 50
});
```

## API Routes

- `GET /api/standings?category=ranked&minGames=10` - Get leaderboard

## Related Documentation

- [Firestore Collections Schema](../../../../docs/schemas/firestore-collections.md#playerstats-collection)
- [Game Stats Implementation](../../../../docs/systems/game-stats/implementation-plan.md)


