# Map Analyzer Module

**Purpose**: Interactive Warcraft 3 map visualization and analysis tools for terrain, pathing, and strategic analysis.

## Exports

### Components
- `MapContainer` - Main map visualization container with interactive features
- `MapControls` - Zoom, pan, and layer control interface
- `MapFileUploader` - .w3x map file upload component with validation
- `MapInfoPanel` - Map metadata and statistics display
- `TerrainVisualizer` - 3D terrain height visualization
- `TerrainVisualizerContainer` - Container managing terrain rendering
- `TerrainLegendCard` - Interactive terrain type legend
- `TileInfoPanel` - Detailed tile information on hover/click
- `FlagVisualizer` - Pathing flags and collision visualization
- `FlagLegend` - Pathing flags reference legend
- `CliffLegend` - Cliff level reference legend
- `ElevationLegend` - Terrain elevation reference legend
- `WaterLegend` - Water level reference legend
- `HeightDistributionChart` - Terrain height distribution analytics

### Types
- `SimpleTile` - Individual map tile data (height, water, cliffs, pathing flags)
- `SimpleMapData` - Complete parsed map data structure

### Utils
- `mapUtils` - Map parsing, processing, and analysis utilities
  - Map file parsing from .w3x format
  - Terrain analysis functions
  - Pathing validation utilities

## Usage

### Basic Map Analysis

```typescript
import { MapContainer } from '@/features/modules/map-analyzer/components';

// Full-featured map analyzer
<MapContainer />
```

### Individual Components

```typescript
import {
  MapFileUploader,
  TerrainVisualizer,
  HeightDistributionChart
} from '@/features/modules/map-analyzer/components';

// File upload with validation
<MapFileUploader onFileSelect={(file) => processMap(file)} />

// Terrain visualization
<TerrainVisualizer mapData={parsedMapData} />

// Height distribution analytics
<HeightDistributionChart tiles={mapData.tiles} />
```

### Using Map Data Types

```typescript
import type { SimpleMapData, SimpleTile } from '@/features/modules/map-analyzer/types';

// Working with parsed map data
const mapData: SimpleMapData = {
  width: 128,
  height: 128,
  tiles: [] // Array of SimpleTile objects
};

const tile: SimpleTile = {
  isWater: false,
  groundHeight: 512,
  waterHeight: 256,
  cliffLevel: 2,
  flagsMask: 0x0001, // Walkable
  isRamp: false,
  isNoWater: true
};
```

## Features

- **Interactive Visualization**: Zoom, pan, and rotate 3D terrain
- **Multi-layer Analysis**: Terrain height, water levels, cliffs, and pathing flags
- **File Upload**: Support for .w3x Warcraft 3 map files
- **Real-time Analytics**: Height distribution and terrain statistics
- **Detailed Inspection**: Tile-by-tile information and pathing analysis

## Related Documentation

- [Data Pipeline](../../../../docs/production/systems/data-pipeline/) - Map data extraction process
- [Map Types](./types/map.ts) - Type definitions


