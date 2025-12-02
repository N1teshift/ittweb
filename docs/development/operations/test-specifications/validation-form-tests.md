# Test Specifications - Validation & Form Tests

Test specifications for form validation and form handling.

### Archive Validation
- [ ] `src/features/modules/archives/utils/archiveValidation.ts`
  - Test `validateArchiveForm` requires title
  - Test `validateArchiveForm` requires creator name
  - Test `validateArchiveForm` validates single date format (YYYY)
  - Test `validateArchiveForm` validates single date format (YYYY-MM)
  - Test `validateArchiveForm` validates single date format (YYYY-MM-DD)
  - Test `validateArchiveForm` rejects invalid date formats
  - Test `validateArchiveForm` allows undated entries
  - Test `validateArchiveForm` validates approximate text for undated
  - Test returns null for valid form
  - Test returns error message for invalid form

## Related Documentation

- [Test Specifications Index](./README.md)
- [Component Tests](./component-tests.md)
- [Hook Tests](./hook-tests.md)
- [Testing Guide](../testing-guide.md)

