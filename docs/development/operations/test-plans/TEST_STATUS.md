# Test Status and Locations

This document consolidates test status tracking and test file location patterns.

## Test Status Summary

**Completed**:
- ✅ Infrastructure tests (mostly complete)
- ✅ Utility function tests (mostly complete)
- ✅ Service layer tests (many complete)
- ✅ Some component tests (minimal)
- ✅ Security tests (complete)
- ✅ Accessibility tests (complete)

**Priority Missing Tests**:
1. **API Route Tests** - Most API routes lack tests
2. **Component Tests** - Most components lack tests
3. **Hook Tests** - Most hooks lack tests
4. **Integration Tests** - No integration tests
5. **E2E Tests** - No E2E tests

## Tests That Already Exist

### Infrastructure Tests
- ✅ `__tests__/infrastructure/api/firebase/config.test.ts` - Firebase Configuration
- ✅ `__tests__/infrastructure/api/firebase/admin.test.ts` - Firebase Admin
- ✅ `__tests__/infrastructure/api/firebase/firebaseClient.test.ts` - Firebase Client
- ✅ `__tests__/infrastructure/api/routeHandlers.test.ts` - API Route Handlers
- ✅ `__tests__/infrastructure/auth/index.test.ts` - Authentication
- ✅ `__tests__/infrastructure/logging/logger.test.ts` - Logging System
- ✅ `__tests__/shared/utils/loggerUtils.test.ts` - Logger Utils

### Utilities Tests
- ✅ `src/features/infrastructure/utils/__tests__/objectUtils.test.ts` - Object Utils
- ✅ `src/features/infrastructure/utils/__tests__/timestampUtils.test.ts` - Timestamp Utils
- ✅ `src/features/infrastructure/utils/__tests__/userRoleUtils.test.ts` - User Role Utils
- ✅ `src/features/modules/scheduled-games/utils/__tests__/timezoneUtils.test.ts` - Timezone Utils
- ✅ `src/features/modules/tools/__tests__/icon-mapper.utils.test.ts` - Icon Mapper Utils
- ✅ `src/features/modules/archives/utils/__tests__/archiveFormUtils.test.ts` - Archive Form Utils
- ✅ `src/features/modules/archives/utils/__tests__/archiveValidation.test.ts` - Archive Validation

### Games Tests
- ✅ `src/features/modules/games/lib/__tests__/eloCalculator.test.ts` - ELO Calculator
- ✅ `src/features/modules/games/lib/__tests__/replayParser.test.ts` - Replay Parser
- ✅ `src/features/modules/games/lib/__tests__/w3mmdUtils.test.ts` - W3MMD Utils
- ✅ `src/features/modules/games/lib/__tests__/gameService.test.ts` - Game Service

**Still Needed**:
- ❌ Games API Route Tests (`src/pages/api/games/__tests__/`)
- ❌ Game Components Tests (`src/features/modules/games/components/__tests__/`)
- ❌ Game Hooks Tests (`src/features/modules/games/hooks/__tests__/`)

### Players Tests
- ✅ `src/features/modules/players/lib/__tests__/playerService.test.ts` - Player Service

**Still Needed**:
- ❌ Players API Route Tests (`src/pages/api/players/__tests__/`)
- ❌ Player Components Tests (`src/features/modules/players/components/__tests__/`)
- ❌ Player Hooks Tests (`src/features/modules/players/hooks/__tests__/`)

### Blog Tests
- ✅ `src/features/modules/blog/lib/__tests__/postService.test.ts` - Post Service
- ✅ `src/features/modules/blog/lib/__tests__/posts.test.ts` - Post Loading & Serialization

**Still Needed**:
- ❌ Posts API Route Tests (`src/pages/api/posts/__tests__/`)
- ❌ Blog Components Tests (`src/features/modules/blog/components/__tests__/`)
- ❌ Blog Hooks Tests (`src/features/modules/blog/hooks/__tests__/`)

### Archives Tests
- ✅ `src/features/infrastructure/lib/__tests__/archiveService.test.ts` - Archive Service
- ✅ `src/features/modules/archives/utils/__tests__/archiveFormUtils.test.ts` - Archive Form Utils
- ✅ `src/features/modules/archives/utils/__tests__/archiveValidation.test.ts` - Archive Validation

**Still Needed**:
- ❌ Archives API Route Tests (`src/pages/api/entries/__tests__/`)
- ❌ Archive Components Tests (`src/features/modules/archives/components/__tests__/`)
- ❌ Archive Hooks Tests (`src/features/modules/archives/hooks/__tests__/`)

### Scheduled Games Tests
- ✅ `src/features/modules/scheduled-games/lib/__tests__/scheduledGameService.test.ts` - Scheduled Game Service
- ✅ `src/features/modules/scheduled-games/utils/__tests__/timezoneUtils.test.ts` - Timezone Utils

**Note**: The scheduled games collection and dedicated pages have been removed. Scheduled games are now managed through the main `games` collection with `gameState: 'scheduled'`. API routes for scheduled games no longer exist - functionality has been moved to `/api/games`.

**Still Needed**:
- ❌ Scheduled Games Components Tests (`src/features/modules/scheduled-games/components/__tests__/`) - Components still exist and are used in other parts of the app
- ❌ Scheduled Games Hooks Tests (`src/features/modules/scheduled-games/hooks/__tests__/`) - If hooks exist

### Standings Tests
**Still Needed**:
- ❌ Standings Service Tests (`src/features/modules/standings/lib/__tests__/`)
- ❌ Standings API Route Tests (`src/pages/api/standings/__tests__/`)
- ❌ Standings Hooks Tests (`src/features/modules/standings/hooks/__tests__/`)
- ❌ Standings Components Tests (`src/features/modules/standings/components/__tests__/`)

### Analytics Tests
- ✅ `src/features/modules/analytics/lib/__tests__/analyticsService.test.ts` - Analytics Service

**Still Needed**:
- ❌ Analytics API Route Tests (`src/pages/api/analytics/__tests__/`)
- ❌ Analytics Components Tests (`src/features/modules/analytics/components/__tests__/`)

### Guides Tests
**Still Needed**:
- ❌ Guide Data Loading Tests (`src/features/modules/guides/data/__tests__/`)
- ❌ Guide Utilities Tests (`src/features/modules/guides/utils/__tests__/`)
- ❌ Guides Components Tests (`src/features/modules/guides/components/__tests__/`)
- ❌ Guides Hooks Tests (`src/features/modules/guides/hooks/__tests__/`)

### Map Analyzer Tests
- ✅ `src/features/modules/map-analyzer/utils/__tests__/mapUtils.test.ts` - Map Utilities
- ✅ `src/features/modules/map-analyzer/components/__tests__/HeightDistributionChart.test.tsx` - Component Test

**Still Needed**:
- ❌ Map Parsing Tests
- ❌ Additional Map Analyzer Component Tests

### Tools Tests
- ✅ `src/features/modules/tools/__tests__/icon-mapper.utils.test.ts` - Icon Mapper Utils
- ✅ `src/features/modules/tools/__tests__/useIconMapperData.test.ts` - Icon Mapper Hook

**Still Needed**:
- ❌ Duel Simulator Tests

### Other Services
- ✅ `src/features/infrastructure/lib/__tests__/userDataService.test.ts` - User Data Service
- ✅ `src/features/modules/entries/lib/__tests__/entryService.test.ts` - Entry Service

### API Tests
- ✅ `__tests__/api/routes.test.ts` - API Routes (general)

### Security Tests (✅ Complete)
- ✅ `__tests__/security/authentication.test.ts` - Authentication & Authorization
- ✅ `__tests__/security/dataValidation.test.ts` - Data Validation
- ✅ `__tests__/security/csrfAndSession.test.ts` - CSRF Protection & Session Security

### Accessibility Tests (✅ Complete)
- ✅ `__tests__/accessibility/keyboardNavigation.test.tsx` - Keyboard Navigation
- ✅ `__tests__/accessibility/screenReader.test.tsx` - Screen Reader Compatibility
- ✅ `__tests__/accessibility/ariaLabels.test.tsx` - ARIA Labels
- ✅ `__tests__/accessibility/focusManagement.test.tsx` - Focus Management
- ✅ `__tests__/accessibility/colorContrast.test.tsx` - Color Contrast
- ✅ `src/features/infrastructure/utils/accessibility/helpers.ts` - Accessibility Testing Utilities

## Tests That Still Need to Be Created

### Integration Tests
- ❌ Firebase Integration Tests
- ❌ Next.js Integration Tests
- ❌ NextAuth Integration Tests
- ❌ MDX Integration Tests

### E2E Tests
- ❌ All E2E scenario tests

### Performance Tests
- ❌ All performance tests

### Edge Cases Tests
- ❌ All edge case tests

### Snapshot Tests
- ❌ All snapshot tests

### Migration Tests
- ❌ All migration tests

## Test File Location Patterns

The project currently uses **three different patterns** for test file locations:

### Pattern 1: Co-located in `__tests__/` subdirectories (Recommended)
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
- `src/features/infrastructure/lib/archiveService.test.ts`
- `src/features/infrastructure/lib/userDataService.test.ts`
- `src/features/infrastructure/utils/objectUtils.test.ts` (next to `objectUtils.ts`)
- `src/features/infrastructure/utils/timestampUtils.test.ts` (next to `timestampUtils.ts`)
- `src/features/infrastructure/utils/userRoleUtils.test.ts` (next to `userRoleUtils.ts`)
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

## Recommended Test Locations

**For new tests**, prefer Pattern #1 (`__tests__/` subdirectories) for consistency:

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

## Jest Configuration

The Jest config supports both patterns:
```javascript
testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"]
```

This matches:
- Files in `__tests__/` directories
- Files with `.test.ts` or `.spec.ts` extensions anywhere

Both patterns work, but `__tests__/` subdirectories are cleaner and more organized.

## Recommendations

1. **Start with API Route Tests** - These are critical for ensuring API functionality
2. **Add Component Tests** - Important for UI reliability
3. **Add Hook Tests** - Hooks are core to React functionality
4. **Add Integration Tests** - Ensure systems work together
5. **Add E2E Tests** - Cover critical user flows

## Related Documentation

- [Comprehensive Test Plan](./comprehensive-test-plan.md) - Complete test specifications
- [Test Plans README](./README.md) - Test plan organization
- [CODEX Quick Start](./CODEX_QUICK_START.md) - How to use Codex agents for test creation

