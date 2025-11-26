# Icon Mapping Analysis

## Current Situation Summary

### Icon Files Available
- **Total icons**: 403 files
- **By category**:
  - `abilities/`: 56 icons
  - `items/`: 217 icons  
  - `buildings/`: 4 icons
  - `trolls/`: 16 icons
  - `base/`: 96 icons (unused?)
  - `unclassified/`: 14 icons

### Icon Mapping System

**Location**: `src/features/ittweb/guides/utils/iconMap.ts`

**Structure**: 
- Central `ICON_MAP` object with categories: `abilities`, `items`, `buildings`, `trolls`, `units`
- Maps entity names → icon filenames (without path)
- Uses `resolveExplicitIcon()` function to resolve full paths

**Current Mappings**:
- **Abilities**: ~419 mappings (many with color codes in names)
- **Items**: ~165 mappings
- **Buildings**: 0 mappings
- **Trolls**: 0 mappings  
- **Units**: 0 mappings

### Data Sources

1. **Items** (`src/features/ittweb/guides/data/items/`)
   - Spread across multiple files: raw-materials, weapons, armor, potions, scrolls, buildings, unknown
   - Some items have `iconPath` field in their data
   - Uses `getItemIconPathFromRecord()` utility

2. **Abilities** (`src/features/ittweb/guides/data/abilities/`)
   - Spread across multiple files: basic, beastmaster, gatherer, hunter, item, mage, priest, scout, thief, unknown
   - Some abilities have `iconPath` field in their data

3. **Units** (`src/features/ittweb/guides/data/units/allUnits.ts`)
   - 306 units total
   - 252 units (82%) have `iconPath` field
   - **0 units mapped in ICON_MAP**

4. **Classes** (`src/features/ittweb/guides/data/units/classes.ts`)
   - 7 base classes
   - 0 have `iconSrc` field
   - **0 mapped in ICON_MAP**

5. **Derived Classes** (`src/features/ittweb/guides/data/units/derivedClasses.ts`)
   - 28 derived classes (subclasses + superclasses)
   - 0 have `iconSrc` field
   - **0 mapped in ICON_MAP**

### How Icons Are Resolved

**GuideIcon Component** (`src/features/ittweb/guides/components/GuideIcon.tsx`):
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

**For Abilities**:
- Some abilities have `iconPath` in data
- Checks ICON_MAP by ability name

### Issues Identified

1. **Inconsistent Systems**:
   - Units use direct `iconPath` from data
   - Items/Abilities use both `iconPath` from data AND ICON_MAP
   - Classes have no icon system at all

2. **Units Not Using ICON_MAP**:
   - 306 units exist, 252 have iconPath
   - But 0 are mapped in ICON_MAP
   - Units page uses direct iconPath

3. **Classes Missing Icons**:
   - Base classes: 0/7 have iconSrc
   - Derived classes: 0/28 have iconSrc
   - All unmapped in ICON_MAP

4. **Buildings Unmapped**:
   - 0 buildings mapped in ICON_MAP
   - Only 4 building icons available

5. **Icon Name Matching**:
   - Many ability names in ICON_MAP have color codes (e.g., `|cffC2E8EB...`)
   - Makes matching difficult
   - Need to normalize names

### Existing Tools

1. **Icon Mapper UI** (`/tools/icon-mapper`)
   - Visual tool for mapping icons
   - Shows stats per category
   - Can export mappings

2. **Scripts**:
   - `scripts/map-all-icons.mjs` - Auto-map items/abilities
   - `scripts/regenerate-iconmap.mjs` - Regenerate from scratch
   - `scripts/map-icons-to-files.mjs` - Map extracted icons

### Recommendations

1. **Unify Icon System**:
   - Decide: Use ICON_MAP for everything OR use iconPath/iconSrc in data
   - Currently mixing both approaches

2. **Map Units to ICON_MAP**:
   - 252 units already have iconPath
   - Could migrate to ICON_MAP or keep current system

3. **Add Class Icons**:
   - Extract class icons from game files
   - Map to ICON_MAP or add iconSrc to class data

4. **Normalize Names**:
   - Strip color codes from ability names for matching
   - Create normalized name mapping

5. **Complete Missing Mappings**:
   - Items: Need to check how many are actually unmapped
   - Abilities: Many mapped but with color codes
   - Units: 306 total, need mapping strategy
   - Classes: 35 total, need icons

### Next Steps

1. **Run proper analysis** to get exact counts:
   - Count all items from all files
   - Count all abilities from all files
   - Count items/abilities with iconPath
   - Count items/abilities mapped in ICON_MAP

2. **Decide on strategy**:
   - Option A: Migrate everything to ICON_MAP
   - Option B: Keep iconPath/iconSrc in data, use ICON_MAP as fallback
   - Option C: Use ICON_MAP for items/abilities, iconPath for units

3. **Create mapping script**:
   - Match existing iconPath values to actual icon files
   - Generate ICON_MAP entries
   - Handle name normalization

4. **Extract missing icons**:
   - If icons are missing, extract from game files
   - Organize into proper directories

