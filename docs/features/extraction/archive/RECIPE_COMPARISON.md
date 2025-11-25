# Recipe Comparison: Extracted vs Website

## Summary

- **Extracted recipes**: 100 recipes from game source code
- **Website recipes**: ~54 recipes (manually maintained)
- **Coverage**: Website has a small subset of all available recipes

## Key Differences

### 1. **Data Format**

#### Extracted Recipes (from game source):
```json
{
  "itemId": "ITEM_BATTLE_AXE",
  "itemName": "ITEM_BATTLE_AXE",
  "ingredients": ["ITEM_GREATER_ESSENCE", "ITEM_STEEL_AXE", ...],
  "unitRequirement": "armory",
  "mixingPotManaRequirement": null
}
```

#### Website Recipes (current):
```typescript
{
  id: 'battle-axe',
  name: 'Battle Axe',
  recipe: ['steel-ingot', 'stick'],
  craftedAt: 'Armory'
}
```

### 2. **ID Format**
- **Extracted**: Uses `ITEM_XXX` constants (e.g., `ITEM_BATTLE_AXE`)
- **Website**: Uses kebab-case IDs (e.g., `battle-axe`)

### 3. **Ingredient Names**
- **Extracted**: Uses `ITEM_XXX` constants (e.g., `ITEM_STEEL_INGOT`)
- **Website**: Uses simplified names (e.g., `steel-ingot`, `hide`, `stick`)

### 4. **Crafting Station**
- **Extracted**: `unitRequirement` (lowercase, snake_case: `armory`, `workshop`, `tannery`, etc.)
- **Website**: `craftedAt` (human-readable: `Armory`, `Workshop`, `Tannery`, etc.)

### 5. **Additional Data**

**Extracted has:**
- `mixingPotManaRequirement` - Mana cost for mixing pot recipes
- Complete ingredient list with exact item constants

**Website has:**
- `stats` - Item statistics (damage, armor, health, mana)
- `description` - Item descriptions
- `category` and `subcategory` - Item categorization
- `iconPath` - Icon file paths

## Recipe Coverage

### Extracted Recipes by Station:
- **Forge**: 24 recipes
- **Armory**: 16 recipes
- **Witch Doctor's Hut**: 16 recipes
- **Workshop**: 14 recipes
- **Tannery**: 9 recipes
- **Mixing Pot**: 5 recipes
- **No requirement**: 16 recipes (building kits, etc.)

### Website Coverage:
The website currently has recipes for a small subset of items, primarily:
- Basic weapons (flint-axe, battle-axe, blowgun, mage-masher)
- Some armor items (wood-boots, battle-armor, anabolic-boots)
- Buildings (fire, tent, troll-hut, etc.)
- Potions and scrolls (with different ingredient names)

## Recommendations

1. **Create a mapping system** to convert between:
   - `ITEM_XXX` constants → kebab-case IDs
   - `ITEM_XXX` ingredient constants → simplified ingredient names

2. **Merge the data**:
   - Use extracted recipes as the source of truth for recipe data
   - Keep website's additional metadata (stats, descriptions, categories)
   - Map crafting stations: `armory` → `Armory`, `workshop` → `Workshop`, etc.

3. **Add missing recipes**: The extracted data has ~92 recipes not currently in the website

4. **Handle mixing pot mana requirements**: Add support for displaying mana costs in mixing pot recipes

5. **Update ingredient names**: Create a mapping from `ITEM_XXX` constants to user-friendly names

## Example Mapping Needed

```typescript
const ITEM_ID_MAP = {
  'ITEM_BATTLE_AXE': 'battle-axe',
  'ITEM_STEEL_INGOT': 'steel-ingot',
  'ITEM_ELK_HIDE': 'hide',
  'ITEM_STICK': 'stick',
  // ... etc
};

const CRAFTING_STATION_MAP = {
  'armory': 'Armory',
  'forge': 'Forge',
  'workshop': 'Workshop',
  'tannery': 'Tannery',
  'witch_doctors_hut': "Witch Doctor's Hut",
  'mixing_pot': 'Mixing Pot',
};
```


