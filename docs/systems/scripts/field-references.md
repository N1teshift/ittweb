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

## Current Status

The historical resolver script (`scripts/resolve-field-references.mjs`) attempted to resolve references by:
1. Looking in the same object's raw modifications
2. Looking in a global lookup of all extracted fields
3. If not found, leaving the placeholder as-is

_That script is not present in the current repository snapshot; follow `scripts/README.md` if a new resolver is added. For now most references remain unresolved because they point to base game data not in the modifications._

