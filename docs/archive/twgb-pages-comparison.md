# Pages Comparison: twgb-website vs Current Project

## Pages Added from twgb-website

### ✅ Implemented Pages

1. **`/games`** - Game list page
   - ✅ `/games` (index) - Lists all games
   - ✅ `/games/[id]` - Game detail page
   - **Status:** Fully implemented

2. **`/players/[name]`** - Player profile page
   - ✅ Individual player profiles with stats
   - ✅ `/players` index/search page with compare mode toggle

3. **`/standings`** - Leaderboard page
   - ✅ `/standings` - Shows leaderboard with category filter
   - **Status:** Implemented

---

## ❌ Missing Pages from twgb-website

### 1. **`/players`** (Index/Search Page)
**twgb-website:** Had a players index page with search functionality  
**Current:** ✅ `/players` index ships with search + selectable rows tied to comparison  
**API:** ✅ `/api/players`, `/api/players/search`

**Future improvements:**
- Autocomplete/live suggestions
- Surfacing recent/active players automatically

---

### 2. **`/players/compare`** (Player Comparison Page)
**twgb-website:** `/compare?names=player1,player2`  
**Current:** ✅ `/players/compare` renders head-to-head + ELO chart (powered by `/api/players/compare`)

**Future improvements:**
- Additional filters/date ranges
- Deep links from `/games` or `/standings`

---

### 3. **`/games_list`** (Alternative Game List)
**twgb-website:** Had a separate game list view  
**Current:** Only has `/games`  
**Status:** May not be needed (could be same as `/games`)

---

### 4. **`/classes`** (Class Statistics)
**twgb-website:** `/classes` - Class statistics and rankings  
**Current:** Has `/guides/classes/[slug]` for guides, but no stats pages

**What's needed:**
- Class overview page (`/classes`)
- Class detail page (`/classes/[className]`)
- Class win rates
- Top players per class

---

### 5. **`/meta`** (Meta Information)
**twgb-website:** Meta information page  
**Current:** Not implemented  
**Status:** Low priority, informational page

---

### 6. **`/changelog`** (Changelog)
**twgb-website:** Game changelog  
**Current:** Has `changelog.md` in assets, but no page  
**Status:** Could be added if needed

---

### 7. **`/competitions`** (Competitions)
**twgb-website:** Competitions/tournaments page  
**Current:** Not implemented  
**Status:** Future feature

---

### 8. **`/player_activity`** (Player Activity)
**twgb-website:** Last played dates for players  
**Current:** Not implemented  
**Status:** Could be added to player profiles or separate page

---

## API Routes Comparison

### ✅ Implemented API Routes
- ✅ `GET /api/games` - List games
- ✅ `GET /api/games/[id]` - Get game
- ✅ `POST /api/games` - Create game
- ✅ `PUT /api/games/[id]` - Update game
- ✅ `DELETE /api/games/[id]` - Delete game
- ✅ `GET /api/players/[name]` - Get player stats
- ✅ `GET /api/players/search` - Search players
- ✅ `GET /api/players/compare` - Compare players
- ✅ `GET /api/standings` - Get leaderboard
- ✅ `GET /api/analytics/activity` - Activity data
- ✅ `GET /api/analytics/elo-history` - ELO history
- ✅ `GET /api/analytics/win-rate` - Win rate data

### ❌ Missing API Routes
- ❌ `GET /api/classes` - Class statistics
- ❌ `GET /api/classes/[className]` - Class detail

---

## Summary

### Core Pages: ✅ 3/3 Implemented
- ✅ Games (list + detail)
- ✅ Players (profile + index/search)
- ✅ Standings

### Additional Pages: ❌ 3/5 Implemented
- ✅ Player comparison
- ❌ Class statistics
- ❌ Meta page (now `/meta`, but still lacks TWGB-style content)
- ❌ Other informational pages

### API Routes: ✅ 11/13 Implemented
- ✅ All core game/player/standings APIs
- ❌ Class statistics APIs

---

## Priority Recommendations

### High Priority (P0)
1. **`/classes`** (Class Statistics)
   - Part of original plan (Phase 8)
   - Useful for meta analysis
   - Requires new API routes

### Medium Priority (P1)
2. **`/meta`** (TWGB-style write-up) + other informational pages
3. **`/competitions`** / **`/changelog`** (community storytelling)

### Low Priority (P2)
4. Optional alternative `/games_list` view / `/player_activity` standalone page (current `/players` already shows last played, but a dedicated UI could help)

---

## Quick Wins

1. **Class Statistics** - Requires new API but follows existing patterns
2. **Meta/Competitions pages** - Mostly content + light data plumbing

---

**Status:** Core functionality is there, but some UI pages are missing!




