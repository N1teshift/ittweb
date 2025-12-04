# End-to-End Testing

This directory contains Playwright-based end-to-end tests for the ITT Web application.

## Overview

E2E tests verify that the application works correctly from the user's perspective, testing complete user workflows across multiple pages and components.

## Test Structure

```
e2e/
├── homepage.spec.ts       # Homepage and navigation tests
├── games.spec.ts          # Games page and game detail functionality
├── auth.spec.ts           # Authentication and responsive design tests
├── console-errors.spec.ts # Automated console error checking across all pages
└── README.md             # This file
```

## Running Tests

### Prerequisites

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

### Run All E2E Tests

```bash
npm run test:e2e
```

### Run Tests with UI Mode

```bash
npm run test:e2e:ui
```

### Run Tests in Headed Mode (see browser)

```bash
npm run test:e2e:headed
```

### Debug Tests

```bash
npm run test:e2e:debug
```

### Run Specific Test File

```bash
npx playwright test homepage.spec.ts
```

## Test Configuration

Tests are configured in `playwright.config.ts`:

- **Browsers**: Chromium, Firefox, WebKit
- **Devices**: Desktop and mobile viewports
- **Base URL**: `http://localhost:3000`
- **Auto-start**: Development server starts automatically

## Writing E2E Tests

### Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should perform specific user action', async ({ page }) => {
    // Arrange
    await page.goto('/');

    // Act
    await page.click('button');

    // Assert
    await expect(page.locator('.result')).toBeVisible();
  });
});
```

### Best Practices

1. **Use Descriptive Test Names**: Clearly describe what the test verifies
2. **Test User Journeys**: Focus on complete workflows, not isolated components
3. **Handle Async Operations**: Use `await` for all Playwright operations
4. **Use Appropriate Selectors**: Prefer `role`, `text`, or `data-testid` over CSS selectors
5. **Test Error States**: Verify graceful error handling
6. **Mobile Responsiveness**: Test across different viewport sizes

### Selectors

```typescript
// Good - semantic and accessible
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByLabelText('Email').fill('user@example.com');

// Good - test-specific attributes
await page.locator('[data-testid="user-menu"]').click();

// Avoid - brittle CSS selectors
await page.locator('.btn-primary').click();
```

## Current Test Coverage

### Homepage Tests (`homepage.spec.ts`)
- ✅ Page loads successfully
- ✅ Navigation to Games, Players, Standings pages
- ✅ Basic page structure and content

### Games Tests (`games.spec.ts`)
- ✅ Games page loads
- ✅ Games list or empty state display
- ✅ Filter functionality (when available)
- ✅ Game detail navigation

### Authentication Tests (`auth.spec.ts`)
- ✅ Graceful handling of unauthenticated access
- ✅ Login prompts for protected actions
- ✅ Responsive design across viewports (mobile, tablet, desktop)

### Console Error Tests (`console-errors.spec.ts`)
- ✅ Automated checking for console errors across all public pages
- ✅ Detection of unhandled JavaScript exceptions
- ✅ Monitoring of failed network requests
- ✅ React error boundary detection

## Test Data

E2E tests work with the actual application data and don't require special test fixtures. Tests are designed to work whether the database is empty or populated.

## CI/CD Integration

Tests are designed to run in CI/CD environments:

- Automatic server startup via `webServer` configuration
- Parallel test execution across multiple browsers
- Screenshot and video capture on failures
- Trace collection for debugging

## Debugging Failed Tests

When tests fail, Playwright provides several debugging options:

1. **HTML Report**: Run `npx playwright show-report` after test execution
2. **Screenshots**: Automatic screenshots on failure
3. **Traces**: Step-by-step execution traces
4. **UI Mode**: Interactive debugging with `npm run test:e2e:ui`

## Contributing

When adding new E2E tests:

1. Follow the existing naming convention (`*.spec.ts`)
2. Add descriptive test names that explain the user behavior being tested
3. Include both positive and negative test cases
4. Test across different browsers when possible
5. Update this README if adding new test categories

## Future Enhancements

- **User Authentication Flows**: Complete login/logout workflows
- **Form Submissions**: Complex form interactions and validations
- **Real-time Features**: WebSocket connections and live updates
- **Performance Testing**: Page load times and interaction performance
- **Accessibility Testing**: WCAG compliance across user journeys
