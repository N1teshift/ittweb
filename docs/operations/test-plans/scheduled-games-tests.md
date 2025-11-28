# Scheduled Games Tests

This document outlines all tests needed for the scheduled games module including services, API routes, components, hooks, and pages.

## Scheduled Game Service

### `src/features/modules/scheduled-games/lib/scheduledGameService.ts`

- [ ] Test `deriveGameStatus` returns scheduled/ongoing/awaiting_replay based on start and duration
  - **What**: Verify game status is derived from scheduled time and duration
  - **Expected**: Returns 'scheduled' before start, 'ongoing' during game, 'awaiting_replay' after end
  - **Edge cases**: Exact time boundaries, very long games, negative duration

- [ ] Test `deriveGameStatus` respects stored archived/awaiting_replay/cancelled statuses
  - **What**: Verify stored statuses override derived status
  - **Expected**: Stored statuses (archived, awaiting_replay, cancelled) take precedence
  - **Edge cases**: Status transitions, conflicting statuses, status updates

- [ ] Test `deriveGameStatus` handles invalid timestamps gracefully
  - **What**: Verify invalid timestamps don't crash
  - **Expected**: Returns default status or handles error gracefully
  - **Edge cases**: Null timestamps, future timestamps, malformed timestamps

- [ ] Test `getNextScheduledGameId` increments highest ID and falls back when index queries fail
  - **What**: Verify ID generation works correctly
  - **Expected**: Returns next sequential ID, falls back on query failure
  - **Edge cases**: No existing games, query failures, concurrent creation

- [ ] Test `createScheduledGame` sets default creator fields and timestamps on server/client SDKs
  - **What**: Verify creator and timestamp fields are set automatically
  - **Expected**: Creator fields and timestamps set correctly for both SDKs
  - **Edge cases**: Missing creator data, timestamp precision, SDK differences

- [ ] Test `createScheduledGame` preserves provided participants and modes
  - **What**: Verify provided data is preserved
  - **Expected**: Participants and modes stored as provided
  - **Edge cases**: Empty participants, many participants, invalid modes

- [ ] Test `createScheduledGame` converts scheduledDateTime string to Timestamp/admin Timestamp
  - **What**: Verify datetime string conversion works
  - **Expected**: String converted to appropriate Timestamp type
  - **Edge cases**: Different date formats, timezone handling, invalid dates

- [ ] Test `getAllScheduledGames` filters past/archived games based on flags
  - **What**: Verify filtering works with includePast/includeArchived flags
  - **Expected**: Games filtered according to flags
  - **Edge cases**: All flags true/false, mixed flags, no games match

- [ ] Test `getAllScheduledGames` sorts by scheduled date ascending and derives statuses
  - **What**: Verify sorting and status derivation
  - **Expected**: Games sorted by date, statuses derived for each
  - **Edge cases**: Same dates, missing dates, status derivation errors

- [ ] Test `getAllScheduledGames` returns empty array when Firestore setup errors occur
  - **What**: Verify error handling returns empty array
  - **Expected**: Returns empty array on Firestore errors, doesn't throw
  - **Edge cases**: Permission errors, connection errors, query errors

- [ ] Test `getScheduledGameById` returns null for missing game
  - **What**: Verify missing game returns null
  - **Expected**: Returns null when game doesn't exist
  - **Edge cases**: Invalid ID, deleted game, permission errors

- [ ] Test `getScheduledGameById` normalizes participant timestamps and derived status
  - **What**: Verify participant data and status are normalized
  - **Expected**: Timestamps converted, status derived correctly
  - **Edge cases**: Missing timestamps, invalid timestamps, status conflicts

- [ ] Test `updateScheduledGame` updates team size/custom size/modes/version/length
  - **What**: Verify game fields can be updated
  - **Expected**: All specified fields updated correctly
  - **Edge cases**: Partial updates, invalid values, field dependencies

- [ ] Test `updateScheduledGame` removes undefined fields via `removeUndefined`
  - **What**: Verify undefined fields are removed from update
  - **Expected**: Undefined fields not sent to Firestore
  - **Edge cases**: All fields undefined, nested undefined, null vs undefined

- [ ] Test `updateScheduledGame` updates timestamps in admin/client environments
  - **What**: Verify timestamps updated correctly for both SDKs
  - **Expected**: Timestamps updated appropriately for environment
  - **Edge cases**: SDK differences, timestamp precision, timezone handling

- [ ] Test `deleteScheduledGame` removes document and handles non-existent IDs
  - **What**: Verify deletion works and handles missing games
  - **Expected**: Game deleted, returns success for non-existent (idempotent)
  - **Edge cases**: Already deleted, invalid ID, permission errors

- [ ] Test `joinScheduledGame` prevents duplicate participants and appends join timestamp
  - **What**: Verify join functionality works correctly
  - **Expected**: Participant added if not exists, join timestamp recorded
  - **Edge cases**: Duplicate joins, concurrent joins, missing game

- [ ] Test `joinScheduledGame` rejects unknown game ID
  - **What**: Verify unknown game ID is rejected
  - **Expected**: Returns error or null for unknown game
  - **Edge cases**: Invalid ID format, deleted game, permission errors

- [ ] Test `leaveScheduledGame` removes participant by discordId and updates timestamp
  - **What**: Verify leave functionality works
  - **Expected**: Participant removed, leave timestamp recorded
  - **Edge cases**: Participant not in game, concurrent leaves, missing game

- [ ] Test `leaveScheduledGame` handles leaving non-existent or already-left users
  - **What**: Verify idempotent leave behavior
  - **Expected**: Returns success even if user already left or doesn't exist
  - **Edge cases**: Never joined, already left, invalid discordId

## Scheduled Games API Routes

### `src/pages/api/scheduled-games/index.ts`

- [ ] Test GET returns upcoming games by default and honors includePast/includeArchived flags
  - **What**: Verify GET endpoint filtering works
  - **Expected**: Returns upcoming games by default, respects query flags
  - **Edge cases**: All flags, no games match, invalid flags

- [ ] Test POST requires authentication and validates required fields
  - **What**: Verify authentication and validation
  - **Expected**: Returns 401 without auth, 400 with invalid data
  - **Edge cases**: Expired tokens, missing fields, invalid field types

- [ ] Test POST rejects past dates for non-admin users and allows admins/manual entries
  - **What**: Verify date validation and admin override
  - **Expected**: Non-admins can't create past games, admins can, manual entries allowed
  - **Edge cases**: Exactly current time, timezone issues, admin detection

- [ ] Test POST adds creator as participant when addCreatorToParticipants is true/undefined
  - **What**: Verify creator auto-join behavior
  - **Expected**: Creator added as participant when flag is true or undefined
  - **Edge cases**: Flag false, missing flag, creator already in participants

- [ ] Test POST preserves provided participants when addCreatorToParticipants is false
  - **What**: Verify participants are preserved when flag is false
  - **Expected**: Provided participants used, creator not auto-added
  - **Edge cases**: Empty participants, many participants, invalid participants

- [ ] Test POST returns 201 with scheduled game ID on success
  - **What**: Verify success response format
  - **Expected**: Returns 201 with game ID in response
  - **Edge cases**: Response format, ID generation, concurrent creation

- [ ] Test POST handles archived status flow: creates scheduled game and attempts game/archive linking
  - **What**: Verify archived game creation and linking
  - **Expected**: Game created, archive/game linking attempted
  - **Edge cases**: Linking failures, missing archive, concurrent operations

- [ ] Test POST surfaces internal errors as 500 with redacted production message
  - **What**: Verify error handling and message redaction
  - **Expected**: Returns 500, error message redacted in production
  - **Edge cases**: Different error types, environment detection, sensitive data

- [ ] Test method not allowed returns 405 for unsupported verbs
  - **What**: Verify unsupported methods return 405
  - **Expected**: Returns 405 Method Not Allowed for unsupported methods
  - **Edge cases**: Case variations, custom methods, OPTIONS requests

### `src/pages/api/scheduled-games/[id]/index.ts`

- [ ] Test GET returns single game or 404 when missing
  - **What**: Verify GET by ID works
  - **Expected**: Returns game or 404
  - **Edge cases**: Invalid ID, deleted game, permission errors

- [ ] Test PUT/PATCH require authentication and creator ownership
  - **What**: Verify authentication and ownership checks
  - **Expected**: Returns 401 without auth, 403 if not creator
  - **Edge cases**: Expired tokens, admin override, ownership edge cases

- [ ] Test PUT/PATCH validate required update fields (teamSize, gameType)
  - **What**: Verify required fields validation
  - **Expected**: Returns 400 if required fields missing
  - **Edge cases**: Partial updates, invalid values, field dependencies

- [ ] Test PUT/PATCH support custom team size and optional version/length/modes
  - **What**: Verify optional fields are accepted
  - **Expected**: Custom team size and optional fields updated correctly
  - **Edge cases**: Invalid custom size, missing optional fields, field validation

- [ ] Test method not allowed for DELETE/POST/etc.
  - **What**: Verify unsupported methods return 405
  - **Expected**: Returns 405 for DELETE, POST, etc.
  - **Edge cases**: Different methods, case variations

- [ ] Test server error path returns 500 with environment-specific messaging
  - **What**: Verify error handling
  - **Expected**: Returns 500, message varies by environment
  - **Edge cases**: Different error types, environment detection

### `src/pages/api/scheduled-games/[id]/join.ts`

- [ ] Test POST requires authentication and discordId
  - **What**: Verify authentication and required fields
  - **Expected**: Returns 401 without auth, 400 without discordId
  - **Edge cases**: Expired tokens, invalid discordId format

- [ ] Test joining adds participant and prevents duplicates
  - **What**: Verify join functionality
  - **Expected**: Participant added, duplicates prevented
  - **Edge cases**: Concurrent joins, already joined, duplicate discordId

- [ ] Test join rejects missing game or cancelled/archived game
  - **What**: Verify join restrictions
  - **Expected**: Returns 404 for missing game, 400 for cancelled/archived
  - **Edge cases**: Recently cancelled, archived status, game transitions

- [ ] Test method not allowed for non-POST verbs
  - **What**: Verify only POST allowed
  - **Expected**: Returns 405 for other methods
  - **Edge cases**: GET, PUT, DELETE requests

### `src/pages/api/scheduled-games/[id]/leave.ts`

- [ ] Test POST requires authentication and discordId
  - **What**: Verify authentication and required fields
  - **Expected**: Returns 401 without auth, 400 without discordId
  - **Edge cases**: Expired tokens, invalid discordId

- [ ] Test leaving removes participant and is idempotent when user absent
  - **What**: Verify leave functionality and idempotency
  - **Expected**: Participant removed, success even if not in game
  - **Edge cases**: Never joined, already left, concurrent leaves

- [ ] Test leave rejects missing game
  - **What**: Verify missing game handling
  - **Expected**: Returns 404 for missing game
  - **Edge cases**: Invalid ID, deleted game

- [ ] Test method not allowed for non-POST verbs
  - **What**: Verify only POST allowed
  - **Expected**: Returns 405 for other methods
  - **Edge cases**: GET, PUT, DELETE requests

### `src/pages/api/scheduled-games/[id]/upload-replay.ts`

- [ ] Test POST requires authentication and creator ownership
  - **What**: Verify authentication and ownership
  - **Expected**: Returns 401 without auth, 403 if not creator
  - **Edge cases**: Expired tokens, admin override

- [ ] Test replay upload rejects oversized files and invalid MIME types
  - **What**: Verify file validation
  - **Expected**: Returns 400 for oversized or invalid MIME types
  - **Edge cases**: Exactly at size limit, invalid extensions, missing MIME type

- [ ] Test replay upload stores metadata and links to archive/game IDs
  - **What**: Verify upload processing
  - **Expected**: File uploaded, metadata stored, archive/game linked
  - **Edge cases**: Upload failures, missing archive, linking errors

- [ ] Test replay upload updates scheduled game status to archived
  - **What**: Verify status update after upload
  - **Expected**: Game status updated to archived after successful upload
  - **Edge cases**: Upload success but status update fails, concurrent updates

- [ ] Test upload rejects missing game or missing file payload
  - **What**: Verify validation
  - **Expected**: Returns 404 for missing game, 400 for missing file
  - **Edge cases**: Invalid game ID, empty file, malformed request

- [ ] Test method not allowed for non-POST verbs
  - **What**: Verify only POST allowed
  - **Expected**: Returns 405 for other methods
  - **Edge cases**: GET, PUT, DELETE requests

### `src/pages/api/scheduled-games/[id]/delete.ts`

- [ ] Test POST requires authentication and creator ownership
  - **What**: Verify authentication and ownership
  - **Expected**: Returns 401 without auth, 403 if not creator
  - **Edge cases**: Expired tokens, admin override

- [ ] Test deletion removes scheduled game and returns success payload
  - **What**: Verify deletion works
  - **Expected**: Game deleted, success response returned
  - **Edge cases**: Already deleted, permission errors, cascading deletes

- [ ] Test deletion handles missing game with 404
  - **What**: Verify missing game handling
  - **Expected**: Returns 404 for missing game
  - **Edge cases**: Invalid ID, already deleted

- [ ] Test method not allowed for non-POST verbs
  - **What**: Verify only POST allowed
  - **Expected**: Returns 405 for other methods
  - **Edge cases**: GET, PUT, DELETE requests

## Scheduled Games Components

### `src/features/modules/scheduled-games/components/ScheduleGameForm.tsx`

- [ ] Test form renders available team sizes, types, and timezones
  - **What**: Verify form options are rendered
  - **Expected**: All options displayed correctly
  - **Edge cases**: Empty options, many options, disabled options

- [ ] Test validation for required date/time/timezone/teamSize fields
  - **What**: Verify required field validation
  - **Expected**: Validation errors shown for missing required fields
  - **Edge cases**: Partial completion, invalid values, field dependencies

- [ ] Test manual entry toggle allows past dates and archived status selection
  - **What**: Verify manual entry mode behavior
  - **Expected**: Past dates and archived status allowed in manual mode
  - **Edge cases**: Toggle state, permission checks, date validation

- [ ] Test add/remove participant rows and validation requiring winner/loser mix
  - **What**: Verify participant management and validation
  - **Expected**: Participants can be added/removed, winner/loser mix validated
  - **Edge cases**: All winners, all losers, empty participants, many participants

- [ ] Test submission calls `/api/scheduled-games` with assembled payload
  - **What**: Verify form submission
  - **Expected**: Correct payload sent to API endpoint
  - **Edge cases**: Missing fields, invalid data, payload structure

- [ ] Test success and error alert rendering
  - **What**: Verify success/error feedback
  - **Expected**: Success/error alerts displayed appropriately
  - **Edge cases**: Multiple errors, timeout, alert dismissal

### `src/features/modules/scheduled-games/components/EditGameForm.tsx`

- [ ] Test initial values populate from selected game
  - **What**: Verify form pre-population
  - **Expected**: All fields filled with game data
  - **Edge cases**: Missing data, partial data, malformed data

- [ ] Test editing fields updates local state and payload structure
  - **What**: Verify field updates work
  - **Expected**: State updated, payload structure maintained
  - **Edge cases**: Rapid updates, invalid values, field dependencies

- [ ] Test submit enforces creator-only updates and handles API errors
  - **What**: Verify ownership and error handling
  - **Expected**: Only creator can submit, errors handled gracefully
  - **Edge cases**: Non-creator attempts, network errors, validation errors

- [ ] Test cancel action restores view without saving
  - **What**: Verify cancel functionality
  - **Expected**: Form reset, no changes saved
  - **Edge cases**: Cancel after edits, cancel during submission, multiple cancels

### `src/features/modules/scheduled-games/components/ScheduledGamesList.tsx`

- [ ] Test list renders grouped by status with derived badges
  - **What**: Verify list rendering and grouping
  - **Expected**: Games grouped by status, badges shown correctly
  - **Edge cases**: No games, many games, status transitions

- [ ] Test loading/error states while fetching games
  - **What**: Verify loading and error states
  - **Expected**: Loading indicator shown, errors displayed
  - **Edge cases**: Slow network, timeout, multiple errors

- [ ] Test join/leave buttons visibility based on participation and status
  - **What**: Verify button visibility logic
  - **Expected**: Buttons shown/hidden based on participation and status
  - **Edge cases**: Already joined, cancelled game, archived game

- [ ] Test edit/delete/upload buttons show for creator only
  - **What**: Verify creator-only buttons
  - **Expected**: Buttons visible only to game creator
  - **Edge cases**: Non-creator, admin override, missing creator

- [ ] Test filtering to include past/archived games when toggled
  - **What**: Verify filter toggles work
  - **Expected**: Past/archived games shown when toggles enabled
  - **Edge cases**: All toggles, no matches, filter combinations

### `src/features/modules/scheduled-games/components/GameDeleteDialog.tsx`

- [ ] Test confirmation dialog shows game info and disables buttons while deleting
  - **What**: Verify dialog rendering and state
  - **Expected**: Game info shown, buttons disabled during delete
  - **Edge cases**: Missing game data, long game info, delete errors

- [ ] Test confirm triggers delete API and closes on success
  - **What**: Verify delete functionality
  - **Expected**: Delete API called, dialog closes on success
  - **Edge cases**: Network errors, permission errors, delete failures

- [ ] Test cancel/close actions dismiss dialog without calling API
  - **What**: Verify cancel/close behavior
  - **Expected**: Dialog closes, no API call made
  - **Edge cases**: Cancel during delete, multiple closes, escape key

### `src/features/modules/scheduled-games/components/UploadReplayModal.tsx`

- [ ] Test replay file selection and size validation messaging
  - **What**: Verify file selection and validation
  - **Expected**: File selected, size validation shown
  - **Edge cases**: Oversized files, invalid types, no file selected

- [ ] Test upload button triggers `/api/scheduled-games/{id}/upload-replay`
  - **What**: Verify upload functionality
  - **Expected**: Upload API called with correct data
  - **Edge cases**: Missing file, invalid file, network errors

- [ ] Test progress/disabled states during upload
  - **What**: Verify upload state management
  - **Expected**: Progress shown, buttons disabled during upload
  - **Edge cases**: Slow upload, upload failure, cancellation

- [ ] Test success closes modal and shows toast/message
  - **What**: Verify success handling
  - **Expected**: Modal closes, success message shown
  - **Edge cases**: Multiple successes, message dismissal, navigation

- [ ] Test error responses display inline feedback
  - **What**: Verify error handling
  - **Expected**: Error messages displayed in modal
  - **Edge cases**: Multiple errors, network errors, validation errors

### `src/features/modules/scheduled-games/components/CreateGameInlineForm.tsx`

- [ ] Test default date/time/timezone initialization from user context
  - **What**: Verify default values from user context
  - **Expected**: Defaults set from user timezone/preferences
  - **Edge cases**: Missing context, invalid timezone, timezone changes

- [ ] Test participant generation enforces at least one winner and one loser
  - **What**: Verify participant validation
  - **Expected**: At least one winner and one loser required
  - **Edge cases**: All winners, all losers, empty participants

- [ ] Test custom team size is required when teamSize is `custom`
  - **What**: Verify custom team size validation
  - **Expected**: Custom size required when teamSize is 'custom'
  - **Edge cases**: Missing custom size, invalid custom size, teamSize changes

- [ ] Test form rejects submissions without two named participants
  - **What**: Verify participant requirement
  - **Expected**: At least two named participants required
  - **Edge cases**: One participant, empty names, duplicate names

- [ ] Test successful submit archives game immediately and closes modal
  - **What**: Verify submit behavior
  - **Expected**: Game created/archived, modal closes on success
  - **Edge cases**: Creation errors, archive errors, modal state

## Scheduled Games Pages

### `src/pages/scheduled-games/index.tsx`

- [ ] Test initial fetch calls includePast=true to populate list
  - **What**: Verify initial data fetch
  - **Expected**: Games fetched with includePast=true
  - **Edge cases**: No games, fetch errors, slow network

- [ ] Test Create Game modal toggles visibility and passes callbacks
  - **What**: Verify modal functionality
  - **Expected**: Modal opens/closes, callbacks work correctly
  - **Edge cases**: Multiple opens, callback errors, modal state

- [ ] Test join/leave/edit/delete/upload flows update list after completion
  - **What**: Verify list updates after actions
  - **Expected**: List refreshed after each action completes
  - **Edge cases**: Action failures, concurrent actions, list state

- [ ] Test error states render when API requests fail
  - **What**: Verify error handling
  - **Expected**: Error states displayed when requests fail
  - **Edge cases**: Multiple errors, network errors, timeout

- [ ] Test loading skeleton/placeholder while fetching
  - **What**: Verify loading state
  - **Expected**: Loading skeleton shown during fetch
  - **Edge cases**: Slow network, timeout, rapid fetches

### `src/pages/scheduled-games/[id]/upload-replay.tsx`

- [ ] Test page fetches scheduled game details and handles 404 redirects
  - **What**: Verify page data loading
  - **Expected**: Game details fetched, 404 redirects appropriately
  - **Edge cases**: Missing game, invalid ID, fetch errors

- [ ] Test form submission uploads replay and navigates back on success
  - **What**: Verify upload and navigation
  - **Expected**: Replay uploaded, navigation occurs on success
  - **Edge cases**: Upload failures, navigation errors, success state

- [ ] Test validation errors surface when no file chosen or upload fails
  - **What**: Verify validation and error handling
  - **Expected**: Validation errors shown, upload errors displayed
  - **Edge cases**: Missing file, invalid file, network errors

