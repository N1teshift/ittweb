# Scripts Directory

The `scripts/` folder hosts the end-to-end data regeneration pipeline for Island Troll Tribes. Everything you need to extract Warcraft III data, convert it to TypeScript, and rebuild the icon map lives in `scripts/data/`.

## Utility Scripts

### Check Missing Icons

**Script:** `scripts/check-missing-icons.js`

Checks for missing icon files by comparing iconMap.ts with actual PNG files in the icons directory.

**Usage:**
```bash
node scripts/check-missing-icons.js
```

**Output:** Generates `missing-icons-report.txt` in the project root with a categorized list of missing icons.

**What it checks:**
- Reads all icon mappings from `src/features/modules/guides/data/iconMap.ts`
- Compares with actual PNG files in `public/icons/itt/`
- Categorizes missing icons by type (abilities, items, units, buildings, trolls)
- Generates a detailed report

---

### Replay File Analyzer

**Script:** `scripts/analyze-replay.mjs`

Analyzes WC3 replay files (`.w3g`) to check what data is available, including:
- Basic replay information (game ID, map, players, etc.)
- W3MMD data presence and structure
- Winning team detection sources
- Player statistics and properties

**Usage:**
```bash
npm run analyze:replay <path-to-replay.w3g>
```

**Example:**
```bash
npm run analyze:replay ./replays/game.w3g
# or
node scripts/analyze-replay.mjs ./replays/game.w3g
```

**What it checks:**
- ✅ File size and basic metadata
- ✅ Player information and team distribution
- ✅ W3MMD data availability (Island Troll Tribes custom stats)
- ✅ Winning team detection methods (parsed winningTeamId, player properties, W3MMD indicators)
- ✅ Sample W3MMD structure and mission keys

This is useful for:
- Testing if replays contain W3MMD data before uploading
- Debugging why winner detection might not work
- Understanding what data sources are available in a replay file

## Pipeline at a Glance

| Stage | Script | Purpose | Output |
| --- | --- | --- | --- |
| 1. Extract | `extract-from-w3x.mjs` | Parse `war3map.*` files from `external/Work/` | Raw JSON in `tmp/work-data/raw/` |
| 2. Metadata | `extract-metadata.mjs` | Build derived metadata (units/buildings/recipes) straight from extracted data + `war3map.j` | JSON in `tmp/work-data/metadata/` |
| 3. Ability Details | `extract-ability-details-from-wurst.mjs` | Extract detailed ability properties from Wurst source files | `tmp/work-data/metadata/ability-details-wurst.json` |
| 4. Ability Relationships | `extract-ability-relationships.mjs` | Extract ability-to-class/spellbook relationships | `tmp/work-data/metadata/ability-relationships.json` |
| 5. Item Details | `extract-item-details-from-wurst.mjs` | Extract item stat bonuses and properties from Wurst source files | `tmp/work-data/metadata/item-details-wurst.json` |
| 5.5. Ability ID Mapping | `generate-ability-id-mapping.mjs` | Generate mapping from raw ability IDs (e.g., "AMi1") to ability slugs | `src/features/modules/guides/data/items/abilityIdMapper.ts` |
| 5.6. Extract Ability Codes | `extract-ability-codes-from-items.mjs` | Parse ability codes from item descriptions to find missing mappings | Updated `src/features/modules/guides/data/items/abilityIdMapper.ts` |
| 6. Convert | `convert-extracted-to-typescript.mjs` | Generate typed data consumed by the app (merges all sources) | `src/features/modules/guides/data/**` |
| 7. Icon map | `regenerate-iconmap.mjs` | Produce `iconMap.ts` from PNG assets + generated data | `src/features/modules/guides/data/iconMap.ts` |
| 8. Fix paths | `fix-icon-paths.mjs` | Validate and fix icon paths in generated TypeScript files | Updated `src/features/modules/guides/data/**` |
| 9. Resolve references | `resolve-field-references.mjs` | Resolve field references in tooltips (e.g., `<AMd5,Cool1>`) | Updated `src/features/modules/guides/data/**` |

All stages can be orchestrated with one command:

```bash
node scripts/data/main.mjs
```

## Running Individual Stages

Each script is standalone and can be executed directly when you need to re-run only one portion of the pipeline:

```bash
node scripts/data/extract/extract-from-w3x.mjs
node scripts/data/extract/extract-metadata.mjs
node scripts/data/extract/extract-ability-details-from-wurst.mjs
node scripts/data/extract/extract-ability-relationships.mjs
node scripts/data/extract/extract-item-details-from-wurst.mjs
node scripts/data/generate/generate-ability-id-mapping.mjs
node scripts/data/extract/extract-ability-codes-from-items.mjs
node scripts/data/convert/convert-extracted-to-typescript.mjs
node scripts/data/generate/regenerate-iconmap.mjs
node scripts/data/generate/fix-icon-paths.mjs
node scripts/data/generate/resolve-field-references.mjs
```

When debugging, re-run the downstream stages only for the assets you changed to save time.

## Required Inputs

### Input Files

The pipeline requires the following input files in `external/Work/`:

- **war3map.w3t** - Item data (Warcraft 3 Table)
- **war3map.w3a** - Ability data
- **war3map.w3u** - Unit data
- **war3map.w3b** - Building/Destructable data
- **war3map.j** - JASS code (for recipe extraction)

**How to prepare input files:**

1. **Extract from .w3x map file:**
   - Download **MPQ Editor** from: https://www.zezula.net/en/mpq/download.html
   - Open the `.w3x` map file (e.g., `Island.Troll.Tribes.v3.28.w3x`)
   - Extract the required files listed above
   - Place them directly in `external/Work/` directory

2. **Verify files are present:**
   ```bash
   ls -la external/Work/war3map.*
   ```
   Should show all 5 files: `.w3t`, `.w3a`, `.w3u`, `.w3b`, `.j`

For detailed extraction instructions, see [`docs/systems/scripts/extract-w3x.md`](../docs/systems/scripts/extract-w3x.md).

### Configuration Files

- **category-mappings.json** - Manually curated categories (`scripts/data/config/category-mappings.json`)
- **Icon PNGs** - Icon files in `public/icons/itt/` for the icon-mapping stage

## Outputs & Verification

### Output Locations

- **Intermediate JSON** (raw + metadata) lives under `tmp/work-data/` and is regenerated every run
- **TypeScript data** is written to `src/features/modules/guides/data/`
- **Icon mapping** is regenerated at `src/features/modules/guides/data/iconMap.ts`

### Validation Checklist

After running the pipeline, verify the following:

1. **Check extraction completed:**
   ```bash
   ls -la tmp/work-data/raw/
   ```
   Should contain: `items.json`, `abilities.json`, `units.json`, `buildings.json`

2. **Check metadata extracted:**
   ```bash
   ls -la tmp/work-data/metadata/
   ```
   Should contain: `recipes.json`, `units.json`, `buildings.json`, plus Wurst-extracted data

3. **Verify TypeScript compilation:**
   ```bash
   npm run type-check
   ```
   Should complete without errors

4. **Spot-check generated files:**
   - `tmp/work-data/metadata/recipes.json` – verifies recipe extractor parsed `war3map.j`
   - `src/features/modules/guides/data/items/*.ts` – ensures items were converted correctly
   - `src/features/modules/guides/data/abilities/*.ts` – ensures abilities were converted correctly
   - `src/features/modules/guides/data/iconMap.ts` – ensures icon map was generated

5. **Count generated entities:**
   ```bash
   # Count items
   find src/features/modules/guides/data/items -name "*.ts" -type f | wc -l
   
   # Count abilities
   find src/features/modules/guides/data/abilities -name "*.ts" -type f | wc -l
   ```

For detailed validation procedures and troubleshooting, see [`docs/systems/scripts/TROUBLESHOOTING.md`](../docs/systems/scripts/TROUBLESHOOTING.md#data-validation).

## Troubleshooting

### Common Issues

**Work directory not found:**
- Verify `external/Work/` directory exists with required `war3map.*` files
- See [Required Inputs](#required-inputs) section above

**TypeScript compilation errors:**
- Run `npm run type-check` to identify errors
- Check generated files for syntax issues
- Review converter logic if data format is incorrect

**Missing or incorrect data:**
- Check intermediate JSON files in `tmp/work-data/`
- Verify input files are not corrupted
- Review filtering logic in converters

**For detailed troubleshooting:**
See the complete [Pipeline Troubleshooting Guide](../docs/systems/data-pipeline/troubleshooting.md) for:
- Common error messages and solutions
- Debugging procedures
- Performance issues
- Data validation steps

## Documentation & References

### Essential Guides

- **[Pipeline Architecture](../docs/systems/data-pipeline/architecture.md)** – High-level architecture and data flow
- **[Data Schemas](../docs/systems/data-pipeline/schemas.md)** – Complete data structure documentation
- **[Troubleshooting Guide](../docs/systems/data-pipeline/troubleshooting.md)** – Common issues and debugging
- **[Complete Documentation Index](../docs/systems/data-pipeline/README.md)** – All pipeline documentation

### Additional Resources

- **Operational details:** `docs/README.md` → **Systems › Data Pipeline**
- **Refactoring status:** Completed (historical notes archived in `docs/archive/scripts-data/REFACTORING_PLAN.md`)
- **Deep-dive guides:** `docs/systems/data-pipeline/guides/` (icon mapping, extraction, field references)
- **Input file extraction:** `docs/systems/data-pipeline/guides/extract-w3x.md`

Need to refresh fixtures before testing? Both `docs/QUICK_START_TESTING.md` and `docs/TESTING_GUIDE.md` include links to this README so you always land back here.
