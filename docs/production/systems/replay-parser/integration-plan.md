# Replay Parser & Scheduled Games Integration Plan

**Status:** Planning Phase _(references former `src/features/ittweb` paths; current code lives in `src/features/modules`)_  
**Last Updated:** 2025-01-XX  
**Version:** 1.0

## Overview

This plan outlines the integration of:
1. **Scheduled Games** with **Game Statistics** system
2. **Warcraft 3 Replay Parser** for automatic game data extraction
3. **Replay Upload** functionality (reusing Archives infrastructure – see `src/features/shared/lib/archiveService.ts::uploadReplay`)

---

## 1. Merging Scheduled Games with Game Stats

### 1.1 Database Schema Updates

#### Unified Games Collection (Current Implementation)
The system uses a unified `games` collection with `gameState` field:

```typescript
interface Game {
  // ... existing fields ...
  gameState: 'scheduled' | 'completed';  // Unified collection approach
  scheduledGameId?: number;     // Numeric scheduled game ID
  scheduledDateTime?: Timestamp; // When game was scheduled
  participants?: Array<{...}>;  // Scheduled game participants
  datetime?: Timestamp;         // When game was actually played (completed games)
  players?: Array<{...}>;       // Game players (completed games)
  replayUrl?: string;          // Replay file URL (if uploaded)
  // ... other fields ...
}
```

**Note:** The current implementation uses a unified `games` collection rather than separate `scheduledGames` and `games` collections. When a replay is uploaded, the same document is updated from `gameState: 'scheduled'` to `gameState: 'completed'`.

### 1.2 Integration Points

#### A. Scheduled Game Detail Page
- Add "Record Result" button when game status is `scheduled` or `completed`
- Button opens replay upload form OR manual entry form
- After game is recorded, update scheduled game:
  - Set `status` to `completed`
  - Link `gameId` and `gameResultId`
  - Set `completedAt` timestamp

#### B. Game Creation Flow
When creating a game (via replay or manual):
1. Check if `scheduledGameId` is provided
2. If yes, update the scheduled game record
3. Link the game back to scheduled game

#### C. Scheduled Games List
- Show status badges: `Scheduled`, `Completed`, `Cancelled`
- For completed games, show link to game result
- Show "Record Result" button for past scheduled games without results

### 1.3 API Updates

#### New Endpoint: `POST /api/scheduled-games/[id]/record-result`
```typescript
// Body: Either replay file OR manual game data
{
  type: 'replay' | 'manual';
  replayFile?: File;           // If type === 'replay'
  gameData?: CreateGame;       // If type === 'manual'
}
```

#### Update: `PUT /api/scheduled-games/[id]`
- Allow updating status to `completed` or `cancelled`
- Allow linking `gameId` when result is recorded

---

## 2. Warcraft 3 Replay Parser

### 2.1 Technology Choice

**Recommended:** Use existing Node.js libraries:
- `@w3g/replay` or `w3gjs` - JavaScript replay parsers
- Alternative: `w3g` (Python) with Node.js subprocess (if needed)

**Research needed:**
- Check which parser supports W3MMD data (Island Troll Tribes uses W3MMD)
- Verify compatibility with current Warcraft 3 versions

### 2.2 Parser Service Structure

```
src/features/modules/games/
├── lib/
│   ├── replayParser.ts        # Main parser service (already exists)
│   ├── w3mmdUtils.ts         # W3MMD-specific utilities (already exists)
│   └── replayValidator.ts     # Validate replay file
```

### 2.3 Data Extraction

#### Basic Game Data
```typescript
interface ParsedGameData {
  gameId: number;              // From replay header
  datetime: Date;              // Game start time
  duration: number;            // Game duration in seconds
  gamename: string;           // Game name
  map: string;                 // Map name
  creatorName: string;         // Creator name (standardized field)
  createdByDiscordId?: string; // Creator Discord ID (standardized field)
}
```

#### Player Data (from W3MMD)
```typescript
interface ParsedPlayerData {
  name: string;                // Player name
  pid: number;                 // Player ID (0-11)
  flag: 'winner' | 'loser' | 'drawer';
  category?: string;           // Game category (from W3MMD vars)
  class?: string;              // Troll class (from W3MMD vars)
  randomClass?: boolean;        // Whether class was random
  kills?: number;
  deaths?: number;
  assists?: number;
  gold?: number;
  damageDealt?: number;
  damageTaken?: number;
}
```

#### W3MMD Variables to Extract
- `class` - Troll class name
- `random` - Random class flag
- `kills` - Kill count
- `deaths` - Death count
- `gold` - Gold amount
- `category` - Game category (1v1, 2v2, etc.)
- Any other custom stats

### 2.4 Parser Implementation

```typescript
// src/features/modules/games/lib/replayParser.ts (already exists)

export interface ParseReplayResult {
  game: ParsedGameData;
  players: ParsedPlayerData[];
  isValid: boolean;
  errors?: string[];
}

export async function parseReplayFile(
  file: File | Buffer | string // File path or buffer
): Promise<ParseReplayResult> {
  // 1. Read replay file
  // 2. Parse with w3g library
  // 3. Extract basic game info
  // 4. Extract W3MMD data
  // 5. Map players to winners/losers/drawers
  // 6. Extract player stats
  // 7. Validate data
  // 8. Return structured data
}
```

### 2.5 Validation

- Verify replay is from Island Troll Tribes map
- Check that W3MMD data exists
- Validate player count (at least 2)
- Verify winners/losers are properly flagged
- Check for duplicate gameId

---

## 3. Replay Upload Integration

### 3.1 Reuse Archives Upload Infrastructure

The Archives feature already has:
- ✅ File upload to Firebase Storage (`uploadReplay` in `archiveService.ts`)
- ✅ File input handling (`MediaSelector` component)
- ✅ File validation

### 3.2 New Upload Endpoints

#### Option A: Separate Game Replay Upload
```
POST /api/games/upload-replay
Content-Type: multipart/form-data
Body: { replayFile: File }
Response: { gameId: string, parsedData: ParseReplayResult }
```

#### Option B: Integrated with Game Creation
```
POST /api/games
Body: { 
  type: 'replay' | 'manual',
  replayFile?: File,
  gameData?: CreateGame 
}
```

**Recommendation:** Option B - Single endpoint handles both cases

### 3.3 Upload Flow

1. **User uploads replay file**
   - Via scheduled game "Record Result" button
   - Via games page "Upload Replay" button
   - Via manual game creation form

2. **Server processes replay**
   - Upload file to Firebase Storage
   - Parse replay file
   - Extract game and player data
   - Validate data

3. **Create game record**
   - Use parsed data to create game
   - Calculate ELO changes
   - Update player stats
   - Link to scheduled game (if applicable)

4. **Return result**
   - Success: Return game ID and link
   - Error: Return validation errors

### 3.4 UI Components

#### A. Replay Upload Form Component
```typescript
// src/features/modules/games/components/ReplayUploadForm.tsx
interface ReplayUploadFormProps {
  scheduledGameId?: string;    // Optional: Link to scheduled game
  onSuccess: (gameId: string) => void;
  onCancel: () => void;
}
```

#### B. Update Scheduled Game Component
Add "Record Result" section:
- Upload replay button
- Manual entry button
- Show linked game result if exists

#### C. Game Creation Form Enhancement
- Add "Upload Replay" option alongside manual entry
- Show parsed data preview before submission
- Allow editing parsed data if needed

---

## 4. Implementation Phases

### Phase 1: Replay Parser Foundation (3-5 days)
**Priority:** P0

#### Tasks:
1. Research and choose replay parser library
2. Install and test parser library
3. Create `replayParser.ts` service
4. Implement basic game data extraction
5. Implement W3MMD data extraction
6. Create validation logic
7. Write unit tests for parser

#### Deliverables:
- Working replay parser service
- Can extract game and player data from .w3g files
- Validation working

---

### Phase 2: Upload Integration (2-3 days)
**Priority:** P0

#### Tasks:
1. Create `POST /api/games` endpoint that accepts replay files
2. Integrate parser with upload endpoint
3. Handle file upload to Firebase Storage
4. Create game from parsed data
5. Error handling and validation
6. Return appropriate responses

#### Deliverables:
- API endpoint accepts replay files
- Files uploaded to storage
- Games created from parsed data

---

### Phase 3: UI Components (3-4 days)
**Priority:** P0

#### Tasks:
1. Create `ReplayUploadForm` component
2. Add replay upload to game creation flow
3. Add "Record Result" to scheduled games
4. Show parsed data preview
5. Allow editing parsed data
6. Error states and loading states

#### Deliverables:
- Users can upload replays via UI
- Parsed data shown before submission
- Scheduled games can link to results

---

### Phase 4: Scheduled Games Integration (2-3 days)
**Priority:** P1

#### Tasks:
1. Update `scheduledGames` schema
2. Update `games` schema
3. Add linking logic in game creation
4. Update scheduled game when result recorded
5. Update scheduled games UI to show results
6. Add "Record Result" button

#### Deliverables:
- Scheduled games link to game results
- Status updates automatically
- UI shows completion status

---

### Phase 5: Polish & Error Handling (2-3 days)
**Priority:** P1

#### Tasks:
1. Comprehensive error handling
2. Invalid replay file handling
3. Missing W3MMD data handling
4. Duplicate game detection
5. User feedback improvements
6. Loading states
7. Progress indicators for large files

#### Deliverables:
- Robust error handling
- Good user experience
- Clear error messages

---

## 5. Technical Considerations

### 5.1 File Size Limits
- Warcraft 3 replays are typically 100KB - 2MB
- Set Firebase Storage upload limit appropriately
- Consider chunked uploads for very large files

### 5.2 Parser Performance
- Replay parsing can be CPU-intensive
- Consider:
  - Background job processing (Firebase Functions)
  - Queue system for multiple uploads
  - Progress updates for long-running parses

### 5.3 Data Validation
- Not all replays will have W3MMD data
- Handle missing data gracefully
- Allow manual correction of parsed data
- Flag games that need manual review

### 5.4 Security
- Validate file type (must be .w3g)
- Scan for malicious files
- Rate limit uploads per user
- Authenticate uploads (require login)

### 5.5 Error Scenarios
- Invalid replay file format
- Missing W3MMD data
- Corrupted replay file
- Unsupported Warcraft 3 version
- Duplicate gameId
- Parsing errors

---

## 6. Dependencies

### New NPM Packages Needed
```json
{
  "w3gjs": "^1.0.0",  // Or similar replay parser
  // OR
  "w3g": "^1.0.0"     // Alternative parser
}
```

**Note:** Need to research which parser works best for W3MMD data

### Firebase Storage
- Already configured (used by Archives)
- Need to create `replays/` folder structure
- Set appropriate security rules

---

## 7. Testing Strategy

### Unit Tests
- Parser functions
- Data extraction logic
- Validation logic
- W3MMD parsing

### Integration Tests
- End-to-end upload flow
- Game creation from replay
- Scheduled game linking
- Error scenarios

### Manual Testing
- Upload various replay files
- Test with missing W3MMD data
- Test with different game types
- Test scheduled game integration

---

## 8. Migration Path

### For Existing Scheduled Games
1. Add migration script to add new fields
2. Set default values for existing games
3. Allow manual linking of past games

### For Future Games
1. New scheduled games automatically support result recording
2. Games created from replays can link back to scheduled games
3. Both systems work seamlessly together

---

## 9. Success Criteria

- ✅ Users can upload .w3g replay files
- ✅ Games are automatically created from replays
- ✅ Scheduled games can be linked to results
- ✅ Parsed data is accurate
- ✅ Error handling is robust
- ✅ UI is intuitive and clear
- ✅ Performance is acceptable (< 5s for parsing)

---

## 10. Next Steps

1. **Research replay parser libraries**
   - Test with Island Troll Tribes replays
   - Verify W3MMD data extraction
   - Choose best library

2. **Create proof of concept**
   - Parse a single replay file
   - Extract basic data
   - Validate approach

3. **Start Phase 1 implementation**
   - Build parser service
   - Test with various replays
   - Iterate on data extraction

4. **Plan UI/UX**
   - Design upload flow
   - Design scheduled game integration
   - Get user feedback

---

## Notes

- **W3MMD Support:** Island Troll Tribes uses W3MMD (Warcraft 3 Multi-Map Data) system. Ensure parser supports this.
- **Replay Versions:** Different Warcraft 3 versions may have different replay formats. Test compatibility.
- **Manual Fallback:** Always allow manual entry if replay parsing fails.
- **Data Correction:** Allow admins to correct parsed data if errors occur.

---

**Document Status:** ✅ Complete - Ready for Implementation




