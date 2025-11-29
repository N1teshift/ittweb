# Map Analyzer Module

**Purpose**: Warcraft 3 map file (.w3e) visualization and analysis tools.

## Exports

### Components
- `MapContainer` - Main map visualization container
- `TerrainVisualizer` - Terrain type visualization
- `TerrainVisualizerContainer` - Container for terrain viz
- `FlagVisualizer` - Flag/control point visualization
- `MapControls` - Map interaction controls
- `MapFileUploader` - Upload map file component
- `MapInfoPanel` - Map metadata display
- `TileInfoPanel` - Individual tile information
- `TerrainLegendCard` - Terrain legend
- `ElevationLegend` - Elevation legend
- `CliffLegend` - Cliff level legend
- `WaterLegend` - Water depth legend
- `FlagLegend` - Flag legend
- `HeightDistributionChart` - Height distribution chart

### Utils
- `mapUtils` - Map parsing and utility functions

### Types
- `MapData` - Parsed map data structure
- `TerrainType` - Terrain type definitions
- `TileData` - Individual tile data

## Usage

```typescript
import { MapContainer, TerrainVisualizer } from '@/features/modules/map-analyzer/components';
import { parseMapFile } from '@/features/modules/map-analyzer/utils/mapUtils';

// Parse map file
const mapData = await parseMapFile(file);

// Use map components
<MapContainer mapData={mapData}>
  <TerrainVisualizer />
</MapContainer>
```

## Related Documentation

- [Map Types](./types/map.ts)


