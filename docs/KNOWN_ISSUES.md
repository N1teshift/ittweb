# Known Issues & Migration Status

**⚠️ IMPORTANT**: This document tracks **known issues and technical debt**. See [Documentation Index](./README.md) for navigation.

This document tracks known issues, technical debt, and migration status in the codebase.

## 🔴 Critical Issues

### 1. ~~Duplicate Logging Systems~~ ✅ RESOLVED
**Status**: ✅ Migration complete (2025-01-15)

**Previous Issue**: Two identical logging implementations existed

**Resolution**:
- ✅ All files migrated to `@/features/infrastructure/logging`
- ✅ `loggerUtils.ts` converted to backward-compatibility re-export with deprecation notice
- ✅ All references updated

**Current State**: Single logging system in use, legacy path maintained for backward compatibility only

---

### 2. ~~Shared Folder Structure - Planned Consolidation~~ ✅ RESOLVED
**Status**: ✅ Consolidation complete (2025-01-15)

**Previous Issue**: Two "shared" folders existed with different purposes

**Resolution**:
- ✅ `src/features/shared/` folder removed
- ✅ All functionality moved to `@/features/infrastructure`
- ✅ All imports updated
- ✅ Documentation references updated

**Current State**: Single location for all shared/infrastructure code under `@/features/infrastructure`

---

## ⚠️ Medium Priority Issues

### 3. ~~API Response Format Inconsistency~~ ✅ RESOLVED
**Status**: ✅ Standardization complete (2025-01-15)

**Previous Issue**: Multiple API response formats in use

**Resolution**:
- ✅ All 16 API routes migrated to `createApiHandler`
- ✅ Standardized format: `{ success: boolean, data?: T, error?: string }`
- ✅ All routes now use consistent response formatting

**Current State**: All API routes use standardized response format via `createApiHandler`

---

### 4. ~~createApiHandler Authentication Not Implemented~~ ✅ RESOLVED
**Status**: ✅ Implementation complete (2025-01-15)

**Previous Issue**: `requireAuth` option was documented but not implemented

**Resolution**:
- ✅ Authentication check implemented in `createApiHandler`
- ✅ Returns 401 Unauthorized when `requireAuth: true` and no session
- ✅ `requireSession(context)` helper available for accessing session
- ✅ All routes can now use `requireAuth: true` option

**Current State**: Authentication fully implemented and available via `requireAuth: true` option

---

## 📋 Migration Status

### Logging System Migration
- ✅ **COMPLETE** - All files migrated to `@/features/infrastructure/logging`
- ✅ `loggerUtils.ts` converted to backward-compatibility re-export
- ✅ No remaining legacy imports

### API Response Standardization
- ✅ **COMPLETE** - All routes use `createApiHandler` with standardized format
- ✅ All 16 API routes migrated
- ✅ Consistent `{ success: boolean, data?: T, error?: string }` format

### Shared Folder Consolidation
- ✅ **COMPLETE** - `src/features/shared/` folder removed
- ✅ All functionality moved to `@/features/infrastructure`
- ✅ All imports updated

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


1. **Review Issues**: Check all issues for security implications
2. **Authentication**: Pay special attention to authentication-related issues (e.g., createApiHandler auth)
3. **Create Tasks**: If security issues are found, add them here and create tasks


## Related Documentation

- [Architecture Overview](./development/architecture.md)
- [Development Guide](./development/development-guide.md)
- [API Reference](./api/README.md)
- [Documentation Plan](./DOCUMENTATION_PLAN.md)

