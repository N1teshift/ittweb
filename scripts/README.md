# Scripts Directory

This directory contains utility scripts for managing game data, icons, and various maintenance tasks.

## Directory Structure

```
scripts/
├── icons/          # Icon management and mapping scripts
├── data/           # Data extraction and processing scripts
├── cleanup/        # Data cleanup and maintenance scripts
├── validation/     # Data validation scripts
├── migration/      # Data migration scripts
└── README.md       # This file
```

## Quick Start

### Data Extraction Workflow

1. **Extract from game files:**
   ```bash
   node scripts/data/extract-from-w3x.mjs
   ```

2. **Resolve field references:**
   ```bash
   node scripts/data/resolve-field-references.mjs
   ```

3. **Convert to TypeScript:**
   ```bash
   node scripts/data/convert-extracted-to-typescript.mjs
   ```

### Icon Management Workflow

1. **Analyze icon mapping:**
   ```bash
   node scripts/icons/analyze-icon-mapping-comprehensive.mjs
   ```

2. **Manage icon mappings (consolidated):**
   ```bash
   node scripts/icons/manage-icon-mapping.mjs
   ```

3. **Migrate icon paths (consolidated):**
   ```bash
   node scripts/data/migrate-iconpaths.mjs
   ```

4. **Maintain icon map (consolidated):**
   ```bash
   node scripts/icons/maintain-iconmap.mjs
   ```

5. **Cleanup icons (consolidated):**
   ```bash
   node scripts/icons/cleanup-icons.mjs --remove-duplicates --normalize --execute
   ```

## Script Categories

### Icons (`icons/`)

Icon-related scripts for managing icon files and mappings.

| Script | Purpose |
|--------|---------|
| `analyze-icon-mapping-comprehensive.mjs` | Comprehensive analysis of icon mapping coverage |
| `fix-icon-mapping-issues.mjs` | Fixes case sensitivity and path-based icon references |
| `migrate-iconpaths-to-iconmap.mjs` | Migrates iconPath/iconSrc values to ICON_MAP |
| `fix-iconmap-duplicates.mjs` | Removes duplicate ICON_MAP entries |
| `fix-iconmap-escaping.mjs` | Fixes escaping issues in iconMap.ts |
| `regenerate-iconmap.mjs` | Regenerates iconMap.ts from scratch |
| `extract-and-organize-icons.mjs` | Extracts and organizes missing icons |
| `find-missing-icons-with-fuzzy-match.mjs` | Finds missing icons using fuzzy matching |
| `map-available-icons-and-generate-extraction-list.mjs` | Maps available icons and generates extraction list |
| `map-icons-to-files.mjs` | Maps icons to entity files |
| `map-all-icons-fixed.mjs` | Maps all icons with fixes |
| `cleanup-icon-duplicates.cjs` | Removes duplicate icon files |
| `normalize-icon-filenames.cjs` | Normalizes icon filenames |
| `delete-icons-from-list.cjs` | Deletes icons from a list |
| `delete-marked-icons.cjs` | Deletes marked icons |
| `analyze-icon-duplicates.cjs` | Analyzes duplicate icons |
| `download-wowpedia-icons.cjs` | Downloads icons from WoWpedia |
| `remove-reforged-icons.cjs` | Removes Reforged icons |

### Data (`data/`)

Data extraction and processing scripts.

| Script | Purpose |
|--------|---------|
| `extract-from-w3x.mjs` | Extracts game data from .w3x map files |
| `convert-extracted-to-typescript.mjs` | Converts extracted JSON to TypeScript format |
| `resolve-field-references.mjs` | Resolves Warcraft 3 field references in tooltips |
| `build-gamedata.mjs` | Builds modular game data structure |
| `extract-item-data.mjs` | Extracts item data from game files |

### Cleanup (`cleanup/`)

Data cleanup and maintenance scripts.

| Script | Purpose |
|--------|---------|
| `cleanup-garbage-abilities.mjs` | Removes garbage/internal abilities |
| `cleanup-color-codes-from-names.mjs` | Removes color codes from entity names |
| `clear-data-keep-structure.mjs` | Clears data while preserving structure |

### Validation (`validation/`)

Data validation scripts.

| Script | Purpose |
|--------|---------|
| `check-items.cjs` | Validates item data integrity |
| `generate-external-items.cjs` | Generates external items data |

### Migration (`migration/`)

Data migration scripts.

| Script | Purpose |
|--------|---------|
| `migrate-posts-to-firestore.mjs` | Migrates posts to Firestore |
| `update-items-from-extracted-v2.mjs` | Updates items from extracted data |

## Common Patterns

### Path Resolution

All scripts use a consistent pattern for resolving paths:

**ES Modules (.mjs):**
```javascript
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..', '..'); // Go up to repo root
```

**CommonJS (.cjs):**
```javascript
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..', '..'); // Go up to repo root
```

### Icon Map Structure

The icon map is located at:
```
src/features/modules/guides/utils/iconMap.ts
```

It has the following structure:
```typescript
export const ICON_MAP: IconMap = {
  abilities: { /* name -> filename */ },
  items: { /* name -> filename */ },
  buildings: { /* name -> filename */ },
  trolls: { /* name -> filename */ },
  units: { /* name -> filename */ },
};
```

## Consolidated Scripts

The following consolidated scripts combine multiple related scripts:

1. **Icon Management** → `icons/manage-icon-mapping.mjs`
   - Combines: `extract-and-organize-icons.mjs`, `find-missing-icons-with-fuzzy-match.mjs`, `map-available-icons-and-generate-extraction-list.mjs`, `map-icons-to-files.mjs`, `map-all-icons-fixed.mjs`
   - Usage: `node scripts/icons/manage-icon-mapping.mjs [--map] [--find-missing] [--fuzzy] [--generate-list] [--update-map]`

2. **Icon Map Maintenance** → `icons/maintain-iconmap.mjs`
   - Combines: `fix-iconmap-duplicates.mjs`, `fix-iconmap-escaping.mjs`, `regenerate-iconmap.mjs`
   - Usage: `node scripts/icons/maintain-iconmap.mjs [--fix-duplicates] [--fix-escaping] [--regenerate]`

3. **Icon Cleanup** → `icons/cleanup-icons.mjs`
   - Combines: `cleanup-icon-duplicates.cjs`, `normalize-icon-filenames.cjs`, `delete-icons-from-list.cjs`, `delete-marked-icons.cjs`
   - Usage: `node scripts/icons/cleanup-icons.mjs [--remove-duplicates] [--normalize] [--delete-list <file>] [--delete-marked <file>] [--execute]`

4. **Icon Path Migration** → `data/migrate-iconpaths.mjs`
   - Combines: `migrate-iconpaths-to-iconmap.mjs`, `fix-icon-mapping-issues.mjs`
   - Usage: `node scripts/data/migrate-iconpaths.mjs [--fix-case] [--handle-paths] [--auto-map] [--report]`

**Note:** The original individual scripts are still available for backward compatibility, but the consolidated scripts are recommended for new workflows.

## Notes

- Scripts use ES modules (`.mjs`) or CommonJS (`.cjs`) depending on their dependencies
- All scripts assume they're run from the repository root
- Path calculations account for scripts being in subdirectories
- See [`docs/scripts/README.md`](../docs/scripts/README.md) for comprehensive documentation index

## Documentation

For detailed documentation, see:
- **Icon Mapping**: [`docs/scripts/ICON_MAPPING.md`](../docs/scripts/ICON_MAPPING.md)
- **Data Extraction**: [`docs/scripts/EXTRACT_W3X.md`](../docs/scripts/EXTRACT_W3X.md)
- **Field References**: [`docs/scripts/FIELD_REFERENCES.md`](../docs/scripts/FIELD_REFERENCES.md)
- **Refactoring Guide**: [`docs/scripts/REFACTORING.md`](../docs/scripts/REFACTORING.md)
- **Scripts Analysis**: [`docs/scripts/SCRIPT_ANALYSIS.md`](../docs/scripts/SCRIPT_ANALYSIS.md)

## Troubleshooting

### Path Errors

If you see path-related errors, ensure:
1. Scripts are run from the repository root
2. Path calculations use `'..', '..'` to go up to repo root from subdirectories

### Module Errors

If you see module import errors:
- Check that dependencies are installed: `npm install`
- Verify the script file extension matches its module system (`.mjs` for ES modules, `.cjs` for CommonJS)

