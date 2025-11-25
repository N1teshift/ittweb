# Roadmap to 100% Data Completeness

## Current Status: ~85-90% Complete

This document outlines the steps needed to achieve 100% data completeness for all entities.

---

## 🎯 Priority Tasks

### 1. **Improve Ability Descriptions** (High Priority)
**Current Issue**: Many abilities have placeholder text "Ability extracted from game source."

**Solution**:
- Extract ability tooltips/descriptions from game source WurstScript files
- Look for `setTooltipBasic()` and `setTooltipExtended()` calls in ability definitions
- Parse and integrate these descriptions into `abilities.ts`

**Files to Check**:
- `external/wurst/objects/abilities/*.wurst`
- Look for `AbilityDefinition` objects with tooltip setters

**Estimated Work**: Medium
**Impact**: High - Improves user experience significantly

---

### 2. **Integrate Remaining Abilities** (Medium Priority)
**Current Issue**: 245 additional abilities available but not integrated

**Solution**:
- Review `external/new_abilities.ts` for high-quality abilities
- Filter out placeholders and dummy abilities
- Add remaining useful abilities to `abilities.ts`
- Focus on abilities with complete data (mana cost, cooldown, etc.)

**Estimated Work**: Low-Medium
**Impact**: Medium - Increases ability coverage

---

### 3. **Complete Item Stat Information** (Medium Priority)
**Current Issue**: Some items missing complete stat information

**Solution**:
- Review items without stats
- Extract stat information from game source item definitions
- Look for `setDamageBase()`, `setArmorBase()`, `setHitPointsBonus()`, etc.
- Update items in category files (`items.weapons.ts`, `items.armor.ts`, etc.)

**Files to Check**:
- `external/wurst/systems/craftingV2/*.wurst`
- `external/wurst/objects/items/*.wurst`

**Estimated Work**: Medium
**Impact**: Medium - Completes item data

---

### 4. **Enhance Building Data** (Low Priority)
**Current Issue**: Some buildings may have incomplete craftable items lists

**Solution**:
- Verify all craftable items are listed for each building
- Extract building abilities/special functions
- Ensure building construction recipes are complete (already in items.buildings.ts)

**Estimated Work**: Low
**Impact**: Low - Buildings are mostly complete

---

### 5. **Add Class-Specific Details** (Low Priority)
**Current Issue**: Could add more class-specific tips and strategies

**Solution**:
- Expand tips arrays for base classes
- Add subclass/superclass specific tips
- Document class synergies and strategies

**Estimated Work**: Low
**Impact**: Low - Nice to have, but not critical

---

## 🔧 Implementation Plan

### Phase 1: Extract Ability Descriptions (Week 1)
1. Create script to extract tooltips from ability definitions
2. Parse `setTooltipBasic()` and `setTooltipExtended()` calls
3. Map tooltips to ability IDs
4. Update `abilities.ts` with real descriptions

**Script**: `external/scripts/extract_ability_descriptions.py`

### Phase 2: Integrate Remaining Abilities (Week 1-2)
1. Review `external/new_abilities.ts`
2. Filter for high-quality abilities
3. Batch add to `abilities.ts`
4. Verify no duplicates

### Phase 3: Complete Item Stats (Week 2)
1. Create script to extract item stats from definitions
2. Identify items missing stats
3. Update item data files
4. Verify stat accuracy

### Phase 4: Polish & Verification (Week 2-3)
1. Review all data for completeness
2. Fix any inconsistencies
3. Verify against game source
4. Update documentation

---

## 📋 Detailed Task Breakdown

### Task 1.1: Extract Ability Tooltips
```python
# external/scripts/extract_ability_descriptions.py
# - Find all AbilityDefinition objects
# - Extract setTooltipBasic() and setTooltipExtended()
# - Map to ability IDs
# - Generate update script for abilities.ts
```

### Task 1.2: Update Ability Descriptions
- Replace placeholder descriptions with extracted tooltips
- Format descriptions properly
- Handle special characters and formatting

### Task 2.1: Review Remaining Abilities
- Filter `external/new_abilities.ts` for:
  - Abilities with complete data
  - Non-placeholder names
  - Useful abilities (not dummies)
- Estimate: ~50-100 additional abilities worth adding

### Task 2.2: Integrate Abilities
- Add filtered abilities to `abilities.ts`
- Ensure proper categorization
- Verify no duplicates

### Task 3.1: Extract Item Stats
```python
# external/scripts/extract_item_stats.py
# - Find CustomItemType definitions
# - Extract stat setters
# - Map to item IDs
# - Generate update script
```

### Task 3.2: Update Item Stats
- Identify items missing stats
- Update with extracted values
- Verify stat accuracy

---

## 🎯 Success Criteria

### 100% Completion Checklist:
- [ ] All abilities have real descriptions (not placeholders)
- [ ] All useful abilities from extraction are integrated
- [ ] All items have complete stat information where applicable
- [ ] All buildings have complete craftable items lists
- [ ] All class data is complete (already done ✅)
- [ ] All data verified against game source
- [ ] No placeholder text remaining
- [ ] All extraction scripts working and documented

---

## 📊 Expected Results

After completion:
- **Items**: 100% complete ✅
- **Abilities**: 100% complete ✅
- **Buildings**: 100% complete ✅
- **Trolls/Classes**: 100% complete ✅ (already done)

**Overall Project Data Completeness: 100%** 🎯

---

## 🚀 Quick Start

To begin, start with **Phase 1: Extract Ability Descriptions** as it has the highest impact on user experience.

Would you like me to:
1. Create the ability description extraction script?
2. Start integrating remaining abilities?
3. Extract item stats?
4. Do all of the above?


