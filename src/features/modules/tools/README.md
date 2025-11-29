# Tools Module

**Purpose**: Utility tools including icon mapper and statistics tools.

## Exports

### Components
- `IconMapper` - Icon mapping tool interface
- `StatsPanel` - Statistics display panel
- Additional tool components (10 total)

### Utils
- `icon-mapper.utils` - Icon mapping utilities
- `icon-mapper.types` - Icon mapper type definitions

### Hooks
- `useIconMapperData` - Icon mapper data management (in `useIconMapperData.ts`)

## Usage

```typescript
import { useIconMapperData } from '@/features/modules/tools/useIconMapperData';
import { mapIconId } from '@/features/modules/tools/icon-mapper.utils';

// Use icon mapper hook
const { icons, loading } = useIconMapperData();

// Map icon ID
const mappedId = mapIconId('BTNIcon');
```

## Pages

- `/tools` - Tools index page
- `/tools/icon-mapper` - Icon mapper tool

## Related Documentation

- [Icon Mapping Guide](../../../../docs/systems/scripts/icon-mapping.md)


