# Standings API

Leaderboard endpoints.

## `GET /api/standings`

Get leaderboard.

**Query Parameters**:
- `category` (string, optional) - Game category
- `minGames` (number, optional) - Minimum games required
- `limit` (number, optional) - Results limit

**Response**:
```typescript
{
  success: true;
  data: StandingsEntry[];
}
```


