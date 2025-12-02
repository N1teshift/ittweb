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

### Component Library Usage ✅ RESOLVED
**Component Usage Statistics**:
- `Button`: Used in 13 files
- `Card`: Used in 31 files (most popular)
- `LoadingOverlay/LoadingScreen`: Used in 3 files

**Status**: ✅ Input components (`Input`, `NumberInput`, `SelectInput`) have been removed from codebase as they were underutilized.

---

## 🔧 Technical Debt

### Documentation
**Outstanding Items**:
- API docs may reference redundant `scheduled-games/[id]/*` routes (functionality moved to `/api/games/[id]/*`) - needs verification

### Code Quality ✅ RESOLVED
**Outstanding Items**: None remaining

**Completed Items**:
- ✅ Removed empty `scheduled-games/[id]/` folder (redundant, functionality moved to `/api/games/[id]/*`)
- ✅ Removed unused Input components (`Input`, `NumberInput`, `SelectInput`) - only used in 2 files

**Note**: The following items have been resolved:
- ✅ API response format standardization - Complete (all routes use `createApiHandler`)
- ✅ Logging system consolidation - Complete (all files migrated)
- ✅ Shared folder structure consolidation - Complete (consolidated to `@/features/infrastructure`)


## Related Documentation

- [Architecture Overview](../development/architecture.md)
- [Development Guide](../development/development-guide.md)
- [API Reference](../production/api/README.md)
- [Documentation Plan](../development/archive/meta-documentation/DOCUMENTATION_PLAN.md)

