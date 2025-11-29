# Ability Data Extraction - Investigation & Improvement Opportunities

## Executive Summary

This document explores what ability data is currently extracted and what additional data could be captured from:
1. **Source files** (`island-troll-tribes/wurst/`) - Wurst source code
2. **Decompiled files** (`external/Work/`) - Compiled game data (war3map.w3a, war3map.j)

## Currently Extracted Data

### From `extract-from-w3x.mjs` (war3map.w3a):
- ✅ **Basic Info**: `id`, `name`, `description`, `tooltip`, `icon`
- ✅ **Type Flags**: `hero`, `item`, `race`
- ✅ **Basic Stats**: `manaCost`, `cooldown`, `range`, `duration`, `damage` (limited fields)
- ✅ **Raw modifications**: Full array of all field modifications

### From `extract-metadata.mjs` (Wurst source):
- ✅ **Category mapping**: Ability to class/category (hunter, mage, priest, etc.)
- ✅ **Ability ID constants**: LocalObjectIDs_ABILITY_* mappings

### From `ability-converter.mjs`:
- ✅ Converts to TypeScript format with: `id`, `name`, `category`, `classRequirement`, `description`, `tooltip`, `iconPath`, `manaCost`, `cooldown`, `range`, `duration`, `damage`

---

## Additional Data Available in Wurst Source Files

### 1. **Detailed Ability Properties** (from ability definition files)

#### Example: `FlameSpray.wurst`
```wurst
let DAMAGE = 20.
let MANACOST = 10
let COOLDOWN = 30.
let AREA_OF_EFFECT = 600.
this.setAreaofEffect(1, AREA_OF_EFFECT)
this.setMaximumNumberofTargets(1, 4)
this.setDamagePerTarget(1, DAMAGE)
this.setMissileHomingEnabled(true)
this.setMissileArt(Abilities.fireBallMissile)
```

**Extractable Properties:**
- ✅ **Area of Effect** (AOE) - Currently missing
- ✅ **Maximum Targets** - Currently missing
- ✅ **Damage per Target** - More specific than generic "damage"
- ✅ **Missile Properties**: Homing enabled, missile art/model
- ✅ **Art Effects**: Caster, target, area effects
- ✅ **Button Position**: X/Y coordinates for UI
- ✅ **Hotkey**: Keyboard shortcut
- ✅ **Target Types**: Unit, item, terrain, point, etc.
- ✅ **Targets Allowed**: Specific allowed targets
- ✅ **Follow Through Time**: Cast animation duration
- ✅ **Animation Names**: Cast animations
- ✅ **Attachment Points**: Visual effect attachment points

#### Example: `Sniff.wurst`
```wurst
let CAST_RANGE = 0
let COOLDOWN = 3.
let MANACOST = 0
let TRAIL_DURATION = 300.
let TRACK_DURATION = 15.
this.setAreaofEffect(1, AOE)
this.setFollowThroughTime(1, 1)
this.setBaseOrderID(1, "cripple")
```

**Additional Properties:**
- ✅ **Cast Range** (separate from range)
- ✅ **Multiple Durations**: Trail duration, track duration, etc.
- ✅ **Base Order ID**: The order/command used
- ✅ **Follow Through Time**: Post-cast delay

### 2. **Ability Relationships** (from TrollUnitTextConstant.wurst)

**Extractable:**
- ✅ **Spell Lists by Class**: `HERO_SPELLS_HUNTER`, `NORMAL_SPELLS_MAGE`, etc.
- ✅ **Inherited Spells**: `SUB_MAGE_INHERITED_SPELL`, `SS_MAGE_INHERITED_SPELL`
- ✅ **Spellbook Contents**: Which abilities are in which spellbooks
- ✅ **Class Progression**: Which abilities unlock at which class level
- ✅ **Ability Prerequisites**: Which abilities unlock other abilities

### 3. **Ability Constants & IDs** (from LocalObjectIDs.wurst)

**Extractable:**
- ✅ **All ABILITY_* constants**: Complete list of all ability IDs
- ✅ **Ability naming conventions**: Standardized naming patterns

### 4. **Tooltip Data** (from ToolTipsUtils.wurst)

**Extractable:**
- ✅ **Tooltip formatting patterns**: How tooltips are constructed
- ✅ **Data field references**: `<{abilId},{fieldId}>` patterns
- ✅ **Color coding**: How colors are applied to tooltips
- ✅ **Dynamic values**: How values are inserted into tooltips

---

## Additional Data Available in war3map.w3a (Decompiled)

### Standard Warcraft 3 Ability Fields

The `war3map.w3a` file contains many more fields than currently extracted. Here are the key missing fields:

#### **Combat & Damage Fields:**
- `ahd1`, `ahd2`, `ahd3` - Hero damage per level
- `ahd4`, `ahd5`, `ahd6` - Additional damage fields
- `aare` - Area of effect
- `atar` - Targets allowed
- `acat` - Casting time
- `acap` - Maximum number of targets
- `adur` - Duration (already extracted but could check all levels)
- `ahdu` - Hero duration

#### **Mana & Cooldown Fields:**
- `amcs` - Mana cost (already extracted)
- `amc1`, `amc2`, `amc3` - Mana cost per level
- `acdn` - Cooldown (already extracted)
- `acd1`, `acd2`, `acd3` - Cooldown per level

#### **Range & Targeting Fields:**
- `aran` - Range (already extracted)
- `arng` - Range (alternative field)
- `aani` - Animation names
- `aart` - Art (icon/model)
- `atar` - Targets allowed
- `ata1`, `ata2` - Target types

#### **Visual & Effect Fields:**
- `aef1`, `aef2`, `aef3` - Effect art
- `aub1`, `aub2`, `aub3` - Tooltip extended (already extracted)
- `aube` - Tooltip extended (alternative)
- `aher` - Hero ability flag (already extracted)
- `aite` - Item ability flag (already extracted)

#### **Level-Specific Data:**
Currently only extracting level 0 data. Many abilities have multiple levels with different:
- Damage per level
- Mana cost per level
- Cooldown per level
- Duration per level
- Range per level

#### **Special Ability Type Fields:**
Different ability types have specific fields:
- **Channel abilities**: `acf1`, `acf2` - Channel time
- **Aura abilities**: `aau1`, `aau2` - Aura radius, targets
- **Passive abilities**: `apf1`, `apf2` - Passive effect data
- **Buff abilities**: `abf1`, `abf2` - Buff duration, effects

---

## Additional Data Available in war3map.j (Decompiled JASS)

### 1. **Ability Object Creation**

**Extractable:**
- ✅ **Custom ability constructors**: How abilities are created programmatically
- ✅ **Ability initialization**: Setup code for abilities
- ✅ **Ability relationships**: Which abilities are linked to items/units

### 2. **Ability Constants**

**Extractable:**
- ✅ **LocalObjectIDs_ABILITY_***: All ability ID constants
- ✅ **Ability aliases**: Alternative names/IDs for abilities
- ✅ **Ability groups**: Collections of related abilities

### 3. **Ability Usage in Code**

**Extractable:**
- ✅ **Ability triggers**: When abilities are used
- ✅ **Ability effects**: What happens when abilities are cast
- ✅ **Ability interactions**: How abilities interact with other systems

---

## Recommended Improvements

### Priority 1: High-Value, Easy to Extract

1. **Area of Effect (AOE)**
   - **Source**: Wurst files (`setAreaofEffect`)
   - **Use**: Display radius for AOE abilities
   - **Display**: "Affects units within 600 range"

2. **Maximum Targets**
   - **Source**: Wurst files (`setMaximumNumberofTargets`)
   - **Use**: Show multi-target capabilities
   - **Display**: "Hits up to 4 targets"

3. **Hotkey**
   - **Source**: Wurst files (`setHotkeyNormal`)
   - **Use**: Show keyboard shortcuts
   - **Display**: "Hotkey: W"

4. **Target Types**
   - **Source**: Wurst files (`presetTargetTypes`, `presetTargetsAllowed`)
   - **Use**: Show what can be targeted
   - **Display**: "Target: Units, Items, Terrain"

5. **Level-Specific Data**
   - **Source**: war3map.w3a (extract all levels, not just level 0)
   - **Use**: Show scaling per level
   - **Display**: "Level 1: 20 damage, Level 2: 40 damage"

### Priority 2: Medium-Value, Moderate Effort

6. **Ability Relationships**
   - **Source**: TrollUnitTextConstant.wurst (spell lists)
   - **Use**: Show which class gets which abilities
   - **Display**: "Available to: Hunter, Warrior, Tracker"

7. **Spellbook Contents**
   - **Source**: TrollUnitTextConstant.wurst
   - **Use**: Show which abilities are in spellbooks
   - **Display**: "Part of: Mage Spellbook"

8. **Cast Range vs Effect Range**
   - **Source**: Wurst files (separate fields)
   - **Use**: Distinguish between cast range and AOE
   - **Display**: "Cast Range: 600, Effect Range: 300"

9. **Animation & Visual Effects**
   - **Source**: Wurst files (`setMissileArt`, `setArtEffect`)
   - **Use**: Show visual effects
   - **Display**: "Effect: Fireball missile"

10. **Order/Command ID**
    - **Source**: Wurst files (`setBaseOrderID`)
    - **Use**: Technical reference
    - **Display**: "Order: cripple"

### Priority 3: Lower-Value, Higher Effort

11. **Ability Prerequisites**
    - **Source**: TrollUnitTextConstant.wurst (spell progression)
    - **Use**: Show unlock requirements
    - **Display**: "Requires: Level 2 Mage"

12. **Inherited Abilities**
    - **Source**: TrollUnitTextConstant.wurst
    - **Use**: Show which abilities carry over to subclasses
    - **Display**: "Inherited by: Elementalist, Hypnotist"

13. **Dynamic Tooltip Parsing**
    - **Source**: ToolTipsUtils.wurst + war3map.w3a
    - **Use**: Resolve `<{abilId},{fieldId}>` references
    - **Display**: Replace placeholders with actual values

14. **Ability Interactions**
    - **Source**: war3map.j (code analysis)
    - **Use**: Show synergies and interactions
    - **Display**: "Synergizes with: Track ability"

15. **Channel/Charge Time**
    - **Source**: war3map.w3a (`acf1`, `acf2`)
    - **Use**: Show casting time
    - **Display**: "Channel Time: 2 seconds"

---

## Implementation Recommendations

### Phase 1: Extract from Wurst Source Files

Create a new script: `scripts/data/extract-ability-details-from-wurst.mjs`

**Extract:**
- Parse Wurst ability files for constants (DAMAGE, MANACOST, COOLDOWN, etc.)
- Extract method calls (`setAreaofEffect`, `setMaximumNumberofTargets`, etc.)
- Map ability IDs to detailed properties

**Output:**
```json
{
  "ability-flame-spray": {
    "damage": 20,
    "manaCost": 10,
    "cooldown": 30,
    "areaOfEffect": 600,
    "maxTargets": 4,
    "hotkey": "W",
    "targetTypes": ["unit"],
    "missileArt": "fireBallMissile",
    "buttonPosition": { "x": 1, "y": 0 }
  }
}
```

### Phase 2: Enhance war3map.w3a Extraction

Modify `extract-from-w3x.mjs` to extract:
- All ability levels (not just level 0)
- Additional fields (AOE, targets, etc.)
- Level-specific scaling

**Enhancement:**
```javascript
// Extract all levels
const getFieldAllLevels = (fieldId) => {
  const levels = {};
  for (let level = 0; level <= 10; level++) {
    const field = modifications.find(m => m.id === fieldId && m.level === level);
    if (field) {
      levels[level] = field.value;
    }
  }
  return Object.keys(levels).length > 0 ? levels : undefined;
};
```

### Phase 3: Merge Data Sources

Create `scripts/data/merge-ability-data.mjs` to:
- Combine Wurst source data with war3map.w3a data
- Prioritize Wurst data (more accurate) over decompiled data
- Fill in gaps from war3map.w3a when Wurst data unavailable

### Phase 4: Update TypeScript Types

Extend `AbilityData` type to include:
```typescript
export type AbilityData = {
  // ... existing fields ...
  areaOfEffect?: number;
  maxTargets?: number;
  hotkey?: string;
  targetTypes?: string[];
  castRange?: number;
  levels?: {
    [level: number]: {
      damage?: number;
      manaCost?: number;
      cooldown?: number;
      // ... other level-specific fields
    };
  };
  missileArt?: string;
  artEffects?: {
    caster?: string;
    target?: string;
    area?: string;
  };
  buttonPosition?: { x: number; y: number };
  orderId?: string;
  availableToClasses?: string[];
  spellbook?: string;
  prerequisites?: string[];
};
```

---

## Example: Enhanced Ability Display

### Current Display:
```
Flame Spray
Mage Ability
Mana: 10 | Cooldown: 30s | Range: 600
Shoots fire bolt at nearby enemies dealing damage.
```

### Enhanced Display:
```
Flame Spray [W]
Mage Ability | Hotkey: W
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mana: 10 | Cooldown: 30s | Range: 600
Area of Effect: 600 | Max Targets: 4
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Shoots fire bolt at nearby enemies dealing 20 damage.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Available to: Mage, Elementalist, Hypnotist, Dreamwalker
Part of: Mage Spellbook (Level 2)
Effect: Fireball missile (homing)
```

---

## Files to Modify/Create

1. **New**: `scripts/data/extract-ability-details-from-wurst.mjs`
   - Parse Wurst ability files
   - Extract detailed properties

2. **Modify**: `scripts/data/extract-from-w3x.mjs`
   - Extract additional fields from war3map.w3a
   - Extract all ability levels

3. **New**: `scripts/data/merge-ability-data.mjs`
   - Merge Wurst and war3map.w3a data
   - Create unified ability dataset

4. **Modify**: `scripts/data/converters/ability-converter.mjs`
   - Include new fields in conversion
   - Handle level-specific data

5. **Modify**: `src/features/modules/guides/data/abilities/types.ts`
   - Extend AbilityData type

6. **New**: `scripts/data/extract-ability-relationships.mjs`
   - Extract spell lists from TrollUnitTextConstant.wurst
   - Map abilities to classes and spellbooks

---

## Conclusion

There is significant opportunity to extract much more detailed ability data from both the Wurst source files and the decompiled game files. The most valuable additions would be:

1. **Area of Effect** - Critical for understanding ability range
2. **Maximum Targets** - Important for multi-target abilities
3. **Hotkey** - Useful for players
4. **Level-specific data** - Shows ability scaling
5. **Ability relationships** - Shows which classes get which abilities

These improvements would make the ability data much more useful for players browsing the website.



