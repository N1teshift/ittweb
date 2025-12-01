# Extracting Data from .w3x Map Files

This guide explains how to extract game data (items, abilities, units, buildings) from the compiled Warcraft 3 map file (`.w3x`).

## Why Extract from .w3x?

Extracting from the compiled map file has several advantages:
- ✅ **Structured data**: Object data is stored in standardized formats (SLK/text files)
- ✅ **Complete information**: All final values are already compiled
- ✅ **Easier parsing**: No need to parse Wurst source code syntax
- ✅ **Accurate**: Reflects exactly what's in the game

## Prerequisites

You need to extract the object data files from the `.w3x` archive first. The `.w3x` file is an MPQ (Mo'PaQ) archive.

### Option 1: Use MPQ Editor (Recommended)

1. Download **MPQ Editor** from: https://www.zezula.net/en/mpq/download.html
2. Open `Island.Troll.Tribes.v3.28.w3x` in MPQ Editor
3. Extract these files:
   - `war3map.w3t` → Items
   - `war3map.w3a` → Abilities  
   - `war3map.w3u` → Units
   - `war3map.w3b` → Buildings/Destructables
4. Place them in: `external/Work/` directory in the project root

### Option 2: Use Command Line Tools

If you have `mpq-tools` or similar installed:
```bash
# Extract all files
mpq-extract Island.Troll.Tribes.v3.28.w3x external/Work/

# Or extract specific files
mpq-extract Island.Troll.Tribes.v3.28.w3x war3map.w3t external/Work/
mpq-extract Island.Troll.Tribes.v3.28.w3x war3map.w3a external/Work/
mpq-extract Island.Troll.Tribes.v3.28.w3x war3map.w3u external/Work/
mpq-extract Island.Troll.Tribes.v3.28.w3x war3map.w3b external/Work/
```

## Running the Extraction Script

Once you have the extracted files in place:

```bash
node scripts/data/extract/extract-from-w3x.mjs
```

This will:
1. Parse each object data file using `wc3maptranslator`
2. Extract names, descriptions, tooltips, icons, and other properties
3. Save the data to JSON files in `tmp/work-data/raw/`

## Output Files

- `all_objects.json` - Combined data from all object types
- `items.json` - All items
- `abilities.json` - All abilities
- `units.json` - All units
- `buildings.json` - All buildings/destructables

## Next Steps

After extraction, you can:
1. Review the extracted data
2. Use it to update your TypeScript data files
3. Compare with Wurst source extraction to ensure accuracy

## File Format Reference

- **war3map.w3t**: Item data (Warcraft 3 Table)
- **war3map.w3a**: Ability data
- **war3map.w3u**: Unit data
- **war3map.w3b**: Destructable/Building data

These files use a binary format that `wc3maptranslator` can parse into JSON.

