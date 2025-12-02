# Archives Module

**Purpose**: Archive entry management for game replays, clips, and media content.

## Exports

### Components
- `ArchivesContent` - Main archives page content with timeline view
- `ArchiveForm` - Create new archive entry form (wraps ArchiveFormBase)
- `ArchiveEditForm` - Edit existing archive entry form (wraps ArchiveFormBase)
- `ArchiveFormBase` - Base form component for creating/editing archive entries (internal, used by ArchiveForm and ArchiveEditForm)
- `ArchiveEntry` - Display individual archive entry (main component, ~115 lines)
- `ArchiveMediaSections` - Media sections display component (extracted from ArchiveEntry)
- `GamePlayersSection` - Game players information section (extracted from ArchiveEntry)
- `GameLinkedArchiveEntry` - Archive entry linked to a game (extracted from ArchiveEntry)
- `NormalArchiveEntry` - Standard archive entry display (extracted from ArchiveEntry)
- `ArchiveDeleteDialog` - Delete confirmation dialog with loading state
- `ArchivesToolbar` - Toolbar with filters and actions
- `GameDetailsSection` - Game details display section
- `TwitchClipEmbed` - Twitch clip embed component
- `YouTubeEmbed` - YouTube video embed component

### Hooks
- `useArchivesPage` - Main archives page state management and CRUD operations
- `useArchiveHandlers` - Form event handlers for archive entry forms (input changes, file uploads, reordering)
- `useArchiveBaseState` - Form state management for archive entry forms (form data, files, section order)
- `useArchiveMedia` - Media preview URL generation and cleanup for image files
- `useArchiveFormSubmit` - Form submission logic with validation and media upload (internal hook)

### Utils
- `archiveFormUtils` - Form validation and utilities
- `archiveValidation` - Archive entry validation logic
- `ArchiveEntryUtils` - Utility functions for archive entry operations (extracted from ArchiveEntry)

## Usage

### Basic Archives Page

```typescript
import { useArchivesPage } from '@/features/modules/community/archives/shared/hooks/useArchivesPage';

// Use archives page hook
const {
  archives,
  loading,
  error,
  handleCreate,
  handleUpdate,
  handleDelete
} = useArchivesPage();
```

### Archive Form with Custom Hooks

```typescript
import { useArchiveBaseState } from '@/features/modules/archives/hooks/useArchiveBaseState';
import { useArchiveHandlers } from '@/features/modules/archives/hooks/useArchiveHandlers';
import { useArchiveMedia } from '@/features/modules/archives/hooks/useArchiveMedia';

// In a form component
function MyArchiveForm({ mode, initialEntry }) {
  // Manage form state
  const {
    formData,
    setFormData,
    imageFile,
    imageFiles,
    replayFile,
    currentImages,
    sectionOrder,
    setSectionOrder
  } = useArchiveBaseState(mode, initialEntry);

  // Get image preview URLs
  const { imagePreviewUrls } = useArchiveMedia(imageFile, imageFiles);

  // Handle form events
  const {
    handleInputChange,
    handleCombinedFileUpload,
    handleReorderImages,
    handleReorderSections,
    handleVideoUrlChange
  } = useArchiveHandlers({
    setFormData,
    imageFile,
    imageFiles,
    setImageFile,
    setImageFiles,
    setReplayFile,
    setCurrentImages,
    setSectionOrder,
    setError,
    setExistingReplayUrl
  });

  // Use formData, handlers, and preview URLs in your form
}
```

### Using Archive Components

```typescript
import { ArchiveForm, ArchiveEditForm, ArchiveDeleteDialog } from '@/features/modules/archives/components';

// Create form
<ArchiveForm 
  onSuccess={() => console.log('Created!')} 
  onCancel={() => setShowForm(false)} 
/>

// Edit form
<ArchiveEditForm 
  entry={archiveEntry}
  onSuccess={() => console.log('Updated!')} 
  onCancel={() => setShowEdit(false)} 
/>

// Delete dialog
<ArchiveDeleteDialog
  isOpen={showDelete}
  entryTitle={entry.title}
  isLoading={deleting}
  onConfirm={handleDelete}
  onCancel={() => setShowDelete(false)}
/>
```

## API Routes

- `GET /api/entries` - List archive entries
- `GET /api/entries/[id]` - Get archive entry
- `POST /api/entries` - Create archive entry (authenticated)
- `PUT /api/entries/[id]` - Update archive entry (authenticated)
- `DELETE /api/entries/[id]` - Delete archive entry (authenticated)

## Related Documentation

- [Firestore Collections Schema](../../../../docs/schemas/firestore-collections.md#archiveentries-collection)
- [Archive Service](../../../infrastructure/lib/archiveService.ts)

