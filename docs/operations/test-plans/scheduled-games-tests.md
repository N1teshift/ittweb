# Scheduled Games Tests

This document outlines all tests needed for the scheduled games module including services and components.

**Note**: The scheduled games collection and dedicated pages have been removed. Scheduled games are now managed through the main `games` collection with `gameState: 'scheduled'`. API routes for scheduled games no longer exist - functionality has been moved to `/api/games`. The components listed below are still used in other parts of the application (e.g., `ScheduleGameForm` on the homepage, `EditGameForm` and `GameDeleteDialog` on game detail pages).

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

## Scheduled Games Components

**Note**: These components are still used in the application but in different contexts:
- `ScheduleGameForm` is used on the homepage (`src/pages/index.tsx`)
- `EditGameForm` and `GameDeleteDialog` are used on game detail pages (`src/pages/games/[id].tsx`)
- Other components may be used elsewhere or are legacy

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

- [ ] Test submission calls `/api/games` with assembled payload (gameState: 'scheduled')
  - **What**: Verify form submission
  - **Expected**: Correct payload sent to games API endpoint with gameState: 'scheduled'
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

- [ ] Test upload button triggers appropriate games API endpoint for replay upload
  - **What**: Verify upload functionality
  - **Expected**: Upload API called with correct data (likely `/api/games/{id}/upload-replay` or similar)
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

