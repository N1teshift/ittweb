# Scripts Folder Analysis & Recommendations

_Historical document: references to `scripts/icons/*` describe a prior repo layout. Current scripts live in `scripts/data/`, so treat path references below as legacy context._

## Executive Summary

**Total Scripts:** 39 files
**Categories Identified:** 6 main categories
**Recommendations:**
- **Delete:** 8 scripts (outdated/redundant)
- **Consolidate:** 12 scripts into 4 unified scripts
- **Keep as-is:** 19 scripts (active/unique purpose)
- **Reorganize:** Create 6 subdirectories for better organization

---

## 1. Scripts to DELETE (Outdated/Redundant)

### Icon Mapping - Redundant Versions
- ❌ `analyze-icon-mapping.mjs` → **Replaced by** `analyze-icon-mapping-comprehensive.mjs`
- ❌ `map-all-icons.mjs` → **Replaced by** `map-all-icons-fixed.mjs` or `fix-icon-mapping-issues.mjs`
- ❌ `map-icons.mjs` → **Replaced by** `map-icons-to-files.mjs` or newer versions
- ❌ `fix-icon-map-escaping.mjs` → **Replaced by** `fix-iconmap-escaping.mjs` (better naming)
- ❌ `fix-all-icon-map-escaping.mjs` → **Redundant** (same as fix-iconmap-escaping.mjs)
- ❌ `fix-icon-map-completely.mjs` → **Redundant** (functionality covered by other scripts)

### Item Processing - Redundant
- ❌ `update-items-from-extracted.mjs` → **Replaced by** `update-items-from-extracted-v2.mjs`
- ❌ `check-items.js` → **Replaced by** `check-items.cjs` (CommonJS version)

### Icon Duplicates - Redundant
- ❌ `analyze-icon-duplicates.js` → **Replaced by** `analyze-icon-duplicates.cjs`

**Total to Delete: 8 scripts**

---

## 2. Scripts to CONSOLIDATE

### Group A: Icon Mapping & Analysis → `icons/manage-icon-mapping.mjs`
**Consolidate these 5 scripts:**
- `map-available-icons-and-generate-extraction-list.mjs`
- `map-icons-to-files.mjs`
- `map-all-icons-fixed.mjs`
- `find-missing-icons-with-fuzzy-match.mjs`
- `extract-and-organize-icons.mjs`

**New unified script should:**
- Scan for available icons
- Map icons to entities (items/abilities/units)
- Find missing icons with fuzzy matching
- Generate extraction lists
- Organize icons into proper directories

### Group B: Icon Map Maintenance → `icons/maintain-iconmap.mjs`
**Consolidate these 3 scripts:**
- `fix-iconmap-duplicates.mjs`
- `fix-iconmap-escaping.mjs`
- `regenerate-iconmap.mjs`

**New unified script should:**
- Fix duplicates
- Fix escaping issues
- Regenerate clean iconMap.ts
- Validate iconMap structure

### Group C: Icon Cleanup → `icons/cleanup-icons.mjs`
**Consolidate these 4 scripts:**
- `cleanup-icon-duplicates.cjs`
- `normalize-icon-filenames.cjs`
- `delete-icons-from-list.cjs`
- `delete-marked-icons.cjs`

**New unified script should:**
- Remove duplicate icons
- Normalize filenames
- Delete icons from lists
- Clean up icon directory structure

### Group D: Data Migration → `data/migrate-iconpaths.mjs`
**Consolidate these 2 scripts:**
- `migrate-iconpaths-to-iconmap.mjs`
- `fix-icon-mapping-issues.mjs`

**New unified script should:**
- Migrate iconPath/iconSrc to ICON_MAP
- Fix case sensitivity issues
- Handle path-based references
- Auto-map available icons

**Total to Consolidate: 14 scripts → 4 unified scripts**

---

## 3. Scripts to KEEP AS-IS (Active/Unique Purpose)

### Data Extraction & Processing
- ✅ `extract-from-w3x.mjs` - Extracts game data from .w3x files
- ✅ `convert-extracted-to-typescript.mjs` - Converts extracted JSON to TypeScript
- ✅ `resolve-field-references.mjs` - Resolves Warcraft 3 field references
- ✅ `extract-item-data.mjs` - Extracts item data (if different from extract-from-w3x)

### Data Analysis & Reporting
- ✅ `analyze-icon-mapping-comprehensive.mjs` - Comprehensive icon mapping analysis
- ✅ `build-gamedata.mjs` - Builds modular game data structure

### Data Cleanup
- ✅ `cleanup-garbage-abilities.mjs` - Removes garbage/internal abilities
- ✅ `cleanup-color-codes-from-names.mjs` - Removes color codes from names
- ✅ `clear-data-keep-structure.mjs` - Clears data while keeping structure

### Item/Ability Management
- ✅ `check-items.cjs` - Validates item data
- ✅ `update-items-from-extracted-v2.mjs` - Updates items from extracted data
- ✅ `generate-external-items.cjs` - Generates external items data

### Icon Management (Unique)
- ✅ `download-wowpedia-icons.cjs` - Downloads icons from WoWpedia
- ✅ `remove-reforged-icons.cjs` - Removes Reforged icons

### Other
- ✅ `migrate-posts-to-firestore.mjs` - Migrates posts to Firestore

**Total to Keep: 15 scripts**

---

## 4. Recommended Folder Structure

```
scripts/
├── icons/                          # Icon-related scripts
│   ├── manage-icon-mapping.mjs    # [CONSOLIDATED] Map icons, find missing, organize
│   ├── maintain-iconmap.mjs       # [CONSOLIDATED] Fix duplicates, escaping, regenerate
│   ├── cleanup-icons.mjs          # [CONSOLIDATED] Cleanup duplicates, normalize, delete
│   ├── analyze-icon-mapping-comprehensive.mjs  # Analysis & reporting
│   ├── download-wowpedia-icons.cjs              # Download icons
│   └── remove-reforged-icons.cjs                 # Remove Reforged icons
│
├── data/                          # Data extraction & processing
│   ├── extract-from-w3x.mjs      # Extract from game files
│   ├── convert-extracted-to-typescript.mjs      # Convert JSON to TS
│   ├── resolve-field-references.mjs             # Resolve field references
│   ├── build-gamedata.mjs        # Build modular game data
│   ├── extract-item-data.mjs     # Extract item data
│   └── migrate-iconpaths.mjs     # [CONSOLIDATED] Migrate icon paths
│
├── cleanup/                       # Data cleanup scripts
│   ├── cleanup-garbage-abilities.mjs
│   ├── cleanup-color-codes-from-names.mjs
│   └── clear-data-keep-structure.mjs
│
├── validation/                    # Validation & checking scripts
│   ├── check-items.cjs
│   └── generate-external-items.cjs
│
├── migration/                     # Migration scripts
│   ├── migrate-posts-to-firestore.mjs
│   └── update-items-from-extracted-v2.mjs
│
└── README.md                      # Documentation for all scripts
```

---

## 5. Script Dependencies & Execution Order

### Typical Workflow

1. **Data Extraction:**
   ```
   data/extract-from-w3x.mjs
   → data/resolve-field-references.mjs
   → data/convert-extracted-to-typescript.mjs
   ```

2. **Icon Management:**
   ```
   icons/manage-icon-mapping.mjs
   → icons/migrate-iconpaths.mjs (from data/)
   → icons/maintain-iconmap.mjs
   → icons/analyze-icon-mapping-comprehensive.mjs
   ```

3. **Data Cleanup:**
   ```
   cleanup/cleanup-garbage-abilities.mjs
   → cleanup/cleanup-color-codes-from-names.mjs
   ```

4. **Validation:**
   ```
   validation/check-items.cjs
   ```

---

## 6. Scripts That Need Formalization

### High Priority (Create proper CLI interfaces)
- `convert-extracted-to-typescript.mjs` - Add command-line options
- `extract-from-w3x.mjs` - Add path configuration options
- `resolve-field-references.mjs` - Add dry-run mode

### Medium Priority (Add error handling & logging)
- All icon management scripts
- Data cleanup scripts

### Low Priority (Documentation)
- Add JSDoc comments to all scripts
- Add usage examples in README.md

---

## 7. Implementation Plan

### Phase 1: Cleanup (Immediate)
1. Delete 8 redundant scripts
2. Create new folder structure
3. Move scripts to appropriate folders

### Phase 2: Consolidation (Next Sprint)
1. Create 4 consolidated scripts
2. Test consolidated scripts
3. Delete old scripts after verification

### Phase 3: Formalization (Future)
1. Add CLI interfaces to key scripts
2. Add comprehensive error handling
3. Create unified logging system
4. Write comprehensive README.md

---

## 8. Quick Reference: Script Status

| Script | Status | Action | New Location |
|--------|--------|--------|--------------|
| `analyze-icon-mapping-comprehensive.mjs` | ✅ Keep | Move | `icons/` |
| `analyze-icon-mapping.mjs` | ❌ Delete | - | - |
| `extract-and-organize-icons.mjs` | 🔄 Consolidate | Merge | `icons/manage-icon-mapping.mjs` |
| `fix-icon-mapping-issues.mjs` | 🔄 Consolidate | Merge | `data/migrate-iconpaths.mjs` |
| `migrate-iconpaths-to-iconmap.mjs` | 🔄 Consolidate | Merge | `data/migrate-iconpaths.mjs` |
| `fix-iconmap-duplicates.mjs` | 🔄 Consolidate | Merge | `icons/maintain-iconmap.mjs` |
| `fix-iconmap-escaping.mjs` | 🔄 Consolidate | Merge | `icons/maintain-iconmap.mjs` |
| `regenerate-iconmap.mjs` | 🔄 Consolidate | Merge | `icons/maintain-iconmap.mjs` |
| `map-all-icons.mjs` | ❌ Delete | - | - |
| `map-all-icons-fixed.mjs` | 🔄 Consolidate | Merge | `icons/manage-icon-mapping.mjs` |
| `map-icons.mjs` | ❌ Delete | - | - |
| `map-icons-to-files.mjs` | 🔄 Consolidate | Merge | `icons/manage-icon-mapping.mjs` |
| `map-available-icons-and-generate-extraction-list.mjs` | 🔄 Consolidate | Merge | `icons/manage-icon-mapping.mjs` |
| `find-missing-icons-with-fuzzy-match.mjs` | 🔄 Consolidate | Merge | `icons/manage-icon-mapping.mjs` |
| `cleanup-icon-duplicates.cjs` | 🔄 Consolidate | Merge | `icons/cleanup-icons.mjs` |
| `normalize-icon-filenames.cjs` | 🔄 Consolidate | Merge | `icons/cleanup-icons.mjs` |
| `delete-icons-from-list.cjs` | 🔄 Consolidate | Merge | `icons/cleanup-icons.mjs` |
| `delete-marked-icons.cjs` | 🔄 Consolidate | Merge | `icons/cleanup-icons.mjs` |
| `fix-icon-map-escaping.mjs` | ❌ Delete | - | - |
| `fix-all-icon-map-escaping.mjs` | ❌ Delete | - | - |
| `fix-icon-map-completely.mjs` | ❌ Delete | - | - |
| `convert-extracted-to-typescript.mjs` | ✅ Keep | Move | `data/` |
| `resolve-field-references.mjs` | ✅ Keep | Move | `data/` |
| `extract-from-w3x.mjs` | ✅ Keep | Move | `data/` |
| `build-gamedata.mjs` | ✅ Keep | Move | `data/` |
| `cleanup-garbage-abilities.mjs` | ✅ Keep | Move | `cleanup/` |
| `cleanup-color-codes-from-names.mjs` | ✅ Keep | Move | `cleanup/` |
| `clear-data-keep-structure.mjs` | ✅ Keep | Move | `cleanup/` |
| `check-items.cjs` | ✅ Keep | Move | `validation/` |
| `check-items.js` | ❌ Delete | - | - |
| `update-items-from-extracted.mjs` | ❌ Delete | - | - |
| `update-items-from-extracted-v2.mjs` | ✅ Keep | Move | `migration/` |
| `generate-external-items.cjs` | ✅ Keep | Move | `validation/` |
| `extract-item-data.mjs` | ✅ Keep | Move | `data/` |
| `analyze-icon-duplicates.js` | ❌ Delete | - | - |
| `analyze-icon-duplicates.cjs` | ✅ Keep | Move | `icons/` (or delete if consolidated) |
| `download-wowpedia-icons.cjs` | ✅ Keep | Move | `icons/` |
| `migrate-posts-to-firestore.mjs` | ✅ Keep | Move | `migration/` |
| `remove-reforged-icons.cjs` | ✅ Keep | Move | `icons/` |

---

## 9. Notes

- **File Extensions:** Mix of `.mjs` (ES modules) and `.cjs` (CommonJS). Consider standardizing on `.mjs` for new scripts.
- **Naming Convention:** Some scripts use `-` (kebab-case), some use `_` (snake_case). Standardize on kebab-case.
- **Documentation:** Most scripts have good header comments. Consider adding a unified README.md per folder.
- **Testing:** No test files found. Consider adding validation scripts or unit tests for critical scripts.

---

## Summary Statistics

- **Total Scripts:** 39
- **To Delete:** 8 (20.5%)
- **To Consolidate:** 14 → 4 (35.9% → 10.3%)
- **To Keep:** 15 (38.5%)
- **New Structure:** 6 folders
- **Reduction:** 39 → 23 scripts (41% reduction)

