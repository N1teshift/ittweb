# Archives Tests

This document outlines all tests needed for the archives module including services, API routes, components, hooks, validation, and archive system logic.

## Archive Service

### `src/shared/lib/archiveService.ts` (client)

- [ ] Test `getAllArchives` retrieves all archives
  - **What**: Verify all archives are retrieved from Firestore
  - **Expected**: Returns array of all archive documents
  - **Edge cases**: Empty collection, very large collection, permission errors

- [ ] Test `getArchiveById` retrieves archive by ID
  - **What**: Verify archive is retrieved by document ID
  - **Expected**: Returns archive document matching the ID
  - **Edge cases**: Invalid ID format, malformed document, missing fields

- [ ] Test `createArchive` creates new archive
  - **What**: Verify new archive document is created
  - **Expected**: Archive document created with provided data and generated ID
  - **Edge cases**: Missing required fields, duplicate archive, permission errors

- [ ] Test `updateArchive` updates existing archive
  - **What**: Verify archive document is updated
  - **Expected**: Archive document updated, old data replaced/merged correctly
  - **Edge cases**: Non-existent archive, concurrent updates, permission errors

- [ ] Test `deleteArchive` deletes archive
  - **What**: Verify archive document is deleted
  - **Expected**: Archive document removed from Firestore
  - **Edge cases**: Non-existent archive, permission errors, cascading deletes

- [ ] Test archive filtering
  - **What**: Verify archives can be filtered by various criteria
  - **Expected**: Returns filtered archives matching criteria
  - **Edge cases**: No matches, multiple filters, invalid filters

### `src/shared/lib/archiveService.server.ts` (server)

- [ ] Test server-side archive operations
  - **What**: Verify server-side operations work correctly
  - **Expected**: All operations use admin SDK and work as expected
  - **Edge cases**: Server/client SDK differences, permission handling

- [ ] Test admin SDK usage
  - **What**: Verify Firebase Admin SDK is used correctly
  - **Expected**: Admin SDK used for all operations, proper initialization
  - **Edge cases**: SDK errors, initialization failures, permission issues

## Archives API Routes

### `src/pages/api/entries/index.ts`

- [ ] Test GET returns list of archives
  - **What**: Verify GET endpoint returns array of archives
  - **Expected**: Returns 200 with array of archive objects
  - **Edge cases**: Empty list, large datasets, pagination

- [ ] Test POST creates new archive
  - **What**: Verify POST endpoint creates new archive
  - **Expected**: Returns 201 with created archive data
  - **Edge cases**: Missing fields, invalid data, permission errors

- [ ] Test POST validates request body
  - **What**: Verify request body validation works
  - **Expected**: Invalid bodies return 400 with error message
  - **Edge cases**: Missing required fields, wrong types, extra fields

### `src/pages/api/entries/[id].ts`

- [ ] Test GET returns archive by ID
  - **What**: Verify GET endpoint returns single archive
  - **Expected**: Returns 200 with archive object
  - **Edge cases**: Invalid ID format, missing archive

- [ ] Test PUT updates archive
  - **What**: Verify PUT endpoint updates archive
  - **Expected**: Returns 200 with updated archive data
  - **Edge cases**: Non-existent archive, invalid data, permission errors

- [ ] Test DELETE deletes archive
  - **What**: Verify DELETE endpoint removes archive
  - **Expected**: Returns 200 or 204 on success
  - **Edge cases**: Non-existent archive, permission errors, cascading deletes

## Archive Components

### `src/features/modules/archives/components/ArchivesContent.tsx`

- [ ] Test renders archive list
  - **What**: Verify archives are rendered in list format
  - **Expected**: All archives displayed with correct information
  - **Edge cases**: Empty list, large lists, malformed archive data

- [ ] Test handles empty state
  - **What**: Verify empty state is displayed when no archives
  - **Expected**: Shows appropriate empty state message/UI
  - **Edge cases**: Loading to empty transition, filtered empty results

- [ ] Test handles loading state
  - **What**: Verify loading indicator is shown while fetching
  - **Expected**: Loading spinner/skeleton shown during fetch
  - **Edge cases**: Slow network, timeout, rapid mount/unmount

- [ ] Test handles error state
  - **What**: Verify error state is displayed on failure
  - **Expected**: Error message displayed with retry option
  - **Edge cases**: Network errors, permission errors, malformed responses

### `src/features/modules/archives/components/ArchiveForm.tsx`

- [ ] Test renders all form sections
  - **What**: Verify all form sections are rendered
  - **Expected**: All sections (title, date, creator, content, media) visible
  - **Edge cases**: Conditional sections, disabled sections, section ordering

- [ ] Test validates form data
  - **What**: Verify form validation works
  - **Expected**: Validation errors shown for invalid data
  - **Edge cases**: Missing required fields, invalid dates, invalid media URLs

- [ ] Test handles form submission
  - **What**: Verify form submission creates archive
  - **Expected**: Archive created on submit, success message shown
  - **Edge cases**: Network errors, validation errors, permission errors

- [ ] Test handles media uploads
  - **What**: Verify media upload functionality works
  - **Expected**: Images/videos uploaded and linked to archive
  - **Edge cases**: Large files, invalid file types, upload failures

### `src/features/modules/archives/components/ArchiveEditForm.tsx`

- [ ] Test renders form with existing data
  - **What**: Verify form is pre-populated with archive data
  - **Expected**: All fields filled with existing archive data
  - **Edge cases**: Missing data, partial data, malformed data

- [ ] Test updates archive
  - **What**: Verify form submission updates archive
  - **Expected**: Archive updated on submit, success message shown
  - **Edge cases**: Network errors, concurrent edits, permission errors

- [ ] Test validates changes
  - **What**: Verify validation works on edit
  - **Expected**: Validation errors shown for invalid edits
  - **Edge cases**: Removing required fields, invalid types, constraints

### `src/features/modules/archives/components/ArchiveDeleteDialog.tsx`

- [ ] Test renders confirmation dialog
  - **What**: Verify delete confirmation dialog is shown
  - **Expected**: Dialog displays with archive info and confirmation
  - **Edge cases**: Missing archive data, long titles, special characters

- [ ] Test handles delete action
  - **What**: Verify delete action removes archive
  - **Expected**: Archive deleted, dialog closes, success message shown
  - **Edge cases**: Network errors, permission errors, already deleted

### `src/features/modules/archives/components/ArchiveEntry.tsx`

- [ ] Test renders archive entry
  - **What**: Verify archive entry is rendered correctly
  - **Expected**: All archive data displayed in entry format
  - **Edge cases**: Missing fields, long content, special characters

- [ ] Test renders all sections
  - **What**: Verify all archive sections are rendered
  - **Expected**: All sections (title, date, creator, content, media) displayed
  - **Edge cases**: Empty sections, missing sections, section ordering

- [ ] Test renders media embeds
  - **What**: Verify media embeds are rendered correctly
  - **Expected**: Images, videos, clips embedded and displayed
  - **Edge cases**: Invalid URLs, missing media, multiple media items

### `src/features/modules/archives/components/YouTubeEmbed.tsx`

- [ ] Test renders YouTube embed
  - **What**: Verify YouTube video is embedded correctly
  - **Expected**: YouTube iframe embed rendered with correct video ID
  - **Edge cases**: Invalid video IDs, private videos, deleted videos

- [ ] Test handles video ID extraction
  - **What**: Verify video ID is extracted from various URL formats
  - **Expected**: Video ID extracted from full URLs, short URLs, embed URLs
  - **Edge cases**: Invalid URLs, malformed URLs, missing IDs

### `src/features/modules/archives/components/TwitchClipEmbed.tsx`

- [ ] Test renders Twitch embed
  - **What**: Verify Twitch clip is embedded correctly
  - **Expected**: Twitch iframe embed rendered with correct clip ID
  - **Edge cases**: Invalid clip IDs, expired clips, deleted clips

- [ ] Test handles clip URL parsing
  - **What**: Verify clip ID is extracted from Twitch URLs
  - **Expected**: Clip ID extracted from various Twitch URL formats
  - **Edge cases**: Invalid URLs, malformed URLs, missing IDs

## Archive Hooks

### `src/features/modules/archives/hooks/useArchiveBaseState.ts`

- [ ] Test initializes state correctly
  - **What**: Verify archive state is initialized with defaults
  - **Expected**: All state fields initialized with appropriate defaults
  - **Edge cases**: Missing defaults, partial initialization, type mismatches

- [ ] Test handles form field updates
  - **What**: Verify field updates update state correctly
  - **Expected**: State updated when fields change
  - **Edge cases**: Rapid updates, invalid values, field dependencies

- [ ] Test handles section management
  - **What**: Verify section add/remove/reorder works
  - **Expected**: Sections managed correctly in state
  - **Edge cases**: Many sections, empty sections, section ordering

- [ ] Test handles media management
  - **What**: Verify media add/remove works
  - **Expected**: Media items managed correctly in state
  - **Edge cases**: Many media items, invalid URLs, duplicate media

### `src/features/modules/archives/hooks/useArchiveHandlers.ts`

- [ ] Test handles form submission
  - **What**: Verify form submission creates/updates archive
  - **Expected**: Archive created/updated, success state set
  - **Edge cases**: Network errors, validation errors, permission errors

- [ ] Test handles form validation
  - **What**: Verify form validation works
  - **Expected**: Validation errors set when form is invalid
  - **Edge cases**: Real-time validation, async validation, custom rules

- [ ] Test handles errors
  - **What**: Verify errors are handled and exposed
  - **Expected**: Errors caught, logged, and available in state
  - **Edge cases**: Network errors, validation errors, server errors

### `src/features/modules/archives/hooks/useArchiveMedia.ts`

- [ ] Test handles image uploads
  - **What**: Verify image upload functionality works
  - **Expected**: Images uploaded and URLs stored in state
  - **Edge cases**: Large files, invalid formats, upload failures

- [ ] Test handles video URLs
  - **What**: Verify video URL handling works
  - **Expected**: Video URLs validated and stored
  - **Edge cases**: Invalid URLs, private videos, expired videos

- [ ] Test handles Twitch clips
  - **What**: Verify Twitch clip URL handling works
  - **Expected**: Clip IDs extracted and stored
  - **Edge cases**: Invalid URLs, expired clips, malformed URLs

- [ ] Test handles replay files
  - **What**: Verify replay file handling works
  - **Expected**: Replay files uploaded and stored
  - **Edge cases**: Large files, invalid formats, upload failures

### `src/features/modules/archives/hooks/useArchivesActions.ts`

- [ ] Test handles create action
  - **What**: Verify create action creates archive
  - **Expected**: Archive created, state updated, success callback
  - **Edge cases**: Network errors, validation errors, permission errors

- [ ] Test handles update action
  - **What**: Verify update action updates archive
  - **Expected**: Archive updated, state updated, success callback
  - **Edge cases**: Network errors, concurrent edits, permission errors

- [ ] Test handles delete action
  - **What**: Verify delete action removes archive
  - **Expected**: Archive deleted, state updated, success callback
  - **Edge cases**: Network errors, permission errors, already deleted

### `src/features/modules/archives/hooks/useArchivesPage.ts`

- [ ] Test fetches archives
  - **What**: Verify archives are fetched on mount
  - **Expected**: Archives fetched and available in state
  - **Edge cases**: Network errors, empty results, slow responses

- [ ] Test handles filters
  - **What**: Verify filtering works
  - **Expected**: Archives filtered based on criteria
  - **Edge cases**: No matches, many matches, filter combinations

- [ ] Test handles loading/error states
  - **What**: Verify loading and error states are managed
  - **Expected**: Loading state during fetch, error state on failure
  - **Edge cases**: Rapid fetches, timeout, cancellation

## Archive Validation

### `src/features/modules/archives/utils/archiveValidation.ts`

- [ ] Test `validateArchiveForm` requires title
  - **What**: Verify title is required
  - **Expected**: Returns error when title is missing or empty
  - **Edge cases**: Whitespace-only title, null title, undefined title

- [ ] Test `validateArchiveForm` requires creator name
  - **What**: Verify creator name is required
  - **Expected**: Returns error when creator name is missing or empty
  - **Edge cases**: Whitespace-only name, null name, undefined name

- [ ] Test `validateArchiveForm` validates single date format (YYYY)
  - **What**: Verify year-only date format is accepted
  - **Expected**: Year format (e.g., "2024") is valid
  - **Edge cases**: Invalid years, future years, very old years

- [ ] Test `validateArchiveForm` validates single date format (YYYY-MM)
  - **What**: Verify year-month date format is accepted
  - **Expected**: Year-month format (e.g., "2024-03") is valid
  - **Edge cases**: Invalid months, future dates, malformed dates

- [ ] Test `validateArchiveForm` validates single date format (YYYY-MM-DD)
  - **What**: Verify full date format is accepted
  - **Expected**: Full date format (e.g., "2024-03-15") is valid
  - **Edge cases**: Invalid dates, leap years, future dates

- [ ] Test `validateArchiveForm` rejects invalid date formats
  - **What**: Verify invalid date formats are rejected
  - **Expected**: Invalid formats return error message
  - **Edge cases**: Malformed dates, wrong separators, missing parts

- [ ] Test `validateArchiveForm` allows undated entries
  - **What**: Verify undated entries are allowed
  - **Expected**: Undated entries pass validation
  - **Edge cases**: Missing date, null date, empty date string

- [ ] Test `validateArchiveForm` validates approximate text for undated
  - **What**: Verify approximate text is validated for undated entries
  - **Expected**: Approximate text required or optional for undated
  - **Edge cases**: Missing text, empty text, very long text

- [ ] Test returns null for valid form
  - **What**: Verify valid forms return null (no errors)
  - **Expected**: Returns null when form is valid
  - **Edge cases**: All fields valid, optional fields, edge values

- [ ] Test returns error message for invalid form
  - **What**: Verify invalid forms return error message
  - **Expected**: Returns descriptive error message for first invalid field
  - **Edge cases**: Multiple errors, nested errors, custom error messages

## Archive System Tests

### Archive Data Structure

- [ ] Test archive creation with all fields
  - **What**: Verify archive can be created with all fields populated
  - **Expected**: Archive created successfully with all data
  - **Edge cases**: Very long fields, special characters, nested data

- [ ] Test archive creation with minimal fields
  - **What**: Verify archive can be created with only required fields
  - **Expected**: Archive created successfully with minimal data
  - **Edge cases**: Only required fields, missing optional fields

- [ ] Test archive date info structure
  - **What**: Verify date info structure is correct
  - **Expected**: Date info formatted correctly (single date, date range, undated)
  - **Edge cases**: Different date formats, date ranges, approximate dates

- [ ] Test archive section ordering
  - **What**: Verify section order is maintained
  - **Expected**: Sections displayed in correct order
  - **Edge cases**: Custom ordering, missing sections, duplicate sections

- [ ] Test archive media embeds
  - **What**: Verify media embeds are stored and rendered correctly
  - **Expected**: Media URLs stored, embeds rendered correctly
  - **Edge cases**: Multiple media, invalid URLs, missing media

### Archive Media Handling

- [ ] Test image URL extraction
  - **What**: Verify image URLs are extracted and validated
  - **Expected**: Image URLs extracted from various formats
  - **Edge cases**: Relative URLs, data URLs, invalid URLs

- [ ] Test video URL parsing
  - **What**: Verify video URLs are parsed correctly
  - **Expected**: Video URLs validated and stored
  - **Edge cases**: Different video platforms, private videos, expired videos

- [ ] Test Twitch clip URL parsing
  - **What**: Verify Twitch clip URLs are parsed
  - **Expected**: Clip IDs extracted from Twitch URLs
  - **Edge cases**: Different URL formats, expired clips, invalid clips

- [ ] Test replay file handling
  - **What**: Verify replay files are handled correctly
  - **Expected**: Replay files uploaded and stored
  - **Edge cases**: Large files, invalid formats, corrupted files

- [ ] Test YouTube embed URL parsing
  - **What**: Verify YouTube URLs are parsed correctly
  - **Expected**: Video IDs extracted from various YouTube URL formats
  - **Edge cases**: Short URLs, embed URLs, playlist URLs, invalid URLs

