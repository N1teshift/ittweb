# Test Specifications Index

Comprehensive test specifications for ITT Web organized by test type and module.

## Overview

This directory contains detailed test specifications organized by category. These are **test specification documents** - checkboxes are appropriate for tracking test implementation status.

## Test Specifications

- **[Infrastructure & Utility Tests](./infrastructure-utility-tests.md)** - Firebase, API handlers, authentication, logging, utility functions
- **[Service Layer Tests](./service-layer-tests.md)** - Service functions for all modules
- **[API Route Tests](./api-route-tests.md)** - API endpoint tests
- **[Component Tests](./component-tests.md)** - React component tests
- **[Hook Tests](./hook-tests.md)** - Custom React hook tests
- **[Validation & Form Tests](./validation-form-tests.md)** - Form validation and form handling tests
- **[Module Tests](./module-tests.md)** - Feature module tests (Games, Players, Blog, Archives, Scheduled Games, Standings, Analytics, Guides, Map Analyzer, Tools)
- **[Integration & E2E Tests](./integration-e2e-tests.md)** - Integration tests and end-to-end scenarios
- **[Special Tests](./special-tests.md)** - Performance, edge cases, security, accessibility, snapshot, migration tests

## Test Organization

### File Structure
```
src/
├── __tests__/
│   ├── unit/
│   │   ├── utils/
│   │   ├── services/
│   │   └── lib/
│   ├── integration/
│   │   ├── api/
│   │   └── services/
│   └── e2e/
│       └── scenarios/
└── features/
    └── modules/
        └── [module]/
            ├── __tests__/
            │   ├── components/
            │   ├── hooks/
            │   ├── lib/
            │   └── utils/
```

### Test Naming Conventions
- Unit tests: `[module].test.ts` or `[module].spec.ts`
- Component tests: `[ComponentName].test.tsx`
- Integration tests: `[feature].integration.test.ts`
- E2E tests: `[scenario].e2e.test.ts`

## Test Coverage Goals

- **Unit Tests**: 80%+ coverage for utilities, services, and pure functions
- **Integration Tests**: 70%+ coverage for API routes and service integrations
- **Component Tests**: 60%+ coverage for React components
- **E2E Tests**: Critical user flows covered

## Testing Best Practices

- Use `@testing-library/react` for component tests
- Use `@testing-library/user-event` for user interactions
- Mock Firebase/Firestore for isolated unit tests
- Use MSW (Mock Service Worker) for API mocking in integration tests
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests isolated and independent
- Use descriptive test names
- Test behavior, not implementation
- Maintain test data fixtures for consistency

## Related Documentation

- [Testing Guide](../testing-guide.md) - How to run and write tests
- [Test Plans](../test-plans/) - Feature-specific test plans
- [Comprehensive Test Plan](../comprehensive-test-plan.md) - Original comprehensive plan (now split)

