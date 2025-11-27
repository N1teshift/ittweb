# Item Data Extraction - Investigation & Improvement Opportunities

## Executive Summary

This document explores what item data is currently extracted and what additional data could be captured from:
1. **Source files** (`island-troll-tribes/wurst/`) - Wurst source code
2. **Decompiled files** (`external/Work/`) - Compiled game data (war3map.w3t, war3map.j)

## Currently Extracted Data

### From `extract-from-w3x.mjs` (war3map.w3t):
- ✅ **Basic Info**: `id`, `name`, `description`, `tooltip`, `icon`
- ✅ **Cost**: `cost` (gold cost)
- ✅ **Usage**: `uses` (charges)
- ✅ **Flags**: `droppable`, `pawnable`, `perishable`
- ✅ **Metadata**: `level`, `class` (classification)
- ✅ **Raw modifications**: Full array of all field modifications

### From `extract-metadata.mjs` (war3map.j):
- ✅ **Item ID mappings**: LocalObjectIDs_ITEM_* constants to names

### From `item-converter.mjs`:
- ✅ Converts to TypeScript format with: `id`, `name`, `category`, `subcategory`, `description`, `tooltip`, `iconPath`
- ✅ Recipe information is merged from recipes.json

### From recipes.json (via extract-metadata.mjs):
- ✅ Recipe ingredients
- ✅ Crafting location (craftedAt)
- ✅ Mixing pot mana requirement

---

## Additional Data Available in war3map.w3t (Decompiled)

### Standard Warcraft 3 Item Fields (Not Currently Extracted)

The `war3map.w3t` file contains many more fields than currently extracted:

#### **Cost & Stock Information**
- ❌ **Lumber Cost** (`ilum`) - Lumber/resource cost
- ❌ **Stock Maximum** (`isto`) - Maximum stock at shops
- ❌ **Stock Replenish Interval** (`istr`) - Time between stock replenishments

#### **Item Properties**
- ❌ **Hit Points** (`ihpc`) - Item durability/hit points
- ❌ **Classification** (`icla`) - Item type (Permanent, Charged, PowerUp, etc.) - partially extracted as `class`
- ❌ **Max Stack** (`ista`) - Maximum stack size
- ❌ **Scaling Value** (`isca`) - Scaling factor for certain item properties
- ❌ **Model/File** (`ifil`) - 3D model file path

#### **Usage & Abilities**
- ❌ **Hotkey** (`uhot` or `ihot`) - Keyboard shortcut for using item
- ❌ **Abilities** (`iabi`) - List of ability IDs granted by item (comma-separated)
- ❌ **Actively Used** (`iusa`) - Whether item requires activation
- ❌ **Ignore Cooldown** (`iucd`) - Whether item ignores cooldown restrictions

#### **Miscellaneous**
- ❌ **Button Position X/Y** (`ubpx`, `ubpy`) - UI button position
- ❌ **Tinting Colors** (`uclr`, `uclg`, `uclb`) - RGB color values for item tinting

---

## Additional Data Available in Wurst Source Files

### 1. **Stat Bonuses** (from CustomItemType/CustomItemDefinition)

Items can grant stat bonuses when equipped. These are defined in Wurst files:

**Extractable Properties:**
- ❌ **Strength Bonus** (`strengthBonus`)
- ❌ **Agility Bonus** (`agilityBonus`)
- ❌ **Intelligence Bonus** (`intelligenceBonus`)
- ❌ **Armor Bonus** (`armorBonus`)
- ❌ **Damage Bonus** (`damageBonus`)
- ❌ **Attack Speed Bonus** (`attackSpeedBonus`)
- ❌ **Health Bonus** (`hpBonus`)
- ❌ **Mana Bonus** (`mpBonus`)

**Example from `CustomItemType.wurst`:**
```wurst
public class CustomItemType
    int strengthBonus =0    
    int agilityBonus =0
    int intelligenceBonus =0
    int armorBonus =0
    int damageBonus =0
    int attackSpeedBonus =0
    int hpBonus =0
    int mpBonus =0
```

### 2. **Item Definition Properties** (from CustomItemDefinition.wurst)

**Extractable Properties:**
- ❌ **Lumber Cost** (`lumberCost`) - Already available in war3map.w3t as `ilum`
- ❌ **Number of Charges** (`numberOfCharges`) - Already available in war3map.w3t as `iuse`
- ❌ **Stock Maximum** (`stockMaximum`)
- ❌ **Stock Replenish Interval** (`stockReplenishInterval`)
- ❌ **Scaling Value** (`scalingValue`)
- ❌ **Model Path** (`modelPath`)
- ❌ **Icon Path** (`iconPath`) - Already extracted
- ❌ **Abilities String** (`abilities`) - Comma-separated ability IDs

### 3. **Item Constants & IDs** (from LocalObjectIDs.wurst)

Items are defined with constants like:
```wurst
public constant ITEM_STONE_SPEAR = 'xxxx'
public constant ITEM_IRON_SPEAR = 'yyyy'
```

**Extractable:**
- ❌ All `ITEM_*` constants with their raw codes
- ❌ Mapping between constants and actual item IDs

### 4. **Recipe Information** (from ItemRecipeV2.wurst)

**Already extracted**, but could be enhanced with:
- ❌ Unit requirements (which unit type can craft)
- ❌ Recipe flags (prevent being crafted as ingredient)

---

## Priority Ranking for Implementation

### High Priority (Most Valuable)

1. **Stat Bonuses** ⭐⭐⭐⭐⭐
   - **Source**: Wurst source files
   - **Impact**: Critical for showing item power/utility
   - **Display**: "+5 Strength, +3 Agility, +10 Armor"

2. **Lumber Cost** ⭐⭐⭐⭐⭐
   - **Source**: war3map.w3t (`ilum`) + Wurst
   - **Impact**: Important for crafting cost display
   - **Display**: "Cost: 5 Lumber, 100 Gold"

3. **Abilities List** ⭐⭐⭐⭐⭐
   - **Source**: war3map.w3t (`iabi`)
   - **Impact**: Shows which abilities item grants
   - **Display**: "Grants: Iron Skin, Attack Speed Bonus"

4. **Hotkey** ⭐⭐⭐⭐
   - **Source**: war3map.w3t (`uhot`/`ihot`)
   - **Impact**: Useful for usability information
   - **Display**: "Hotkey: Q"

5. **Hit Points / Durability** ⭐⭐⭐⭐
   - **Source**: war3map.w3t (`ihpc`)
   - **Impact**: Important for items with durability
   - **Display**: "Durability: 75 HP"

### Medium Priority

6. **Stock Information** ⭐⭐⭐
   - **Source**: war3map.w3t (`isto`, `istr`)
   - **Impact**: Useful for shop items
   - **Display**: "Stock: Max 4, Replenishes every 120s"

7. **Max Stack** ⭐⭐⭐
   - **Source**: war3map.w3t (`ista`)
   - **Impact**: Important for stackable items
   - **Display**: "Stacks up to 5"

8. **Model Path** ⭐⭐⭐
   - **Source**: war3map.w3t (`ifil`) + Wurst
   - **Impact**: Visual reference
   - **Display**: Internal reference

9. **Scaling Value** ⭐⭐
   - **Source**: war3map.w3t (`isca`) + Wurst
   - **Impact**: Technical detail, less user-facing

10. **Actively Used / Ignore Cooldown** ⭐⭐
    - **Source**: war3map.w3t (`iusa`, `iucd`)
    - **Impact**: Technical detail

### Low Priority

11. **Button Position** ⭐
    - **Source**: war3map.w3t (`ubpx`, `ubpy`)
    - **Impact**: Internal UI positioning, not user-facing

12. **Tinting Colors** ⭐
    - **Source**: war3map.w3t (`uclr`, `uclg`, `uclb`)
    - **Impact**: Visual customization detail

---

## Implementation Strategy

### Phase 1: Extract from war3map.w3t (Easier)

Enhance `extract-from-w3x.mjs` to extract:
- Lumber cost (`ilum`)
- Hit points (`ihpc`)
- Abilities list (`iabi`)
- Hotkey (`uhot`/`ihot`)
- Max stack (`ista`)
- Stock information (`isto`, `istr`)
- Model path (`ifil`)
- Scaling value (`isca`)
- Actively used (`iusa`)
- Ignore cooldown (`iucd`)

### Phase 2: Extract from Wurst Source (More Complex)

Create `extract-item-details-from-wurst.mjs` (similar to `extract-ability-details-from-wurst.mjs`) to extract:
- Stat bonuses from `CustomItemType` instances
- Additional properties from `CustomItemDefinition` instances
- Item constant mappings from `LocalObjectIDs.wurst`

### Phase 3: Merge and Convert

Update `item-converter.mjs` to:
- Merge extracted W3T data with Wurst data
- Convert stat bonuses to TypeScript format
- Map abilities to ability names (if available)

### Phase 4: Type System Updates

Update `src/types/items.ts` to include:
- `stats` object with all stat bonuses
- `lumberCost` field
- `abilities` array
- `hotkey` field
- `hitPoints` field
- `maxStack` field
- `stockMaximum` and `stockReplenishInterval` fields

---

## Example Enhanced Item Data Structure

```typescript
export type ItemData = {
  id: string;
  name: string;
  category: ItemCategory;
  subcategory?: ItemSubcategory;
  description: string;
  tooltip?: string;
  recipe?: string[];
  craftedAt?: string;
  mixingPotManaRequirement?: number;
  iconPath?: string;
  
  // NEW: Cost information
  cost?: number; // Gold cost (existing)
  lumberCost?: number; // NEW
  
  // NEW: Usage information
  hotkey?: string; // NEW
  uses?: number; // Charges (existing)
  hitPoints?: number; // NEW
  maxStack?: number; // NEW
  
  // NEW: Stock information
  stockMaximum?: number; // NEW
  stockReplenishInterval?: number; // NEW
  
  // NEW: Abilities
  abilities?: string[]; // NEW: List of ability IDs/names granted by item
  
  // Enhanced stats
  stats?: {
    damage?: number;
    armor?: number;
    health?: number;
    mana?: number;
    strength?: number;
    agility?: number;
    intelligence?: number;
    attackSpeed?: number; // NEW
    other?: string[];
  };
};
```

---

## Next Steps

1. ✅ Create this exploration document
2. ⏳ Enhance `extract-from-w3x.mjs` to extract additional W3T fields
3. ⏳ Create `extract-item-details-from-wurst.mjs` for stat bonuses
4. ⏳ Update `item-converter.mjs` to merge and convert new fields
5. ⏳ Update TypeScript types to include new fields
6. ⏳ Test with sample items
7. ⏳ Update UI components to display new fields

