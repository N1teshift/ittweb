# Test Specifications - Infrastructure & Utility Tests

Test specifications for infrastructure components and utility functions.

## Infrastructure Tests

### Firebase Configuration
- [ ] `src/features/infrastructure/api/firebase/config.ts`
  - Test Firebase client configuration initialization
  - Test environment variable validation
  - Test Firebase app initialization error handling
  - Test Firebase app singleton behavior

### Firebase Admin
- [ ] `src/features/infrastructure/api/firebase/admin.ts`
  - Test admin SDK initialization
  - Test `getFirestoreAdmin()` returns singleton instance
  - Test `isServerSide()` detection
  - Test admin initialization error handling

### Firebase Client
- [ ] `src/features/infrastructure/api/firebase/firebaseClient.ts`
  - Test client SDK initialization
  - Test `getFirestoreInstance()` returns singleton
  - Test client initialization error handling

### API Route Handlers
- [ ] `src/features/infrastructure/api/routeHandlers.ts`
  - Test `createApiHandler` with GET method
  - Test `createApiHandler` with POST method
  - Test `createApiHandler` with multiple allowed methods
  - Test method validation (405 error for disallowed methods)
  - Test body validation with validator function
  - Test authentication requirement
  - Test error handling and logging
  - Test response format standardization
  - Test request logging when enabled/disabled
  - Test timing metrics

### Authentication
- [ ] `src/features/infrastructure/auth/index.ts`
  - Test session retrieval
  - Test authentication status checking
  - Test user data extraction from session

### Logging System
- [ ] `src/features/infrastructure/logging/logger.ts`
  - Test logger initialization
  - Test log levels (debug, info, warn, error)
  - Test log filtering based on environment
  - Test log formatting
  - Test `createComponentLogger` factory
  - Test component logger prefixing
  - Test `logError` function
  - Test `logAndThrow` function
  - Test `determineErrorCategory` with various error types
  - Note: Legacy `loggerUtils.ts` is a backward-compatibility re-export
  - Test error categorization (VALIDATION, NETWORK, DATABASE, etc.)
  - Test logger in development vs production modes

## Utility Functions Tests

### Object Utils
- [ ] `src/features/infrastructure/utils/objectUtils.ts`
  - Test `removeUndefined` removes undefined values
  - Test `removeUndefined` preserves null values
  - Test `removeUndefined` preserves other falsy values
  - Test `removeUndefined` with nested objects
  - Test `removeUndefined` with empty object
  - Test `removeUndefined` maintains type safety

### Timestamp Utils
- [ ] `src/features/infrastructure/utils/timestampUtils.ts`
  - Test `timestampToIso` with Firestore Timestamp
  - Test `timestampToIso` with Admin SDK Timestamp
  - Test `timestampToIso` with string timestamp
  - Test `timestampToIso` with Date object
  - Test `timestampToIso` with undefined (defaults to now)
  - Test `timestampToIso` with TimestampLike objects
  - Test ISO string format validation

### User Role Utils
- [ ] `src/features/infrastructure/utils/userRoleUtils.ts`
  - Test `hasRole` with all role combinations
  - Test `hasRole` role hierarchy (developer > admin > moderator > premium > user)
  - Test `hasRole` with undefined user role (defaults to user)
  - Test `isAdmin` function
  - Test `isDeveloper` function
  - Test `isModerator` function
  - Test `isPremium` function
  - Test role comparison edge cases
  - Test DEFAULT_USER_ROLE constant

### Timezone Utils
- [ ] `src/features/modules/scheduled-games/utils/timezoneUtils.ts`
  - Test `getUserTimezone` in browser environment
  - Test `getUserTimezone` in server environment (returns UTC)
  - Test `convertToTimezone` converts UTC to target timezone
  - Test `formatDateTimeInTimezone` with various timezones
  - Test `formatDateTimeInTimezone` with custom options
  - Test `convertLocalToUTC` with various timezones
  - Test `convertLocalToUTC` handles DST correctly
  - Test `convertLocalToUTC` with edge cases (midnight, year boundaries)
  - Test `getCommonTimezones` returns expected list
  - Test `getTimezoneAbbreviation` returns correct abbreviation
  - Test `getTimezoneAbbreviation` handles invalid timezone gracefully

### Icon Mapper Utils
- [ ] `src/features/modules/tools/icon-mapper.utils.ts`
  - Test `formatCategoryForExport` formats category correctly
  - Test `formatCategoryForExport` sorts entries alphabetically
  - Test `formatCategoryForExport` with empty category
  - Test `exportMappingsAsCode` generates valid TypeScript code
  - Test `exportMappingsAsCode` includes all categories
  - Test `exportMarkedForDeletion` formats array as JSON
  - Test `exportMarkedForDeletion` sorts paths
  - Test `exportMappingsAndDeletions` combines mappings and deletions
  - Test export functions with special characters in keys/values

### Archive Form Utils
- [ ] `src/features/modules/archives/utils/archiveFormUtils.ts`
  - Test date formatting utilities
  - Test form data transformation

## Related Documentation

- [Test Specifications Index](./README.md)
- [Service Layer Tests](./service-layer-tests.md)
- [API Route Tests](./api-route-tests.md)
- [Testing Guide](../testing-guide.md)

