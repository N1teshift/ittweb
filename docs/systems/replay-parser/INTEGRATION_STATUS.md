# Replay Parser Integration Status

**Last Updated**: 2025-01-28  
**Status**: ✅ **FULLY INTEGRATED**

## Summary

The replay parser is fully integrated with the scheduled games system. All core functionality is implemented and working.

---

## ✅ Completed Components

### 1. Replay Parser Service
**File**: `src/features/modules/games/lib/replayParser.ts`

- ✅ Fully implemented using `w3gjs` library
- ✅ Parses `.w3g` replay files
- ✅ Extracts W3MMD data (Island Troll Tribes compatible)
- ✅ Derives winning team from multiple sources:
  - Parsed `winningTeamId` from replay
  - Player result/status properties
  - W3MMD mission data
  - Process of elimination (finding losers)
- ✅ Maps player stats (kills, deaths, assists, gold, damage, etc.)
- ✅ Derives game category from team distribution
- ✅ Handles fallback options (scheduledGameId, fallbackDatetime, fallbackCategory)

### 2. Upload Replay API Endpoints

#### A. `/api/games/upload-replay` (Create New Game)
**File**: `src/pages/api/games/upload-replay.ts`

- ✅ Accepts replay file upload
- ✅ Optional `scheduledGameId` field for linking
- ✅ Parses replay and creates completed game
- ✅ Uploads replay to Firebase Storage
- ✅ Updates ELO scores automatically
- ✅ Returns game ID and success message
- ✅ Handles parsing failures with manual gameData fallback

#### B. `/api/games/[id]/upload-replay` (Convert Scheduled to Completed)
**File**: `src/pages/api/games/[id]/upload-replay.ts`

- ✅ Accepts replay file for existing scheduled game
- ✅ Validates game exists and is in 'scheduled' state
- ✅ Parses replay file
- ✅ Converts game from 'scheduled' to 'completed' state
- ✅ Preserves scheduled game fields (scheduledDateTime, participants)
- ✅ Adds completed game fields (datetime, players, replayUrl, etc.)
- ✅ Adds players to subcollection
- ✅ Updates ELO scores automatically
- ✅ Handles parsing failures with manual gameData fallback

### 3. UI Components

#### A. UploadReplayModal
**File**: `src/features/modules/scheduled-games/components/UploadReplayModal.tsx`

- ✅ Modal dialog for replay file upload
- ✅ File selection and validation
- ✅ Upload progress indicators (uploading, parsing, processing)
- ✅ Error handling and display
- ✅ Success message and auto-close
- ✅ Calls `/api/games/[id]/upload-replay` endpoint

#### B. ScheduledGamesList
**File**: `src/features/modules/scheduled-games/components/ScheduledGamesList.tsx`

- ✅ "Upload Replay" button when game status is 'awaiting_replay'
- ✅ Opens UploadReplayModal on click
- ✅ Handles upload state (isUploadingReplay)
- ✅ Shows game status badges

#### C. GameDetail
**File**: `src/features/modules/games/components/GameDetail.tsx`

- ✅ "Upload Replay" button for scheduled games
- ✅ Only visible when user has permission (canUploadReplay)
- ✅ Calls onUploadReplay callback

### 4. Integration Flow

#### End-to-End Flow: Scheduled Game → Upload Replay → Completed Game

1. **User creates scheduled game**
   - Game created with `gameState: 'scheduled'`
   - Has `scheduledGameId` (numeric ID)
   - Has `scheduledDateTime` and `participants`

2. **User clicks "Upload Replay" button**
   - Button appears when status is 'awaiting_replay' or user has permission
   - Opens UploadReplayModal

3. **User selects and uploads replay file**
   - File validated (`.w3g` extension, 50MB max)
   - Uploaded to `/api/games/[id]/upload-replay`

4. **Server processes replay**
   - Replay file uploaded to Firebase Storage (`games/{gameId}/replay.w3g`)
   - Replay parsed using `parseReplayFile()`
   - Game data extracted (players, stats, winners, etc.)
   - If parsing fails, accepts manual gameData JSON as fallback

5. **Game converted to completed**
   - Same document updated (no new document created)
   - `gameState` changed from 'scheduled' to 'completed'
   - Scheduled fields preserved (scheduledDateTime, participants)
   - Completed fields added (datetime, duration, players, replayUrl, etc.)
   - Players added to `games/{gameId}/players` subcollection

6. **ELO scores updated**
   - `updateEloScores()` called automatically
   - Player stats updated
   - Leaderboards refreshed

7. **UI updates**
   - Modal shows success message
   - Page refreshes to show completed game
   - Game now appears in completed games list

---

## ✅ Integration Complete

The replay parser integration has been successfully completed. All components are functional:

- **Replay parser service** exists and is functional
- **Upload-replay API endpoint** works correctly
- **Scheduled games linking** - Scheduled games can link to completed games via replay upload
- **Status updates** - Scheduled game status updates when replay is uploaded (`gameState: 'scheduled'` → `'completed'`)
- **UI integration** - "Upload Replay" button exists in scheduled games UI
- **End-to-end flow** - Complete flow works: scheduled game → upload replay → game created → scheduled game updated
- **ELO updates** - ELO scores update automatically when replay is processed
- **Player data** - Players subcollection populated correctly
- **File storage** - Replay file stored in Firebase Storage
- **Error handling** - Error handling for parsing failures implemented
- **Fallback support** - Manual gameData fallback available when parsing fails

---

## 📝 Notes

### Architecture Decision: Unified Games Collection

The implementation uses a **unified `games` collection** with a `gameState` field, rather than separate `scheduledGames` and `games` collections. This means:

- Scheduled games and completed games are the same document type
- When a replay is uploaded, the same document is updated (not a new document created)
- No separate linking is needed - the document ID remains the same
- Scheduled fields (scheduledDateTime, participants) are preserved for history

This is different from the original integration plan which suggested separate collections, but the unified approach is simpler and more efficient.

### Button Visibility

The "Upload Replay" button appears:
- In `ScheduledGamesList`: When game status is `'awaiting_replay'`
- In `GameDetail`: When user has `canUploadReplay` permission (typically creator, participant, or admin)

### Error Handling

- If replay parsing fails, the API accepts a `gameData` JSON field as fallback
- This allows manual entry if the replay file is corrupted or incompatible
- Error messages are displayed to the user in the modal

---

## 🚀 Next Steps (Optional Enhancements)

1. **Manual Entry Option**: Add a "Manual Entry" button alongside "Upload Replay" for games without replay files
2. **Replay Validation**: Add more robust validation for replay file format
3. **Batch Upload**: Allow uploading multiple replays at once
4. **Replay Preview**: Show parsed data preview before final submission
5. **Edit Parsed Data**: Allow editing parsed game data before submission

---

## Related Documentation

- [Replay Parser Integration Plan](./integration-plan.md) - Original planning document
- [Replay Parser Quick Start](./quick-start.md) - Quick start guide
- [API Documentation](../api/README.md) - API endpoint documentation

