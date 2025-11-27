# Replay Parser Quick Start Guide

## Summary

You're right! The Archives feature already has replay upload infrastructure. Here's what we found and what needs to be done:

---

## ✅ What You Already Have

### 1. File Upload Infrastructure
- ✅ `uploadReplay()` function in `archiveService.ts`
- ✅ File validation (`.w3g` extension, 50MB max)
- ✅ Firebase Storage integration
- ✅ File upload UI components (`MediaSelector`)

### 2. Game Statistics System
- ✅ Complete game CRUD system
- ✅ ELO calculation
- ✅ Player stats tracking
- ✅ API endpoints ready

### 3. Scheduled Games System
- ✅ Scheduled games with status field
- ✅ Participant tracking
- ✅ Ready for integration

---

## 🔧 What Needs to Be Built

### 1. Replay Parser Service
**Library Recommendation:** `w3gjs` (TypeScript, Node.js compatible)

```bash
npm install w3gjs
```

**Key Features Needed:**
- Parse `.w3g` files
- Extract W3MMD data (Island Troll Tribes uses this)
- Extract player stats (kills, deaths, class, etc.)
- Map winners/losers

### 2. Integration Points

#### A. Update Game Creation API
```typescript
POST /api/games
// Accept either:
// 1. Replay file (multipart/form-data)
// 2. Manual game data (JSON)
```

#### B. Scheduled Games Integration
- Add "Record Result" button to scheduled games
- Link completed games back to scheduled games
- Update scheduled game status automatically

#### C. New UI Components
- Replay upload form (reuse Archives pattern)
- Parsed data preview/edit form
- "Record Result" button for scheduled games

---

## 📋 Implementation Checklist

### Phase 1: Parser Foundation
- [ ] Install `w3gjs` library
- [ ] Create `replayParser.ts` service
- [ ] Test with sample Island Troll Tribes replay
- [ ] Extract basic game data
- [ ] Extract W3MMD variables
- [ ] Map players to winners/losers

### Phase 2: API Integration
- [ ] Update `POST /api/games` to accept replay files
- [ ] Integrate parser with upload endpoint
- [ ] Handle file upload to Firebase Storage
- [ ] Create game from parsed data
- [ ] Error handling

### Phase 3: UI Components
- [ ] Create `ReplayUploadForm` component
- [ ] Add to game creation flow
- [ ] Add "Record Result" to scheduled games
- [ ] Show parsed data preview
- [ ] Allow editing parsed data

### Phase 4: Scheduled Games Link
- [ ] Update `scheduledGames` schema (add `gameId`, `gameResultId`)
- [ ] Update `games` schema (add `scheduledGameId`)
- [ ] Link games when created from scheduled game
- [ ] Update scheduled game status
- [ ] Show linked results in UI

---

## 🎯 Quick Win: Start Here

1. **Test Parser Library**
   ```bash
   npm install w3gjs
   ```
   
   Create a test script:
   ```typescript
   // test-parser.ts
   import { parseReplay } from 'w3gjs';
   import fs from 'fs';
   
   const buffer = fs.readFileSync('test-replay.w3g');
   const replay = parseReplay(buffer);
   console.log(replay);
   ```

2. **Extend Upload Endpoint**
   - Modify `POST /api/games` to accept `multipart/form-data`
   - Use existing `uploadReplay()` function
   - Parse file after upload
   - Create game from parsed data

3. **Simple UI First**
   - Add file input to game creation form
   - Upload and parse on submit
   - Show parsed data for confirmation
   - Submit to create game

---

## 🔗 Key Files to Modify

### Existing Files to Update
- `src/pages/api/games/index.ts` - Add replay file handling
- `src/features/ittweb/games/lib/gameService.ts` - Add parser integration
- `src/features/ittweb/scheduled-games/` - Add result recording

### New Files to Create
- `src/features/ittweb/games/lib/replayParser.ts` - Parser service
- `src/features/ittweb/games/components/ReplayUploadForm.tsx` - Upload UI
- `src/features/ittweb/games/lib/w3mmdParser.ts` - W3MMD extraction

---

## 📚 Resources

- **w3gjs Documentation:** https://www.skypack.dev/view/w3gjs
- **W3MMD Format:** Island Troll Tribes uses W3MMD for custom stats
- **Replay Format:** Warcraft 3 replay file structure

---

## ⚠️ Important Notes

1. **W3MMD Support:** Ensure parser can extract W3MMD variables (class, kills, deaths, etc.)
2. **File Validation:** Already handled in `uploadReplay()` - just reuse it
3. **Error Handling:** Not all replays will have W3MMD data - allow manual entry fallback
4. **Performance:** Parsing can be slow - consider background processing for large files

---

## 🚀 Next Steps

1. **Research w3gjs** - Test if it supports W3MMD data extraction
2. **Create POC** - Parse one replay file end-to-end
3. **Integrate** - Add to game creation flow
4. **Link** - Connect to scheduled games

---

**Status:** Ready to start implementation! 🎮



