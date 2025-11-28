# Known Issues & Migration Status

**⚠️ IMPORTANT**: This document tracks known issues, technical debt, and migration status in the codebase. See [Documentation Index](./README.md) for navigation.

This document tracks known issues, technical debt, and migration status in the codebase.

## 🔴 Critical Issues

### 1. Duplicate Logging Systems
**Status**: Migration artifact from infrastructure refactoring

**Issue**: Two identical logging implementations exist:
- `src/features/shared/utils/loggerUtils.ts` (legacy)
- `src/features/infrastructure/logging/logger.ts` (current)

**Impact**: 
- Code duplication
- Confusion about which import path to use
- 3 files still use legacy path: `src/features/shared/README.md`, `src/features/shared/utils/accessibility/helpers.ts`, `src/features/modules/tools/useIconMapperData.ts`

**Recommended Action**: 
- Migrate remaining 3 files to `@/features/infrastructure/logging`
- Remove `loggerUtils.ts` from shared (or make it a re-export for backward compatibility)
- Update `src/features/shared/README.md` to reference infrastructure logging

**Related**: See TODO `migration-logging-consolidation`

---

### 2. Shared Folder Structure - Planned Consolidation
**Status**: Migration planned

**Issue**: Two "shared" folders exist with different purposes:
- `src/features/shared/` - Application-level shared features (Layout, services, utilities)
- `src/features/infrastructure/shared/` - Infrastructure UI components (Button, Card, Input, etc.)

**Planned Solution**: 
- Merge `@/features/shared` into `@/features/infrastructure`
- Create `@/features/infrastructure/ui/` subfolder for UI components (Button, Card, etc.)
- Move application-level shared features to appropriate infrastructure subfolders
- This will consolidate all shared code under infrastructure

**Impact**: 
- Current: Potential confusion about where to place new shared code
- After migration: Single location for all shared/infrastructure code

**Recommended Action**: 
- Plan migration to consolidate under infrastructure
- Create `infrastructure/ui/` for UI components
- Update all imports after migration

**Related**: See TODO `docs-shared-folder-clarification`

---

## ⚠️ Medium Priority Issues

### 3. API Response Format Inconsistency
**Status**: Multiple formats in use

**Issue**: The codebase uses 3 different API response formats:

1. **Standardized** (`createApiHandler`): 
   ```typescript
   { success: boolean, data?: T, error?: string }
   ```

2. **Legacy Wrapped**: 
   ```typescript
   { success: true, data: T } 
   // OR
   { id: string, success: true }
   ```

3. **Legacy Direct**: 
   ```typescript
   T  // Raw data, no wrapper
   ```

**Impact**: 
- Inconsistent client-side error handling
- Confusion about response structure
- Harder to maintain

**Recommended Action**: 
- Migrate all routes to use `createApiHandler` for consistent formatting
- Create migration plan for legacy routes
- Document standard format in API docs

**Related**: See TODO `api-response-standardization`

---

### 4. createApiHandler Authentication Not Implemented
**Status**: Feature incomplete

**Issue**: The `requireAuth` option in `createApiHandler` is documented but not implemented (TODO in code).

**Impact**: 
- Developers may think authentication is enforced when it's not
- Manual authentication checks required in all handlers

**Recommended Action**: 
- Implement authentication check in `createApiHandler`
- Update all routes using manual auth checks to use `requireAuth: true`

**Related**: See TODO `implement-createApiHandler-auth`

---

## 📋 Migration Status

### Logging System Migration
- ✅ 41 files migrated to `@/features/infrastructure/logging`
- ⚠️ 3 files still using `@/features/shared/utils/loggerUtils`
- ⚠️ `loggerUtils.ts` still exists (duplicate code)

### API Response Standardization
- ✅ `createApiHandler` provides standardized format
- ⚠️ Many routes still use legacy formats
- 📝 Migration plan needed

### Component Library Usage
**Component Usage Statistics**:
- `Button`: Used in 13 files
- `Card`: Used in 31 files (most popular)
- `Input/NumberInput/SelectInput`: Used in 2 files (underutilized)
- `LoadingOverlay/LoadingScreen`: Used in 3 files

**Note**: Input components (`Input`, `NumberInput`, `SelectInput`) are documented but rarely used (only 2 files).

**Planned Action**: Remove Input components entirely from codebase (not just documentation) as they are not being used.

**Related**: See TODO `remove-unused-input-components`

---

## 🔧 Technical Debt

### Documentation
- [ ] Module-level READMEs planned but not implemented
- [ ] API docs reference redundant `scheduled-games/[id]/*` routes (functionality moved to `/api/games/[id]/*`)
- [ ] Testing guide links verified ✅

### Code Quality
- [ ] API response format standardization needed
- [ ] Logging system consolidation needed (3 files still use legacy path)
- [ ] Shared folder structure - consolidation planned
- [ ] Remove empty `scheduled-games/[id]/` folder (redundant)
- [ ] Remove unused Input components (Input, NumberInput, SelectInput)

### Redundant Code
- [ ] Empty `src/pages/api/scheduled-games/[id]/` folder (functionality moved to `/api/games/[id]/*`)
- [ ] Input components (`Input`, `NumberInput`, `SelectInput`) - only used in 2 files, should be removed

---

## Related Documentation

- [Architecture Overview](./ARCHITECTURE.md)
- [Development Guide](./DEVELOPMENT.md)
- [API Reference](./api/README.md)
- [Documentation Plan](./DOCUMENTATION_PLAN.md)

