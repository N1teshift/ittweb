# Game Management Module

**Purpose**: Game creation, scheduling, and management features.

## Sub-modules

### entries/
Game entry management for recording game results.

**Exports**:
- Components: `EntryFormModal`, `EntryEditModal`
- Services for creating and managing game entries

### games/
Completed game data and statistics.

**Exports**:
- Components: `GameCard`, `GameDetail`, `GameList`, `PlayerStatsTable`
- Hooks: `useGame`, `useGames`, `useGameFilters`
- Services for game CRUD operations
- Types for game data structures

### scheduled-games/
Scheduled game management and participation.

**Exports**:
- Components: `ScheduledGameCard`, `ScheduleGameForm`, `UploadReplayModal`
- Services for scheduling and managing upcoming games
- Utilities for timezone handling

## Usage

```typescript
import { GameCard, useGames } from '@/features/modules/game-management/games';
import { ScheduleGameForm } from '@/features/modules/game-management/scheduled-games';
import { EntryFormModal } from '@/features/modules/game-management/entries';
```

## Related Documentation

- [Games Sub-module](./games/README.md)
- [Entries Sub-module](./entries/README.md)
- [Scheduled Games Sub-module](./scheduled-games/README.md)
