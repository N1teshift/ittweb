# Scripts Directory

This directory contains **only the essential scripts** needed to regenerate TypeScript data files from game source files.

## Directory Structure

```
scripts/
└── data/
    ├── README.md                              # Documentation
    ├── generate-from-work.mjs                 # Master pipeline orchestrator ⭐
    ├── extract-from-w3x.mjs                   # Extract raw data from war3map files
    ├── extract-metadata.mjs                   # Extract metadata (units, buildings, recipes)
    ├── convert-extracted-to-typescript.mjs    # Convert JSON to TypeScript files
    └── regenerate-iconmap.mjs                 # Generate icon mapping
```

## Quick Start

**Generate all TypeScript data files from game files:**

```bash
node scripts/data/generate-from-work.mjs
```

This single command will:
1. Extract raw game data from `external/Work/` war3map files
2. Extract metadata (units, buildings, recipes)
3. Convert everything to TypeScript format (items, abilities, units)
4. Generate icon mapping

## Pipeline Overview

The master script (`generate-from-work.mjs`) automatically orchestrates the complete pipeline:

1. **Extract** → `extract-from-w3x.mjs` - Parses war3map files
2. **Metadata** → `extract-metadata.mjs` - Extracts units, buildings, recipes
3. **Convert** → `convert-extracted-to-typescript.mjs` - Generates TypeScript files
4. **Icons** → `regenerate-iconmap.mjs` - Generates icon mapping

See [`data/README.md`](data/README.md) for detailed documentation.

## Prerequisites

- `external/Work/` directory with war3map files:
  - `war3map.w3t` (items)
  - `war3map.w3a` (abilities)
  - `war3map.w3u` (units)
  - `war3map.w3b` (buildings)

- `data/island_troll_tribes/category-mappings.json` - Manually curated category mappings

## Notes

- **Minimal scripts only** - All non-essential scripts (utilities, cleanup, migration, validation) have been removed
- All scripts are in one folder (`scripts/data/`) for simplicity
- The master script handles everything - no need to run individual scripts manually
