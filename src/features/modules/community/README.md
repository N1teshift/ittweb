# Community Module

**Purpose**: Community features including player profiles, game archives, and competitive standings.

## Sub-modules

### archives/
Historical game data and replay archives.

**Exports**:
- Components for browsing and viewing archived games
- Hooks for fetching archive data
- Types for archive entries

### players/
Player profiles, statistics, and performance tracking.

**Exports**:
- Components for player profiles and stats displays
- Hooks: `usePlayerStats`, `usePlayerComparison`
- Types: `PlayerProfile`, `PlayerSearchFilters`
- Utilities for player data processing

### standings/
Competitive rankings and leaderboards.

**Exports**:
- Components for displaying standings and rankings
- Hooks for fetching leaderboard data
- Types for ranking data structures

## Usage

```typescript
import { PlayerProfile } from '@/features/modules/community/players';
import { StandingsTable } from '@/features/modules/community/standings';
import { ArchivesList } from '@/features/modules/community/archives';
```

## Related Documentation

- [Players Sub-module](./players/README.md)
- [Shared Module](../shared/README.md) - Uses shared filter components
