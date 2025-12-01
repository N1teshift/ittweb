# Testing Guide - Game Statistics System

## 🚀 Quick Start

### 1. Start the Development Server

```bash
npm run dev
```

The server will start on **http://localhost:3000**

## 🔁 Refreshing Data Before Testing

- Gameplay fixtures (units/items/abilities) come from the scripts pipeline in `scripts/data/`.
- Run `node scripts/data/generate-from-work.mjs` first if you need fresh data; see [`scripts/README.md`](../../scripts/README.md) for details.
- Need to understand current script refactors? Check [`scripts/data/REFACTORING_PLAN.md`](../../scripts/data/REFACTORING_PLAN.md).

### 2. Access the Pages

Once the server is running, you can access:

#### **Main Pages:**
- **Games List:** http://localhost:3000/games
- **Game Detail:** http://localhost:3000/games/[id] (replace [id] with actual game ID)
- **Players Index:** http://localhost:3000/players (search + browse profiles)
- **Player Profile:** http://localhost:3000/players/[name] (replace [name] with player name)
- **Player Comparison:** http://localhost:3000/players/compare
- **Leaderboard:** http://localhost:3000/standings

#### **API Endpoints:**
- **Create Game:** `POST http://localhost:3000/api/games`
- **List Games:** `GET http://localhost:3000/api/games`
- **Get Game:** `GET http://localhost:3000/api/games/[id]`
- **Get Player Stats:** `GET http://localhost:3000/api/players/[name]`
- **Search Players:** `GET http://localhost:3000/api/players/search?q=...`
- **Get Standings:** `GET http://localhost:3000/api/standings`

## 🧪 Testing Steps

### Step 1: Create a Test Game

You can create a game using:

**Option A: Use the test form** (see below)
**Option B: Use curl/Postman**

```bash
curl -X POST http://localhost:3000/api/games \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-session-token" \
  -d '{
    "gameState": "completed",
    "gameId": 1001,
    "datetime": "2025-01-15T10:00:00Z",
    "duration": 1800,
    "gamename": "Test Game",
    "map": "Island Troll Tribes",
    "creatorName": "TestCreator",
    "category": "1v1",
    "players": [
      {
        "name": "Player1",
        "pid": 0,
        "flag": "winner"
      },
      {
        "name": "Player2",
        "pid": 1,
        "flag": "loser"
      }
    ]
  }'
```

**Note**: This endpoint requires authentication. Include your session cookie in the request, or use the web UI to create games.

### Step 2: View the Game

1. Go to http://localhost:3000/games
2. You should see your test game in the list
3. Click on it to see the game details

### Step 3: Check Player Stats

1. Go to http://localhost:3000/players and search/select your player
2. Open http://localhost:3000/players/Player1 directly if you already know the slug
3. You should see Player1's statistics
4. Check that ELO was calculated (should be > 1000 for winner)
5. Go to http://localhost:3000/players/Player2
6. Check that Player2's ELO decreased (should be < 1000 for loser)
7. (Optional) Compare players via http://localhost:3000/players/compare?names=Player1,Player2 to ensure the comparison UI/API works

### Step 4: View Leaderboard

1. Go to http://localhost:3000/standings
2. You should see both players ranked
3. Player1 should have a higher ELO than Player2

### Step 5: Create More Games

Create several more games with different players to see:
- ELO changes over time
- Leaderboard rankings
- Player statistics accumulation

## 📝 Test Game Examples

### Example 1: 1v1 Game
```json
{
  "gameState": "completed",
  "gameId": 1001,
  "datetime": "2025-01-15T10:00:00Z",
  "duration": 1800,
  "gamename": "1v1 Match",
  "map": "Island Troll Tribes",
  "creatorName": "Admin",
  "category": "1v1",
  "players": [
    { "name": "Alice", "pid": 0, "flag": "winner" },
    { "name": "Bob", "pid": 1, "flag": "loser" }
  ]
}
```

### Example 2: 2v2 Game
```json
{
  "gameState": "completed",
  "gameId": 1002,
  "datetime": "2025-01-15T11:00:00Z",
  "duration": 2400,
  "gamename": "2v2 Match",
  "map": "Island Troll Tribes",
  "creatorName": "Admin",
  "category": "2v2",
  "players": [
    { "name": "Alice", "pid": 0, "flag": "winner" },
    { "name": "Charlie", "pid": 1, "flag": "winner" },
    { "name": "Bob", "pid": 2, "flag": "loser" },
    { "name": "David", "pid": 3, "flag": "loser" }
  ]
}
```

**Note**: All game creation endpoints require authentication. The `creatorName` and `createdByDiscordId` fields are automatically filled from the session if not provided.

## 🔍 Testing Verification

When testing, verify the following functionality:
- Can create a game via API (with proper authentication)
- Games appear in the games list page
- Game detail page shows correct information
- ELO is calculated correctly (winner gains, loser loses)
- Player stats update after game creation
- Player profile page displays correctly
- Leaderboard shows players ranked by ELO
- Category filtering works on leaderboard
- Multiple games accumulate stats correctly

## 🐛 Troubleshooting

### Issue: "Game not found" or empty list
- **Solution:** Make sure you've created at least one game first
- Check Firestore console to verify games were created

### Issue: ELO not updating
- **Solution:** Check browser console for errors
- Verify Firestore rules allow writes
- Check that players array has at least 2 players

### Issue: API returns 500 error
- **Solution:** Check server console for error messages
- Verify Firebase is properly configured
- Check that all required fields are provided

### Issue: Pages show loading forever
- **Solution:** Check browser console for errors
- Verify API endpoints are working (test with curl)
- Check Firestore connection

## 📊 Expected ELO Behavior

- **Starting ELO:** 1000 for all new players
- **Winner gains ELO:** Amount depends on opponent's ELO
- **Loser loses ELO:** Amount depends on opponent's ELO
- **Expected change:** Typically 10-30 points for evenly matched players

## 🎯 Next Steps After Testing

Once basic functionality is confirmed:
1. Test with more complex scenarios (team games, draws)
2. Test filtering and search features
3. Test analytics endpoints
4. Test player comparison
5. Add more games to see leaderboard behavior

---

**Happy Testing!** 🎮




