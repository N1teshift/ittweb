# Entries Module

**Purpose**: Entry form system for creating game entries.

## Exports

### Components
- `EntryFormModal` - Entry form modal component

### Services
- `entryService` - Entry CRUD operations
  - `createEntry()` - Create new entry
  - `getEntryById()` - Get entry by ID
  - `updateEntry()` - Update entry
  - `deleteEntry()` - Delete entry
- `entryService.server` - Server-side entry operations
  - `getAllEntriesServer()` - Get all entries (server-side only, uses Admin SDK)

## Usage

```typescript
import { EntryFormModal } from '@/features/modules/entries/components/EntryFormModal';
import { createEntry } from '@/features/modules/entries/lib/entryService';

// Use entry form
<EntryFormModal isOpen={true} onClose={() => {}} />

// Create entry
const entry = await createEntry({
  // entry data
});
```

## API Routes

- `GET /api/entries` - List entries
- `GET /api/entries/[id]` - Get entry
- `POST /api/entries` - Create entry (authenticated)
- `PUT /api/entries/[id]` - Update entry (authenticated)
- `DELETE /api/entries/[id]` - Delete entry (authenticated)

## Related Documentation

- [Archives Module](./archives/README.md) - Related archive functionality


