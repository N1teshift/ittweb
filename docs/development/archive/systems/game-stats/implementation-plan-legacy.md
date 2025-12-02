# Comprehensive Implementation Plan: Game Statistics System

**Status:** Planning Phase _(updated: code now lives under `src/features/modules/**`; this document references the earlier `src/features/ittweb` layout)_  
**Last Updated:** 2025-01-XX  
**Version:** 1.0

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Goals & Scope](#project-goals--scope)
3. [Technical Architecture](#technical-architecture)
4. [Database Schema Design](#database-schema-design)
5. [Feature Breakdown](#feature-breakdown)
6. [Implementation Phases](#implementation-phases)
7. [API Design](#api-design)
8. [Component Architecture](#component-architecture)
9. [Dependencies & Integration](#dependencies--integration)
10. [Testing Strategy](#testing-strategy)
11. [Data Migration Strategy](#data-migration-strategy)
12. [Risk Assessment & Mitigation](#risk-assessment--mitigation)
13. [Success Metrics](#success-metrics)
14. [Timeline Estimates](#timeline-estimates)

---

## Executive Summary

This plan outlines the implementation of a comprehensive game statistics tracking system for Island Troll Tribes, inspired by the `twgb-website` project. The system will track games, calculate ELO ratings, display leaderboards, and provide detailed player analytics.

**Key Deliverables:**
- Game tracking and storage system
- ELO rating calculation engine
- Player statistics and profiles
- Leaderboards and standings
- Advanced filtering and search
- Analytics dashboards with charts
- Class-based statistics

---

## Project Goals & Scope

### Primary Goals
1. ✅ Track all Island Troll Tribes game results
2. ✅ Calculate and maintain ELO ratings per category
3. ✅ Display comprehensive player statistics
4. ✅ Provide leaderboards and rankings
5. ✅ Enable game search and filtering
6. ✅ Show analytics and visualizations
7. ✅ Integrate with existing ittweb features

### Out of Scope (Phase 1)
- Replay file parsing (manual entry first)
- Real-time game tracking
- Automated game result submission
- Mobile app
- Historical data import from twgb-website (future phase)

### Success Criteria
- Users can view their game history and statistics
- ELO ratings are calculated correctly
- Leaderboards display accurate rankings
- All filters work correctly
- Charts render properly
- System handles 1000+ games without performance issues

---

## Technical Architecture

### Technology Stack
- **Frontend:** Next.js 15, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Firebase Admin SDK
- **Database:** Firestore
- **Storage:** Firebase Storage (for replays, future)
- **Charts:** Recharts
- **Date Handling:** date-fns
- **Validation:** Zod (recommended)

### Architecture Principles
1. **Feature-based structure** - Follow existing `src/features/modules/` pattern
2. **Service layer** - Business logic in `lib/` directories
3. **Type safety** - Full TypeScript coverage
4. **Error handling** - Use existing logging system
5. **API consistency** - Use `routeHandlers.ts` pattern
6. **Component reusability** - Shared UI components in infrastructure

### File Structure
```
src/features/modules/
├── games/
│   ├── components/          # Game-related UI components
│   ├── hooks/               # React hooks for games
│   ├── lib/                 # Game service & business logic
│   ├── types/               # TypeScript types
│   └── index.ts             # Barrel exports
│
├── players/
│   ├── components/          # Player profile & stats components
│   ├── hooks/               # Player-related hooks
│   ├── lib/                 # Player service
│   ├── types/
│   └── index.ts
│
├── standings/
│   ├── components/          # Leaderboard components
│   ├── hooks/
│   ├── lib/                 # Standings service
│   └── index.ts
│
├── analytics/
│   ├── components/          # Chart components
│   ├── hooks/
│   ├── lib/                 # Analytics calculations
│   └── index.ts
│
└── shared/                  # Shared game stats utilities
    ├── filters/             # Reusable filter components
    ├── utils/               # Date ranges, ELO calc, etc.
    └── types/               # Shared types
```

---

## Database Schema Design

### Firestore Collections

#### 1. `games` Collection
```typescript
interface Game {
  id: string;                    // Firestore document ID
  gameId: number;               // Original game ID from replay (unique)
  datetime: Timestamp;           // When the game was played
  duration: number;              // Game duration in seconds
  gamename: string;              // Game name
  map: string;                   // Map name
  creatorName: string;           // Game creator (standardized field)
  createdByDiscordId: string;   // Creator Discord ID (standardized field)
  category?: string;             // Game mode/category (e.g., "1v1", "2v2", "ffa")
  replayUrl?: string;            // URL to replay file (future)
  replayFileName?: string;       // Original replay filename
  submittedBy?: string;          // Discord ID of submitter
  submittedAt?: Timestamp;       // When game was submitted
  verified: boolean;             // Whether game result is verified
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Indexes needed:
// - gameId (unique)
// - datetime (descending)
// - category + datetime (composite)
// - verified + datetime (composite)
```

#### 2. `gamePlayers` Subcollection (games/{gameId}/players)
```typescript
interface GamePlayer {
  id: string;                    // Firestore document ID
  gameId: string;                // Reference to parent game
  name: string;                  // Player name (case-insensitive normalized)
  pid: number;                   // Player ID in game (0-11)
  flag: 'winner' | 'loser' | 'drawer';
  category?: string;              // Game category
  elochange?: number;            // ELO change for this game
  eloBefore?: number;            // ELO before this game
  eloAfter?: number;             // ELO after this game
  class?: string;                // Class played (e.g., "hunter", "mage")
  randomClass?: boolean;         // Whether class was random
  kills?: number;
  deaths?: number;
  assists?: number;
  gold?: number;
  damageDealt?: number;
  damageTaken?: number;
  // ... other stats from replay
  createdAt: Timestamp;
}

// Indexes needed:
// - gameId + name (composite)
// - name + datetime (composite, via parent game)
// - flag + category (composite)
```

#### 3. `playerStats` Collection
```typescript
interface PlayerStats {
  id: string;                    // Player name (normalized, lowercase)
  name: string;                  // Display name (original casing)
  categories: {
    [category: string]: {
      wins: number;
      losses: number;
      draws: number;
      score: number;              // Current ELO
      games: number;              // Total games
      rank?: number;              // Current rank (calculated on-demand)
      peakElo?: number;           // Highest ELO achieved
      peakEloDate?: Timestamp;    // When peak ELO was achieved
    };
  };
  totalGames: number;             // Across all categories
  lastPlayed?: Timestamp;        // Most recent game
  firstPlayed?: Timestamp;       // First game
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Indexes needed:
// - name (for lookup)
// - categories.{category}.score (for leaderboards)
// - lastPlayed (descending)
```

#### 4. `eloHistory` Collection (Optional - for detailed history)
```typescript
interface EloHistory {
  id: string;                     // Auto-generated
  playerName: string;            // Normalized player name
  category: string;
  gameId: string;
  eloBefore: number;
  eloAfter: number;
  eloChange: number;
  datetime: Timestamp;           // Game datetime
  createdAt: Timestamp;
}

// Indexes needed:
// - playerName + category + datetime (composite)
```

#### 5. `classStats` Collection (Aggregated class statistics)
```typescript
interface ClassStats {
  id: string;                     // Class name (e.g., "hunter")
  category?: string;              // Optional category filter
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;                // Calculated: wins / (wins + losses)
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

### Firestore Security Rules

```javascript
// Add to firestore.rules
match /games/{gameId} {
  allow read: if true;
  allow write: if request.auth != null; // Authenticated users only
  
  match /players/{playerId} {
    allow read: if true;
    allow write: if request.auth != null;
  }
}

match /playerStats/{playerName} {
  allow read: if true;
  allow write: if false; // Only updated by server-side functions
}

match /eloHistory/{historyId} {
  allow read: if true;
  allow write: if false; // Only updated by server-side functions
}

match /classStats/{classId} {
  allow read: if true;
  allow write: if false; // Only updated by server-side functions
}
```

---

## Feature Breakdown

### Feature 1: Game Management
**Priority:** P0 (Critical)

#### 1.1 Game Creation
- **API:** `POST /api/games`
- **Service:** `gameService.createGame()`
- **Validation:**
  - Required: gameId, datetime, duration, players
  - Unique gameId check
  - Player validation (at least 2 players, valid flags)
- **Business Logic:**
  - Normalize player names (lowercase for lookup, preserve original)
  - Calculate ELO changes
  - Update player stats
  - Create gamePlayers subcollection

#### 1.2 Game Listing
- **API:** `GET /api/games`
- **Service:** `gameService.getGames()`
- **Filters:**
  - Date range (start, end)
  - Category
  - Player name(s)
  - Team format (1v1, 2v2, etc.)
- **Pagination:** Cursor-based (Firestore)
- **Sorting:** Default by datetime (descending)

#### 1.3 Game Detail
- **API:** `GET /api/games/[id]`
- **Service:** `gameService.getGameById()`
- **Returns:** Game + all players with stats

#### 1.4 Game Update/Delete
- **API:** `PUT /api/games/[id]`, `DELETE /api/games/[id]`
- **Service:** `gameService.updateGame()`, `gameService.deleteGame()`
- **Business Logic:**
  - Recalculate ELO if game result changes
  - Update affected player stats
  - Handle cascading updates

---

### Feature 2: ELO Rating System
**Priority:** P0 (Critical)

#### 2.1 ELO Calculation
- **Service:** `eloCalculator.ts`
- **Algorithm:**
  ```typescript
  function calculateEloChange(
    playerElo: number,
    opponentElo: number,
    result: 'win' | 'loss' | 'draw',
    kFactor: number = 32
  ): number {
    const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
    const actualScore = result === 'win' ? 1 : result === 'loss' ? 0 : 0.5;
    return Math.round(kFactor * (actualScore - expectedScore) * 100) / 100;
  }
  ```
- **Team Games:** Average team ELO for calculation
- **Starting ELO:** 1000

#### 2.2 ELO Update Process
- **Service:** `eloCalculator.updateEloScores()`
- **Steps:**
  1. Get all players in game
  2. Calculate average ELO for each team
  3. Calculate ELO change for each player
  4. Update playerStats collection
  5. Store ELO history (optional)

#### 2.3 ELO Recalculation
- **Service:** `eloCalculator.recalculateFromGame()`
- **Use Case:** Fix incorrect games, recalculate after game update
- **Process:**
  1. Rollback ELO changes from target game forward
  2. Recalculate all games from target game forward
  3. Update all affected player stats

---

### Feature 3: Player Statistics
**Priority:** P0 (Critical)

#### 3.1 Player Profile
- **Page:** `/players/[name]`
- **API:** `GET /api/players/[name]`
- **Service:** `playerService.getPlayerStats()`
- **Data:**
  - Overall stats (wins, losses, win rate)
  - Stats by category
  - Current ELO per category
  - Rank per category
  - Recent games
  - Class statistics
  - Activity chart

#### 3.2 Player Search
- **Page:** `/players`
- **API:** `GET /api/players?search=...`
- **Service:** `playerService.searchPlayers()`
- **Features:**
  - Name search (case-insensitive)
  - Autocomplete
  - Recent players

#### 3.3 Player Comparison
- **Page:** `/players/compare?names=player1,player2`
- **API:** `GET /api/players/compare?names=...`
- **Service:** `playerService.comparePlayers()`
- **Comparison:**
  - Side-by-side stats
  - Head-to-head record
  - ELO comparison chart
  - Class performance comparison

---

### Feature 4: Leaderboards/Standings
**Priority:** P0 (Critical)

#### 4.1 Standings List
- **Page:** `/standings`
- **API:** `GET /api/standings?category=...&page=...`
- **Service:** `standingsService.getStandings()`
- **Features:**
  - Category selector
  - Minimum games threshold (default: 10)
  - Pagination
  - Rank, name, ELO, wins, losses, win rate

#### 4.2 Category Standings
- **Page:** `/standings/[category]`
- **Same as above, filtered by category**

#### 4.3 Rank Calculation
- **Service:** `standingsService.calculateRank()`
- **Process:**
  1. Get all ranked players (min games threshold)
  2. Sort by ELO (descending)
  3. Assign ranks (handle ties)
  4. Cache rank in playerStats (optional)

---

### Feature 5: Advanced Filtering
**Priority:** P1 (High)

#### 5.1 Date Range Filter
- **Component:** `DateRangeFilter.tsx`
- **Features:**
  - Date picker (from/to)
  - Presets (Last week, month, year, all time)
  - Default: Last year

#### 5.2 Category Filter
- **Component:** `CategoryFilter.tsx`
- **Options:**
  - All categories
  - 1v1
  - 2v2
  - 3v3
  - 4v4
  - 5v5
  - 6v6
  - FFA

#### 5.3 Player Filter
- **Component:** `PlayerFilter.tsx`
- **Features:**
  - Ally filter (games with these players)
  - Enemy filter (games against these players)
  - Multiple player selection

#### 5.4 Team Format Filter
- **Component:** `TeamFormatFilter.tsx`
- **Filter by:** 1v1, 2v2, 3v3, etc.

#### 5.5 Filter State Management
- **Hook:** `useGameFilters.ts`
- **Features:**
  - URL query parameter sync
  - Filter persistence (localStorage)
  - Filter reset
  - Filter validation

---

### Feature 6: Analytics & Charts
**Priority:** P1 (High)

#### 6.1 Activity Chart
- **Component:** `ActivityChart.tsx`
- **Data:** Games played per day
- **Chart Type:** Area chart
- **Features:** Zoom, tooltips

#### 6.2 ELO History Chart
- **Component:** `EloChart.tsx`
- **Data:** ELO over time
- **Chart Type:** Line chart
- **Features:** Multiple players, zoom, tooltips

#### 6.3 Win Rate Charts
- **Component:** `WinRateChart.tsx`
- **Data:** Win/loss/draw distribution
- **Chart Type:** Pie chart

#### 6.4 Class Statistics Charts
- **Component:** `ClassStatsChart.tsx`
- **Data:** Class selection frequency, win rates
- **Chart Types:** Pie chart, bar chart

---

### Feature 7: Class Statistics
**Priority:** P2 (Medium)

#### 7.1 Class Overview
- **Page:** `/classes`
- **API:** `GET /api/classes`
- **Service:** `classService.getClassStats()`
- **Data:**
  - All classes with win rates
  - Top players per class
  - Class popularity

#### 7.2 Class Detail
- **Page:** `/classes/[className]`
- **API:** `GET /api/classes/[className]`
- **Service:** `classService.getClassDetail()`
- **Data:**
  - Class win rate
  - Top players
  - Performance over time
  - Category breakdown

---

## Implementation Phases

### Phase 0: Foundation & Setup
**Duration:** 1-2 days  
**Priority:** P0

#### Tasks:
1. ✅ Create feature directory structure
2. ✅ Set up TypeScript types
3. ✅ Create Firestore collections (manually or via script)
4. ✅ Set up Firestore indexes
5. ✅ Update firestore.rules
6. ✅ Install dependencies (recharts, date-fns, react-datepicker, zod)
7. ✅ Create base service files (empty implementations)

#### Deliverables:
- Directory structure created
- Types defined
- Firestore setup complete
- Dependencies installed

---

### Phase 1: Core Data Layer
**Duration:** 3-5 days  
**Priority:** P0

#### Tasks:
1. **Game Service**
   - ✅ `createGame()` - Create game with validation
   - ✅ `getGameById()` - Get single game
   - ✅ `getGames()` - Query games with filters
   - ✅ `updateGame()` - Update game (with ELO recalculation)
   - ✅ `deleteGame()` - Delete game (with ELO rollback)

2. **ELO Calculator**
   - ✅ `calculateEloChange()` - Calculate ELO change
   - ✅ `calculateTeamElo()` - Average team ELO
   - ✅ `updateEloScores()` - Update ELO after game
   - ✅ `recalculateFromGame()` - Recalculate from specific game

3. **Player Service**
   - ✅ `getPlayerStats()` - Get player statistics
   - ✅ `updatePlayerStats()` - Update after game
   - ✅ `searchPlayers()` - Search players by name
   - ✅ `normalizePlayerName()` - Normalize name for lookup

4. **API Routes**
   - ✅ `POST /api/games` - Create game
   - ✅ `GET /api/games` - List games
   - ✅ `GET /api/games/[id]` - Get game
   - ✅ `PUT /api/games/[id]` - Update game
   - ✅ `DELETE /api/games/[id]` - Delete game

#### Testing:
- Unit tests for ELO calculation
- Integration tests for game creation
- Test ELO recalculation

#### Deliverables:
- Working game creation API
- ELO calculation working
- Player stats updating correctly

---

### Phase 2: Basic UI - Games
**Duration:** 3-4 days  
**Priority:** P0

#### Tasks:
1. **Game List Page**
   - ✅ `/games` page
   - ✅ `GameList` component
   - ✅ `GameCard` component
   - ✅ Basic pagination
   - ✅ Loading states
   - ✅ Error states

2. **Game Detail Page**
   - ✅ `/games/[id]` page
   - ✅ `GameDetail` component
   - ✅ Player list with stats
   - ✅ ELO changes display

3. **Game Creation Form** (Admin)
   - ✅ `CreateGameForm` component
   - ✅ Player input (multiple players)
   - ✅ Validation
   - ✅ Submit to API

4. **Hooks**
   - ✅ `useGames()` - Fetch games
   - ✅ `useGame()` - Fetch single game
   - ✅ `useCreateGame()` - Create game mutation

#### Deliverables:
- Working game list page
- Working game detail page
- Game creation form (admin only)

---

### Phase 3: Player Profiles & Stats
**Duration:** 4-5 days  
**Priority:** P0

#### Tasks:
1. **Player Profile Page**
   - ✅ `/players/[name]` page
   - ✅ `PlayerProfile` component
   - ✅ `PlayerStats` component
   - ✅ Stats by category
   - ✅ Recent games list

2. **Player Search**
   - ✅ `/players` page
   - ✅ `PlayerSearch` component
   - ✅ Autocomplete
   - ✅ Recent players

3. **API Routes**
   - ✅ `GET /api/players/[name]` - Get player stats
   - ✅ `GET /api/players?search=...` - Search players

4. **Hooks**
   - ✅ `usePlayerStats()` - Fetch player stats
   - ✅ `usePlayerSearch()` - Search players

#### Deliverables:
- Working player profile pages
- Player search functionality

---

### Phase 4: Leaderboards
**Duration:** 2-3 days  
**Priority:** P0

#### Tasks:
1. **Standings Page**
   - ✅ `/standings` page
   - ✅ `Leaderboard` component
   - ✅ Category selector
   - ✅ Pagination
   - ✅ Rank display

2. **Standings Service**
   - ✅ `getStandings()` - Get leaderboard
   - ✅ `calculateRank()` - Calculate player rank
   - ✅ Minimum games threshold

3. **API Route**
   - ✅ `GET /api/standings?category=...&page=...`

4. **Hook**
   - ✅ `useStandings()` - Fetch standings

#### Deliverables:
- Working leaderboards
- Category filtering
- Rank calculation

---

### Phase 5: Advanced Filtering
**Duration:** 3-4 days  
**Priority:** P1

#### Tasks:
1. **Filter Components**
   - ✅ `DateRangeFilter` - Date picker with presets
   - ✅ `CategoryFilter` - Category dropdown
   - ✅ `PlayerFilter` - Player search/select
   - ✅ `TeamFormatFilter` - Team format selector
   - ✅ `GameFilters` - Combined filter panel

2. **Filter Hook**
   - ✅ `useGameFilters()` - Filter state management
   - ✅ URL query sync
   - ✅ LocalStorage persistence

3. **Query Builder**
   - ✅ `buildGameQuery()` - Build Firestore query from filters
   - ✅ Handle complex filters (allies, enemies)

4. **Integration**
   - ✅ Add filters to game list page
   - ✅ Add filters to player profile games

#### Deliverables:
- All filter components working
- Filters integrated into game list
- URL state management

---

### Phase 6: Analytics & Charts
**Duration:** 4-5 days  
**Priority:** P1

#### Tasks:
1. **Chart Components**
   - ✅ `ActivityChart` - Games per day
   - ✅ `EloChart` - ELO over time
   - ✅ `WinRateChart` - Win/loss pie chart
   - ✅ `ClassStatsChart` - Class statistics

2. **Analytics Service**
   - ✅ `getActivityData()` - Games per day
   - ✅ `getEloHistory()` - ELO over time
   - ✅ `getWinRateData()` - Win/loss breakdown
   - ✅ `getClassStats()` - Class statistics

3. **Integration**
   - ✅ Add charts to player profile
   - ✅ Add charts to home page (optional)
   - ✅ Chart tooltips and interactions

4. **Dependencies**
   - ✅ Install and configure recharts
   - ✅ Create chart theme (match site design)

#### Deliverables:
- All chart components working
- Charts integrated into player profiles
- Interactive chart features

---

### Phase 7: Player Comparison
**Duration:** 2-3 days  
**Priority:** P1

#### Tasks:
1. **Comparison Page**
   - ✅ `/players/compare?names=...` page
   - ✅ `PlayerComparison` component
   - ✅ Side-by-side stats
   - ✅ Head-to-head record
   - ✅ ELO comparison chart

2. **Comparison Service**
   - ✅ `comparePlayers()` - Compare multiple players
   - ✅ `getHeadToHead()` - Get head-to-head games

3. **API Route**
   - ✅ `GET /api/players/compare?names=...`

4. **Hook**
   - ✅ `usePlayerComparison()` - Fetch comparison data

#### Deliverables:
- Working player comparison page
- Head-to-head statistics

---

### Phase 8: Class Statistics
**Duration:** 3-4 days  
**Priority:** P2

#### Tasks:
1. **Class Overview Page**
   - ✅ `/classes` page
   - ✅ `ClassOverview` component
   - ✅ Class list with win rates
   - ✅ Top players per class

2. **Class Detail Page**
   - ✅ `/classes/[className]` page
   - ✅ `ClassDetail` component
   - ✅ Class-specific leaderboard
   - ✅ Performance charts

3. **Class Service**
   - ✅ `getClassStats()` - Get all class stats
   - ✅ `getClassDetail()` - Get class detail
   - ✅ `getTopPlayersByClass()` - Top players for class

4. **API Routes**
   - ✅ `GET /api/classes`
   - ✅ `GET /api/classes/[className]`

5. **Integration**
   - ✅ Link from player profile class stats
   - ✅ Link from guides/classes page

#### Deliverables:
- Class statistics pages
- Integration with existing class data

---

### Phase 9: Polish & Optimization
**Duration:** 2-3 days  
**Priority:** P2

#### Tasks:
1. **Performance**
   - ✅ Optimize Firestore queries
   - ✅ Add caching where appropriate
   - ✅ Lazy load charts
   - ✅ Pagination optimization

2. **UI/UX**
   - ✅ Loading skeletons
   - ✅ Empty states
   - ✅ Error boundaries
   - ✅ Responsive design
   - ✅ Accessibility improvements

3. **Documentation**
   - ✅ API documentation
   - ✅ Component documentation
   - ✅ Usage examples

4. **Testing**
   - ✅ E2E tests for critical flows
   - ✅ Performance testing
   - ✅ Load testing

#### Deliverables:
- Optimized performance
- Polished UI
- Documentation complete

---

## API Design

### Game APIs

#### `POST /api/games`
**Description:** Create a new game  
**Auth:** Required  
**Body:**
```typescript
{
  gameId: number;
  datetime: string; // ISO string
  duration: number; // seconds
  gamename: string;
  map: string;
  creatorName: string;
  createdByDiscordId?: string;
  category?: string;
  players: Array<{
    name: string;
    pid: number;
    flag: 'winner' | 'loser' | 'drawer';
    class?: string;
    kills?: number;
    deaths?: number;
    // ... other stats
  }>;
}
```
**Response:**
```typescript
{
  success: true;
  data: {
    id: string;
    gameId: number;
  };
}
```

#### `GET /api/games`
**Description:** List games with filters  
**Auth:** Optional  
**Query Params:**
- `startDate?: string` - ISO date string
- `endDate?: string` - ISO date string
- `category?: string`
- `player?: string` - Comma-separated player names
- `ally?: string` - Comma-separated ally names
- `enemy?: string` - Comma-separated enemy names
- `teamFormat?: string` - e.g., "1v1", "2v2"
- `page?: number` - Page number
- `limit?: number` - Results per page (default: 20)
- `cursor?: string` - Cursor for pagination

**Response:**
```typescript
{
  success: true;
  data: {
    games: Game[];
    nextCursor?: string;
    hasMore: boolean;
  };
}
```

#### `GET /api/games/[id]`
**Description:** Get single game  
**Auth:** Optional  
**Response:**
```typescript
{
  success: true;
  data: Game & {
    players: GamePlayer[];
  };
}
```

### Player APIs

#### `GET /api/players/[name]`
**Description:** Get player statistics  
**Auth:** Optional  
**Query Params:**
- `category?: string`
- `startDate?: string`
- `endDate?: string`
- `includeGames?: boolean` - Include recent games

**Response:**
```typescript
{
  success: true;
  data: {
    name: string;
    categories: { [category: string]: CategoryStats };
    totalGames: number;
    lastPlayed?: string;
    recentGames?: Game[];
    activity?: { [date: string]: number };
    eloHistory?: Array<{ date: string; elo: number }>;
  };
}
```

#### `GET /api/players/compare`
**Description:** Compare players  
**Auth:** Optional  
**Query Params:**
- `names: string` - Comma-separated player names
- `category?: string`
- `startDate?: string`
- `endDate?: string`

**Response:**
```typescript
{
  success: true;
  data: {
    players: PlayerStats[];
    headToHead: {
      [player1: string]: {
        [player2: string]: {
          wins: number;
          losses: number;
        };
      };
    };
    eloComparison: Array<{
      date: string;
      [playerName: string]: number | string;
    }>;
  };
}
```

### Standings APIs

#### `GET /api/standings`
**Description:** Get leaderboard  
**Auth:** Optional  
**Query Params:**
- `category?: string`
- `minGames?: number` - Minimum games threshold (default: 10)
- `page?: number`
- `limit?: number`

**Response:**
```typescript
{
  success: true;
  data: {
    standings: Array<{
      rank: number;
      name: string;
      score: number; // ELO
      wins: number;
      losses: number;
      winRate: number;
      games: number;
    }>;
    total: number;
    page: number;
    hasMore: boolean;
  };
}
```

---

## Component Architecture

### Shared Components

#### `DateRangeFilter`
```typescript
interface DateRangeFilterProps {
  startDate?: Date;
  endDate?: Date;
  onChange: (start: Date | null, end: Date | null) => void;
  presets?: Array<{ label: string; start: Date; end: Date }>;
}
```

#### `CategoryFilter`
```typescript
interface CategoryFilterProps {
  value?: string;
  onChange: (category: string | undefined) => void;
  categories: string[];
}
```

#### `PlayerFilter`
```typescript
interface PlayerFilterProps {
  allies?: string[];
  enemies?: string[];
  onChange: (allies: string[], enemies: string[]) => void;
  placeholder?: string;
}
```

### Game Components

#### `GameList`
- Displays paginated list of games
- Handles loading/error states
- Integrates filters

#### `GameCard`
- Displays game summary
- Shows winners/losers
- Links to game detail

#### `GameDetail`
- Full game information
- Player list with stats
- ELO changes

### Player Components

#### `PlayerProfile`
- Main player profile container
- Integrates stats, charts, games

#### `PlayerStats`
- Displays player statistics
- Category breakdown
- Win/loss records

#### `PlayerCharts`
- Activity chart
- ELO history chart
- Win rate chart

---

## Dependencies & Integration

### New Dependencies
```json
{
  "recharts": "^2.10.0",
  "date-fns": "^2.30.0",
  "react-datepicker": "^4.21.0",
  "zod": "^3.22.0"
}
```

### Integration Points

#### 1. Scheduled Games
- Link scheduled games to actual game results
- Update scheduled game status when game is recorded
- Show "Record Result" button on scheduled games

#### 2. Guides/Classes
- Link from class guides to class statistics
- Show class performance in class guide pages
- Use existing class data from `guides/data/units/`

#### 3. User Data
- Link player stats to user accounts (via Discord ID)
- Show player stats in user profile (future)
- Allow users to claim player names

#### 4. Blog
- Announce tournaments and events
- Link to standings/leaderboards
- Highlight top players

---

## Testing Strategy

### Unit Tests
- ELO calculation functions
- Name normalization
- Date range utilities
- Query builders

### Integration Tests
- Game creation flow
- ELO update flow
- Player stats update
- Filter combinations

### E2E Tests
- Create game → View in list → View detail
- Search player → View profile → View games
- Filter games → Verify results
- View leaderboard → Click player → View profile

### Performance Tests
- Load 1000+ games
- Complex filter queries
- Chart rendering with large datasets

---

## Data Migration Strategy

### Phase 1: Manual Entry
- Start with manual game entry
- Test system with sample games
- Validate ELO calculations

### Phase 2: Import Script (Future)
- Create script to import from twgb-website database
- Map MySQL schema to Firestore
- Validate imported data
- Recalculate ELOs if needed

### Phase 3: Replay Parser (Future)
- Parse Warcraft 3 replay files
- Extract game data automatically
- Validate extracted data
- Auto-submit games

---

## Risk Assessment & Mitigation

### Risk 1: ELO Calculation Errors
**Impact:** High  
**Probability:** Medium  
**Mitigation:**
- Thorough unit tests
- Compare with twgb-website calculations
- Manual verification of sample games
- ELO recalculation feature

### Risk 2: Performance with Large Dataset
**Impact:** High  
**Probability:** Medium  
**Mitigation:**
- Proper Firestore indexes
- Pagination everywhere
- Lazy loading
- Caching strategies
- Performance testing

### Risk 3: Data Integrity
**Impact:** High  
**Probability:** Low  
**Mitigation:**
- Validation on all inputs
- Unique constraints (gameId)
- Transaction support for ELO updates
- Audit logging

### Risk 4: Player Name Variations
**Impact:** Medium  
**Probability:** High  
**Mitigation:**
- Name normalization
- Case-insensitive matching
- Player name aliases (future)
- Manual name merging (admin)

### Risk 5: Firestore Costs
**Impact:** Medium  
**Probability:** Low  
**Mitigation:**
- Monitor read/write counts
- Optimize queries
- Use caching where appropriate
- Set up billing alerts

---

## Success Metrics

### Functional Metrics
- ✅ Games can be created and viewed
- ✅ ELO calculations are accurate
- ✅ Player stats update correctly
- ✅ Leaderboards display correctly
- ✅ All filters work
- ✅ Charts render properly

### Performance Metrics
- Game list loads in < 2 seconds
- Player profile loads in < 3 seconds
- Leaderboard loads in < 2 seconds
- Charts render in < 1 second

### User Metrics
- Users can find their games
- Users can view their stats
- Users can compare with others
- System is intuitive to use

---

## Timeline Estimates

### Optimistic Timeline
- Phase 0: 1 day
- Phase 1: 3 days
- Phase 2: 3 days
- Phase 3: 4 days
- Phase 4: 2 days
- Phase 5: 3 days
- Phase 6: 4 days
- Phase 7: 2 days
- Phase 8: 3 days
- Phase 9: 2 days
**Total: ~27 days (5-6 weeks)**

### Realistic Timeline
- Add 20% buffer for each phase
- Account for testing and bug fixes
- Account for review and feedback
**Total: ~35-40 days (7-8 weeks)**

### Phased Release Strategy
1. **MVP (Phases 0-4):** Core functionality - 2-3 weeks
2. **Enhanced (Phases 5-7):** Filters, charts, comparison - 2-3 weeks
3. **Complete (Phases 8-9):** Class stats, polish - 1-2 weeks

---

## Next Steps

1. **Review this plan** - Get feedback and approval
2. **Prioritize features** - Decide what's essential for MVP
3. **Set up project** - Create directories, install dependencies
4. **Start Phase 0** - Foundation setup
5. **Begin implementation** - Follow phases sequentially

---

## Notes & Considerations

- **Player Name Handling:** Consider implementing player name aliases/merging for variations
- **ELO K-Factor:** May need tuning based on game data
- **Category Definitions:** Need to define all game categories clearly
- **Replay Files:** Future feature, not in initial scope
- **Admin Tools:** May need admin interface for game management
- **Data Export:** Consider export functionality for users
- **Notifications:** Future: Notify players of rank changes, achievements

---

**Document Status:** ✅ Complete - Ready for Review




