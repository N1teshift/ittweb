# Test File Locations - Current vs Planned

## Current Test Locations (Mixed Patterns)

The project currently uses **three different patterns** for test file locations:

### Pattern 1: Co-located in `__tests__/` subdirectories
✅ **Used for**: Some lib tests, some component tests
- `src/features/modules/games/lib/__tests__/eloCalculator.test.ts`
- `src/features/modules/games/lib/__tests__/replayParser.test.ts`
- `src/features/modules/games/lib/__tests__/w3mmdUtils.test.ts`
- `src/features/modules/map-analyzer/components/__tests__/HeightDistributionChart.test.tsx`
- `src/features/modules/map-analyzer/utils/__tests__/mapUtils.test.ts`
- `src/features/modules/tools/__tests__/useIconMapperData.test.ts`
- `src/features/modules/tools/__tests__/icon-mapper.utils.test.ts`

### Pattern 2: Next to source files
✅ **Used for**: Most service tests, some utility tests
- `src/features/modules/games/lib/gameService.test.ts` (next to `gameService.ts`)
- `src/features/modules/players/lib/playerService.test.ts` (next to `playerService.ts`)
- `src/features/modules/blog/lib/postService.test.ts` (next to `postService.ts`)
- `src/features/modules/blog/lib/posts.test.ts` (next to `posts.ts`)
- `src/features/modules/scheduled-games/lib/scheduledGameService.test.ts`
- `src/features/modules/analytics/lib/analyticsService.test.ts`
- `src/features/modules/entries/lib/entryService.test.ts`
- `src/features/shared/lib/archiveService.test.ts`
- `src/features/shared/lib/userDataService.test.ts`
- `src/features/infrastructure/utils/objectUtils.test.ts` (next to `objectUtils.ts`)
- `src/features/infrastructure/utils/timestampUtils.test.ts` (next to `timestampUtils.ts`)
- `src/features/shared/utils/userRoleUtils.test.ts` (next to `userRoleUtils.ts`)
- `src/features/modules/scheduled-games/utils/timezoneUtils.test.ts` (next to `timezoneUtils.ts`)
- `src/features/modules/tools/icon-mapper.utils.test.ts` (next to `icon-mapper.utils.ts`)
- `src/features/modules/archives/utils/archiveFormUtils.test.ts` (next to `archiveFormUtils.ts`)
- `src/features/modules/archives/utils/archiveValidation.test.ts` (next to `archiveValidation.ts`)

### Pattern 3: Root `__tests__/` directory
✅ **Used for**: Infrastructure tests, shared utilities
- `__tests__/infrastructure/api/firebase/config.test.ts`
- `__tests__/infrastructure/api/firebase/admin.test.ts`
- `__tests__/infrastructure/api/firebase/firebaseClient.test.ts`
- `__tests__/infrastructure/api/routeHandlers.test.ts`
- `__tests__/infrastructure/auth/index.test.ts`
- `__tests__/infrastructure/logging/logger.test.ts`
- `__tests__/shared/utils/loggerUtils.test.ts`
- `__tests__/api/routes.test.ts`

## Test Plan Specifications

The test plans specify these locations:
- **Service Layer Tests** → `src/features/modules/[module]/lib/__tests__/`
- **API Route Tests** → `src/pages/api/[route]/__tests__/`
- **Component Tests** → `src/features/modules/[module]/components/__tests__/`
- **Hook Tests** → `src/features/modules/[module]/hooks/__tests__/`
- **Utility Tests** → `src/features/[path]/utils/__tests__/`

## Recommendation: Standardize on Co-located Pattern

**Recommended approach**: Use `__tests__/` subdirectories for consistency:

### Service Tests
- ✅ `src/features/modules/[module]/lib/__tests__/[service].test.ts`

### API Route Tests
- ✅ `src/pages/api/[route]/__tests__/[route].test.ts`
- ✅ `src/pages/api/[route]/[id]/__tests__/[id].test.ts`

### Component Tests
- ✅ `src/features/modules/[module]/components/__tests__/[Component].test.tsx`

### Hook Tests
- ✅ `src/features/modules/[module]/hooks/__tests__/use[Hook].test.ts`

### Utility Tests
- ✅ `src/features/[path]/utils/__tests__/[util].test.ts`

### Infrastructure Tests
- ✅ Keep in `__tests__/infrastructure/` (root level is fine for cross-cutting concerns)

## Action Items

1. **For new tests**: Follow the `__tests__/` subdirectory pattern
2. **For existing tests**: Leave them as-is (don't refactor unless needed)
3. **Update test plans**: Accept both patterns but prefer `__tests__/` subdirectories
4. **Documentation**: Update CODEX_PROMPT to reflect actual patterns

## Jest Configuration

The Jest config already supports both patterns:
```javascript
testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"]
```

This matches:
- Files in `__tests__/` directories
- Files with `.test.ts` or `.spec.ts` extensions anywhere

Both patterns work, but `__tests__/` subdirectories are cleaner and more organized.

