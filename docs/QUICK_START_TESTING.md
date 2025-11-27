# Quick Start - Testing the Game Statistics System

## 🚀 Step 1: Start the Server

```bash
npm run dev
```

Wait for: `Ready on http://localhost:3000`

## 📍 Step 2: Access the Test Form

Open in your browser:
**http://localhost:3000/test/create-game**

This page lets you create test games easily!

## 🎮 Step 3: Create Your First Game

1. Fill in the form (default values are pre-filled)
2. Click "Create Game"
3. You should see a success message with the game ID

## 👀 Step 4: View Your Game

After creating a game, click:
- **"→ View All Games"** to see it in the list
- Or go directly to: **http://localhost:3000/games**

## 📊 Step 5: Check Player Stats

1. Click on a player name in the game detail page
2. Or go to: **http://localhost:3000/players/Player1**
3. You should see:
   - ELO rating (should be > 1000 for winners)
   - Win/loss record
   - Category statistics

## 🏆 Step 6: View Leaderboard

Go to: **http://localhost:3000/standings**

You should see players ranked by ELO!

## 🔄 Step 7: Create More Games

1. Go back to the test form
2. Create more games with different players
3. Watch the ELO change!
4. Check the leaderboard to see rankings update

## 📝 All Available Pages

| Page | URL |
|------|-----|
| **Test Form** | http://localhost:3000/test/create-game |
| **Games List** | http://localhost:3000/games |
| **Game Detail** | http://localhost:3000/games/[id] |
| **Player Profile** | http://localhost:3000/players/[name] |
| **Leaderboard** | http://localhost:3000/standings |

## 🧪 Test Scenarios

### Scenario 1: Simple 1v1
- Create a game with 2 players
- Winner should gain ELO (~15-25 points)
- Loser should lose ELO (~15-25 points)

### Scenario 2: Multiple Games
- Create 5 games with the same players
- Check that stats accumulate
- Check that ELO changes over time

### Scenario 3: Team Game
- Create a 2v2 game
- Team ELO is averaged
- Winners gain ELO, losers lose ELO

## 🐛 Troubleshooting

**Problem:** "Failed to fetch" or API errors
- **Fix:** Check that Firebase is configured
- Check browser console for errors
- Check server console for errors

**Problem:** Games not showing up
- **Fix:** Refresh the page
- Check Firestore console
- Verify game was created (check API response)

**Problem:** ELO not updating
- **Fix:** Check that players array has at least 2 players
- Verify winner/loser flags are correct
- Check server logs for ELO calculation errors

## ✅ Success Checklist

- [ ] Can create a game via test form
- [ ] Game appears in games list
- [ ] Can view game details
- [ ] Player stats page loads
- [ ] ELO is calculated (winner > 1000, loser < 1000)
- [ ] Leaderboard shows players
- [ ] Can create multiple games
- [ ] Stats accumulate correctly

---

**That's it!** You're ready to test! 🎉



