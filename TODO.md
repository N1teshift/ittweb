# TODO List

**Last Updated**: 2025-01-29  
**Purpose**: Consolidated list of all TODO items found in the codebase

> 💡 This file tracks actionable TODO items found in source code and documentation. Items are organized by priority and category.

---

## 🔴 High Priority

### ELO Rollback on Game Deletion
**Location**: `src/features/modules/games/lib/gameService.delete.ts` (lines 32, 46)  
**Issue**: When a game is deleted, ELO changes are not rolled back from player stats.  
**Impact**: Player ELO scores become incorrect after game deletion.  
**Status**: ⚪ Not Started

**Details**:
- Currently, when a game is deleted, the game document and player subcollection are removed
- However, the ELO changes that were applied to player stats remain
- Need to implement rollback logic that:
  1. Retrieves the game's ELO changes before deletion
  2. Reverses those changes in player stats
  3. Optionally recalculates ELO for subsequent games

---

## 🟡 Medium Priority

### Cursor-Based Pagination
**Location**: `src/features/modules/games/lib/gameService.read.ts` (line 201)  
**Issue**: Pagination currently uses limit-based approach; cursor-based pagination not implemented.  
**Impact**: Large result sets may have performance issues; users can't efficiently navigate through pages.  
**Status**: ⚪ Not Started

**Details**:
- Current implementation uses `limit()` for pagination
- Cursor-based pagination would allow more efficient navigation
- Need to implement Firestore cursor pagination using `startAfter()` and `endBefore()`

### Firestore Query Optimization for Player Filtering
**Location**: `src/features/modules/games/lib/gameService.read.ts` (line 289)  
**Issue**: Player name filtering is done client-side; should be optimized with Firestore queries.  
**Impact**: Performance degradation when filtering by player names; unnecessary data transfer.  
**Status**: ⚪ Not Started

**Details**:
- Currently filters games by player names after fetching all games
- Should use Firestore queries to filter at database level
- May require composite indexes for efficient querying

### ELO History Aggregation
**Location**: `src/features/modules/players/lib/playerService.compare.ts` (line 77)  
**Issue**: ELO history comparison chart not implemented in player comparison feature.  
**Impact**: Missing feature for comparing player ELO trends over time.  
**Status**: ⚪ Not Started

**Details**:
- Player comparison function has placeholder for ELO history
- Need to aggregate ELO changes from game history
- Should return time-series data for charting

### Update Scheduled Games Tests
**Location**: `__tests__/api/routes.test.ts` (line 601)  
**Issue**: Tests still reference old scheduled games routes; need to update to unified `/api/games` routes.  
**Impact**: Tests may be outdated or failing; test coverage gaps.  
**Status**: ⚪ Not Started

**Details**:
- Scheduled games routes were migrated to unified `/api/games` routes
- Tests are currently skipped (`describe.skip`)
- Need to update tests to use new unified API endpoints

---

## 🟢 Low Priority / Documentation


### Documentation: Ability Field Identifiers
**Location**: `docs/systems/data-pipeline/guides/ability-field-identifiers.md` (line 150)  
**Issue**: Need to find documentation about which data fields can be fetched using `<{abilId},{fieldId}>` format.  
**Status**: ⚪ Not Started

---

## 📋 Documentation & Cleanup Tasks

### Module-Level READMEs
**Location**: `docs/KNOWN_ISSUES.md`  
**Issue**: Module-level READMEs planned but not implemented.  
**Status**: ⚪ Not Started

### API Documentation Updates
**Location**: `docs/KNOWN_ISSUES.md`  
**Issue**: API docs reference redundant `scheduled-games/[id]/*` routes (functionality moved to `/api/games/[id]/*`).  
**Status**: ⚪ Not Started

**Action**: Update API documentation to reflect unified games routes.

### Remove Unused Components ✅ COMPLETED
**Status**: ✅ Completed - Input components (`Input`, `NumberInput`, `SelectInput`) have been removed from the codebase as they were underutilized.

### Remove Empty Folder ✅ COMPLETED
**Status**: ✅ Completed - Empty `src/pages/api/scheduled-games/[id]/` folder has been removed as functionality was moved to `/api/games/[id]/*`.

---

## 📊 Statistics

- **Total TODOs**: 9
- **High Priority**: 1
- **Medium Priority**: 4
- **Low Priority**: 1
- **Documentation/Cleanup**: 3

---

## 🔍 How to Find More TODOs

To search for TODO items in the codebase:

```bash
# Search for TODO comments
grep -r "TODO" src/ --include="*.ts" --include="*.tsx"

# Search for FIXME comments
grep -r "FIXME" src/ --include="*.ts" --include="*.tsx"

# Search for XXX comments (usually indicates hack/workaround)
grep -r "XXX" src/ --include="*.ts" --include="*.tsx"
```

---

## 📝 Notes

- This list is manually maintained and should be updated as TODOs are completed or new ones are discovered
- Some TODOs may be outdated - verify before starting work
- Check `docs/KNOWN_ISSUES.md` for additional technical debt items
- Some items may require architectural decisions before implementation

---

**Related Documentation**:
- [Known Issues](./docs/KNOWN_ISSUES.md)
- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Development Guide](./docs/DEVELOPMENT.md)

