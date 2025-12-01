# Field References in Tooltips

## Issue

Some tooltips contain placeholders like `<AM2w,DataA1>`, `<A0EJ,DataA1,%>%`, etc. These are Warcraft 3 object data field references that point to values in the base game object definitions.

## Format

- `<FieldID,Level>` - References a field value
  - `FieldID`: 4-character field code (e.g., `AM2w`, `A0EJ`, `AIs6`)
  - `Level`: Data level (e.g., `DataA1`, `DataB1`, `DataC1`)
  - Optional suffix: `,` followed by text (e.g., `,%>%` adds a % sign)

## Why They Can't Be Resolved

The extracted `.w3x` file only contains **modifications** to base game objects, not the base object data itself. References like `<AM2w,DataA1>` point to fields in the base Warcraft 3 ability/item definitions, which aren't included in the map file.

## Common Field References Found

- `A0EJ`, `A0EK`, `A0EL` - Ability effect values
- `AM2w`, `AM2z`, `AMem`, `AMep` - Armor/stat modifications
- `AIs6` - Strength modifications
- `AIti` - Damage modifications
- `AM3b`, `AMd5`, `AMdc`, `AMdd` - Various stat fields

## Solutions

### Option 1: Manual Mapping
Create a mapping file with common field values based on game knowledge or testing.

### Option 2: Extract Base Object Data
If you have access to base Warcraft 3 object data files, we could extract those and resolve references.

### Option 3: Leave as Placeholders
Keep the references visible so users know what data is missing. They can be manually filled in later.

## Field Identifier Meanings

**See detailed documentation**: [`ability-field-identifiers.md`](./ability-field-identifiers.md)

**Related documentation**: See [`../../troubleshooting.md`](../troubleshooting.md) for resolving field reference issues.

### Quick Reference

- `Cool1` - Cooldown (Level 1)
- `Dur1` - Duration (Level 1)
- `HeroDur1` - Hero Duration (Level 1)
- `DataA1` - Primary data field (context-dependent: attack speed, damage, armor, etc.)
- `DataB1` - Secondary data field (context-dependent: intelligence, poison %, etc.)
- `DataC1` - Tertiary data field (context-dependent: strength, tertiary effects, etc.)

**Note**: `DataA1`, `DataB1`, and `DataC1` are highly context-dependent - they represent different properties depending on the ability type. See the detailed documentation for examples.

## Current Status

The resolver script (`scripts/data/generate/resolve-field-references.mjs`) is part of the data generation pipeline (Stage 9). It resolves field references by:
1. Loading the ability ID mapper to convert raw ability IDs to ability slugs
2. Looking up cooldown/duration values from the same object's definition
3. Replacing field references with actual values when found
4. Leaving placeholders as-is if values cannot be resolved

The script runs automatically as part of the full pipeline (`node scripts/data/main.mjs`) or can be run individually. Note that some references may remain unresolved because they point to base game data not included in the map file modifications.

## Source of Field Identifier Information

The field identifier meanings were extracted from the Wurst source code:
- `external/island-troll-tribes/wurst/utils/ToolTipsUtils.wurst` - Core tooltip utility functions
- `external/island-troll-tribes/wurst/objects/items/*.wurst` - Item definitions showing field usage

This information shows how the game developers used these field references in tooltips.

