# Guides Module

**Purpose**: Game guides, class information, items, abilities, and static game data.

## Exports

### Components
- `GuideCard` - Display guide card
- `ClassIcon` - Class icon component
- `ClassHeader` - Class header with icon
- `ClassModel` - 3D class model viewer
- `ColoredText` - Text with game color coding
- `GuideIcon` - Icon display component
- `StatsCard` - Statistics display card

### Data
- `abilities/` - Ability definitions by class
- `items/` - Item definitions (weapons, armor, potions, etc.)
- `units/` - Unit and class definitions
- `iconMap` - Icon mapping data

### Utils
- `iconUtils` - Icon utility functions
- `itemIdMapper` - Item ID mapping utilities

### Hooks
- `useItemsData` - Fetch items data (in `hooks/useItemsData.ts`)

## Usage

```typescript
import { ClassIcon } from '@/features/modules/guides';
import { getClassData } from '@/features/modules/guides/data/units/classes';

// Use class icon (components are exported from module root)
<ClassIcon className="mage" size={64} />

// Get class data
const mageData = getClassData('mage');
```

## API Routes

- `GET /api/classes` - List all classes
- `GET /api/classes/[className]` - Get class details
- `GET /api/items` - List all items

## Related Documentation

- [Data Pipeline](../../../../scripts/README.md) - How guide data is generated


