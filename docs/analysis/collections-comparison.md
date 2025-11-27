# Archives, Games, ScheduledGames, and Posts Collections - Attribute Comparison

## Overview
This document compares the `archives`, `games`, `scheduledGames`, and `posts` collections in Firestore to identify common attributes, naming inconsistencies, and relationship patterns that should be standardized before scaling the project.

## Collection Relationships

These three collections are tightly interconnected:

```
ScheduledGame ──gameId──> Game
     │                      │
     │                      │
archiveId                   │
     │                      │
     └──archiveId──> ArchiveEntry ──gameId──> Game
```

**Relationship Details:**
- **ScheduledGame → Game**: `gameId?: string` (Game document ID)
- **ScheduledGame → ArchiveEntry**: `archiveId?: string` (Archive document ID)
- **Game → ScheduledGame**: `scheduledGameId?: number` (ScheduledGame numeric ID)
- **ArchiveEntry → Game**: `gameId?: string` (Game document ID)

**Flow:** When a scheduled game replay is uploaded:
1. ArchiveEntry is created first
2. Game is created from replay
3. ArchiveEntry.gameId links to Game
4. ScheduledGame.gameId and ScheduledGame.archiveId are set
5. Game.scheduledGameId links back to ScheduledGame

## Common Attributes Across All Collections

### 1. **Standard Metadata Fields** ✅
All three collections share these standard fields:
- `id: string` - Firestore document ID
- `createdAt: Timestamp | string` - Creation timestamp
- `updatedAt: Timestamp | string` - Last update timestamp

**Type Inconsistencies:**
- `ArchiveEntry.createdAt/updatedAt` are typed as `string` only
- `Game.createdAt/updatedAt` are typed as `Timestamp | string`
- `ScheduledGame.createdAt/updatedAt` are typed as `string` only

**Recommendation:** Standardize all to `Timestamp | string`, as Firestore stores them as Timestamps but they're converted to strings when read

### 2. **Replay URL** ✅
- `ArchiveEntry.replayUrl?: string` - Optional URL to replay file
- `Game.replayUrl?: string` - Optional URL to replay file
- `ScheduledGame` - No replayUrl (replay is stored via ArchiveEntry)

**Status:** Consistent naming between Archives and Games ✅

### 3. **Game ID Confusion** ⚠️ **CRITICAL ISSUE**

There are multiple fields named `gameId` with different meanings:

- **ScheduledGame.gameId?: string** - Links to Game document ID (when replay uploaded)
- **ScheduledGame.scheduledGameId: number** - Unique numeric ID for scheduled games
- **Game.gameId: number** - Original game ID from replay (unique identifier)
- **Game.scheduledGameId?: number** - Links back to ScheduledGame.scheduledGameId
- **ArchiveEntry.gameId?: string** - Links to Game document ID

**Issues:**
1. **Type confusion:** `gameId` is sometimes `string` (document ID reference) and sometimes `number` (replay ID)
2. **Naming collision:** `ScheduledGame.gameId` (string) vs `Game.gameId` (number) - completely different purposes
3. **Inconsistent reference patterns:**
   - ScheduledGame → Game: uses `gameId` (string)
   - ArchiveEntry → Game: uses `gameId` (string)
   - Game → ScheduledGame: uses `scheduledGameId` (number)

**Recommendations:**
1. **Rename for clarity:**
   - `ScheduledGame.gameId` → `linkedGameDocumentId` or `gameDocumentId`
   - `ArchiveEntry.gameId` → `linkedGameDocumentId` or `gameDocumentId`
   - Keep `Game.gameId: number` as is (it's the original replay ID)
   - Keep `Game.scheduledGameId: number` as is (links to ScheduledGame.scheduledGameId)

2. **Alternative approach:** Use consistent suffix pattern:
   - Document ID references: `*DocumentId` (e.g., `gameDocumentId`, `archiveDocumentId`)
   - Numeric IDs: `*Id` (e.g., `gameId`, `scheduledGameId`)

## Naming Inconsistencies

### 1. **Creator/Author Fields** ⚠️ **HIGH PRIORITY**

**Archives Collection:**
- `author: string` - Display name of the creator
- `createdByDiscordId?: string | null` - Discord ID of creator
- `createdByName?: string` - Name of creator (redundant with `author`?)

**Games Collection:**
- `creatorname: string` - Game creator name (from replay)
- `submittedBy?: string` - Discord ID of submitter
- `submittedAt?: Timestamp | string` - When game was submitted

**ScheduledGames Collection:**
- `scheduledByName: string` - Display name of scheduler
- `scheduledByDiscordId: string` - Discord ID of scheduler

**Issues:**
1. **Three different naming patterns:**
   - Archives: `author`, `createdByDiscordId`, `createdByName`
   - Games: `creatorname`, `submittedBy`, `submittedAt`
   - ScheduledGames: `scheduledByName`, `scheduledByDiscordId`

2. **Semantic confusion:**
   - `author` vs `creatorname` vs `scheduledByName` - all represent creator/author
   - `createdByDiscordId` vs `submittedBy` vs `scheduledByDiscordId` - all represent Discord ID
   - Different verbs: "created", "submitted", "scheduled" - but all mean "who created this"

3. **Missing fields:**
   - Games has `submittedAt` but Archives and ScheduledGames don't
   - ScheduledGames doesn't have timestamp for when it was created/submitted

4. **Redundancy:**
   - Archives has both `author` and `createdByName` which seem to serve the same purpose

**Recommendations:**
Standardize to a common pattern across all three collections:
- `creatorName: string` - Display name (camelCase for consistency)
- `createdByDiscordId?: string | null` - Discord ID (consistent across collections)
- `createdAt: Timestamp | string` - Already exists, but ensure consistency
- `submittedAt?: Timestamp | string` - Add to Archives and ScheduledGames for consistency

**Migration mapping:**
- `author` → `creatorName`
- `creatorname` → `creatorName`
- `scheduledByName` → `creatorName`
- `createdByDiscordId` → `createdByDiscordId` (keep)
- `submittedBy` → `createdByDiscordId`
- `scheduledByDiscordId` → `createdByDiscordId`

### 2. **Soft Delete Pattern** ⚠️

**Archives Collection:**
- `isDeleted?: boolean` - Soft delete flag
- `deletedAt?: string | null` - Deletion timestamp

**Games Collection:**
- No soft delete fields

**ScheduledGames Collection:**
- No soft delete fields (uses `status: 'cancelled'` instead)

**Issues:**
- Inconsistent deletion patterns:
  - Archives: Soft delete with `isDeleted` and `deletedAt`
  - ScheduledGames: Status-based deletion with `status: 'cancelled'`
  - Games: Hard delete only

**Recommendation:**
- Consider standardizing soft delete pattern across all collections:
  - Add `isDeleted?: boolean` and `deletedAt?: Timestamp | string | null` to Games and ScheduledGames
  - Or document why each collection uses different deletion strategies
  - For ScheduledGames, `status: 'cancelled'` could coexist with soft delete pattern

## Type Inconsistencies

### Timestamp Handling
- **Archives:** `createdAt` and `updatedAt` are typed as `string` only
- **Games:** `createdAt` and `updatedAt` are typed as `Timestamp | string`
- **ScheduledGames:** `createdAt` and `updatedAt` are typed as `string` only
- **ScheduledGames:** `scheduledDateTime` is typed as `string` (ISO 8601)
- **Posts:** `createdAt` and `updatedAt` are typed as `string` only

**Recommendation:** Standardize all timestamp fields to `Timestamp | string` to reflect actual Firestore storage (Timestamps in DB, strings when read)

## Summary of Recommendations

### Critical Priority
1. **Fix gameId naming conflicts:**
   - Rename `ScheduledGame.gameId` → `linkedGameDocumentId` or `gameDocumentId`
   - Rename `ArchiveEntry.gameId` → `linkedGameDocumentId` or `gameDocumentId`
   - Keep `Game.gameId: number` as is (original replay ID)
   - Keep `Game.scheduledGameId: number` as is (links to ScheduledGame)

### High Priority
2. **Standardize creator/author fields across all four collections:**
   - `author` → `creatorName` (Archives, Posts)
   - `creatorname` → `creatorName` (Games)
   - `scheduledByName` → `creatorName` (ScheduledGames)
   - `createdByName` → `creatorName` (Posts)
   - `submittedBy` → `createdByDiscordId` (Games)
   - `scheduledByDiscordId` → `createdByDiscordId` (ScheduledGames)
   - Add `submittedAt?: Timestamp | string` to Archives, ScheduledGames, and Posts

3. **Standardize timestamp types:**
   - Change `ArchiveEntry.createdAt/updatedAt` from `string` to `Timestamp | string`
   - Change `ScheduledGame.createdAt/updatedAt` from `string` to `Timestamp | string`
   - Change `Post.createdAt/updatedAt` from `string` to `Timestamp | string`
   - Ensure all timestamp fields use `Timestamp | string` consistently

### Medium Priority
4. **Consider soft delete pattern:**
   - Add `isDeleted?: boolean` and `deletedAt?: Timestamp | string | null` to Games and ScheduledGames
   - Or document why each collection uses different deletion strategies

5. **Remove redundancy:**
   - Evaluate if `ArchiveEntry.createdByName` is needed if `author` exists
   - Consider if `ScheduledGame.scheduledDateTimeString` is needed alongside `scheduledDateTime`

## Proposed Standardized Schema

### Common Base Interface (for reference)
```typescript
interface BaseDocument {
  id: string;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
  creatorName: string;
  createdByDiscordId?: string | null;
  submittedAt?: Timestamp | string; // When applicable
  isDeleted?: boolean;
  deletedAt?: Timestamp | string | null;
}
```

### Archives Collection
```typescript
interface ArchiveEntry extends BaseDocument {
  title: string;
  content: string;
  entryType?: ArchiveEntryType;
  // Media fields...
  replayUrl?: string;
  linkedGameDocumentId?: string; // Renamed from gameId - links to Game document
  dateInfo: DateInfo;
  // ... other fields
}
```

### Games Collection
```typescript
interface Game extends BaseDocument {
  gameId: number; // Original game ID from replay (numeric, unique)
  datetime: Timestamp | string;
  duration: number;
  gamename: string;
  map: string;
  category?: GameCategory;
  replayUrl?: string;
  replayFileName?: string;
  scheduledGameId?: number; // Links to ScheduledGame.scheduledGameId (numeric)
  playerNames?: string[];
  playerCount?: number;
  verified: boolean;
  // ... other fields
}
```

### ScheduledGames Collection
```typescript
interface ScheduledGame extends BaseDocument {
  scheduledGameId: number; // Unique numeric ID for scheduled games
  scheduledDateTime: Timestamp | string; // When game is scheduled
  timezone: string; // IANA timezone identifier
  teamSize: TeamSize;
  customTeamSize?: string;
  gameType: GameType;
  gameVersion?: string;
  gameLength?: number; // Game length in seconds
  modes: GameMode[];
  participants: GameParticipant[];
  status: 'scheduled' | 'ongoing' | 'awaiting_replay' | 'archived' | 'cancelled';
  linkedGameDocumentId?: string; // Renamed from gameId - links to Game document
  linkedArchiveDocumentId?: string; // Renamed from archiveId - links to ArchiveEntry document
  // ... other fields
}
```

### Posts Collection
```typescript
interface Post extends BaseDocument {
  title: string;
  content: string; // MDX/Markdown content
  date: string; // ISO date string
  slug: string;
  excerpt?: string;
  published: boolean; // Allow draft posts
  // ... other fields
}
```

## Migration Strategy

### Phase 1: Add New Fields (Non-Breaking)
1. Add new standardized fields alongside existing ones
2. Update code to write to both old and new fields
3. Run migration script to populate new fields from old ones

### Phase 2: Update Code References
1. Update all service functions to use new field names
2. Update all components to read from new fields
3. Update API endpoints to accept/return new field names

### Phase 3: Remove Old Fields (Breaking)
1. Remove old field names from TypeScript interfaces
2. Remove old fields from Firestore documents (optional cleanup)
3. Update documentation

### Field Mapping Reference

**Creator/Author Fields:**
- `author` → `creatorName`
- `creatorname` → `creatorName`
- `scheduledByName` → `creatorName`
- `createdByDiscordId` → `createdByDiscordId` (keep)
- `submittedBy` → `createdByDiscordId`
- `scheduledByDiscordId` → `createdByDiscordId`
- `createdByName` → Remove if redundant

**Game ID Fields:**
- `ScheduledGame.gameId` → `linkedGameDocumentId`
- `ArchiveEntry.gameId` → `linkedGameDocumentId`
- `ScheduledGame.archiveId` → `linkedArchiveDocumentId`
- `Game.gameId` → Keep as is (numeric replay ID)
- `Game.scheduledGameId` → Keep as is (numeric reference)
- `ScheduledGame.scheduledGameId` → Keep as is (numeric ID)

**Timestamp Fields:**
- All `createdAt`/`updatedAt` → Ensure `Timestamp | string` type
- Add `submittedAt?: Timestamp | string` to Archives and ScheduledGames

