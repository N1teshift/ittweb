# Game Stats Data Model

> Status: Source of truth · Maintainer: Data Guild · Last reviewed: 2025-12-02

## Overview
The Game Stats domain uses Firestore with one top-level collection per aggregate plus subcollections for per-game participants. Every write path must pass through typed services so indexes, timestamps, and derived values stay consistent.

## Collections
### `games`
```typescript
interface GameDoc {
  id: string;          // Firestore ID
  gameId: number;      // External unique identifier
  datetime: Timestamp;
  duration: number;    // seconds
  gamename: string;
  map: string;
  category: string;    // 1v1, 2v2, ...
  creatorName: string;
  createdByDiscordId?: string;
  replayUrl?: string;
  verified: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```
**Indexes:** `gameId` (unique), `datetime desc`, `category+datetime`, `verified+datetime`.

### `games/{gameId}/players`
```typescript
interface GamePlayerDoc {
  name: string;        // normalized + original casing stored separately
  pid: number;         // 0-11 slot
  flag: 'winner' | 'loser' | 'drawer';
  category?: string;
  class?: string;
  eloBefore?: number;
  eloAfter?: number;
  eloChange?: number;
  kills?: number;
  deaths?: number;
  assists?: number;
  damageDealt?: number;
  damageTaken?: number;
  createdAt: Timestamp;
}
```
**Indexes:** `gameId+name`, `name+datetime` (via parent), `flag+category`.

### `playerStats`
```typescript
interface PlayerStatsDoc {
  name: string;                // normalized key
  displayName: string;
  categories: Record<string, {
    wins: number;
    losses: number;
    draws: number;
    score: number;             // current ELO
    games: number;
    rank?: number;
    peakElo?: number;
    peakEloDate?: Timestamp;
  }>;
  totalGames: number;
  lastPlayed?: Timestamp;
  firstPlayed?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```
**Indexes:** `name`, `categories.{category}.score`, `lastPlayed`.

### `eloHistory`
Optional but recommended for analytics.
```typescript
interface EloHistoryDoc {
  playerName: string;
  category: string;
  gameId: string;
  eloBefore: number;
  eloAfter: number;
  eloChange: number;
  datetime: Timestamp;
  createdAt: Timestamp;
}
```
**Index:** `playerName+category+datetime`.

### `classStats`
```typescript
interface ClassStatsDoc {
  id: string;          // class name
  category?: string;
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;
  topPlayers: Array<{
    playerName: string;
    wins: number;
    losses: number;
    winRate: number;
    elo: number;
  }>;
  updatedAt: Timestamp;
}
```

## Security Rules Snapshot
```javascript
match /games/{gameId} {
  allow read: if true;
  allow write: if request.auth != null;
  match /players/{playerId} {
    allow read: if true;
    allow write: if request.auth != null;
  }
}
match /playerStats/{playerName} {
  allow read: if true;
  allow write: if false; // server-only
}
match /eloHistory/{historyId} {
  allow read: if true;
  allow write: if false;
}
match /classStats/{classId} {
  allow read: if true;
  allow write: if false;
}
```
Keep server-side updates behind background functions or admin APIs so public clients never mutate aggregate collections directly.

## Operational Notes
- Always set `createdAt`/`updatedAt` via server timestamps.
- Name normalization happens before writes; store both normalized and original casing where needed.
- When importing historical data, replay ELO through `eloCalculator.updateEloScores` to keep history deterministic.
