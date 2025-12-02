# Entries Module

**Purpose**: Entry form system for creating and managing game entries that can be converted to archives.

## Exports

### Components
- `EntryFormModal` - Modal component for creating new game entries
- `EntryEditModal` - Modal component for editing existing game entries

### Services
- `entryService` - Entry CRUD operations
  - `createEntry()` - Create new game entry
  - `getEntryById()` - Get single entry by ID
  - `updateEntry()` - Update existing entry
  - `deleteEntry()` - Delete entry
- `entryService.server` - Server-side entry operations (Admin SDK)
  - `getAllEntriesServer()` - Get all entries server-side
- `entryService.helpers` - Utility functions for entry operations

## Usage

### Basic Entry Forms

```typescript
import { EntryFormModal, EntryEditModal } from '@/features/modules/entries/components';

// Create new entry
<EntryFormModal
  isOpen={showCreateForm}
  onClose={() => setShowCreateForm(false)}
  onSuccess={(entry) => {
    console.log('Entry created:', entry);
    setShowCreateForm(false);
  }}
/>

// Edit existing entry
<EntryEditModal
  isOpen={showEditForm}
  entry={selectedEntry}
  onClose={() => setShowEditForm(false)}
  onSuccess={(updatedEntry) => {
    console.log('Entry updated:', updatedEntry);
    setShowEditForm(false);
  }}
/>
```

### Entry Service Operations

```typescript
import {
  createEntry,
  getEntryById,
  updateEntry,
  deleteEntry
} from '@/features/modules/entries/lib/entryService';

// Create new entry
const newEntry = await createEntry({
  gameId: 'game-123',
  players: [
    { name: 'Player1', result: 'win', team: 1 },
    { name: 'Player2', result: 'loss', team: 2 }
  ],
  category: 'ranked'
});

// Get entry by ID
const entry = await getEntryById('entry-id-123');

// Update entry
const updatedEntry = await updateEntry('entry-id-123', {
  category: 'casual'
});

// Delete entry
await deleteEntry('entry-id-123');
```

## API Routes

- `GET /api/entries` - List all entries (paginated)
- `GET /api/entries/[id]` - Get single entry by ID
- `POST /api/entries` - Create new entry (authenticated)
- `PUT /api/entries/[id]` - Update existing entry (authenticated)
- `DELETE /api/entries/[id]` - Delete entry (authenticated)

## Entry Lifecycle

1. **Create Entry**: Use `EntryFormModal` to create game entries
2. **Edit Entry**: Use `EntryEditModal` to modify entries
3. **Convert to Archive**: Entries can be converted to full archives with media and detailed information
4. **Archive Management**: Converted entries become part of the archives system

## Related Documentation

- [Archives Module](./archives/README.md) - Entry conversion and archive management
- [Firestore Collections Schema](../../../../docs/schemas/firestore-collections.md#entries-collection)


