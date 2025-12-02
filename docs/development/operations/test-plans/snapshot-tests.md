# Snapshot Tests

This document outlines all snapshot tests needed to catch unintended UI changes.

## Component Snapshots

- [ ] Test all component snapshots
  - **What**: Verify component snapshots are maintained
  - **Expected**: Component output matches snapshots
  - **Edge cases**: Snapshot updates, breaking changes, version mismatches

- [ ] Test component variations
  - **What**: Verify component variations are snapshotted
  - **Expected**: All component variants have snapshots
  - **Edge cases**: Props combinations, state variations, conditional rendering

- [ ] Test component error states
  - **What**: Verify error state snapshots
  - **Expected**: Error states snapshotted correctly
  - **Edge cases**: Various error types, error messages, error UI

- [ ] Test component loading states
  - **What**: Verify loading state snapshots
  - **Expected**: Loading states snapshotted correctly
  - **Edge cases**: Various loading indicators, skeleton screens, progress states

