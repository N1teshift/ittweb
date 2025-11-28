# Utility Functions Tests

This document outlines all tests needed for utility functions across the application.

## Object Utils

### `src/features/infrastructure/utils/objectUtils.ts`

- [ ] Test `removeUndefined` removes undefined values
  - **What**: Verify undefined properties are removed from objects
  - **Expected**: Object returned without undefined properties, other values preserved
  - **Edge cases**: Nested undefined, arrays with undefined, deeply nested objects

- [ ] Test `removeUndefined` preserves null values
  - **What**: Verify null values are not removed (only undefined)
  - **Expected**: Null values remain in object, only undefined removed
  - **Edge cases**: Multiple null values, null in arrays, null in nested objects

- [ ] Test `removeUndefined` preserves other falsy values
  - **What**: Verify falsy values (0, false, empty string) are preserved
  - **Expected**: All falsy values except undefined are kept
  - **Edge cases**: NaN, empty arrays, empty objects

- [ ] Test `removeUndefined` with nested objects
  - **What**: Verify nested objects are processed recursively
  - **Expected**: Undefined removed from all nesting levels
  - **Edge cases**: Circular references, very deep nesting, mixed structures

- [ ] Test `removeUndefined` with empty object
  - **What**: Verify empty object handling
  - **Expected**: Returns empty object unchanged
  - **Edge cases**: Object with only undefined values, null prototype objects

- [ ] Test `removeUndefined` maintains type safety
  - **What**: Verify TypeScript types are preserved
  - **Expected**: Return type correctly reflects removed undefined properties
  - **Edge cases**: Generic types, union types, optional properties

## Timestamp Utils

### `src/features/infrastructure/utils/timestampUtils.ts`

- [ ] Test `timestampToIso` with Firestore Timestamp
  - **What**: Verify Firestore Timestamp converts to ISO string
  - **Expected**: Returns ISO 8601 formatted string
  - **Edge cases**: Invalid timestamps, future dates, very old dates

- [ ] Test `timestampToIso` with Admin SDK Timestamp
  - **What**: Verify Admin SDK Timestamp converts correctly
  - **Expected**: Returns ISO string matching Firestore format
  - **Edge cases**: Different timestamp formats, timezone handling

- [ ] Test `timestampToIso` with string timestamp
  - **What**: Verify string timestamps are parsed and converted
  - **Expected**: String converted to ISO format
  - **Edge cases**: Invalid strings, different formats, timezone strings

- [ ] Test `timestampToIso` with Date object
  - **What**: Verify JavaScript Date objects are converted
  - **Expected**: Date converted to ISO string
  - **Edge cases**: Invalid dates, timezone offsets, DST transitions

- [ ] Test `timestampToIso` with undefined (defaults to now)
  - **What**: Verify undefined input defaults to current time
  - **Expected**: Returns current time as ISO string
  - **Edge cases**: System clock changes, high precision timing

- [ ] Test `timestampToIso` with TimestampLike objects
  - **What**: Verify objects with timestamp-like structure are handled
  - **Expected**: Extracts timestamp and converts to ISO
  - **Edge cases**: Missing properties, invalid structures, custom objects

- [ ] Test ISO string format validation
  - **What**: Verify output is valid ISO 8601 format
  - **Expected**: All outputs are valid ISO strings
  - **Edge cases**: Timezone formats, milliseconds precision, leap seconds

## User Role Utils

### `src/features/shared/utils/userRoleUtils.ts`

- [ ] Test `hasRole` with all role combinations
  - **What**: Verify role checking works for all role pairs
  - **Expected**: Returns true when user role meets or exceeds required role
  - **Edge cases**: Same role, role hierarchy boundaries, custom roles

- [ ] Test `hasRole` role hierarchy (developer > admin > moderator > premium > user)
  - **What**: Verify role hierarchy is enforced correctly
  - **Expected**: Higher roles satisfy lower role requirements
  - **Edge cases**: Role at boundary, missing roles, undefined hierarchy

- [ ] Test `hasRole` with undefined user role (defaults to user)
  - **What**: Verify undefined role defaults to lowest role
  - **Expected**: Undefined treated as 'user' role
  - **Edge cases**: Null role, empty string, invalid role string

- [ ] Test `isAdmin` function
  - **What**: Verify admin role detection
  - **Expected**: Returns true for admin and developer, false otherwise
  - **Edge cases**: Case sensitivity, role variations, missing role

- [ ] Test `isDeveloper` function
  - **What**: Verify developer role detection
  - **Expected**: Returns true only for developer role
  - **Edge cases**: Case sensitivity, role string variations

- [ ] Test `isModerator` function
  - **What**: Verify moderator role detection
  - **Expected**: Returns true for moderator, admin, and developer
  - **Edge cases**: Role hierarchy, case sensitivity

- [ ] Test `isPremium` function
  - **What**: Verify premium role detection
  - **Expected**: Returns true for premium and higher roles
  - **Edge cases**: Role boundaries, case sensitivity

- [ ] Test role comparison edge cases
  - **What**: Verify edge cases in role comparison
  - **Expected**: Handles all edge cases gracefully
  - **Edge cases**: Invalid roles, type mismatches, boundary conditions

- [ ] Test DEFAULT_USER_ROLE constant
  - **What**: Verify default role constant is correct
  - **Expected**: Constant equals 'user'
  - **Edge cases**: Constant usage, type checking

## Timezone Utils

### `src/features/modules/scheduled-games/utils/timezoneUtils.ts`

- [ ] Test `getUserTimezone` in browser environment
  - **What**: Verify timezone detection in browser
  - **Expected**: Returns user's browser timezone (e.g., 'America/New_York')
  - **Edge cases**: Unsupported timezones, browser compatibility, privacy settings

- [ ] Test `getUserTimezone` in server environment (returns UTC)
  - **What**: Verify server-side defaults to UTC
  - **Expected**: Returns 'UTC' when running on server
  - **Edge cases**: Edge runtime, different server environments

- [ ] Test `convertToTimezone` converts UTC to target timezone
  - **What**: Verify UTC datetime converts to target timezone
  - **Expected**: Datetime correctly converted with timezone offset applied
  - **Edge cases**: DST transitions, timezone boundaries, invalid timezones

- [ ] Test `formatDateTimeInTimezone` with various timezones
  - **What**: Verify formatting works across different timezones
  - **Expected**: Correctly formatted datetime for each timezone
  - **Edge cases**: Extreme timezones, DST, timezone abbreviations

- [ ] Test `formatDateTimeInTimezone` with custom options
  - **What**: Verify custom formatting options are applied
  - **Expected**: Format matches provided options (date style, time style, etc.)
  - **Edge cases**: Invalid options, conflicting options, locale-specific formats

- [ ] Test `convertLocalToUTC` with various timezones
  - **What**: Verify local time converts to UTC correctly
  - **Expected**: Local datetime correctly converted to UTC
  - **Edge cases**: DST transitions, timezone boundaries, ambiguous times

- [ ] Test `convertLocalToUTC` handles DST correctly
  - **What**: Verify daylight saving time transitions are handled
  - **Expected**: DST transitions don't cause errors or incorrect conversions
  - **Edge cases**: Spring forward, fall back, timezones without DST

- [ ] Test `convertLocalToUTC` with edge cases (midnight, year boundaries)
  - **What**: Verify edge cases in time conversion
  - **Expected**: Handles midnight, year boundaries, leap years correctly
  - **Edge cases**: Leap seconds, year 0, far future dates

- [ ] Test `getCommonTimezones` returns expected list
  - **What**: Verify common timezones list is complete and correct
  - **Expected**: Returns array of common timezone identifiers
  - **Edge cases**: Empty list, duplicate entries, invalid timezones

- [ ] Test `getTimezoneAbbreviation` returns correct abbreviation
  - **What**: Verify timezone abbreviations are correct
  - **Expected**: Returns correct abbreviation (EST, PST, etc.)
  - **Edge cases**: DST abbreviations, ambiguous abbreviations, unknown timezones

- [ ] Test `getTimezoneAbbreviation` handles invalid timezone gracefully
  - **What**: Verify invalid timezone input is handled
  - **Expected**: Returns fallback or throws appropriate error
  - **Edge cases**: Empty string, null, malformed timezone strings

## Icon Mapper Utils

### `src/features/modules/tools/icon-mapper.utils.ts`

- [ ] Test `formatCategoryForExport` formats category correctly
  - **What**: Verify category data is formatted for export
  - **Expected**: Category formatted as valid TypeScript/JSON structure
  - **Edge cases**: Empty category, special characters, nested structures

- [ ] Test `formatCategoryForExport` sorts entries alphabetically
  - **What**: Verify entries are sorted in alphabetical order
  - **Expected**: All entries sorted by key or name
  - **Edge cases**: Case sensitivity, special characters, numbers

- [ ] Test `formatCategoryForExport` with empty category
  - **What**: Verify empty category handling
  - **Expected**: Returns empty structure or appropriate default
  - **Edge cases**: Null category, undefined category, empty object

- [ ] Test `exportMappingsAsCode` generates valid TypeScript code
  - **What**: Verify generated code is valid TypeScript
  - **Expected**: Code can be parsed and executed without errors
  - **Edge cases**: Special characters, large datasets, circular references

- [ ] Test `exportMappingsAsCode` includes all categories
  - **What**: Verify all categories are included in export
  - **Expected**: All categories present in generated code
  - **Edge cases**: Empty categories, missing categories, duplicate categories

- [ ] Test `exportMarkedForDeletion` formats array as JSON
  - **What**: Verify deletion list is formatted as JSON
  - **Expected**: Valid JSON array with file paths
  - **Edge cases**: Empty array, special characters in paths, invalid paths

- [ ] Test `exportMarkedForDeletion` sorts paths
  - **What**: Verify paths are sorted
  - **Expected**: Paths sorted alphabetically
  - **Edge cases**: Case sensitivity, path separators, relative vs absolute

- [ ] Test `exportMappingsAndDeletions` combines mappings and deletions
  - **What**: Verify both mappings and deletions are included
  - **Expected**: Combined output includes both sections
  - **Edge cases**: Empty mappings, empty deletions, both empty

- [ ] Test export functions with special characters in keys/values
  - **What**: Verify special characters are handled correctly
  - **Expected**: Special characters escaped or handled appropriately
  - **Edge cases**: Unicode, emoji, control characters, quotes

## Archive Form Utils

### `src/features/modules/archives/utils/archiveFormUtils.ts`

- [ ] Test `buildDateInfo` with single date type
  - **What**: Verify single date is formatted correctly
  - **Expected**: Returns date info object with single date
  - **Edge cases**: Invalid dates, different date formats, timezone handling

- [ ] Test `buildDateInfo` with undated type
  - **What**: Verify undated entries are handled
  - **Expected**: Returns date info indicating undated entry
  - **Edge cases**: Missing date, null date, empty date string

- [ ] Test `buildDateInfo` includes approximateText when provided
  - **What**: Verify approximate text is included in date info
  - **Expected**: Approximate text included when provided
  - **Edge cases**: Empty text, very long text, special characters

- [ ] Test `computeEffectiveSectionOrder` filters based on flags
  - **What**: Verify section order respects enable/disable flags
  - **Expected**: Only enabled sections included in order
  - **Edge cases**: All disabled, all enabled, mixed flags

- [ ] Test `computeEffectiveSectionOrder` maintains order
  - **What**: Verify section order is preserved
  - **Expected**: Sections maintain their relative order
  - **Edge cases**: Duplicate sections, missing sections, custom order

- [ ] Test `normalizeSectionOrder` removes duplicates
  - **What**: Verify duplicate sections are removed
  - **Expected**: Each section appears only once
  - **Edge cases**: Multiple duplicates, all duplicates, no duplicates

- [ ] Test `normalizeSectionOrder` fills missing sections
  - **What**: Verify missing standard sections are added
  - **Expected**: All required sections present in normalized order
  - **Edge cases**: Empty array, all missing, partial missing

- [ ] Test `normalizeSectionOrder` with empty array
  - **What**: Verify empty array handling
  - **Expected**: Returns default section order
  - **Edge cases**: Null array, undefined array

- [ ] Test `normalizeSectionOrder` with invalid sections
  - **What**: Verify invalid sections are handled
  - **Expected**: Invalid sections removed or ignored
  - **Edge cases**: Unknown sections, malformed section names

- [ ] Test `extractFilenameFromUrl` extracts filename from URL
  - **What**: Verify filename is extracted from URL
  - **Expected**: Returns filename portion of URL
  - **Edge cases**: URLs without filename, query parameters, fragments

- [ ] Test `extractFilenameFromUrl` handles URL encoding
  - **What**: Verify URL-encoded filenames are decoded
  - **Expected**: Filename correctly decoded from URL encoding
  - **Edge cases**: Multiple encodings, special characters, unicode

- [ ] Test `extractFilenameFromUrl` handles invalid URLs
  - **What**: Verify invalid URLs are handled gracefully
  - **Expected**: Returns fallback or throws appropriate error
  - **Edge cases**: Malformed URLs, empty strings, non-URL strings

- [ ] Test `extractFilenameFromUrl` returns 'File' for empty URL
  - **What**: Verify empty URL returns default filename
  - **Expected**: Returns 'File' when URL is empty
  - **Edge cases**: Null URL, undefined URL, whitespace-only URL

