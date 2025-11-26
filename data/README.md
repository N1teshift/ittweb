# Data Directory

This directory contains backup copies of JSON databases and TypeScript data files extracted from the Island Troll Tribes game data.

## Structure

```
data/
└── island_troll_tribes/
    ├── abilities.json              # Ability definitions
    ├── ability_descriptions.json   # Ability descriptions
    ├── buildings.json              # Building definitions
    ├── item_stats.json            # Item statistics
    ├── items_extracted.json       # Extracted item data
    ├── missing_items.json         # Missing items tracking
    ├── recipes.json               # Crafting recipes
    ├── units.json                 # Unit/troll class definitions
    ├── extracted_from_w3x/        # Raw extraction from .w3x map file
    │   ├── abilities.json         # Raw abilities from map
    │   ├── all_objects.json       # All objects from map
    │   ├── buildings.json         # Raw buildings from map
    │   ├── items.json             # Raw items from map
    │   └── units.json             # Raw units from map
    └── ts_data/                   # TypeScript data backup
        ├── index.ts               # Main data index
        ├── units/                 # Unit/troll class TypeScript files
        │   ├── allUnits.ts
        │   ├── classes.ts
        │   ├── derivedClasses.ts
        │   └── index.ts
        ├── items/                 # Item TypeScript files
        │   ├── armor.ts
        │   ├── buildings.ts
        │   ├── iconUtils.ts
        │   ├── potions.ts
        │   ├── raw-materials.ts
        │   ├── scrolls.ts
        │   ├── unknown.ts
        │   ├── weapons.ts
        │   └── index.ts
        └── abilities/             # Ability TypeScript files
            ├── basic.ts
            ├── beastmaster.ts
            ├── building.ts
            ├── gatherer.ts
            ├── hunter.ts
            ├── item.ts
            ├── mage.ts
            ├── priest.ts
            ├── scout.ts
            ├── thief.ts
            ├── types.ts
            ├── unknown.ts
            └── index.ts
```

## Purpose

This directory serves as:
- **Backup storage** for extracted game data (JSON databases)
- **Backup storage** for generated TypeScript data files
- **Structured pipeline** for data processing workflows
- **Source of truth** for raw extracted databases
- **Rollback reference** for regenerating data from scripts

## Source Locations

The original files are located in:
- **JSON databases:**
  - `external/island_troll_tribes/*.json` - Processed/extracted JSON files
  - `external/island_troll_tribes/extracted_from_w3x/*.json` - Raw extraction from .w3x file

- **TypeScript data:**
  - `src/features/modules/guides/data/*.ts` - Generated TypeScript data files

## Usage

Scripts in `scripts/data/` may reference these files for:
- Building game data modules
- Converting to TypeScript formats
- Processing and validation
- Data migration tasks

## Regeneration Workflow

To regenerate data from scratch:

1. **Reset TypeScript data** (optional - clear `src/features/modules/guides/data/`)
2. **Run extraction scripts** to regenerate from JSON databases:
   - `node scripts/data/convert-extracted-to-typescript.mjs`
   - `node scripts/data/build-gamedata.mjs`
3. **Compare** generated files with backups in `data/island_troll_tribes/ts_data/`
4. **Rollback** if needed by copying from `ts_data/` backup

