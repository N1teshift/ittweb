# Recipe Implementation Summary

## Completed Tasks

### 1. ✅ Created Mapping System
- **File**: `src/features/ittweb/guides/utils/itemIdMapper.ts`
- **Features**:
  - Converts `ITEM_XXX` constants to kebab-case IDs
  - Maps crafting stations from game format to website format
  - Normalizes ingredient names
  - Provides utility functions for ID conversion

### 2. ✅ Updated Type Definitions
- **File**: `src/types/items.ts`
- **Changes**: Added `mixingPotManaRequirement?: number` to `ItemData` type

### 3. ✅ Updated Existing Recipes
Updated recipes in the following files to match game source:

#### `src/features/ittweb/guides/data/items.weapons.ts`
- **battle-axe**: Updated from `['steel-ingot', 'stick']` to `['greater-essence', 'steel-axe', 'spirit-wind', 'spirit-water', 'mana-crystal']`
- **mage-masher**: Updated from `['iron-ingot', 'mana-crystal']` to `['mana-crystal', 'spirit-water', 'spirit-wind', 'stick']` and crafting station to `Forge`

#### `src/features/ittweb/guides/data/items.armor.ts`
- **battle-armor**: Updated from `['steel-ingot', 'iron-ingot', 'hide']` to `['bone-coat', 'mana-crystal', 'spirit-water', 'spirit-wind']`
- **anabolic-boots**: Updated from `['wood-boots', 'anabolic-potion']` to `['bone-boots', 'lesser-essence', 'mana-crystal', 'spirit-water', 'spirit-wind']`
- **battle-gloves**: Updated from `['hide', 'iron-ingot']` to `['mana-crystal', 'spirit-water', 'spirit-wind', 'steel-gloves']`

### 4. ✅ Updated UI Components
- **File**: `src/pages/guides/items/[id].tsx`
- **Changes**:
  - Added display for `mixingPotManaRequirement` in the Details section
  - Added mana cost display in the Recipe section for mixing pot items
  - Improved ingredient name formatting (handles multiple hyphens)

### 5. ✅ Created Merge Script
- **File**: `external/scripts/merge_recipes.py`
- **Purpose**: Automated script to merge extracted recipes with website data
- **Features**:
  - Parses TypeScript item files
  - Updates existing recipes
  - Maps ingredient names
  - Handles crafting station conversion
  - Adds mixing pot mana requirements

## Key Improvements

1. **Recipe Accuracy**: All updated recipes now match the game source code exactly
2. **Complete Ingredient Lists**: Recipes now include all required ingredients (e.g., spirits, essences, mana crystals)
3. **Mixing Pot Support**: Added support for displaying mana requirements for mixing pot recipes
4. **Type Safety**: Added TypeScript type support for new recipe properties

## Next Steps (Optional)

1. **Add Missing Recipes**: The extracted data contains ~92 recipes not yet in the website. These can be added manually or via the merge script.

2. **Update Potion Recipes**: The potion items in `items.potions.ts` use placeholder ingredient names (like 'butsu'). These should be mapped to actual game items from the extracted recipes.

3. **Add More Items**: Many items from the extracted recipes don't exist in the website yet. Consider adding:
   - All forge recipes (24 items)
   - All armory recipes (16 items)
   - All workshop recipes (14 items)
   - All tannery recipes (9 items)
   - All witch doctor's hut recipes (16 items)

4. **Ingredient Mapping**: Some ingredients may need additional mapping. The current mapping covers common items, but there may be edge cases.

## Files Modified

- `src/types/items.ts` - Added `mixingPotManaRequirement` field
- `src/features/ittweb/guides/utils/itemIdMapper.ts` - New mapping utility
- `src/features/ittweb/guides/data/items.weapons.ts` - Updated recipes
- `src/features/ittweb/guides/data/items.armor.ts` - Updated recipes
- `src/pages/guides/items/[id].tsx` - Added UI for mana requirements
- `external/scripts/merge_recipes.py` - New merge script

## Usage

To update recipes in the future when the game source changes:

1. Run the extraction script:
   ```bash
   cd external
   python scripts/extract_recipes.py
   ```

2. Run the merge script:
   ```bash
   cd external
   python scripts/merge_recipes.py
   ```

3. Review and commit changes


