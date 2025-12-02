# Meta Module

**Purpose**: Analytics dashboard displaying system-wide statistics and charts for system monitoring and insights.

## Exports

### Components
- `MetaPage` - Main analytics dashboard page component
- `MetaCharts` - Chart container component displaying various analytics
- `MetaFilters` - Filter controls for the meta dashboard

### Hooks
- `useMetaData` - Hook for fetching meta dashboard data
- `useMetaFilters` - Hook for managing meta dashboard filters and state

## Usage

### Basic Usage

```typescript
import { MetaPage } from '@/features/modules/meta/components';

// The meta dashboard page is accessible at /meta
<MetaPage />
```

### Using Meta Hooks

```typescript
import { useMetaData, useMetaFilters } from '@/features/modules/meta/components';

// Fetch meta dashboard data
const { data, loading, error } = useMetaData();

// Manage meta filters
const { filters, setFilters, resetFilters } = useMetaFilters();
```

## Features

The meta dashboard displays comprehensive system statistics including:
- **Activity Charts**: Games played over time
- **ELO Statistics**: Rating distribution and trends
- **Win Rate Data**: Overall win/loss statistics
- **Class Statistics**: Performance by class
- **Player Activity**: Active player metrics

## API Routes

- `GET /api/analytics/meta` - Get comprehensive meta dashboard data

## Related Documentation

- [Analytics Module](./analytics/README.md) - Individual chart components and analytics services
- [Game Stats Implementation](../../../../docs/systems/game-stats/implementation-plan.md)



