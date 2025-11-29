# Archives Module

**Purpose**: Archive entry management for game replays, clips, and media content.

## Exports

### Components
- `ArchivesContent` - Main archives page content
- `ArchiveForm` - Create/edit archive entry form
- `ArchiveEntry` - Display individual archive entry (main component, ~115 lines)
- `ArchiveMediaSections` - Media sections display component (extracted from ArchiveEntry)
- `GamePlayersSection` - Game players information section (extracted from ArchiveEntry)
- `GameLinkedArchiveEntry` - Archive entry linked to a game (extracted from ArchiveEntry)
- `NormalArchiveEntry` - Standard archive entry display (extracted from ArchiveEntry)
- `ArchiveDeleteDialog` - Delete confirmation dialog
- `ArchivesToolbar` - Toolbar with filters and actions
- `GameDetailsSection` - Game details display section
- `TwitchClipEmbed` - Twitch clip embed component
- `YouTubeEmbed` - YouTube video embed component

### Hooks
- `useArchivesPage` - Main archives page state management
- `useArchiveHandlers` - Archive CRUD operations
- `useArchiveBaseState` - Base form state management
- `useArchiveMedia` - Media URL handling

### Utils
- `archiveFormUtils` - Form validation and utilities
- `archiveValidation` - Archive entry validation logic
- `ArchiveEntryUtils` - Utility functions for archive entry operations (extracted from ArchiveEntry)

## Usage

```typescript
import { useArchivesPage } from '@/features/modules/archives';
import { createArchiveEntry } from '@/features/infrastructure/lib/archiveService';

// Use archives page hook
const {
  archives,
  loading,
  error,
  handleCreate,
  handleUpdate,
  handleDelete
} = useArchivesPage();

// Create archive entry
const archive = await createArchiveEntry({
  title: 'Game Replay',
  description: 'Amazing game',
  linkedGameDocumentId: 'game123',
  mediaUrl: 'https://youtube.com/watch?v=...',
  mediaType: 'youtube'
});
```

## API Routes

- `GET /api/entries` - List archive entries
- `GET /api/entries/[id]` - Get archive entry
- `POST /api/entries` - Create archive entry (authenticated)
- `PUT /api/entries/[id]` - Update archive entry (authenticated)
- `DELETE /api/entries/[id]` - Delete archive entry (authenticated)

## Related Documentation

- [Firestore Collections Schema](../../../../docs/schemas/firestore-collections.md#archiveentries-collection)
- [Archive Service](../../../shared/lib/archiveService.ts)

