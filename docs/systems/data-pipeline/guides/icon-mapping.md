# Icon Mapping Guide

This guide covers the icon mapping system, scripts, workflows, and current status.

## Table of Contents

1. [Overview](#overview)
2. [Icon Mapping System](#icon-mapping-system)
3. [Current Status](#current-status)
4. [Scripts and Workflows](#scripts-and-workflows)
5. [Known Issues](#known-issues)
6. [Next Steps](#next-steps)

## Overview

The icon mapping system manages icons for game entities (items, abilities, units, buildings, classes) using a centralized `ICON_MAP` located at `src/features/modules/guides/utils/iconMap.ts`.

### Icon Files Available

- **Total icons**: 403 files
- **By category**:
  - `abilities/`: 56 icons
  - `items/`: 217 icons  
  - `buildings/`: 4 icons
  - `trolls/`: 16 icons
  - `base/`: 96 icons (unused?)
  - `unclassified/`: 14 icons

## Icon Mapping System

### Structure

The `ICON_MAP` object has the following structure:

```typescript
export const ICON_MAP: IconMap = {
  abilities: { /* name -> filename */ },
  items: { /* name -> filename */ },
  buildings: { /* name -> filename */ },
  trolls: { /* name -> filename */ },
  units: { /* name -> filename */ },
};
```

Maps entity names → icon filenames (without path). Uses `resolveExplicitIcon()` function to resolve full paths.

### How Icons Are Resolved

**GuideIcon Component** (`src/features/modules/guides/components/GuideIcon.tsx`):
1. Priority 1: `src` prop (explicit override)
2. Priority 2: `resolveExplicitIcon(category, name)` - checks ICON_MAP
3. Priority 3: Default fallback icon (`/icons/itt/items/BTNYellowHerb.png`)

**For Units**:
- Units can have `iconPath` in their data
- Currently passed as `src` prop to GuideIcon
- Not using ICON_MAP system

**For Items**:
- Some items have `iconPath` in data
- Uses `getItemIconPathFromRecord()` utility
- Also checks ICON_MAP
- **Important**: `getItemIconPathFromRecord()` always returns full paths starting with `/icons/itt/`
  - If `item.iconPath` exists, it's prepended with `/icons/itt/` (since data files store just filenames)
  - This ensures Next.js Image components resolve paths correctly regardless of page location

**For Abilities**:
- Some abilities have `iconPath` in data
- Checks ICON_MAP by ability name

### Data Sources

1. **Items** (`src/features/modules/guides/data/items/`)
   - Spread across multiple files: raw-materials, weapons, armor, potions, scrolls, buildings, unknown
   - Some items have `iconPath` field in their data

2. **Abilities** (`src/features/modules/guides/data/abilities/`)
   - Spread across multiple files: basic, beastmaster, gatherer, hunter, item, mage, priest, scout, thief, unknown
   - Some abilities have `iconPath` field in their data

3. **Units** (`src/features/modules/guides/data/units/allUnits.ts`)
   - 306 units total
   - 252 units (82%) have `iconPath` field
   - **0 units mapped in ICON_MAP**

4. **Classes** (`src/features/modules/guides/data/units/classes.ts`)
   - 7 base classes
   - 0 have `iconSrc` field
   - **0 mapped in ICON_MAP**

5. **Derived Classes** (`src/features/modules/guides/data/units/derivedClasses.ts`)
   - 28 derived classes (subclasses + superclasses)
   - 0 have `iconSrc` field
   - **0 mapped in ICON_MAP**

## Current Status

**Total Entities:** 1,342
- **Mapped:** 817 (61%)
- **Unmapped:** 525 (39%)

### Breakdown by Category

| Category | Total | Mapped | Unmapped | Coverage |
|----------|-------|--------|----------|----------|
| Items | 313 | 264 | 49 | 84% |
| Abilities | 684 | 378 | 306 | 55% |
| Units | 310 | 175 | 135 | 56% |
| Base Classes | 7 | 0 | 7 | 0% |
| Derived Classes | 28 | 0 | 28 | 0% |

### What's Been Done

✅ **Created comprehensive analysis script** - `analyze-icon-mapping-comprehensive.mjs`
- Properly reads all TypeScript data files
- Provides accurate statistics
- Shows unmapped entities

✅ **Created migration script** - `migrate-iconpaths-to-iconmap.mjs`
- Migrates existing iconPath/iconSrc to ICON_MAP
- Verifies icon files exist
- Handles case-insensitive matching

✅ **Created extraction list generator** - `map-available-icons-and-generate-extraction-list.mjs`
- Identifies entities needing icons
- Groups by icon filename
- Generates detailed extraction list

✅ **Fixed iconMap.ts issues**
- Removed trailing backslashes from keys
- Removed duplicate ICON_MAP declarations
- Removed duplicate keys
- Fixed escaping issues

## Scripts and Workflows

### Analysis

**Analyze current icon mapping status:**
```bash
node scripts/data/generate/regenerate-iconmap.mjs
```

What it does:
- Scans all icon directories
- Reads all items, abilities, units, and classes from TypeScript files
- Parses ICON_MAP to see current mappings
- Shows coverage statistics
- Lists unmapped entities

### Migration

**Migrate iconPath/iconSrc to ICON_MAP:**
```bash
node scripts/data/migrate-iconpaths.mjs
```

What it does:
- Reads all entities with iconPath/iconSrc in their data
- Verifies icon files exist
- Adds mappings to ICON_MAP
- Reports which icons were found/not found

**Note:** This script adds mappings but doesn't remove iconPath/iconSrc from data files.

### Icon Mapping Management

**Manage icon mappings:**
```bash
node scripts/data/generate/regenerate-iconmap.mjs
```

Features:
- Map available icons to entities
- Find missing icons with fuzzy matching
- Generate extraction lists
- Update iconMap.ts automatically

### Icon Map Maintenance

**Maintain icon map:**
```bash
node scripts/data/generate/regenerate-iconmap.mjs
```

Features:
- Fix duplicate ICON_MAP entries
- Fix escaping issues
- Regenerate clean iconMap.ts
- Validate iconMap structure

### Icon Cleanup

**Cleanup icons:**
```bash
node scripts/data/generate/regenerate-iconmap.mjs
```

Features:
- Remove duplicate icon files
- Normalize icon filenames
- Delete icons from text lists
- Delete marked icons from JSON

### Recommended Workflow

1. **Run analysis first:**
   ```bash
   node scripts/data/generate/regenerate-iconmap.mjs
   ```
   This gives you the current state.

2. **Migrate existing iconPaths:**
   ```bash
   node scripts/data/migrate-iconpaths.mjs
   ```
   This will populate ICON_MAP with entities that already have iconPath/iconSrc.

3. **Generate extraction list:**
   ```bash
   node scripts/data/generate/regenerate-iconmap.mjs
   ```
   This shows what icons need to be extracted (see `ICON_EXTRACTION_LIST.md`).

4. **Extract missing icons:**
   - Use MPQ Editor or similar to extract from .w3x files
   - Look in: `ReplaceableTextures/CommandButtons/` and `ReplaceableTextures/PassiveButtons/`
   - Extract .blp files and convert to .png
   - Organize into proper directories

5. **Map newly extracted icons:**
   ```bash
   node scripts/data/generate/regenerate-iconmap.mjs
   ```

6. **Re-run analysis:**
   ```bash
   node scripts/data/generate/regenerate-iconmap.mjs
   ```
   Verify improved coverage.

## Known Issues

### 1. Inconsistent Systems

- Units use direct `iconPath` from data
- Items/Abilities use both `iconPath` from data AND ICON_MAP
- Classes have no icon system at all

**Recommendation:** Unify to use ICON_MAP for everything OR use iconPath/iconSrc in data consistently.

### 2. Units Not Using ICON_MAP

- 306 units exist, 252 have iconPath
- But 0 are mapped in ICON_MAP
- Units page uses direct iconPath

**Recommendation:** Migrate units to ICON_MAP or keep current system consistently.

### 3. Classes Missing Icons

- Base classes: 0/7 have iconSrc
- Derived classes: 0/28 have iconSrc
- All unmapped in ICON_MAP

**Recommendation:** Extract class icons from game files and add to ICON_MAP under `trolls` category.

### 4. Icon Name Matching

- Many ability names in ICON_MAP have color codes (e.g., `|cffC2E8EB...`)
- Makes matching difficult
- Need to normalize names

### 5. Data Cleanup Needed

**Remove trailing backslashes from entity names:**
- Many items/abilities/units have names ending with `\` (e.g., `Coat of Wolf\`)
- These should be cleaned up in the source TypeScript files

### 6. Path-Based Icons

**6 entities have full paths** like:
- `ReplaceableTextures/PassiveButtons/PASBTNElunesBlessing.png`
- `ReplaceableTextures/CommandButtonsDisabled/DISPASBTNImmolation.png`

These need to be:
- Extracted from game files
- Or mapped to existing icons if available

## Next Steps

### High Priority

1. **Extract Missing Icons**
   - **87 unique icon files needed** to cover **482 entities**
   - See `ICON_EXTRACTION_LIST.md` for the complete list
   - Items: 27 need extraction
   - Abilities: 288 need extraction  
   - Units: 132 need extraction
   - Classes: 35 need extraction

2. **Map Classes**
   - All 35 classes need icons
   - Extract class icons from game files
   - Add to ICON_MAP under `trolls` category

### Medium Priority

1. **Fix Data Files**
   - Remove trailing backslashes from entity names
   - Create cleanup script if needed

2. **Handle Path-Based Icons**
   - Extract 6 icons with full paths
   - Or map to existing icons if available

### Low Priority

1. **Unify Icon System**
   - Decide: Use ICON_MAP for everything OR use iconPath/iconSrc in data
   - Currently mixing both approaches

2. **Normalize Names**
   - Strip color codes from ability names for matching
   - Create normalized name mapping

3. **Map Units to ICON_MAP**
   - 252 units already have iconPath
   - Could migrate to ICON_MAP or keep current system

## Tools

### Icon Mapper UI

Visual tool for mapping icons:
- Location: `/tools/icon-mapper`
- Shows stats per category
- Can export mappings

### Extraction List

See `ICON_EXTRACTION_LIST.md` for:
- Complete list of icons to extract
- Grouped by filename
- Shows which entities use each icon

## Related Documentation

- [`extract-w3x.md`](./extract-w3x.md) - How to extract data/icons from .w3x files
- [`field-references.md`](./field-references.md) - Understanding field references in tooltips
- [`icon-extraction-list.md`](./icon-extraction-list.md) - Complete list of icons to extract

