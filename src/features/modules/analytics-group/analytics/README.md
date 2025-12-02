# Analytics Module

> Date: 2025-12-02

**Purpose**: Analytics data aggregation and visualization charts for game statistics.

## Exports

### Components
- `ActivityChart` - Games played over time
- `EloChart` - ELO rating history
- `WinRateChart` - Win rate pie chart
- `GameLengthChart` - Game duration statistics
- `PlayerActivityChart` - Player activity over time
- `ClassSelectionChart` - Class selection statistics
- `ClassWinRateChart` - Win rate by class

### Services
- `analyticsService` - Analytics data aggregation
  - `getActivityData()` - Games per day/week/month
  - `getEloHistory()` - ELO changes over time
  - `getWinRateData()` - Win/loss statistics
  - `getClassStats()` - Class-based statistics

### Types
- `ActivityDataPoint` - Activity chart data point
- `EloHistoryDataPoint` - ELO history data point
- `WinRateData` - Win rate statistics
- `ClassStats` - Class statistics

## Usage

```typescript
import { ActivityChart } from '@/features/modules/analytics-group/analytics/components';
import { getActivityData } from '@/features/modules/analytics-group/analytics/lib/analyticsService';

// Fetch activity data
const activityData = await getActivityData({
  startDate: '2025-01-01',
  endDate: '2025-01-31',
  category: 'ranked'
});

// Use chart component
<ActivityChart data={activityData} />
```

## Pages

- `/analytics/classes` - Class Statistics overview page with class selection and win rate charts
- `/analytics/classes/[className]` - Class detail page with class-specific statistics, win rate chart, and top players

## API Routes

- `GET /api/analytics/activity` - Get activity data
- `GET /api/analytics/elo-history` - Get ELO history
- `GET /api/analytics/win-rate` - Get win rate data
- `GET /api/analytics/meta` - Get meta analytics dashboard data
- `GET /api/classes` - Get class statistics (used by Class Statistics pages)
- `GET /api/classes/[className]` - Get class detail statistics (used by Class Statistics pages)

## Related Documentation

- [Meta Dashboard](../../../../src/pages/meta.tsx)
- [Game Stats Implementation](../../../../docs/systems/game-stats/implementation-plan.md)


