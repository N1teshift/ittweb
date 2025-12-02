# Pipeline Architecture

High-level architecture and data flow for the Island Troll Tribes data generation pipeline.

## Overview

The pipeline extracts game data from Warcraft III map files and converts it into TypeScript data files for use by the application. It processes multiple data sources and merges them into a unified structure.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         INPUT SOURCES                            │
├─────────────────────────────────────────────────────────────────┤
│  external/Work/          │  Wurst Source Files    │  Icons       │
│  ├── war3map.w3t         │  ├── items/*.wurst     │  ├── items/  │
│  ├── war3map.w3a         │  ├── abilities/*.wurst │  ├── abilities│
│  ├── war3map.w3u         │  └── units/*.wurst     │  └── units/  │
│  ├── war3map.w3b         │                        │              │
│  └── war3map.j           │                        │              │
└────────────┬──────────────────┬───────────────────────┬──────────┘
             │                  │                       │
             ▼                  ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    STAGE 1: RAW EXTRACTION                       │
│                    extract-from-w3x.mjs                          │
├─────────────────────────────────────────────────────────────────┤
│  Parses binary war3map files → JSON                              │
│  Output: tmp/work-data/raw/                                      │
│    ├── items.json                                                │
│    ├── abilities.json                                            │
│    ├── units.json                                                │
│    └── buildings.json                                            │
└────────────┬─────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    STAGE 2: METADATA EXTRACTION                  │
│                    extract-metadata.mjs                          │
├─────────────────────────────────────────────────────────────────┤
│  Extracts recipes, processes units/buildings from war3map.j      │
│  Output: tmp/work-data/metadata/                                 │
│    ├── recipes.json                                              │
│    ├── units.json                                                │
│    └── buildings.json                                            │
└────────────┬─────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│              STAGE 3-5: ENHANCED DATA EXTRACTION                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │ extract-ability- │  │ extract-ability- │  │ extract-item │  │
│  │ details-from-    │  │ relationships    │  │ details-from │  │
│  │ wurst.mjs        │  │ .mjs             │  │ wurst.mjs    │  │
│  └────────┬─────────┘  └────────┬─────────┘  └──────┬───────┘  │
│           │                     │                     │          │
│           ▼                     ▼                     ▼          │
│    ability-details    ability-relationships   item-details       │
│    -wurst.json        .json                   -wurst.json        │
└────────────┬─────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│              STAGE 5.5-5.6: ABILITY ID MAPPING                   │
│  ┌──────────────────────┐  ┌──────────────────────────┐        │
│  │ generate-ability-id- │  │ extract-ability-codes-   │        │
│  │ mapping.mjs          │  │ from-items.mjs           │        │
│  └──────────┬───────────┘  └──────────┬───────────────┘        │
│             │                         │                         │
│             ▼                         ▼                         │
│    abilityIdMapper.ts        (updates abilityIdMapper.ts)       │
└────────────┬─────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  STAGE 6: TYPESCRIPT CONVERSION                  │
│              convert-extracted-to-typescript.mjs                 │
├─────────────────────────────────────────────────────────────────┤
│  Merges all sources and converts to TypeScript                   │
│  Input: All previous stage outputs                               │
│  Output: src/features/modules/guides/data/                       │
│    ├── items/                                                    │
│    │   ├── weapons.ts                                           │
│    │   ├── armor.ts                                             │
│    │   └── ...                                                  │
│    ├── abilities/                                                │
│    │   ├── mage.ts                                              │
│    │   ├── hunter.ts                                            │
│    │   └── ...                                                  │
│    └── units/                                                    │
│        ├── allUnits.ts                                          │
│        ├── classes.ts                                           │
│        └── derivedClasses.ts                                    │
└────────────┬─────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│              STAGE 7-9: POST-PROCESSING                          │
│  ┌─────────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ regenerate-     │  │ fix-icon-    │  │ resolve-field-   │  │
│  │ iconmap.mjs     │  │ paths.mjs    │  │ references.mjs   │  │
│  └────────┬────────┘  └──────┬───────┘  └────────┬─────────┘  │
│           │                  │                     │            │
│           ▼                  ▼                     ▼            │
│    iconMap.ts         (fixes paths)        (resolves <refs>)   │
└────────────┬─────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         FINAL OUTPUT                             │
│              src/features/modules/guides/data/                   │
│                                                                  │
│  Complete, typed, categorized game data ready for application    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. Extraction Phase

**Input:** Binary game files (`war3map.*`)  
**Process:** Parse binary formats into JSON  
**Output:** Raw JSON files with all object data

```
war3map.w3t → items.json (raw item data)
war3map.w3a → abilities.json (raw ability data)
war3map.w3u → units.json (raw unit data)
war3map.w3b → buildings.json (raw building data)
```

### 2. Metadata Phase

**Input:** Raw JSON + JASS code (`war3map.j`)  
**Process:** Extract recipes, process unit metadata  
**Output:** Structured metadata JSON

```
war3map.j → recipes.json (crafting recipes)
Raw units → units.json (processed unit metadata)
Raw buildings → buildings.json (processed building metadata)
```

### 3. Enhancement Phase

**Input:** Wurst source code files  
**Process:** Parse Wurst syntax for detailed properties  
**Output:** Enhanced metadata JSON

```
Wurst ability files → ability-details-wurst.json (detailed ability properties)
Wurst relationship files → ability-relationships.json (class mappings)
Wurst item files → item-details-wurst.json (stat bonuses, properties)
```

### 4. Mapping Phase

**Input:** Extracted ability data  
**Process:** Generate ID mappings for cross-referencing  
**Output:** TypeScript mapper file

```
Raw ability IDs → abilityIdMapper.ts (raw ID → slug mapping)
```

### 5. Conversion Phase

**Input:** All previous outputs + category mappings  
**Process:** Merge, categorize, convert to TypeScript  
**Output:** Typed TypeScript data files

**Merging Priority:**
1. Wurst data (most accurate) takes precedence
2. Raw war3map data as fallback
3. Category mappings for classification
4. Recipes merged into items

### 6. Post-Processing Phase

**Input:** Generated TypeScript files + icon files  
**Process:** Generate icon mapping, fix paths, resolve references  
**Output:** Final polished data files

---

## Key Components

### Extractors

**Purpose:** Parse source formats into structured JSON

- `extract-from-w3x.mjs` - Binary file parser (war3map.*)
- `extract-metadata.mjs` - JASS code parser (war3map.j)
- `extract-ability-details-from-wurst.mjs` - Wurst parser (abilities)
- `extract-item-details-from-wurst.mjs` - Wurst parser (items)
- `extract-ability-relationships.mjs` - Wurst parser (relationships)

### Converters

**Purpose:** Transform JSON into TypeScript data structures

- `item-converter.mjs` - Items → TypeScript
- `ability-converter.mjs` - Abilities → TypeScript
- `unit-converter.mjs` - Units → TypeScript
- `category-mapper.mjs` - Categorization logic

### Generators

**Purpose:** Write TypeScript files with proper formatting

- `file-writer.mjs` - File writing utilities
- `index-generator.mjs` - Generate index files

### Utilities

**Purpose:** Shared functionality

- `utils.mjs` - Common utilities (slugify, loadJson, etc.)
- `paths.mjs` - Path constants and directory management

---

## Data Sources & Their Roles

### war3map.w3t (Items)
- **Role:** Primary item data source
- **Contains:** Item names, descriptions, costs, icons, basic properties
- **Limitations:** Some properties may be missing or incomplete

### war3map.w3a (Abilities)
- **Role:** Primary ability data source
- **Contains:** Ability names, descriptions, mana costs, cooldowns, icons
- **Limitations:** Level-specific data may be incomplete

### war3map.w3u (Units)
- **Role:** Primary unit data source
- **Contains:** Unit stats, names, descriptions, icons
- **Limitations:** Classification may need additional processing

### war3map.j (JASS Code)
- **Role:** Recipe source and metadata
- **Contains:** Crafting recipes, item/unit constants
- **Limitations:** Requires parsing JASS syntax

### Wurst Source Files
- **Role:** Enhanced property data
- **Contains:** Detailed stat bonuses, relationships, accurate values
- **Advantage:** Most accurate data, directly from source code

### Icon Files (`public/icons/itt/`)
- **Role:** Visual assets
- **Contains:** PNG icon files for all entities
- **Usage:** Generates icon mapping for application

---

## Dependencies Between Stages

```
Stage 1 (Raw Extraction)
  └─► Required by: All downstream stages

Stage 2 (Metadata)
  └─► Depends on: Stage 1
  └─► Required by: Stage 6 (Conversion)

Stage 3-5 (Enhanced Data)
  └─► Depends on: Stage 1 (for cross-referencing)
  └─► Required by: Stage 6 (Conversion)

Stage 5.5-5.6 (Ability ID Mapping)
  └─► Depends on: Stage 1, Stage 3
  └─► Required by: Stage 6, Stage 9

Stage 6 (Conversion)
  └─► Depends on: Stages 1, 2, 3, 4, 5, 5.5, 5.6
  └─► Required by: Stages 7, 8, 9

Stage 7 (Icon Mapping)
  └─► Depends on: Stage 6
  └─► Can run independently if icons changed

Stage 8 (Fix Icon Paths)
  └─► Depends on: Stage 6, Stage 7
  └─► Required by: Application (implicit)

Stage 9 (Resolve Field References)
  └─► Depends on: Stage 1, Stage 5.5
  └─► Works on: Stage 6 output
```

---

## Category Mappings

**Location:** `scripts/data/config/category-mappings.json`

**Purpose:** Manual curation of item and ability categories

**Structure:**
- Maps item/ability IDs/names to categories
- Used by converters to classify entities
- Manually maintained (not auto-generated)

**Why Manual:**
- Game data doesn't include explicit categories
- Categories are application-specific
- Requires domain knowledge

---

## Error Handling Strategy

### Fail-Fast Approach

- **Input Validation:** Check for required files before starting
- **Error Logging:** Clear error messages with context
- **Graceful Degradation:** Continue processing if individual objects fail
- **Exit Codes:** Scripts exit with error codes for CI/CD integration

### Common Failure Points

1. **Missing Input Files:** Caught early, clear error message
2. **Corrupted Data:** Logged as warnings, skipped objects
3. **Conversion Errors:** Logged with object ID for debugging
4. **TypeScript Errors:** Caught by type-check, script exits

---

## Performance Considerations

### Current Performance

- **Full Pipeline:** ~2-5 minutes (depends on file sizes)
- **Individual Stages:** Seconds to minutes

### Optimization Opportunities

1. **Parallel Processing:** Some stages can run in parallel
2. **Caching:** Cache parsed JSON to avoid re-parsing
3. **Incremental Updates:** Only regenerate changed entities
4. **Batch Operations:** Process multiple files in single read

See `scripts/data/REFACTORING_PLAN.md` for optimization backlog.

---

## Extension Points

### Adding New Data Types

1. Create extractor script (e.g., `extract-custom-data.mjs`)
2. Add converter module (e.g., `custom-data-converter.mjs`)
3. Update `main.mjs` to include new stages
4. Update TypeScript types
5. Add to category mapper if needed

### Adding New Fields

1. Update extractor to capture new field
2. Update converter to include field in output
3. Update TypeScript type definition
4. Update application code to use new field

---

## Related Documentation

- [Data Schemas](./schemas.md) - Complete data structure definitions
- [Troubleshooting](./troubleshooting.md) - Common issues and debugging
- [Main Pipeline README](../../../scripts/README.md) - Operational guide
- [Refactoring Plan](../../../scripts/data/REFACTORING_PLAN.md) - Known issues and improvements

