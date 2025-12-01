# Test Plans

This directory contains comprehensive test plans organized by feature/module. Each file outlines all tests needed for that area, with expanded details on what to test, expected outcomes, and edge cases.

## File Organization

### Core Infrastructure
- **infrastructure-tests.md** - Firebase configuration, authentication, logging, API route handlers
- **utilities-tests.md** - Utility functions (object utils, timestamps, roles, timezones, etc.)

### Feature Modules
- **games-tests.md** - Games service, API routes, components, hooks, ELO calculator, replay parser
- **players-tests.md** - Player service, API routes, components, hooks, player system logic
- **blog-tests.md** - Blog service, API routes, components, hooks, post loading/serialization
- **archives-tests.md** - Archive service, API routes, components, hooks, validation, media handling
- **scheduled-games-tests.md** - Scheduled games service and components (note: API routes and pages removed - functionality moved to main games collection)
- **standings-tests.md** - Standings service, API routes, hooks, components
- **analytics-tests.md** - Analytics service, API routes, components
- **guides-tests.md** - Guides data loading, utilities, components, hooks

### Tools & Utilities
- **map-analyzer-tests.md** - Map parsing, data extraction, visualization
- **tools-tests.md** - Icon mapper, duel simulator

### Integration & E2E
- **integration-tests.md** - Firebase, Next.js, NextAuth, MDX integration
- **e2e-tests.md** - End-to-end scenario tests for critical user flows

### Quality & Performance
- **performance-tests.md** - Database query performance, component rendering, API response times
- **edge-cases-tests.md** - Invalid input handling, network errors, database errors, boundary conditions
- ~~**security-tests.md**~~ - ✅ Complete (All security tests implemented in `__tests__/security/`)
- **accessibility-tests.md** - Keyboard navigation, screen readers, ARIA labels, color contrast
- **snapshot-tests.md** - Component snapshots, variations, error/loading states
- **migration-tests.md** - Data migrations, backward compatibility, browser compatibility

## Test Format

Each test item follows this format:

```markdown
- [ ] Test name
  - **What**: What to test
  - **Expected**: Expected outcome/assertion
  - **Edge cases**: Edge cases to consider
```

## Usage

These test plans can be used to:
1. Assign test development tasks to developers
2. Track test coverage and completion
3. Guide test implementation
4. Ensure comprehensive testing across all modules

## Test Coverage Goals

- **Unit Tests**: 80%+ coverage for utilities, services, and pure functions
- **Integration Tests**: 70%+ coverage for API routes and service integrations
- **Component Tests**: 60%+ coverage for React components
- **E2E Tests**: Critical user flows covered

## Test Status and Locations

- **TEST_STATUS.md** - Consolidated test status tracking and file location patterns
- **CODEX_QUICK_START.md** - Quick start guide for using Codex agents to create tests

## Notes

- Use `@testing-library/react` for component tests
- Use `@testing-library/user-event` for user interactions
- Mock Firebase/Firestore for isolated unit tests
- Use MSW (Mock Service Worker) for API mocking in integration tests
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests isolated and independent
- Use descriptive test names
- Test behavior, not implementation
- Maintain test data fixtures for consistency

