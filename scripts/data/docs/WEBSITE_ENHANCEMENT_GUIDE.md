# Website Enhancement Guide - Ability Data Features

_Last updated: 2025-01-27_

## 🎯 Available Data Fields

The following fields are extracted and available in the ability data. Most are already displayed in the UI.

### 1. **Area of Effect (AOE)**
- **Field**: `areaOfEffect?: number`
- **What it is**: The radius in which the ability affects units
- **Example**: Flame Spray has AOE of 600, meaning it hits all enemies within 600 range
- **Use case**: Show players the effective range of AOE abilities

### 2. **Maximum Targets**
- **Field**: `maxTargets?: number`
- **What it is**: Maximum number of units the ability can hit
- **Example**: Flame Spray can hit up to 4 targets
- **Use case**: Help players understand multi-target capabilities

### 3. **Hotkey**
- **Field**: `hotkey?: string`
- **What it is**: Keyboard shortcut to cast the ability
- **Example**: "W" for Flame Spray
- **Use case**: Show players the keyboard shortcut for quick reference

### 4. **Targets Allowed**
- **Field**: `targetsAllowed?: string`
- **What it is**: What can be targeted (units, items, terrain, etc.)
- **Example**: "unit", "item", "terrain", "self"
- **Use case**: Clarify targeting restrictions

### 5. **Level-Specific Data**
- **Field**: `levels?: { [level: number]: { damage?, manaCost?, cooldown?, duration?, range?, areaOfEffect? } }`
- **What it is**: How the ability scales with levels
- **Example**: Level 1 does 20 damage, Level 2 does 40 damage
- **Use case**: Show ability progression and scaling

### 6. **Available to Classes**
- **Field**: `availableToClasses?: string[]`
- **What it is**: Which classes can learn this ability
- **Example**: ["mage", "elementalist", "hypnotist", "dreamwalker"]
- **Use case**: Filter abilities by class, show class requirements

### 7. **Spellbook**
- **Field**: `spellbook?: string`
- **What it is**: Which spellbook contains this ability ("hero" or "normal")
- **Example**: "normal" for regular abilities, "hero" for hero abilities
- **Use case**: Organize abilities by spellbook type

### 8. **Visual Effects**
- **Field**: `visualEffects?: { missileArt?, attachmentPoints?, artEffect?, artTarget?, artCaster? }`
- **What it is**: Visual effect information
- **Example**: Fireball missile, attachment points for effects
- **Use case**: Show visual effect details (advanced/technical info)

### 9. **Cast Time**
- **Field**: `castTime?: string`
- **What it is**: Time required to cast the ability
- **Use case**: Show casting requirements

---

## 🚀 Current UI Implementation

### ✅ Already Implemented

**Ability Cards** (`src/pages/guides/abilities.tsx`):
- ✅ AOE badge displayed
- ✅ Max targets badge displayed  
- ✅ Hotkey badge displayed
- ✅ Available to classes count shown
- ✅ Category badges shown

**Ability Detail Page** (`src/pages/guides/abilities/[id].tsx`):
- ✅ AOE stat displayed
- ✅ Max targets stat displayed
- ✅ Hotkey displayed
- ✅ Level scaling data displayed
- ✅ Available to classes list shown
- ✅ Spellbook badge displayed

### ⏳ Potential Future Enhancements

1. **Class-specific filtering** - Add filter dropdown for `availableToClasses` (currently only category filter exists)
2. **Enhanced search** - Search by hotkey or class name in addition to name/description
3. **Visual effects display** - Show more detailed visual effects information if available
4. **Targets allowed badge** - Add to ability cards (currently only shown on detail page)

---

## 📊 Implementation Status Summary

| Feature | Status | Location |
|---------|--------|----------|
| AOE/Max Targets/Hotkey badges | ✅ Implemented | `src/pages/guides/abilities.tsx` |
| Level scaling display | ✅ Implemented | `src/pages/guides/abilities/[id].tsx` |
| Class availability display | ✅ Implemented | `src/pages/guides/abilities/[id].tsx` |
| Spellbook badge | ✅ Implemented | `src/pages/guides/abilities/[id].tsx` |
| Enhanced detail page stats | ✅ Implemented | `src/pages/guides/abilities/[id].tsx` |
| Class filtering | ⏳ TODO | Add to `src/pages/guides/abilities.tsx` |
| Enhanced search (hotkey/class) | ⏳ TODO | Enhance search in `src/pages/guides/abilities.tsx` |

---

## 📝 Notes

- All major data fields are extracted and available in TypeScript data files
- Most UI enhancements are already implemented
- Remaining enhancements are optional improvements for better UX

---

## 🔧 Implementation Checklist

- [x] Update TypeScript types ✅ **COMPLETE**
- [x] Add new badges to ability cards ✅ **COMPLETE** (AOE, maxTargets, hotkey displayed)
- [x] Create level scaling display component ✅ **COMPLETE** (levels shown on detail page)
- [ ] Add class filter to abilities page ⏳ **TODO** (category filter exists, but not class-specific)
- [x] Enhance ability detail page with full stats ✅ **COMPLETE** (AOE, maxTargets, hotkey, levels shown)
- [x] Add class availability section ✅ **COMPLETE** (availableToClasses displayed)
- [x] Add spellbook badge ✅ **COMPLETE** (spellbook shown on detail page)
- [ ] Enhance search functionality ⏳ **PARTIAL** (basic search exists, could add hotkey/class search)
- [x] Test with real data after running extraction ✅ **COMPLETE**

---

## 💡 Pro Tips

1. **Progressive Enhancement**: Start with the most visible changes (badges) first
2. **Conditional Rendering**: Only show fields that exist (use optional chaining)
3. **Color Coding**: Use consistent colors for stat types (blue=mana, purple=cooldown, etc.)
4. **Mobile Responsive**: Ensure new UI elements work on mobile
5. **Performance**: Use `useMemo` for filtered lists to avoid re-computation

---

## 🚀 Data Pipeline

To regenerate ability data with all fields:

```bash
node scripts/data/main.mjs
```

This will extract all ability data including AOE, maxTargets, hotkey, levels, availableToClasses, and spellbook information.

## 📚 Related Documentation

- **Pipeline documentation**: `../README.md`
- **Refactoring status**: Archived in `docs/archive/scripts-data/REFACTORING_PLAN.md` (refactoring complete)
- **Ability improvements**: `ABILITY_IMPROVEMENTS_SUMMARY.md`

