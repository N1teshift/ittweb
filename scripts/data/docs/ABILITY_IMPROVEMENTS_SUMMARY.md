# Ability Data - Available Fields

_Last updated: 2025-01-27_

## What's Currently Extracted

✅ **Basic info**: name, description, tooltip, icon  
✅ **Type flags**: hero, item, race  
✅ **Basic stats**: manaCost, cooldown, range, duration, damage  
✅ **Category mapping**: class associations (hunter, mage, etc.)  
✅ **Area of Effect (AOE)** - Extracted from `aare` field in war3map.w3a  
✅ **Maximum Targets** - Extracted from `acap` field in war3map.w3a  
✅ **Hotkey** - Extracted from `ahky` field in war3map.w3a  
✅ **Targets Allowed** - Extracted from `atar` field in war3map.w3a  
✅ **Level-Specific Data** - All levels (0, 1, 2, etc.) extracted from war3map.w3a  
✅ **Available to Classes** - Extracted from Wurst relationship files  
✅ **Spellbook** - Extracted from Wurst relationship files  
✅ **Visual Effects** - Partial (attachment points, missile art)

## Data Sources

The ability data is extracted from multiple sources and merged:

1. **`extract/extract-from-w3x.mjs`** - Extracts raw ability data from `war3map.w3a` (AOE, maxTargets, hotkey, targetsAllowed, level-specific stats)
2. **`extract/extract-ability-details-from-wurst.mjs`** - Extracts detailed properties from Wurst source files
3. **`extract/extract-ability-relationships.mjs`** - Extracts class and spellbook relationships from Wurst constants
4. **`convert/convert-extracted-to-typescript.mjs`** - Merges all sources and generates TypeScript data files

The final TypeScript data files are located in `src/features/modules/guides/data/abilities/`.

## Potential Future Enhancements

1. **Cast Range vs Effect Range** - Distinguish `aran` (cast) from `aare` (effect)
2. **Button Position** - UI layout reference (low priority)
3. **Enhanced Visual Effects** - More detailed art effect extraction

## Related Documentation

- **Pipeline documentation**: `../README.md` (how to run the pipeline)
- **UI implementation**: `WEBSITE_ENHANCEMENT_GUIDE.md` (what's displayed in the UI)
- **Historical refactoring notes**: Archived in `docs/archive/scripts-data/REFACTORING_PLAN.md`



