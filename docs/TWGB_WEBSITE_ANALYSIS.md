# TWGB Website Analysis - Borrowable Features

This document analyzes the `twgb-website` (Ruby on Rails) project and identifies features that could be implemented in the modern `ittweb` (Next.js/TypeScript) project.

## Overview

**twgb-website** is a Rails application that tracks Island Troll Tribes game statistics, player ELO scores, and provides leaderboards. It's an older system but contains valuable game tracking logic.

**ittweb** is a modern Next.js application with guides, tools, and community features, but currently lacks game statistics tracking.

## Key Features in TWGB Website

### 1. **Game Tracking System** 🎮
- Records game results from Warcraft 3 replays
- Tracks game metadata: date, duration, map, creator, category
- Stores player participation with win/loss/draw flags
- Links to replay file downloads

**Implementation in ittweb:**
- Create Firestore collections: `games`, `gamePlayers`, `gameStats`
- Build API endpoints to ingest game data (from replays or manual entry)
- Create game detail pages showing match results

### 2. **Player Statistics & Profiles** 👤
- Individual player pages with comprehensive stats
- Win/loss records by category
- ELO rating tracking over time
- Activity charts (games played per day)
- Class selection statistics
- Class-specific win rates
- Player comparison tool

**Implementation in ittweb:**
- Extend existing `userData` service or create `playerStats` collection
- Build player profile pages (`/players/[name]`)
- Add charts using a library like `recharts` or `chart.js`
- Create filtering components for date ranges and categories

### 3. **ELO Rating System** 📊
- ELO score calculation and tracking
- Category-based ELO (different game modes)
- ELO change per game
- ELO history over time (line charts)
- Starting ELO of 1000

**Implementation in ittweb:**
- Implement ELO calculation logic (can adapt from Rails models)
- Store ELO scores in Firestore with category support
- Create ELO tracking service
- Build ELO history visualization

### 4. **Leaderboards/Standings** 🏆
- Category-based leaderboards
- Ranked players (minimum game threshold)
- Pagination support
- Score sorting (ELO-based)

**Implementation in ittweb:**
- Create `/standings` page with category selector
- Use Firestore queries with ordering and pagination
- Add minimum game threshold filtering
- Display rankings in a table with player links

### 5. **Class Statistics** 🎭
- Win rates by class
- Top players per class
- Class selection frequency
- Class-specific performance metrics

**Implementation in ittweb:**
- Leverage existing class data from `guides/data/units/`
- Create `/classes` page showing class statistics
- Aggregate game data by class
- Show class win rates and top performers

### 6. **Advanced Filtering** 🔍
- Date range filtering (from/to dates)
- Category filtering (game modes)
- Team format filtering (1v1, 2v2, etc.)
- Ally/enemy filtering (games with specific players)
- Player name filtering

**Implementation in ittweb:**
- Create reusable filter components
- Use URL query parameters for filter state
- Build date picker components
- Implement Firestore query builders

### 7. **Game List & Search** 📋
- Paginated game lists
- Game search by player names
- Category filtering
- Date range filtering
- Game detail views

**Implementation in ittweb:**
- Create `/games` page with list view
- Add search functionality
- Implement pagination (Firestore cursor-based or offset)
- Build game detail modal/page

### 8. **Analytics & Charts** 📈
- Activity charts (games per day)
- ELO change over time (line charts)
- Win percentage pie charts
- Class selection pie charts
- Class win rate bar charts

**Implementation in ittweb:**
- Use `recharts` or `chart.js` for visualizations
- Create chart components in `src/features/infrastructure/shared/components/ui/`
- Build analytics dashboard
- Add interactive chart features (zoom, tooltips)

## Technical Implementation Recommendations

### Database Schema (Firestore)

```typescript
// games collection
interface Game {
  id: string;
  gameId: number; // Original game ID from replay
  datetime: Timestamp;
  duration: number; // seconds
  gamename: string;
  map: string;
  creatorname: string;
  ownername: string;
  category?: string; // Game mode/category
  replayUrl?: string;
  createdAt: Timestamp;
}

// gamePlayers collection (subcollection of games)
interface GamePlayer {
  id: string;
  gameId: string;
  name: string;
  pid: number;
  flag: 'winner' | 'loser' | 'drawer';
  category?: string;
  elochange?: number;
  class?: string;
  kills?: number;
  deaths?: number;
  gold?: number;
  // ... other stats
}

// playerStats collection (aggregated)
interface PlayerStats {
  id: string; // player name
  name: string;
  categories: {
    [category: string]: {
      wins: number;
      losses: number;
      draws: number;
      score: number; // ELO
      rank?: number;
    };
  };
  totalGames: number;
  lastPlayed?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Feature Structure

```
src/features/ittweb/
  ├── games/
  │   ├── components/
  │   │   ├── GameList.tsx
  │   │   ├── GameCard.tsx
  │   │   ├── GameDetail.tsx
  │   │   ├── GameFilters.tsx
  │   │   └── index.ts
  │   ├── hooks/
  │   │   ├── useGames.ts
  │   │   ├── useGameFilters.ts
  │   │   └── index.ts
  │   ├── lib/
  │   │   ├── gameService.ts
  │   │   ├── eloCalculator.ts
  │   │   └── index.ts
  │   ├── types/
  │   │   └── index.ts
  │   └── index.ts
  │
  ├── players/
  │   ├── components/
  │   │   ├── PlayerProfile.tsx
  │   │   ├── PlayerStats.tsx
  │   │   ├── PlayerCharts.tsx
  │   │   ├── PlayerComparison.tsx
  │   │   └── index.ts
  │   ├── hooks/
  │   │   ├── usePlayerStats.ts
  │   │   └── index.ts
  │   ├── lib/
  │   │   ├── playerService.ts
  │   │   └── index.ts
  │   └── index.ts
  │
  ├── standings/
  │   ├── components/
  │   │   ├── Leaderboard.tsx
  │   │   ├── CategorySelector.tsx
  │   │   └── index.ts
  │   ├── hooks/
  │   │   └── useStandings.ts
  │   └── index.ts
  │
  └── analytics/
      ├── components/
      │   ├── ActivityChart.tsx
      │   ├── EloChart.tsx
      │   ├── WinRateChart.tsx
      │   └── index.ts
      └── index.ts
```

### Key Services to Create

1. **Game Service** (`gameService.ts`)
   - `createGame(gameData)` - Create new game record
   - `getGames(filters)` - Query games with filters
   - `getGameById(id)` - Get single game
   - `getGamesByPlayer(name, filters)` - Get player's games

2. **Player Service** (`playerService.ts`)
   - `getPlayerStats(name, filters)` - Get player statistics
   - `updatePlayerStats(gameId)` - Recalculate stats after game
   - `comparePlayers(names, filters)` - Compare multiple players
   - `getPlayerEloHistory(name, category, dateRange)` - ELO over time

3. **ELO Calculator** (`eloCalculator.ts`)
   - `calculateEloChange(winnerElo, loserElo, kFactor)` - Calculate ELO change
   - `updateEloScores(game)` - Update all player ELOs after game
   - `recalculateEloFromGame(gameId)` - Recalculate from specific game

4. **Standings Service** (`standingsService.ts`)
   - `getStandings(category, page, limit)` - Get leaderboard
   - `getPlayerRank(name, category)` - Get player's rank
   - `getTopPlayersByClass(className, category)` - Class-specific rankings

## Priority Implementation Order

### Phase 1: Foundation (High Priority)
1. ✅ Database schema design
2. ✅ Game service and basic CRUD
3. ✅ Player stats aggregation
4. ✅ Basic game list page

### Phase 2: Core Features (High Priority)
1. ✅ Player profile pages
2. ✅ ELO calculation and tracking
3. ✅ Basic leaderboards
4. ✅ Game detail pages

### Phase 3: Enhanced Features (Medium Priority)
1. ✅ Advanced filtering
2. ✅ Charts and analytics
3. ✅ Player comparison
4. ✅ Class statistics

### Phase 4: Polish (Low Priority)
1. ✅ Replay file handling
2. ✅ Game import from replays
3. ✅ Advanced analytics dashboard
4. ✅ Export functionality

## Code Examples to Adapt

### ELO Calculation (from `game.rb`)
The ELO calculation logic can be extracted and adapted to TypeScript:

```typescript
// From the Rails model, the ELO change is stored per player
// We can implement a similar calculation system
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

### Date Range Filtering (from `application_controller.rb`)
The date range logic can be adapted:

```typescript
function getDateRange(startRange?: string, endRange?: string) {
  const start = startRange 
    ? new Date(startRange) 
    : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // 1 year ago
  const end = endRange 
    ? new Date(endRange + 'T23:59:59') 
    : new Date(); // Today
  return { start, end };
}
```

## Integration Points

### With Existing Features

1. **Scheduled Games** → Link to actual game results
2. **Guides/Classes** → Use class data for statistics
3. **User Data** → Link player stats to user accounts
4. **Blog** → Announce tournaments and events

### New Pages to Create

- `/games` - Game list and search
- `/games/[id]` - Game detail page
- `/players` - Player search/index
- `/players/[name]` - Player profile
- `/players/compare` - Player comparison
- `/standings` - Leaderboards
- `/standings/[category]` - Category-specific standings
- `/classes` - Class statistics
- `/classes/[className]` - Class-specific leaderboard

## Dependencies to Add

```json
{
  "recharts": "^2.x", // For charts
  "date-fns": "^2.x", // For date utilities
  "react-datepicker": "^4.x" // For date pickers
}
```

## Notes

- The original project uses MySQL, but we'll use Firestore
- The original uses Rails helpers and Slim templates - we'll use React components
- The original has replay file hosting - we may need cloud storage (Firebase Storage)
- Consider authentication for game submission (prevent spam)
- Consider rate limiting for API endpoints
- The original project is archived (read-only) - good reference but won't receive updates

## Conclusion

The `twgb-website` provides a solid foundation for game statistics tracking. The core concepts (ELO, player stats, leaderboards) are well-designed and can be modernized for the Next.js/TypeScript stack. The main work will be:

1. Adapting Rails models to TypeScript services
2. Converting MySQL queries to Firestore queries
3. Building modern React components instead of Slim templates
4. Adding proper TypeScript types throughout
5. Integrating with existing ittweb features

The analytics and filtering features are particularly valuable and would enhance the ittweb project significantly.




