# Data Extraction Results

## Summary

Successfully extracted data for all three categories from the game source code:

### ✅ Abilities - 494 extracted
- **File**: `abilities.json`
- **Categories found**:
  - basic: 5
  - beastmaster: 50
  - gatherer: 12
  - hunter: 27
  - mage: 33
  - priest: 10
  - scout: 20
  - subclass: 2
  - superclass: 9
  - thief: 2
  - unknown: 324 (need categorization refinement)

**Note**: Many abilities are categorized as "unknown" because they don't follow the standard directory structure. These can be manually categorized or the extraction script can be refined.

### ✅ Buildings - 9 extracted
- **File**: `buildings.json`
- **Buildings found**:
  1. Storage Hut
  2. Forge (with craftable items)
  3. Armory (with craftable items)
  4. Hatchery
  5. Smoke House
  6. Workshop (with craftable items)
  7. Mixing Pot
  8. Tannery (with craftable items)
  9. Witch Doctors Hut (with craftable items)

**Note**: Some buildings have craftable items extracted, but HP and armor stats need refinement in the extraction script.

### ✅ Units/Trolls - 43 extracted
- **File**: `units.json`
- **Units by type**:
  - base: 7 (Hunter, Mage, Priest, Thief, Scout, Gatherer, Beastmaster)
  - subclass: 24 (Warrior, Tracker, Elementalist, Hypnotist, Dreamwalker, Booster, Master Healer, Rogue, Telethief, Contortionist, Escape Artist, Observer, Trapper, Radar Gatherer, Herb Master, Shapeshifter variants, Druid, etc.)
  - superclass: 7 (Juggernaut, Assassin, Sage, Dementia Master, Jungle Tyrant, Omnigatherer, Spy)
  - unknown: 5

**Note**: All units have attribute growth data (strength, agility, intelligence). Base stats (HP, mana, attack speed, move speed) extraction needs refinement.

## Next Steps

1. **Refine extraction scripts**:
   - Improve ability categorization (reduce "unknown" count)
   - Extract building HP/armor stats more accurately
   - Extract unit base stats (HP, mana, attack speed, move speed) more accurately

2. **Compare with existing website data**:
   - Compare extracted abilities with `src/features/ittweb/guides/data/abilities.ts`
   - Compare extracted buildings with building items in `items.buildings.ts`
   - Compare extracted units with `src/features/ittweb/guides/data/classes.ts`

3. **Integrate extracted data**:
   - Update website TypeScript files with extracted data
   - Fill in missing information
   - Correct any discrepancies

## Files Created

- `external/scripts/extract_abilities.py` - Ability extraction script
- `external/scripts/extract_buildings.py` - Building extraction script
- `external/scripts/extract_units.py` - Unit/troll extraction script
- `abilities.json` - Extracted abilities data
- `buildings.json` - Extracted buildings data
- `units.json` - Extracted units data


