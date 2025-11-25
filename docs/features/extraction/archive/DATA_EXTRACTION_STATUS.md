# Data Extraction Status and Opportunities

## Current Status

### ✅ Items - COMPLETE
- **Status**: Full list extracted and integrated
- **Source**: Extracted from `external/wurst/systems/craftingV2/*.wurst` files
- **Data**: 
  - All item recipes with ingredients
  - Crafting station requirements
  - Mixing pot mana requirements
- **Files**: 
  - `recipes.json` (extracted data)
  - `src/features/ittweb/guides/data/items.*.ts` (integrated into website)
- **Total**: ~100+ items with recipes

### ⚠️ Buildings - PARTIAL
- **Current State**: 
  - Building **items** (kits) are in `items.buildings.ts` (e.g., `armory-kit`, `forge-kit`)
  - Building **definitions** (actual building units) are NOT extracted
- **Available in Game Source**:
  - `external/wurst/objects/units/Buildings/` - Contains building unit definitions
  - `external/wurst/systems/entities/buildings/` - Contains building entity classes
  - `UNIT_ARMORY`, `UNIT_FORGE`, `UNIT_WORKSHOP`, `UNIT_TANNERY`, `UNIT_WITCH_DOCTORS_HUT`, etc.
- **What Could Be Extracted**:
  - Building names and descriptions
  - Building costs (if any)
  - Building abilities/functions
  - Building health/armor stats
  - What items can be crafted at each building

### ⚠️ Trolls/Units - PARTIAL
- **Current State**: 
  - Base troll classes are in `classes.ts` (7 base classes: Hunter, Beastmaster, Mage, Priest, Thief, Scout, Gatherer)
  - Subclasses and superclasses are manually maintained
  - Unit stats (growth, base stats) are manually entered
- **Available in Game Source**:
  - `external/wurst/objects/units/` - Contains unit definitions
  - `external/wurst/systems/entities/trolls/` - Contains troll entity classes
  - `UNIT_HUNTER`, `UNIT_MAGE`, `UNIT_PRIEST`, `UNIT_THIEF`, `UNIT_SCOUT`, `UNIT_GATHERER`, `UNIT_BEASTMASTER`
  - Subclasses: `UNIT_WARRIOR`, `UNIT_TRACKER`, `UNIT_ELEMENTALIST`, `UNIT_HYPNOTIST`, `UNIT_DREAMWALKER`, `UNIT_BOOSTER`, `UNIT_MASTER_HEALER`, `UNIT_ROGUE`, `UNIT_TELETHIEF`, `UNIT_CONTORTIONIST`, `UNIT_ESCAPE_ARTIST`, `UNIT_OBSERVER`, `UNIT_TRAPPER`, `UNIT_RADAR_GATHERER`, `UNIT_HERB_MASTER`, `UNIT_ALCHEMIST`, etc.
  - Superclasses: `UNIT_JUGGERNAUT`, `UNIT_ASSASSIN`, `UNIT_SAGE`, `UNIT_DEMENTIA_MASTER`, `UNIT_JUNGLE_TYRANT`, `UNIT_OMNIGATHERER`, `UNIT_SPY`
- **What Could Be Extracted**:
  - Exact stat growth values
  - Base HP, mana, attack speed, move speed
  - All subclass/superclass relationships
  - Unit abilities (which abilities each class gets)
  - Unit requirements/restrictions

### ⚠️ Abilities - PARTIAL
- **Current State**: 
  - Abilities are manually maintained in `abilities.ts`
  - ~100+ abilities with categories, descriptions, mana costs, cooldowns
- **Available in Game Source**:
  - `external/wurst/objects/abilities/` - Contains 200+ ability definition files
  - `external/wurst/assets/LocalObjectIDs.wurst` - Contains all `ABILITY_*` constants
  - Abilities are organized by class (hunter/, mage/, priest/, thief/, scout/, gatherer/, beastmaster/)
- **What Could Be Extracted**:
  - All ability IDs and names
  - Mana costs
  - Cooldowns
  - Damage values
  - Range values
  - Duration values
  - Which classes get which abilities
  - Ability descriptions (if available in code)

## Extraction Opportunities

### 1. Building Definitions Extraction
**Similar to items extraction, we could:**
- Parse `external/wurst/objects/units/Buildings/*.wurst` files
- Extract building unit IDs, names, descriptions
- Extract building stats (health, armor)
- Extract what items can be crafted at each building (from crafting system files)
- Create `buildings.ts` data file

**Script**: Similar to `extract_recipes.py`, create `extract_buildings.py`

### 2. Troll/Unit Definitions Extraction
**Similar to items extraction, we could:**
- Parse `external/wurst/objects/units/TrollUnitFactory.wurst` or similar
- Extract unit IDs, names
- Extract stat growth values (strength, agility, intelligence)
- Extract base stats (HP, mana, attack speed, move speed)
- Extract class relationships (subclasses, superclasses)
- Update `classes.ts` with extracted data

**Script**: Create `extract_units.py`

### 3. Abilities Extraction
**Similar to items extraction, we could:**
- Parse `external/wurst/objects/abilities/*.wurst` files
- Extract ability IDs, names
- Extract ability properties (mana cost, cooldown, range, damage, duration)
- Extract which classes have which abilities
- Update `abilities.ts` with extracted data

**Script**: Create `extract_abilities.py`

## Recommendations

1. **Items**: ✅ Already complete - we have full recipe data extracted and integrated

2. **Buildings**: 🔄 Medium priority
   - Extract building definitions to complement building items
   - Would help show what each building does, its stats, and what it can craft

3. **Trolls/Units**: 🔄 High priority
   - Extract exact stat values to ensure accuracy
   - Extract all subclass/superclass relationships
   - Ensure we have all classes documented

4. **Abilities**: 🔄 High priority
   - Extract all abilities to ensure completeness
   - Extract exact values (mana costs, cooldowns, damage) for accuracy
   - Map abilities to classes automatically

## Next Steps

If you want to proceed with extraction:
1. I can create extraction scripts similar to `extract_recipes.py`
2. Extract the data into JSON files
3. Compare with existing website data
4. Integrate the extracted data into the website

Which would you like to tackle first?


