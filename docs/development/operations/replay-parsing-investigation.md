# Replay Parsing Investigation

> Date: 2025-12-05  
> Investigation into missing player stats and data overwriting issues in parsed game replays

## Problem Statement

After adding metadata recording capabilities to the Island Troll Tribes map and parsing capabilities to the ittweb project, several issues were discovered:

1. **Missing player stats**: Some players had detailed stats (animal kills, damage, etc.) while others did not
2. **Stats overwriting**: Stats from one player were appearing on another player
3. **Missing players**: Some players from enemy tribes had no metadata recorded at all

## Investigation Process

### Initial Diagnostic

Created a diagnostic script (`scripts/diagnose-replays.mjs`) to test all parsing methods:
- **Old method**: `extractITTMetadata()` - used by the website parser
- **MMD method**: `readMMDData()` - w3mmd protocol parser
- **Order method**: `decodeReplay()` - order-based encoding parser
- **Chat method**: `readChatMessages()` - chat-based encoding parser

### Findings from Diagnostic

**Replay: `Replay_2025_12_04_2333.w3g`**

The MMD parser successfully extracted metadata with 3 players:
- SlotIndex 0: "Scatman33_2333" - All stats present
- SlotIndex 2: "Staycool_21990" - All stats present  
- SlotIndex 3: "Bel_1873" - All stats present

However, the replay file contains 6 players total:
- Player 1: "Scatman33#2333" (matched correctly)
- Player 2: "LampLight#31707" (incorrectly matched to SlotIndex 2)
- Player 3: "Staycool#21990" (matched correctly)
- Player 4: "Reyes46#3333" (no match found)
- Player 5: "Anrael#2585" (no match found)
- Player 6: "Bel#1873" (matched correctly)

## Root Causes Identified

### Issue 1: Schema v3 Parsing Bug (FIXED)

**Problem**: The replay metadata parser didn't support schema v3 format, which includes a `class` field between `race` and `team`.

**Schema v3 format**: `slot|name|race|class|team|result|dmg|selfHeal|allyHeal|gold|meat|elk|hawk|snake|wolf|bear|panther`

**Location**: `scripts/replay-metadata-parser/src/payload/payloadParser.ts`

**Fix Applied**: Updated `parsePlayerLine()` to detect schema version and adjust field positions accordingly.

```typescript
// Schema v3+ format: slot|name|race|class|team|result|dmg|...
// Schema v2 format: slot|name|race|team|result|dmg|...
const hasClass = schemaVersion >= 3;
// Adjust statsOffset based on schema version
```

### Issue 2: Player Matching Logic Bug (NOT FIXED)

**Problem**: The player matching logic in `parseReplayFile()` is too loose and causes:
- False matches (Player 2 matching SlotIndex 2 incorrectly)
- Multiple players matching the same ITT player
- Stats overwriting each other

**Location**: `src/features/modules/game-management/lib/mechanics/replay/parser.ts` (lines 86-90)

**Current Logic**:
```typescript
const ittPlayer = ittMetadata?.players.find(
  (p) => p.slotIndex === player.id ||
    p.name.toLowerCase().replace(/[^a-z0-9]/g, '') ===
    (player.name || '').toLowerCase().replace(/[^a-z0-9]/g, '')
);
```

**Issues**:
1. `find()` returns only the first match, so if multiple players match the same ITT player, only the first gets stats
2. Normalized name matching is too loose and can cause false positives
3. No tracking of which ITT players have already been matched

**Recommended Fix**: 
- Use a more strict matching priority (slotIndex → exact name → normalized name)
- Track matched ITT players to prevent duplicates
- Use `??` instead of `||` to handle zero values correctly

### Issue 3: Defeated Players Excluded from Metadata (BUG IN MAP)

**Problem**: Players from defeated enemy tribes are not included in metadata.

**Root Cause**: In `island-troll-tribes/wurst/systems/core/Tribe.wurst`:
- When a tribe is defeated, `wasDefeated()` calls `makePlayersObservers()` (line 143)
- This converts defeated players to observers
- In `MatchMetadataEncoder.wurst` (line 127), the check `not member.isObserver()` excludes them

**Location**: `island-troll-tribes/wurst/systems/core/MatchMetadataEncoder.wurst`

**Current Logic**:
```wurst
for tribe in Tribe.getTribes()
    for member in tribe.getMembers()
        if member != null and not member.isObserver()  // Excludes defeated players!
```

**Impact**: All players from defeated tribes are missing from metadata, even though they played the game.

**Fix Needed**: The metadata encoder should include defeated players. Options:
1. Track original players before they're made observers
2. Remove the `not member.isObserver()` check and filter differently
3. Include all players who were ever in a tribe, regardless of observer status

## Data Verification

### What's Recorded Correctly

The metadata recording system in the map correctly records:
- All players who are in non-defeated tribes at game end
- Complete stats for each player (damage, healing, kills, etc.)
- Schema v3 format with class information
- Match metadata (matchId, duration, map version, etc.)

### What's Missing

- Players from defeated tribes (converted to observers)
- Players who left before game end
- Players who weren't in tribes (observers from start)

## Parser Architecture

### Two Parser Systems

1. **Website Parser** (`src/features/modules/game-management/lib/mechanics/replay/parser.ts`)
   - Uses `extractITTMetadata()` to extract from W3MMD custom messages
   - Used when uploading replays via the website
   - Has player matching bugs

2. **Standalone Parser** (`scripts/replay-metadata-parser/`)
   - Supports multiple encoding methods (MMD, order-based, chat-based)
   - CLI tool for debugging and testing
   - Fixed schema v3 support

### Parsing Flow

```
Replay File (.w3g)
    ↓
w3gjs.parse() → Basic replay data + W3MMD actions
    ↓
extractITTMetadata() → Extract custom "itt_*" messages
    ↓
Reconstruct payload from chunks
    ↓
parseITTPayload() → Parse player lines (schema v2/v3)
    ↓
Match ITT players to w3gjs players
    ↓
Merge stats into game data
```

## Fixes Applied

1. ✅ **Schema v3 Support**: Updated `payloadParser.ts` to handle schema v3 format with class field
2. ✅ **Diagnostic Tools**: Created scripts to compare parsers and identify issues

## Remaining Issues

1. ❌ **Player Matching**: Needs stricter matching logic to prevent false matches and overwriting
2. ❌ **Defeated Players**: Map needs to include defeated tribe members in metadata
3. ⚠️ **Parse Errors**: w3gjs throws many `ERR_OUT_OF_RANGE` errors when parsing these replays (non-fatal, but concerning)

## Recommendations

### Immediate Fixes (ittweb)

1. **Fix player matching logic** in `parser.ts`:
   - Use strict matching priority
   - Track matched players to prevent duplicates
   - Add better logging for debugging

2. **Add validation**: Log warnings when players can't be matched

### Map Fixes (island-troll-tribes)

1. **Include defeated players in metadata**: Modify `MatchMetadataEncoder.wurst` to include players from defeated tribes
2. **Track original player status**: Before converting to observers, record which players were actual players

### Long-term Improvements

1. **Unify parsers**: Consider using the standalone parser's MMD reader in the website parser for better error handling
2. **Add tests**: Create test cases with known replay files to catch regressions
3. **Better error handling**: Handle w3gjs parse errors more gracefully

## Testing

To test the fixes:

```bash
# Build the parser
npm run replay-meta:build

# Test a replay
npm run replay-meta:decode -- Replay_2025_12_04_2333.w3g --pretty

# Or use MMD method
node ./scripts/replay-metadata-parser/dist/cli.js mmd Replay_2025_12_04_2333.w3g --pretty
```

## Related Files

- `scripts/replay-metadata-parser/src/payload/payloadParser.ts` - Payload parsing (schema v3 fix)
- `src/features/modules/game-management/lib/mechanics/replay/parser.ts` - Website parser (matching bug)
- `src/features/modules/game-management/lib/mechanics/replay/metadata.ts` - ITT metadata extraction
- `scripts/diagnose-replays.mjs` - Diagnostic tool
- `scripts/compare-parsers.mjs` - Parser comparison tool
- `island-troll-tribes/wurst/systems/core/MatchMetadataEncoder.wurst` - Metadata recording (defeated players bug)

