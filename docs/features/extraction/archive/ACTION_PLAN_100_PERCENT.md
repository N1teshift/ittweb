# Action Plan to Reach 100% Data Completeness

## Current Status: 85-90% → Target: 100%

---

## 🎯 Task Breakdown

### **Task 1: Extract Ability Descriptions** (HIGHEST PRIORITY)
**Impact**: High - Improves user experience significantly  
**Effort**: Medium  
**Current**: 121 abilities with placeholder descriptions  
**Target**: All abilities have real descriptions

**Steps**:
1. Create script to extract `TOOLTIP_NORM` and `TOOLTIP_EXTENDED` from ability files
2. Parse tooltip variables and method calls (`setTooltipNormal`, `setTooltipNormalExtended`, etc.)
3. Map tooltips to ability IDs
4. Update `abilities.ts` with extracted descriptions
5. Clean up formatting (remove color codes, format placeholders)

**Script**: `external/scripts/extract_ability_descriptions.py`

---

### **Task 2: Integrate Remaining Abilities** (MEDIUM PRIORITY)
**Impact**: Medium - Increases coverage  
**Effort**: Low-Medium  
**Current**: 236 abilities integrated, 245 available  
**Target**: All useful abilities integrated

**Steps**:
1. Review `external/new_abilities.ts` for high-quality abilities
2. Filter out placeholders, dummies, and low-value abilities
3. Estimate: ~50-100 additional abilities worth adding
4. Batch add to `abilities.ts`

---

### **Task 3: Complete Item Stats** (MEDIUM PRIORITY)
**Impact**: Medium - Completes item data  
**Effort**: Medium  
**Current**: Some items missing stats  
**Target**: All items have complete stats where applicable

**Steps**:
1. Create script to extract item stats from `CustomItemType` definitions
2. Look for stat setters (`setDamageBase`, `setArmorBase`, etc.)
3. Identify items missing stats
4. Update item data files

**Script**: `external/scripts/extract_item_stats.py`

---

### **Task 4: Verify Building Data** (LOW PRIORITY)
**Impact**: Low - Buildings mostly complete  
**Effort**: Low  
**Current**: 9 buildings with HP/armor  
**Target**: Verify craftable items lists are complete

**Steps**:
1. Cross-reference building craftable items with item recipes
2. Verify all items are listed at correct buildings
3. Add any missing items

---

## 🚀 Implementation Order

1. **Start with Task 1** (Ability Descriptions) - Highest impact
2. **Then Task 2** (Remaining Abilities) - Quick wins
3. **Then Task 3** (Item Stats) - Completes data
4. **Finally Task 4** (Building Verification) - Polish

---

## ✅ Success Criteria

- [ ] Zero placeholder ability descriptions
- [ ] All useful abilities integrated
- [ ] All items have complete stats
- [ ] All buildings verified
- [ ] 100% data completeness achieved

---

## 📊 Expected Timeline

- **Task 1**: 2-3 hours (script + integration)
- **Task 2**: 1-2 hours (review + integration)
- **Task 3**: 2-3 hours (script + updates)
- **Task 4**: 1 hour (verification)

**Total**: ~6-9 hours of work

---

## 🎯 Ready to Start?

I can begin with **Task 1: Extract Ability Descriptions** right now. This will:
1. Create the extraction script
2. Extract all tooltips from ability files
3. Update `abilities.ts` with real descriptions
4. Remove all placeholder text

Would you like me to proceed?


