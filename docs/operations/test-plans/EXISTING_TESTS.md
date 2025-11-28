# Existing Tests Summary

This document tracks which tests already exist in the project and what still needs to be created.

## ✅ Tests That Already Exist

### Infrastructure Tests (`infrastructure-tests.md`)
- ✅ `__tests__/infrastructure/api/firebase/config.test.ts` - Firebase Configuration
- ✅ `__tests__/infrastructure/api/firebase/admin.test.ts` - Firebase Admin
- ✅ `__tests__/infrastructure/api/firebase/firebaseClient.test.ts` - Firebase Client
- ✅ `__tests__/infrastructure/api/routeHandlers.test.ts` - API Route Handlers
- ✅ `__tests__/infrastructure/auth/index.test.ts` - Authentication
- ✅ `__tests__/infrastructure/logging/logger.test.ts` - Logging System
- ✅ `__tests__/shared/utils/loggerUtils.test.ts` - Logger Utils

### Utilities Tests (`utilities-tests.md`)
- ✅ `src/features/infrastructure/utils/objectUtils.test.ts` - Object Utils
- ✅ `src/features/infrastructure/utils/timestampUtils.test.ts` - Timestamp Utils
- ✅ `src/features/shared/utils/userRoleUtils.test.ts` - User Role Utils
- ✅ `src/features/modules/scheduled-games/utils/timezoneUtils.test.ts` - Timezone Utils
- ✅ `src/features/modules/tools/icon-mapper.utils.test.ts` - Icon Mapper Utils
- ✅ `src/features/modules/archives/utils/archiveFormUtils.test.ts` - Archive Form Utils
- ✅ `src/features/modules/archives/utils/archiveValidation.test.ts` - Archive Validation

### Games Tests (`games-tests.md`)
- ✅ `src/features/modules/games/lib/__tests__/eloCalculator.test.ts` - ELO Calculator
- ✅ `src/features/modules/games/lib/__tests__/replayParser.test.ts` - Replay Parser
- ✅ `src/features/modules/games/lib/__tests__/w3mmdUtils.test.ts` - W3MMD Utils
- ✅ `src/features/modules/games/lib/gameService.test.ts` - Game Service

**Still Needed:**
- ❌ Games API Route Tests (`src/pages/api/games/__tests__/`)
- ❌ Game Components Tests (`src/features/modules/games/components/__tests__/`)
- ❌ Game Hooks Tests (`src/features/modules/games/hooks/__tests__/`)

### Players Tests (`players-tests.md`)
- ✅ `src/features/modules/players/lib/playerService.test.ts` - Player Service

**Still Needed:**
- ❌ Players API Route Tests (`src/pages/api/players/__tests__/`)
- ❌ Player Components Tests (`src/features/modules/players/components/__tests__/`)
- ❌ Player Hooks Tests (`src/features/modules/players/hooks/__tests__/`)

### Blog Tests (`blog-tests.md`)
- ✅ `src/features/modules/blog/lib/postService.test.ts` - Post Service
- ✅ `src/features/modules/blog/lib/posts.test.ts` - Post Loading & Serialization

**Still Needed:**
- ❌ Posts API Route Tests (`src/pages/api/posts/__tests__/`)
- ❌ Blog Components Tests (`src/features/modules/blog/components/__tests__/`)
- ❌ Blog Hooks Tests (`src/features/modules/blog/hooks/__tests__/`)

### Archives Tests (`archives-tests.md`)
- ✅ `src/features/shared/lib/archiveService.test.ts` - Archive Service
- ✅ `src/features/modules/archives/utils/archiveFormUtils.test.ts` - Archive Form Utils
- ✅ `src/features/modules/archives/utils/archiveValidation.test.ts` - Archive Validation

**Still Needed:**
- ❌ Archives API Route Tests (`src/pages/api/entries/__tests__/`)
- ❌ Archive Components Tests (`src/features/modules/archives/components/__tests__/`)
- ❌ Archive Hooks Tests (`src/features/modules/archives/hooks/__tests__/`)

### Scheduled Games Tests (`scheduled-games-tests.md`)
- ✅ `src/features/modules/scheduled-games/lib/scheduledGameService.test.ts` - Scheduled Game Service
- ✅ `src/features/modules/scheduled-games/utils/timezoneUtils.test.ts` - Timezone Utils

**Note**: The scheduled games collection and dedicated pages have been removed. Scheduled games are now managed through the main `games` collection with `gameState: 'scheduled'`. API routes for scheduled games no longer exist - functionality has been moved to `/api/games`.

**Still Needed:**
- ❌ Scheduled Games Components Tests (`src/features/modules/scheduled-games/components/__tests__/`) - Components still exist and are used in other parts of the app
- ❌ Scheduled Games Hooks Tests (`src/features/modules/scheduled-games/hooks/__tests__/`) - If hooks exist

### Standings Tests (`standings-tests.md`)
**Still Needed:**
- ❌ Standings Service Tests (`src/features/modules/standings/lib/__tests__/`)
- ❌ Standings API Route Tests (`src/pages/api/standings/__tests__/`)
- ❌ Standings Hooks Tests (`src/features/modules/standings/hooks/__tests__/`)
- ❌ Standings Components Tests (`src/features/modules/standings/components/__tests__/`)

### Analytics Tests (`analytics-tests.md`)
- ✅ `src/features/modules/analytics/lib/analyticsService.test.ts` - Analytics Service

**Still Needed:**
- ❌ Analytics API Route Tests (`src/pages/api/analytics/__tests__/`)
- ❌ Analytics Components Tests (`src/features/modules/analytics/components/__tests__/`)

### Guides Tests (`guides-tests.md`)
**Still Needed:**
- ❌ Guide Data Loading Tests (`src/features/modules/guides/data/__tests__/`)
- ❌ Guide Utilities Tests (`src/features/modules/guides/utils/__tests__/`)
- ❌ Guides Components Tests (`src/features/modules/guides/components/__tests__/`)
- ❌ Guides Hooks Tests (`src/features/modules/guides/hooks/__tests__/`)

### Map Analyzer Tests (`map-analyzer-tests.md`)
- ✅ `src/features/modules/map-analyzer/utils/__tests__/mapUtils.test.ts` - Map Utilities
- ✅ `src/features/modules/map-analyzer/components/__tests__/HeightDistributionChart.test.tsx` - Component Test

**Still Needed:**
- ❌ Map Parsing Tests
- ❌ Additional Map Analyzer Component Tests

### Tools Tests (`tools-tests.md`)
- ✅ `src/features/modules/tools/__tests__/icon-mapper.utils.test.ts` - Icon Mapper Utils
- ✅ `src/features/modules/tools/__tests__/useIconMapperData.test.ts` - Icon Mapper Hook

**Still Needed:**
- ❌ Duel Simulator Tests

### Other Services
- ✅ `src/features/shared/lib/userDataService.test.ts` - User Data Service
- ✅ `src/features/modules/entries/lib/entryService.test.ts` - Entry Service

### API Tests
- ✅ `__tests__/api/routes.test.ts` - API Routes (general)

## ❌ Tests That Still Need to Be Created

### Integration Tests (`integration-tests.md`)
- ❌ Firebase Integration Tests
- ❌ Next.js Integration Tests
- ❌ NextAuth Integration Tests
- ❌ MDX Integration Tests

### E2E Tests (`e2e-tests.md`)
- ❌ All E2E scenario tests

### Performance Tests (`performance-tests.md`)
- ❌ All performance tests

### Edge Cases Tests (`edge-cases-tests.md`)
- ❌ All edge case tests

### Security Tests (✅ Complete - All tests implemented)
- ✅ `__tests__/security/authentication.test.ts` - Authentication & Authorization
- ✅ `__tests__/security/dataValidation.test.ts` - Data Validation (Input Sanitization, Output Encoding, File Upload, URL Validation)
- ✅ `__tests__/security/csrfAndSession.test.ts` - CSRF Protection & Session Security

### Accessibility Tests (✅ Complete - All tests implemented)
- ✅ `__tests__/accessibility/keyboardNavigation.test.tsx` - Keyboard Navigation
- ✅ `__tests__/accessibility/screenReader.test.tsx` - Screen Reader Compatibility
- ✅ `__tests__/accessibility/ariaLabels.test.tsx` - ARIA Labels
- ✅ `__tests__/accessibility/focusManagement.test.tsx` - Focus Management
- ✅ `__tests__/accessibility/colorContrast.test.tsx` - Color Contrast
- ✅ `src/features/shared/utils/accessibility/helpers.ts` - Accessibility Testing Utilities

### Snapshot Tests (`snapshot-tests.md`)
- ❌ All snapshot tests

### Migration Tests (`migration-tests.md`)
- ❌ All migration tests

## Summary

**Completed:**
- ✅ Infrastructure tests (mostly complete)
- ✅ Utility function tests (mostly complete)
- ✅ Service layer tests (many complete)
- ✅ Some component tests (minimal)

**Priority Missing Tests:**
1. **API Route Tests** - Most API routes lack tests
2. **Component Tests** - Most components lack tests
3. **Hook Tests** - Most hooks lack tests
4. **Integration Tests** - No integration tests
5. **E2E Tests** - No E2E tests

## Recommendations

1. **Start with API Route Tests** - These are critical for ensuring API functionality
2. **Add Component Tests** - Important for UI reliability
3. **Add Hook Tests** - Hooks are core to React functionality
4. **Add Integration Tests** - Ensure systems work together
5. **Add E2E Tests** - Cover critical user flows

## Test File Locations

⚠️ **Note**: Tests are currently organized in **three mixed patterns**:

1. **Co-located in `__tests__/` subdirectories**: `src/features/[module]/[component]/__tests__/[name].test.ts`
   - Used for: Some lib tests, some component tests
   - Example: `src/features/modules/games/lib/__tests__/eloCalculator.test.ts`

2. **Next to source files**: `src/features/[module]/[component]/[name].test.ts`
   - Used for: Most service tests, utility tests
   - Example: `src/features/modules/games/lib/gameService.test.ts` (next to `gameService.ts`)

3. **Root `__tests__/` directory**: `__tests__/[category]/[module]/[name].test.ts`
   - Used for: Infrastructure tests, shared utilities
   - Example: `__tests__/infrastructure/api/firebase/config.test.ts`

**Recommendation**: For new tests, prefer pattern #1 (`__tests__/` subdirectories) for consistency. See `TEST_LOCATIONS.md` for detailed analysis.

