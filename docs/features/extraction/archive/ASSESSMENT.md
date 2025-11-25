# Extraction & Integration Scripts Assessment

## Extraction Scripts

### ✅ `extract_ability_descriptions.py`
**Purpose**: Extract ability tooltips/descriptions from WurstScript ability files  
**Output**: `external/ability_descriptions.json`  
**Status**: ✅ Good - Extracts TOOLTIP_NORM and TOOLTIP_EXTENDED from ability files  
**Dependencies**: Requires `external/wurst/objects/abilities/` directory

### ✅ `extract_item_stats.py`
**Purpose**: Extract item stats (damage, armor, bonuses) from CustomItemType definitions  
**Output**: `external/item_stats.json`  
**Status**: ✅ Good - Extracts strength/agility/intelligence/armor/damage/hp/mana bonuses  
**Dependencies**: Requires `external/wurst/systems/craftingV2/` directory

### ✅ `extract_buildings.py`
**Purpose**: Extract building definitions from WurstScript source  
**Output**: `buildings.json` (in parent directory, not external/)  
**Status**: ⚠️ Needs fix - Output path is wrong (should be `external/buildings.json`)  
**Dependencies**: Requires `external/wurst/objects/units/Buildings/` and `external/wurst/systems/entities/buildings/`

### ✅ `extract_units.py`
**Purpose**: Extract troll/unit definitions from WurstScript source  
**Output**: `units.json` (in parent directory, not external/)  
**Status**: ⚠️ Needs fix - Output path is wrong (should be `external/units.json`)  
**Dependencies**: Requires `external/wurst/objects/units/` and `external/wurst/systems/entities/trolls/`

### ✅ `extract_recipes.py`
**Purpose**: Extract item recipes from crafting system  
**Output**: `external/recipes.json`  
**Status**: ✅ Good - Extracts recipes with ingredients and building requirements  
**Dependencies**: Requires `external/wurst/systems/craftingV2/` and `external/wurst/objects/items/`

### ⚠️ `extract_all_abilities.py`
**Purpose**: Extract abilities from `abilities.ts` and create category files  
**Output**: Creates files in `src/features/ittweb/guides/data/abilities/`  
**Status**: ⚠️ Problem - This reads from existing `abilities.ts` file, not from wurst source  
**Issue**: This is a refactoring script, not an extraction script. We need a script that extracts from wurst files directly.

## Integration Scripts

### ⚠️ `integrate_all_data.py`
**Purpose**: Integrate descriptions and stats into existing TypeScript files  
**Status**: ⚠️ Partial - Only updates existing files, doesn't generate new ones  
**Issues**: 
- Only updates `abilities.ts` (but abilities are now in separate files)
- Only updates `items.armor.ts` and `items.weapons.ts`
- Doesn't generate buildings/units from JSON

### ❌ `integrate_abilities.py`
**Purpose**: Integrate extracted abilities into website  
**Status**: ❌ Outdated - References `abilities.json` which doesn't exist  
**Issue**: This script seems to be from an older workflow

## Missing Scripts

1. **Extract abilities from wurst files** - We need a script that extracts abilities directly from `external/wurst/objects/abilities/` and generates the ability category files
2. **Generate buildings.ts from buildings.json** - Convert extracted buildings JSON to TypeScript
3. **Generate classes.ts and derivedClasses.ts from units.json** - Convert extracted units JSON to TypeScript
4. **Generate items.external.ts from recipes.json** - Extract items from recipes and generate external items file

## Current Data Flow Issues

1. **Abilities**: 
   - Current: `extract_all_abilities.py` reads from `abilities.ts` (circular dependency)
   - Needed: Extract from wurst → JSON → TypeScript files

2. **Buildings**:
   - Current: `extract_buildings.py` outputs to wrong location
   - Needed: Extract → JSON → Generate `buildings.ts`

3. **Units/Trolls**:
   - Current: `extract_units.py` outputs to wrong location
   - Needed: Extract → JSON → Generate `classes.ts` and `derivedClasses.ts`

4. **Items**:
   - Current: Node.js scripts (`check-items.cjs`, `generate-external-items.cjs`)
   - Status: These seem to work but need verification

## Recommended Workflow

1. **Extract Phase** (from wurst source):
   - `extract_ability_descriptions.py` → `ability_descriptions.json`
   - `extract_item_stats.py` → `item_stats.json`
   - `extract_buildings.py` → `buildings.json` (fix path)
   - `extract_units.py` → `units.json` (fix path)
   - `extract_recipes.py` → `recipes.json`
   - **NEW**: `extract_abilities_from_wurst.py` → `abilities.json`

2. **Generate Phase** (from JSON to TypeScript):
   - **NEW**: `generate_abilities_from_json.py` → `abilities/*.ts` files
   - **NEW**: `generate_buildings_from_json.py` → `buildings.ts`
   - **NEW**: `generate_classes_from_json.py` → `classes.ts` and `derivedClasses.ts`
   - **NEW**: `generate_external_items_from_recipes.py` → `items.external.ts`

3. **Integrate Phase** (enhance generated files):
   - `integrate_all_data.py` → Add descriptions and stats to generated files

