# Guides Module

> Date: 2025-12-02

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
import { ClassIcon } from '@/features/modules/content/guides';
import { getClassData } from '@/features/modules/content/guides/data/units/classes';

// Use class icon (components are exported from module root)
<ClassIcon className="mage" size={64} />

// Get class data
const mageData = getClassData('mage');
```

## Performance Optimizations

The guides module contains large data files (100KB+) that can impact initial page load performance. For optimal performance, consider using lazy loading:

```typescript
// Instead of direct import (loads immediately)
import { ALL_UNITS } from '@/features/modules/content/guides/data/units/allUnits';

// Use lazy loading (loads only when needed)
import { getAllUnits } from '@/features/modules/content/guides/data';

const MyComponent = () => {
  const [units, setUnits] = useState(null);

  useEffect(() => {
    getAllUnits().then(module => {
      setUnits(module.ALL_UNITS);
    });
  }, []);

  // ... rest of component
};
```

### Available Lazy Loaders

- `getAllUnits()` - Load unit data (5178 lines, ~147KB)
- `getUnknownAbilities()` - Load unknown abilities (5048 lines, ~148KB)
- `getUnknownItems()` - Load unknown items
- `getBuildingData()` - Load building ability data (1727 lines, ~83KB)

## API Routes

- `GET /api/classes` - List all classes
- `GET /api/classes/[className]` - Get class details
- `GET /api/items` - List all items

## Related Documentation

- [Data Pipeline](../../../../scripts/README.md) - How guide data is generated


