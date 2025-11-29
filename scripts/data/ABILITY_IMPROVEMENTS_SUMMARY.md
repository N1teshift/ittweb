# Ability Data Extraction - Quick Summary & Action Items

## What's Currently Extracted

✅ Basic info: name, description, tooltip, icon  
✅ Type flags: hero, item, race  
✅ Basic stats: manaCost, cooldown, range, duration, damage (limited)  
✅ Category mapping: class associations (hunter, mage, etc.)

## Top 10 Missing Fields (High Value)

### 1. **Area of Effect (AOE)**
- **Field ID**: `aare` (in raw modifications)
- **Source**: war3map.w3a + Wurst files (`setAreaofEffect`)
- **Display**: "Affects units within 600 range"
- **Priority**: ⭐⭐⭐⭐⭐

### 2. **Maximum Targets**
- **Field ID**: `acap` (in raw modifications)
- **Source**: Wurst files (`setMaximumNumberofTargets`)
- **Display**: "Hits up to 4 targets"
- **Priority**: ⭐⭐⭐⭐⭐

### 3. **Hotkey**
- **Field ID**: `ahky` (in raw modifications)
- **Source**: Wurst files (`setHotkeyNormal`)
- **Display**: "Hotkey: W"
- **Priority**: ⭐⭐⭐⭐

### 4. **Targets Allowed**
- **Field ID**: `atar` (in raw modifications)
- **Source**: Wurst files (`presetTargetsAllowed`)
- **Display**: "Target: Units, Items, Terrain"
- **Priority**: ⭐⭐⭐⭐

### 5. **Level-Specific Data**
- **Field IDs**: All fields have `level` property (0, 1, 2, etc.)
- **Source**: war3map.w3a (extract all levels, not just level 0)
- **Display**: "Level 1: 20 damage, Level 2: 40 damage"
- **Priority**: ⭐⭐⭐⭐

### 6. **Cast Range vs Effect Range**
- **Field IDs**: `aran` (cast range), `aare` (effect range)
- **Source**: war3map.w3a + Wurst files
- **Display**: "Cast Range: 600, Effect Range: 300"
- **Priority**: ⭐⭐⭐

### 7. **Ability Relationships**
- **Source**: `TrollUnitTextConstant.wurst` (HERO_SPELLS_*, NORMAL_SPELLS_*)
- **Display**: "Available to: Hunter, Warrior, Tracker"
- **Priority**: ⭐⭐⭐

### 8. **Spellbook Membership**
- **Source**: `TrollUnitTextConstant.wurst` (spellbook constants)
- **Display**: "Part of: Mage Spellbook"
- **Priority**: ⭐⭐⭐

### 9. **Visual Effects**
- **Field IDs**: `atat`, `ata0`, `ata1` (attachment points)
- **Source**: Wurst files (`setMissileArt`, `setArtEffect`)
- **Display**: "Effect: Fireball missile"
- **Priority**: ⭐⭐

### 10. **Button Position**
- **Source**: Wurst files (`setButtonPositionNormalX/Y`)
- **Display**: Technical reference for UI layout
- **Priority**: ⭐

---

## Quick Implementation Guide

### Step 1: Extract Additional Fields from war3map.w3a

Modify `extract-from-w3x.mjs` to extract:

```javascript
// In extractAbilities() function, add:
const areaOfEffect = getField('aare');
const maxTargets = getField('acap');
const hotkey = getField('ahky');
const targetsAllowed = getField('atar');
const castTime = getField('acat');
const attachmentPoints = modifications
  .filter(m => m.id.startsWith('ata') && m.id !== 'atar')
  .map(m => m.value);

// Extract all levels
const getAllLevels = (fieldId) => {
  const levels = {};
  modifications
    .filter(m => m.id === fieldId)
    .forEach(m => {
      levels[m.level] = m.value;
    });
  return Object.keys(levels).length > 0 ? levels : undefined;
};

const levels = {
  damage: getAllLevels('ahd1'),
  manaCost: getAllLevels('amcs') || getAllLevels('amc1'),
  cooldown: getAllLevels('acdn') || getAllLevels('acd1'),
  duration: getAllLevels('adur'),
  range: getAllLevels('aran'),
};
```

### Step 2: Extract from Wurst Source Files

Create `extract-ability-details-from-wurst.mjs`:

```javascript
// Parse Wurst ability files
const abilityFiles = glob('island-troll-tribes/wurst/objects/abilities/**/*.wurst');

for (const file of abilityFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  
  // Extract constants
  const damage = extractConstant(content, 'DAMAGE');
  const manaCost = extractConstant(content, 'MANACOST');
  const cooldown = extractConstant(content, 'COOLDOWN');
  const aoe = extractConstant(content, 'AREA_OF_EFFECT') || extractConstant(content, 'AOE');
  const hotkey = extractMethodCall(content, 'setHotkeyNormal');
  const maxTargets = extractMethodCall(content, 'setMaximumNumberofTargets');
  
  // Extract ability ID from class name or constant
  const abilityId = extractAbilityId(content);
  
  abilities[abilityId] = {
    damage, manaCost, cooldown, aoe, hotkey, maxTargets
  };
}
```

### Step 3: Extract Ability Relationships

Create `extract-ability-relationships.mjs`:

```javascript
// Parse TrollUnitTextConstant.wurst
const content = fs.readFileSync('island-troll-tribes/wurst/objects/units/TrollUnitTextConstant.wurst', 'utf-8');

// Extract spell lists
const spellListRegex = /(?:HERO_SPELLS|NORMAL_SPELLS)_([A-Z_]*)\s*=\s*commaList\(([^)]+)\)/g;

const relationships = {};

let match;
while ((match = spellListRegex.exec(content)) !== null) {
  const className = match[1];
  const abilityList = match[2]
    .split(',')
    .map(a => a.trim().replace(/^ABILITY_/, '').toLowerCase().replace(/_/g, '-'));
  
  for (const ability of abilityList) {
    if (!relationships[ability]) {
      relationships[ability] = { classes: [], spellbooks: [] };
    }
    relationships[ability].classes.push(className.toLowerCase());
  }
}
```

### Step 4: Update TypeScript Types

Modify `src/features/modules/guides/data/abilities/types.ts`:

```typescript
export type AbilityData = {
  // ... existing fields ...
  areaOfEffect?: number;
  maxTargets?: number;
  hotkey?: string;
  targetsAllowed?: string[];
  castTime?: number;
  levels?: {
    [level: number]: {
      damage?: number;
      manaCost?: number;
      cooldown?: number;
      duration?: number;
      range?: number;
    };
  };
  availableToClasses?: string[];
  spellbook?: string;
  visualEffects?: {
    missileArt?: string;
    attachmentPoints?: string[];
  };
};
```

---

## Example Enhanced Output

### Before:
```json
{
  "id": "flame-spray",
  "name": "Flame Spray",
  "manaCost": 10,
  "cooldown": 30,
  "range": 600
}
```

### After:
```json
{
  "id": "flame-spray",
  "name": "Flame Spray",
  "manaCost": 10,
  "cooldown": 30,
  "range": 600,
  "areaOfEffect": 600,
  "maxTargets": 4,
  "hotkey": "W",
  "targetsAllowed": ["unit"],
  "levels": {
    "1": {
      "damage": 20,
      "manaCost": 10,
      "cooldown": 30
    }
  },
  "availableToClasses": ["mage", "elementalist", "hypnotist", "dreamwalker"],
  "spellbook": "mage-spellbook",
  "visualEffects": {
    "missileArt": "fireBallMissile"
  }
}
```

---

## Files to Modify

1. ✅ `scripts/data/extract-from-w3x.mjs` - Add field extraction
2. ✅ `scripts/data/extract-ability-details-from-wurst.mjs` - NEW: Parse Wurst files
3. ✅ `scripts/data/extract-ability-relationships.mjs` - NEW: Extract relationships
4. ✅ `scripts/data/converters/ability-converter.mjs` - Include new fields
5. ✅ `src/features/modules/guides/data/abilities/types.ts` - Update types

---

## Next Steps

1. **Start with war3map.w3a fields** (easiest, most data)
   - Extract `aare`, `acap`, `ahky`, `atar`, `acat`
   - Extract all levels for existing fields

2. **Then add Wurst source parsing** (more accurate, more work)
   - Parse ability files for constants
   - Extract method calls for properties

3. **Finally add relationships** (nice to have)
   - Map abilities to classes
   - Map abilities to spellbooks

See `ABILITY_DATA_EXPLORATION.md` for detailed field reference and examples.



