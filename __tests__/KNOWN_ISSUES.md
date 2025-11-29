# Known Test Issues

This document tracks known issues with the test suite that require further investigation or are pending fixes.

## Health Test - Firebase Admin Mock Chain Issue

**File**: `src/pages/api/__tests__/health.test.ts`

**Issue**: One test is failing: "returns healthy status when database is accessible"

**Status**: 5/6 tests passing

**Problem**: The mock chain for Firebase Admin (`db.collection('games').limit(1).get()`) is not working correctly in the test environment. The database check returns a 503 error instead of 200, indicating the mock chain is broken or not properly connected.

**Root Cause**: 
- Jest mock hoisting may be interfering with the mock chain setup
- The global mock in `config/jest.setup.cjs` may be conflicting with the test-specific mock
- `jest.clearAllMocks()` may be clearing mock implementations before they can be used

**Attempted Solutions**:
1. Various mock setup strategies (module-scoped variables, factory functions, `jest.requireMock`)
2. Different approaches to creating and connecting the mock chain
3. Adjusting when and how mocks are cleared/reset

**Impact**: Low - 5/6 tests passing, other tests (error cases, method validation) work correctly

**Next Steps**: 
- Investigate Jest mock hoisting behavior in detail
- Consider using a manual mock file (`__mocks__`) instead of inline mocking
- Review if the global mock setup can be improved to support this use case
- Potentially refactor the health endpoint to make it more testable

**Created**: 2025-11-29

---

## Icons List Test - fs/promises Mock Issue

**File**: `src/pages/api/icons/__tests__/list.test.ts`

**Issue**: Two tests failing: "sorts icons by category then filename" and "handles error when reading directory"

**Status**: 8/10 tests passing

**Problem**: The mock for `fs/promises.readdir` is not being applied correctly. The handler is reading actual files from the filesystem (323 real icon files) instead of using the mocked `readdir` function. This causes the tests to receive unexpected data.

**Root Cause**: 
- Jest mock hoisting or module resolution may not be working correctly for `fs/promises`
- The handler imports `readdir` directly from `fs/promises`, and the mock may not be intercepting it properly

**Attempted Solutions**:
1. Added `__esModule: true` to the mock
2. Attempted to access the mocked module using `require('fs/promises')` in the test

**Impact**: Low - 8/10 tests passing, most functionality is covered

**Next Steps**: 
- Try using a manual mock file (`__mocks__/fs/promises.js`) instead of inline mocking
- Investigate Jest's handling of Node.js built-in modules
- Consider mocking at a different level (e.g., mock the entire handler logic)

**Created**: 2025-11-29

---

## GameService Test - Firebase Admin Query Chain Mocking Issues

**File**: `src/features/modules/games/lib/__tests__/gameService.test.ts`

**Issue**: Nine tests failing out of 19 total tests

**Status**: 10/19 tests passing (52.6%)

**Problem**: Multiple tests are failing due to complex Firebase Admin SDK query chain mocking issues:

1. **getGames tests (4 failures)**: Tests for `getGames` filtering by gameState, category, gameId, and limit are all returning empty arrays. The Firebase Admin query chain (`collection().where().where().orderBy().limit().get()`) is not properly mocked, and the snapshot's `forEach` method is not correctly processing mock documents.

2. **updateGame ELO recalculation test**: The test "recalculates ELO when players are updated" expects `updateEloScores` to be called, but it's not being called (0 calls received). The mock chain `collection().doc().update()` may not be properly triggering the players update check.

3. **createScheduledGame gameId generation test**: The test "generates next gameId when not provided" is failing because the `getNextGameId` function's Firebase Admin query chain (`collection().orderBy().limit().get()`) is not properly mocked or connected.

4. **Other failures**: Additional tests related to Firebase Admin operations may be affected by similar mocking chain issues.

**Root Cause**: 
- The Firebase Admin SDK uses complex fluent API chains that are difficult to mock in Jest
- Each method in the chain returns a new object with the next method, requiring careful mock setup
- Jest mock hoisting and module resolution may interfere with complex mock chains
- The `snapshot.forEach` method requires documents with both `id` and `data()` properties that work correctly with `convertGameDoc`
- Multiple query chains with different patterns (some with orderBy, some without, varying numbers of where clauses) make it difficult to create a unified mock strategy

**Attempted Solutions**:
1. Created mock chains for Firebase Admin queries with proper method chaining
2. Attempted to mock `snapshot.forEach` with proper document structure
3. Set up server-side mode mocks for tests that require `isServerSide() === true`
4. Created separate mock implementations for different query patterns
5. Tried using `jest.requireMock` to access and modify mocks dynamically

**Impact**: Medium - 10/19 tests passing (52.6%). Core functionality tests (validation, basic CRUD) are passing, but filtering, querying, and complex operations cannot be fully verified.

**Next Steps**: 
- Consider creating a comprehensive Firebase Admin mock helper/utility that handles common query patterns
- Investigate using `firebase-admin` mock libraries or creating manual mock files (`__mocks__`)
- Review if the implementation can be refactored to be more testable (e.g., dependency injection for Firebase Admin)
- Potentially split complex query logic into smaller, more testable functions
- Consider integration tests using Firebase Emulator Suite instead of unit tests with mocks

**Created**: 2025-01-28

