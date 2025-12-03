# Tools Group Module

**Purpose**: Developer and analysis tools for maps and game data.

## Sub-modules

### map-analyzer/
Map terrain analysis and visualization tools.

**Exports**:
- Components for map visualization, terrain legends, and analysis
- Hooks: `useMapPersistence`, `useMapUIState`
- Utilities for map data processing
- Types for map data structures

### tools/
Icon mapper and other development tools.

**Exports**:
- Components for icon mapping and inventory simulation
- Hooks: `useIconMapperData`
- Utilities for icon mapping
- Types for tool data structures

## Usage

```typescript
import { MapContainer, TerrainVisualizer } from '@/features/modules/tools-group/map-analyzer';
import { IconMapperStats } from '@/features/modules/tools-group/tools';
```

## Related Documentation

- [Map Analyzer Sub-module](./map-analyzer/README.md)
- [Tools Sub-module](./tools/README.md)
