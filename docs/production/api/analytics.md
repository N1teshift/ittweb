# Analytics API

Analytics data endpoints.

## `GET /api/analytics/activity`

Get activity data (games per time period).

**Query Parameters**:
- `startDate` (string, optional) - ISO date string
- `endDate` (string, optional) - ISO date string
- `category` (string, optional) - Filter by category
- `period` (string, optional) - `'day' | 'week' | 'month'`

**Response**:
```typescript
{
  success: true;
  data: ActivityDataPoint[];
}
```

## `GET /api/analytics/elo-history`

Get ELO history data.

**Query Parameters**:
- `player` (string, optional) - Player name
- `startDate` (string, optional) - ISO date string
- `endDate` (string, optional) - ISO date string
- `category` (string, optional) - Filter by category

**Response**:
```typescript
{
  success: true;
  data: EloHistoryDataPoint[];
}
```

## `GET /api/analytics/win-rate`

Get win rate statistics.

**Query Parameters**:
- `player` (string, optional) - Player name
- `startDate` (string, optional) - ISO date string
- `endDate` (string, optional) - ISO date string
- `category` (string, optional) - Filter by category

**Response**:
```typescript
{
  success: true;
  data: WinRateData;
}
```

## `GET /api/analytics/meta`

Get meta dashboard data (aggregated statistics).

**Response**:
```typescript
{
  success: true;
  data: {
    totalGames: number;
    totalPlayers: number;
    activity: ActivityDataPoint[];
    // ... other aggregated stats
  };
}
```



