/**
 * Shared test helper for mocking server-side userDataService functions
 * 
 * This module must be imported BEFORE importing the module under test.
 * 
 * Usage in test files:
 * ```typescript
 * // Import this FIRST, before importing handlers
 * import '../../__tests__/helpers/mockUserDataService.server';
 * import handler from '../data-notice-status';
 * 
 * // Then import the mock functions
 * import {
 *   mockGetUserDataByDiscordIdServer,
 *   mockUpdateDataCollectionNoticeAcceptanceServer,
 *   mockDeleteUserDataServer,
 *   mockSaveUserDataServer,
 *   setIsServerSide,
 * } from '../../__tests__/helpers/mockUserDataService.server';
 * 
 * describe('My test', () => {
 *   beforeEach(() => {
 *     setIsServerSide(true); // Enable server-side mode
 *     jest.clearAllMocks();
 *   });
 *   
 *   it('should work', async () => {
 *     mockGetUserDataByDiscordIdServer.mockResolvedValue({ ... });
 *     // ... test code
 *   });
 * });
 * ```
 */

// Mock the userDataService.server module (must be at top level due to Jest hoisting)
export const mockGetUserDataByDiscordIdServer = jest.fn();
export const mockUpdateDataCollectionNoticeAcceptanceServer = jest.fn();
export const mockDeleteUserDataServer = jest.fn();
export const mockSaveUserDataServer = jest.fn();

jest.mock('@/features/infrastructure/lib/userDataService.server', () => ({
  getUserDataByDiscordIdServer: (...args: unknown[]) => mockGetUserDataByDiscordIdServer(...args),
  updateDataCollectionNoticeAcceptanceServer: (...args: unknown[]) => mockUpdateDataCollectionNoticeAcceptanceServer(...args),
  deleteUserDataServer: (...args: unknown[]) => mockDeleteUserDataServer(...args),
  saveUserDataServer: (...args: unknown[]) => mockSaveUserDataServer(...args),
}));

/**
 * Helper to set isServerSide mock return value
 * Call this in beforeEach to enable server-side mode for tests
 */
export function setIsServerSide(value: boolean): void {
  const adminModule = jest.requireMock('@/features/infrastructure/api/firebase/admin');
  adminModule.isServerSide.mockReturnValue(value);
}

