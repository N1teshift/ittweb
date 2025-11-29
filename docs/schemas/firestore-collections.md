# Firestore Collections - Standardized Schema Documentation

**⚠️ CRITICAL: This document defines the ONLY valid schema for all Firestore collections. All code MUST follow these schemas exactly. No backward compatibility or migration code is allowed.**

## Standardized Field Naming Conventions

### Creator/Author Fields (REQUIRED STANDARD)
All collections MUST use these standardized field names:
- **`creatorName: string`** - Display name of the creator/author/scheduler
- **`createdByDiscordId: string`** - Discord ID of the creator

**❌ FORBIDDEN FIELD NAMES (DO NOT USE):**
- `scheduledByName`, `scheduledByDiscordId` (old ScheduledGames fields)
- `author`, `createdByName` (old Archives fields)
- `creatorname` (lowercase), `submittedBy` (old Games fields)
- `mediaUrl`, `mediaType` (deprecated ArchiveEntry fields - removed in standardization)
- Any other variations

### Timestamp Fields (REQUIRED STANDARD)
All collections MUST use these standardized field names:
- **`createdAt: Timestamp | string`** - Creation timestamp
- **`updatedAt: Timestamp | string`** - Last update timestamp
- **`submittedAt?: Timestamp | string`** - Optional submission timestamp (when applicable)

### Soft Delete Fields (OPTIONAL STANDARD)
All collections MAY use these standardized soft delete fields:
- **`isDeleted?: boolean`** - Soft delete flag
- **`deletedAt?: Timestamp | string | null`** - When the document was soft deleted

### Link Fields (REQUIRED STANDARD)
When linking between collections, use these standardized field names:
- **`linkedGameDocumentId?: string`** - Link to Game document (Firestore document ID)
- **`linkedArchiveDocumentId?: string`** - Link to ArchiveEntry document (Firestore document ID)

**❌ FORBIDDEN FIELD NAMES (DO NOT USE):**
- `gameId` (use `linkedGameDocumentId` instead)
- `archiveId` (use `linkedArchiveDocumentId` instead)

---

## Collection Schemas

### 1. `games` Collection (Unified - Scheduled and Completed Games)

**⚠️ IMPORTANT**: The `games` collection uses a **unified design** that stores both scheduled and completed games in a single collection. Use the `gameState` field to distinguish between game types.

**Standardized Schema:**
```typescript
interface Game {
  // Document Identity
  id: string; // Firestore document ID
  
  // Core Identity Fields
  gameId: number; // Unique numeric ID (shared by scheduled and completed games)
  gameState: 'scheduled' | 'completed'; // REQUIRED: Distinguishes game type
  
  // Common Fields (Both Scheduled and Completed)
  creatorName: string; // REQUIRED
  createdByDiscordId: string; // REQUIRED
  createdAt: Timestamp | string; // REQUIRED
  updatedAt: Timestamp | string; // REQUIRED
  isDeleted?: boolean;
  deletedAt?: Timestamp | string | null;
  
  // Scheduled Game Fields (when gameState === 'scheduled')
  scheduledDateTime?: Timestamp | string; // ISO 8601 string in UTC or Timestamp
  scheduledDateTimeString?: string; // ISO 8601 string (for querying)
  timezone?: string; // IANA timezone identifier (e.g., 'America/New_York')
  teamSize?: TeamSize; // '1v1' | '2v2' | '3v3' | '4v4' | '5v5' | '6v6' | 'custom'
  customTeamSize?: string; // Only used when teamSize is 'custom'
  gameType?: GameType; // 'elo' | 'normal'
  gameVersion?: string; // Game version (e.g., 'v3.28')
  gameLength?: number; // Game length in seconds
  modes?: GameMode[]; // Array of game modes
  participants?: GameParticipant[]; // Array of users who joined
  status?: 'scheduled' | 'ongoing' | 'awaiting_replay' | 'archived' | 'cancelled';
  
  // Completed Game Fields (when gameState === 'completed')
  datetime?: Timestamp | string; // Game completion date/time
  duration?: number; // Game duration in seconds
  gamename?: string; // Game name
  map?: string; // Map name
  category?: string; // Game category
  players?: GamePlayer[]; // Players in the completed game
  replayUrl?: string; // Replay file URL
  
  // Standardized Link Fields (OPTIONAL)
  linkedGameDocumentId?: string; // Link to related Game document (for scheduled→completed linking)
  linkedArchiveDocumentId?: string; // Link to ArchiveEntry document
  
  // Optional Timestamps
  submittedAt?: Timestamp | string;
}
```

**Field Requirements:**
- `gameState` is REQUIRED and MUST be either `'scheduled'` or `'completed'`
- `gameId` is REQUIRED and MUST be a unique numeric identifier
- `creatorName` and `createdByDiscordId` are REQUIRED for all games
- `createdAt` and `updatedAt` are REQUIRED for all games
- Scheduled games MUST include: `scheduledDateTime`, `scheduledDateTimeString`, `timezone`, `teamSize`, `gameType`
- Completed games MUST include: `datetime`, `players`

**Querying:**
```typescript
// Get scheduled games
const scheduled = await db.collection('games')
  .where('gameState', '==', 'scheduled')
  .where('isDeleted', '==', false)
  .get();

// Get completed games
const completed = await db.collection('games')
  .where('gameState', '==', 'completed')
  .where('isDeleted', '==', false)
  .get();
```

**❌ FORBIDDEN:**
- Do NOT use separate `scheduledGames` collection (deprecated)
- Do NOT use `scheduledByName` or `scheduledByDiscordId` (use `creatorName` and `createdByDiscordId`)
- Do NOT use `archiveId` (use `linkedArchiveDocumentId`)
- Do NOT add migration/fallback code for old field names

---

### 2. `archives` Collection

**Standardized Schema:**
```typescript
interface ArchiveEntry {
  // Document Identity
  id: string; // Firestore document ID
  
  // Core Fields
  title: string;
  content: string;
  entryType?: 'story' | 'changelog';
  dateInfo: DateInfo; // Date information structure
  // ... media fields ...
  replayUrl?: string;
  
  // Standardized Creator Fields (REQUIRED)
  creatorName: string; // Display name of creator
  createdByDiscordId?: string | null; // Discord ID of creator
  
  // Standardized Timestamp Fields (REQUIRED)
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
  submittedAt?: Timestamp | string;
  
  // Standardized Link Fields (OPTIONAL)
  linkedGameDocumentId?: string; // Link to Game document
  
  // Soft Delete
  isDeleted?: boolean;
  deletedAt?: Timestamp | string | null;
}
```

**Field Requirements:**
- `creatorName` is REQUIRED
- `createdByDiscordId` is OPTIONAL but recommended
- `createdAt` and `updatedAt` are REQUIRED

**❌ FORBIDDEN:**
- Do NOT use `author` or `createdByName`
- Do NOT add migration/fallback code for old field names

**Note on Completed Games:**
- When `gameState === 'completed'`, the game document represents a completed game with replay data
- Completed games include fields like `datetime`, `duration`, `gamename`, `map`, `category`, `players`, `replayUrl`
- The `ownername` field (legacy from replay file format) may be present but should not be used in new code - use `creatorName` instead
- Completed games can be linked to scheduled games via `linkedGameDocumentId` (when a scheduled game is completed)

---

### 4. `posts` Collection

**Standardized Schema:**
```typescript
interface Post {
  // Document Identity
  id: string; // Firestore document ID
  
  // Core Fields
  title: string;
  content: string; // MDX/Markdown content
  date: string; // ISO date string
  slug: string; // URL-friendly identifier
  excerpt?: string;
  published: boolean; // Allow draft posts
  
  // Standardized Creator Fields (REQUIRED)
  creatorName: string;
  createdByDiscordId?: string | null;
  
  // Standardized Timestamp Fields (REQUIRED)
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
  submittedAt?: Timestamp | string;
  
  // Soft Delete (OPTIONAL)
  isDeleted?: boolean;
  deletedAt?: Timestamp | string | null;
}
```

**Field Requirements:**
- `creatorName` is REQUIRED
- `createdByDiscordId` is OPTIONAL but recommended
- `createdAt` and `updatedAt` are REQUIRED

**❌ FORBIDDEN:**
- Do NOT use `author` or `createdByName`
- Do NOT add migration/fallback code for old field names

---

## Implementation Rules

### 1. Writing to Firestore
- **ALWAYS** use the standardized field names when creating or updating documents
- **NEVER** write old field names (`scheduledByName`, `gameId`, etc.)
- **ALWAYS** set `creatorName` and `createdByDiscordId` from the session when creating documents
- **ALWAYS** set `createdAt` and `updatedAt` automatically

### 2. Reading from Firestore
- **ALWAYS** read using standardized field names
- **NEVER** add fallback/migration code to read old field names
- If a document is missing required fields, use sensible defaults (e.g., `creatorName: 'Unknown'`)

### 3. Type Definitions
- **ALWAYS** use the standardized field names in TypeScript interfaces
- **NEVER** include old field names in type definitions
- **ALWAYS** mark optional fields with `?` and provide JSDoc comments

### 4. API Endpoints
- **ALWAYS** map incoming data to standardized field names
- **NEVER** accept or return old field names
- **ALWAYS** validate that required fields are present

---

## Code Examples

### ✅ CORRECT: Creating a ScheduledGame
```typescript
const gameData: CreateScheduledGame = {
  scheduledDateTime: '2024-01-01T12:00:00Z',
  timezone: 'America/New_York',
  teamSize: '1v1',
  gameType: 'normal',
  modes: [],
  creatorName: session.user?.name ?? 'Unknown',
  createdByDiscordId: session.discordId || '',
};
```

### ❌ INCORRECT: Using old field names
```typescript
// DO NOT DO THIS
const gameData = {
  scheduledByName: session.user?.name, // ❌ WRONG
  scheduledByDiscordId: session.discordId, // ❌ WRONG
};
```

### ✅ CORRECT: Reading a ScheduledGame
```typescript
const game: ScheduledGame = {
  id: doc.id,
  scheduledGameId: data.scheduledGameId,
  creatorName: data.creatorName || 'Unknown', // ✅ CORRECT
  createdByDiscordId: data.createdByDiscordId || '',
  // ... other fields
};
```

### ❌ INCORRECT: Reading with fallbacks
```typescript
// DO NOT DO THIS
creatorName: data.creatorName || data.scheduledByName || 'Unknown', // ❌ WRONG - no fallback
```

---

## Enforcement

This schema is enforced by:
1. TypeScript type definitions in `src/types/`
2. API validation in `src/pages/api/`
3. Service layer in `src/features/modules/*/lib/`

**Any code that violates this schema MUST be fixed immediately.**

---

## Summary of Standardization Changes

### Completed Standardizations:
1. ✅ **Creator fields**: All collections use `creatorName` and `createdByDiscordId`
2. ✅ **Timestamp fields**: All collections use `createdAt`, `updatedAt`, and `submittedAt` (when applicable)
3. ✅ **Link fields**: All collections use `linkedGameDocumentId` and `linkedArchiveDocumentId`
4. ✅ **Soft delete**: All collections support `isDeleted` and `deletedAt` (optional)
5. ✅ **Removed deprecated fields**: `mediaUrl` and `mediaType` removed from ArchiveEntry
6. ✅ **Fixed field name bug**: Replay parser now uses `creatorName` instead of `creatorname`

### Legacy Fields (Kept for Compatibility):
- **Games.ownername**: Legacy field from replay file format, typically same as `creatorName`. Kept for backward compatibility with replay structure.

---

## Questions?

If you're unsure about a field name:
1. Check this document first
2. Check the TypeScript type definitions in `src/types/`
3. If the field doesn't exist in the standardized schema, **DO NOT CREATE IT** - discuss with the team first

**Remember: No backward compatibility. No migration code. Only the standardized schema.**

