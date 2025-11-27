# Scripts Refactoring Guide

This document covers the refactoring proposal and comparison for the scripts directory, analyzing code duplication and proposing a modular approach with shared utilities. _Legacy references to `scripts/icons/*` reflect an earlier layout; the current code lives in `scripts/data/`.*

## Table of Contents

1. [Current Issues](#current-issues)
2. [Proposed Solution](#proposed-solution)
3. [Comparison: Monolithic vs Modular](#comparison-monolithic-vs-modular)
4. [Implementation Plan](#implementation-plan)
5. [Recommendation](#recommendation)

## Current Issues

### 1. Significant Code Duplication

**Duplicated Functions (found in 10+ scripts each):**
- `getAllIconFiles()` - 12+ variations
- `readItemsFromTS()` - 10+ identical copies
- `readAbilitiesFromTS()` - 10+ identical copies
- `parseIconMap()` - 6+ variations
- `extractIconFilename()` - 8+ copies
- `findIconFile()` - 8+ copies
- `normalize()` - 5+ copies
- Path constants - duplicated in every script

**Estimated Duplication:**
- ~2000+ lines of duplicated code
- Same logic repeated with slight variations
- Bug fixes need to be applied in multiple places
- Inconsistent implementations

### 2. Maintenance Burden

- **Bug fixes:** Must be applied to 10+ files
- **Feature additions:** Need to update multiple scripts
- **Testing:** Same logic tested multiple times
- **Inconsistencies:** Different implementations of same function

### 3. Current Script Structure

```
scripts/
├── icons/
│   ├── manage-icon-mapping.mjs (482 lines - monolithic)
│   ├── maintain-iconmap.mjs (232 lines - monolithic)
│   ├── cleanup-icons.mjs (450+ lines - monolithic)
│   └── [12+ other scripts with duplicated code]
```

## Proposed Solution

### Option A: Shared Utility Modules (Recommended)

**Structure:**
```
scripts/
├── lib/                          # Shared utilities
│   ├── icon-utils.mjs           # Icon file operations
│   ├── data-readers.mjs          # TypeScript file parsing
│   ├── iconmap-utils.mjs         # IconMap parsing/generation
│   ├── constants.mjs             # Path constants and config
│   └── string-utils.mjs          # Normalization, escaping
│
├── icons/
│   ├── manage-icon-mapping.mjs   # CLI entry point (thin)
│   ├── maintain-iconmap.mjs      # CLI entry point (thin)
│   └── cleanup-icons.mjs         # CLI entry point (thin)
```

**Benefits:**
- ✅ Single source of truth for common functions
- ✅ Easy to test utilities independently
- ✅ Scripts become thin CLI wrappers (~50-150 lines)
- ✅ Consistent behavior across all scripts
- ✅ Easy to add new scripts using shared utilities

**Example Refactored Script:**
```javascript
// scripts/icons/manage-icon-mapping.mjs (refactored)
import { getAllIconFiles, findIconFile } from '../lib/icon-utils.mjs';
import { readItemsFromTS, readAbilitiesFromTS } from '../lib/data-readers.mjs';
import { parseIconMap, updateIconMap } from '../lib/iconmap-utils.mjs';
import { PATHS } from '../lib/constants.mjs';

// Parse CLI args
const args = process.argv.slice(2);
// ... CLI logic ...

// Use shared utilities
const { icons, allFilenames } = getAllIconFiles(PATHS.ICONS_DIR);
const items = readItemsFromTS(PATHS.ITEMS_DIR);
const abilities = readAbilitiesFromTS(PATHS.ABILITIES_DIR);
// ... rest of logic using utilities ...
```

### Option B: Keep Monolithic (Current)

**Pros:**
- ✅ Scripts are self-contained
- ✅ No import dependencies
- ✅ Easy to copy/run standalone
- ✅ No risk of breaking other scripts

**Cons:**
- ❌ Massive code duplication
- ❌ Hard to maintain
- ❌ Inconsistent implementations
- ❌ Bug fixes need multiple updates

## Comparison: Monolithic vs Modular

### Current State: Monolithic Scripts

**Example: `manage-icon-mapping.mjs` (Current)**
- **Lines of Code:** ~482 lines
- **Structure:** All code in one file
- **Duplication:** Contains functions duplicated in 10+ other scripts
- **Maintenance:** Bug fixes need to be applied to multiple files

**Code Structure:**
```javascript
// 482 lines total
- Path constants (30 lines)
- getAllIconFiles() (40 lines) - DUPLICATED in 12+ scripts
- normalize() (10 lines) - DUPLICATED in 5+ scripts
- extractIconFilename() (5 lines) - DUPLICATED in 8+ scripts
- findIconFile() (10 lines) - DUPLICATED in 8+ scripts
- findFuzzyMatch() (25 lines) - DUPLICATED in 2+ scripts
- suggestIconFilename() (15 lines) - DUPLICATED in 2+ scripts
- readItemsFromTS() (35 lines) - DUPLICATED in 10+ scripts
- readAbilitiesFromTS() (40 lines) - DUPLICATED in 10+ scripts
- parseIconMap() (30 lines) - DUPLICATED in 6+ scripts
- updateIconMap() (50 lines) - DUPLICATED in 3+ scripts
- Main logic (200 lines) - UNIQUE to this script
```

### Proposed State: Modular with Shared Utilities

**Example: `manage-icon-mapping-refactored.mjs`**
- **Lines of Code:** ~150 lines (69% reduction!)
- **Structure:** Thin CLI wrapper using shared utilities
- **Duplication:** Zero - all common code in shared modules
- **Maintenance:** Bug fixes in one place benefit all scripts

**Code Structure:**
```javascript
// 150 lines total
import { getAllIconFiles, findIconFile, ... } from '../lib/icon-utils.mjs';
import { readItemsFromTS, readAbilitiesFromTS } from '../lib/data-readers.mjs';
import { parseIconMap, updateIconMap } from '../lib/iconmap-utils.mjs';
import { PATHS } from '../lib/constants.mjs';

// CLI argument parsing (10 lines)
// Main logic using utilities (140 lines) - UNIQUE to this script
```

### Shared Utilities Created

#### `lib/constants.mjs` (~50 lines)
- All path constants
- Category lists
- File lists
- **Used by:** All scripts

#### `lib/icon-utils.mjs` (~200 lines)
- `getAllIconFiles()` - Single implementation
- `extractIconFilename()` - Single implementation
- `findIconFile()` - Single implementation
- `normalize()` - Single implementation
- `findFuzzyMatch()` - Single implementation
- `suggestIconFilename()` - Single implementation
- **Used by:** 10+ icon-related scripts

#### `lib/data-readers.mjs` (~150 lines)
- `readItemsFromTS()` - Single implementation
- `readAbilitiesFromTS()` - Single implementation
- `readUnitsFromTS()` - Single implementation
- `readClassesFromTS()` - Single implementation
- **Used by:** 10+ scripts that read TypeScript data

#### `lib/iconmap-utils.mjs` (~150 lines)
- `parseIconMap()` - Single implementation
- `generateIconMap()` - Single implementation
- `updateIconMap()` - Single implementation
- `escapeForJS()` - Single implementation
- **Used by:** 6+ scripts that work with iconMap

## Line Count Comparison

### Before Refactoring
```
manage-icon-mapping.mjs:        482 lines
maintain-iconmap.mjs:           232 lines
cleanup-icons.mjs:              450 lines
migrate-iconpaths.mjs:          400 lines
[10+ other scripts with duplicates]
─────────────────────────────────────
Total:                          ~3000+ lines
Duplicated code:                ~2000+ lines (67%)
```

### After Refactoring
```
lib/constants.mjs:               50 lines (shared)
lib/icon-utils.mjs:             200 lines (shared)
lib/data-readers.mjs:           150 lines (shared)
lib/iconmap-utils.mjs:          150 lines (shared)
─────────────────────────────────────
Shared utilities:               550 lines

manage-icon-mapping-refactored: 150 lines (69% reduction)
maintain-iconmap-refactored:     80 lines (65% reduction)
cleanup-icons-refactored:       200 lines (56% reduction)
migrate-iconpaths-refactored:   150 lines (63% reduction)
─────────────────────────────────────
Total:                          ~1130 lines
Duplicated code:                   0 lines (0%)
```

**Net Result:**
- **67% reduction in duplicated code**
- **62% reduction in total lines**
- **Single source of truth** for all common functions

## Benefits Analysis

### ✅ Code Quality
- **Consistency:** Same function behaves the same everywhere
- **Testability:** Test utilities once, use everywhere
- **Maintainability:** Fix bugs in one place
- **Readability:** Scripts focus on their unique logic

### ✅ Developer Experience
- **Faster development:** Reuse utilities instead of copying
- **Less errors:** No copy-paste mistakes
- **Easier debugging:** Single implementation to debug
- **Better documentation:** Utilities can have comprehensive docs

### ✅ Long-term Maintenance
- **Feature additions:** Add once, use everywhere
- **Performance improvements:** Optimize once, benefit all
- **Refactoring:** Change implementation without touching scripts
- **Onboarding:** New developers learn utilities once

## Trade-offs

### ⚠️ Dependencies
- Scripts now depend on utility modules
- **Mitigation:** Utilities are stable, well-tested
- **Benefit:** Dependencies are explicit and documented

### ⚠️ Initial Refactoring Effort
- Need to extract utilities (done ✅)
- Need to refactor scripts (can be done incrementally)
- **Mitigation:** Can refactor one script at a time
- **Benefit:** Long-term maintenance is much easier

### ⚠️ Script Independence
- Scripts can't be easily copied standalone
- **Mitigation:** Utilities are part of the repo
- **Benefit:** Scripts are simpler and more maintainable

## Implementation Plan

### Hybrid Structure

```
scripts/
├── lib/                          # Shared utilities (ES modules)
│   ├── icon-utils.mjs           # Icon operations
│   ├── data-readers.mjs          # TS file parsing
│   ├── iconmap-utils.mjs         # IconMap operations
│   └── constants.mjs             # Paths and config
│
├── icons/
│   ├── manage-icon-mapping.mjs   # Uses lib/ (refactored)
│   ├── maintain-iconmap.mjs      # Uses lib/ (refactored)
│   ├── cleanup-icons.mjs         # Uses lib/ (refactored)
│   └── [legacy scripts]          # Keep for backward compat
```

### Phase 1: Create Utility Modules ✅
1. ✅ Extract common functions to `lib/icon-utils.mjs`
2. ✅ Extract data readers to `lib/data-readers.mjs`
3. ✅ Extract iconMap operations to `lib/iconmap-utils.mjs`
4. ✅ Extract constants to `lib/constants.mjs`

### Phase 2: Refactor Consolidated Scripts ⏭️
1. Refactor `manage-icon-mapping.mjs` to use utilities
2. Refactor `maintain-iconmap.mjs` to use utilities
3. Refactor `cleanup-icons.mjs` to use utilities
4. Refactor `migrate-iconpaths.mjs` to use utilities

### Phase 3: Test & Validate ⏭️
1. Test all refactored scripts
2. Compare output with original scripts
3. Update documentation

### Phase 4: Optional - Refactor Legacy Scripts ⏭️
1. Gradually refactor remaining scripts
2. Or keep them as-is for backward compatibility

## Code Reduction Estimate

**Before Refactoring:**
- `manage-icon-mapping.mjs`: ~482 lines
- `maintain-iconmap.mjs`: ~232 lines
- `cleanup-icons.mjs`: ~450 lines
- `migrate-iconpaths.mjs`: ~400 lines
- **Total: ~1564 lines**

**After Refactoring:**
- `lib/icon-utils.mjs`: ~200 lines (shared)
- `lib/data-readers.mjs`: ~150 lines (shared)
- `lib/iconmap-utils.mjs`: ~150 lines (shared)
- `lib/constants.mjs`: ~50 lines (shared)
- `manage-icon-mapping.mjs`: ~150 lines (thin CLI)
- `maintain-iconmap.mjs`: ~80 lines (thin CLI)
- `cleanup-icons.mjs`: ~200 lines (thin CLI)
- `migrate-iconpaths.mjs`: ~150 lines (thin CLI)
- **Total: ~1130 lines** (28% reduction)

**Additional Benefits:**
- Shared utilities can be used by new scripts
- Easier to add features (update once, use everywhere)
- Better testability (test utilities independently)

## Example: Refactored Utility Module

```javascript
// scripts/lib/icon-utils.mjs
import fs from 'fs';
import path from 'path';
import { PATHS } from './constants.mjs';

/**
 * Get all icon files with metadata
 * @returns {{icons: Map, allFilenames: string[]}}
 */
export function getAllIconFiles(iconsDir = PATHS.ICONS_DIR) {
  const icons = new Map();
  const allFilenames = [];
  const categories = ['abilities', 'items', 'buildings', 'trolls', 'units', 'base', 'unclassified'];
  
  for (const category of categories) {
    const categoryDir = path.join(iconsDir, category);
    if (fs.existsSync(categoryDir)) {
      scanDirectory(categoryDir, category, icons, allFilenames);
    }
  }
  
  return { icons, allFilenames };
}

function scanDirectory(dir, category, icons, allFilenames) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      scanDirectory(fullPath, category, icons, allFilenames);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) {
      const lowerKey = entry.name.toLowerCase();
      if (!icons.has(lowerKey)) {
        icons.set(lowerKey, { category, filename: entry.name, fullPath });
      }
      allFilenames.push(entry.name);
    }
  }
}

// ... more utility functions ...
```

## Migration Strategy

### Backward Compatibility

1. **Keep legacy scripts** - Don't delete them immediately
2. **Gradual migration** - Refactor one script at a time
3. **Test thoroughly** - Compare outputs before/after
4. **Update docs** - Point to new refactored scripts

### Risk Mitigation

1. **Version control** - Commit before refactoring
2. **Side-by-side testing** - Run old and new scripts
3. **Incremental rollout** - Refactor one script at a time
4. **Rollback plan** - Keep old scripts until validated

### Best of Both Worlds

- Keep monolithic scripts for backward compatibility
- Create refactored versions using utilities
- Document both approaches
- Let team choose based on needs

## Recommendation

**✅ Refactor to use shared utilities**

**Why:**
1. **Massive reduction in duplication** (67% → 0%)
2. **Easier maintenance** (fix once vs fix 10+ times)
3. **Better code quality** (consistent, testable)
4. **Faster development** (reuse vs rewrite)

**How:**
1. ✅ Utilities already created (lib/*.mjs)
2. ✅ Example refactored script created
3. ⏭️ Refactor consolidated scripts incrementally
4. ⏭️ Keep legacy scripts for backward compatibility
5. ⏭️ Gradually migrate as needed

**Trade-offs:**
- ⚠️ Scripts have import dependencies (but still simple)
- ⚠️ Need to maintain utility modules (but less code overall)
- ⚠️ Initial refactoring effort (but long-term benefit)

**Best Approach:**
- Start with utility modules ✅
- Refactor consolidated scripts first ⏭️
- Keep legacy scripts for backward compatibility
- Gradually migrate as needed



