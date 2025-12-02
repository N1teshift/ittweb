# Shared Module

**Purpose**: Shared components, types, and utilities used across multiple feature modules.

## Exports

### Components
- `DateRangeFilter` - Date range selection component with presets
- `PlayerFilter` - Player name input filter component
- `TeamFormatFilter` - Team format selection (e.g., "4v4", "3v3") filter component
- `GameFilters` - Combined filter component that includes all filter types

### Types
- `DateRange` - Date range interface with start/end dates
- `DateRangePreset` - Date range preset with label and date range
- `FilterState` - URL query parameter filter state interface

### Utils
- `formatDuration(seconds: number)` - Format seconds to human-readable duration string (e.g., "1h 30m 45s")
- `formatEloChange(change: number)` - Format ELO change with sign (e.g., "+25.00", "-10.50")

## Usage

### Using Filter Components

```typescript
import { DateRangeFilter, PlayerFilter, TeamFormatFilter } from '@/features/modules/shared/components';

// Date range filter
<DateRangeFilter
  startDate={startDate}
  endDate={endDate}
  onChange={(range) => setDateRange(range)}
/>

// Player filter
<PlayerFilter
  value={playerName}
  onChange={(name) => setPlayerName(name)}
/>

// Team format filter
<TeamFormatFilter
  value={teamFormat}
  onChange={(format) => setTeamFormat(format)}
/>
```

### Using Utility Functions

```typescript
import { formatDuration, formatEloChange } from '@/features/modules/shared/utils';

// Format game duration
const duration = formatDuration(3661); // "1h 1m 1s"

// Format ELO change
const change = formatEloChange(25.5); // "+25.50"
const loss = formatEloChange(-10.25); // "-10.25"
```

### Using Types

```typescript
import type { DateRange, FilterState } from '@/features/modules/shared/types';

// Date range type
const range: DateRange = {
  start: new Date('2025-01-01'),
  end: new Date('2025-01-31')
};

// Filter state for URL params
const filters: FilterState = {
  startDate: '2025-01-01',
  endDate: '2025-01-31',
  category: 'ranked',
  player: 'PlayerName'
};
```

## Related Documentation

- Used by: games, players, standings, analytics modules
- [Games Module](../games/README.md) - Uses GameFilters component
- [Players Module](../players/README.md) - Uses shared filter components
- [Analytics Module](../analytics/README.md) - Uses shared utilities
