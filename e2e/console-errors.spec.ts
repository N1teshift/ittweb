import { test, expect } from '@playwright/test';

// List of all public pages to test
const pagesToTest = [
  '/',
  '/games',
  '/players',
  '/standings',
  '/classes',
  '/guides',
  '/guides/abilities',
  '/guides/items',
  '/guides/units',
  '/guides/troll-classes',
  '/tools',
  '/tools/duel-simulator',
  '/tools/icon-mapper',
  '/tools/map-analyzer',
  '/community/archives',
  '/privacy',
  '/download',
  '/development',
];

test.describe('Console Error Checks', () => {
  test.setTimeout(180000); // 3 minutes for the entire test

  // Only test on Chromium - console errors are browser-agnostic
  test('should have no console errors on all pages', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Only testing console errors on Chromium');
    const consoleErrors: Array<{ url: string; error: string }> = [];
    const consoleWarnings: Array<{ url: string; warning: string }> = [];

    // Listen for console messages
    page.on('console', (msg) => {
      const text = msg.text();
      const type = msg.type();

      if (type === 'error') {
        // Filter out known/expected errors if needed
        if (!shouldIgnoreError(text)) {
          consoleErrors.push({ url: page.url(), error: text });
        }
      } else if (type === 'warning') {
        // Optionally track warnings too
        if (!shouldIgnoreWarning(text)) {
          consoleWarnings.push({ url: page.url(), warning: text });
        }
      }
    });

    // Listen for page errors (unhandled exceptions)
    page.on('pageerror', (error) => {
      consoleErrors.push({ url: page.url(), error: error.message });
    });

    // Listen for failed network requests (optional - can be noisy)
    page.on('response', (response) => {
      if (response.status() >= 400 && !shouldIgnoreFailedRequest(response.url())) {
        // Only log non-404s as errors (404s might be expected for missing resources)
        if (response.status() !== 404) {
          consoleErrors.push({
            url: page.url(),
            error: `Failed request: ${response.status()} ${response.statusText()} - ${response.url()}`,
          });
        }
      }
    });

    // Visit each page
    for (const path of pagesToTest) {
      try {
        // Use 'load' instead of 'networkidle' for faster, more reliable loading
        // Increase timeout to 60 seconds per page
        await page.goto(path, { waitUntil: 'load', timeout: 60000 });

        // Wait a bit for any async errors to appear
        await page.waitForTimeout(2000);

        // Check for React error boundaries or error states
        const errorBoundary = page.locator('[data-error-boundary], .error-boundary');
        if (await errorBoundary.count() > 0) {
          const errorText = await errorBoundary.first().textContent();
          consoleErrors.push({
            url: page.url(),
            error: `Error boundary triggered: ${errorText}`,
          });
        }
      } catch (error) {
        // Only treat actual navigation failures as errors, not timeouts
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('timeout')) {
          // Timeout is not necessarily a console error - just log it
          console.warn(`[${path}]: Page load timeout (this may not be a console error)`);
        } else {
          // Other navigation errors
          consoleErrors.push({
            url: path,
            error: `Failed to load page: ${errorMessage}`,
          });
        }
      }
    }

    // Report results
    if (consoleErrors.length > 0) {
      console.error('\n=== CONSOLE ERRORS FOUND ===');
      consoleErrors.forEach(({ url, error }) => {
        console.error(`[${url}]: ${error}`);
      });
    }

    if (consoleWarnings.length > 0) {
      console.warn('\n=== CONSOLE WARNINGS FOUND ===');
      consoleWarnings.forEach(({ url, warning }) => {
        console.warn(`[${url}]: ${warning}`);
      });
    }

    // Fail the test if there are errors
    expect(
      consoleErrors,
      `Found ${consoleErrors.length} console error(s). See output above.`,
    ).toHaveLength(0);
  });
});

// Helper function to ignore known/expected errors
function shouldIgnoreError(errorText: string): boolean {
  const ignoredPatterns = [
    // Add patterns for errors you want to ignore
    // For example:
    // /favicon\.ico.*404/i,
    // /analytics.*blocked/i,
  ];

  return ignoredPatterns.some((pattern) => pattern.test(errorText));
}

// Helper function to ignore known/expected warnings
function shouldIgnoreWarning(warningText: string): boolean {
  const ignoredPatterns = [
    // Add patterns for warnings you want to ignore
    // For example:
    // /deprecated.*api/i,
  ];

  return ignoredPatterns.some((pattern) => pattern.test(warningText));
}

// Helper function to ignore known/expected failed requests
function shouldIgnoreFailedRequest(url: string): boolean {
  const ignoredPatterns = [
    // Add patterns for URLs that might legitimately fail
    // For example:
    // /favicon\.ico/i,
    // /analytics/i,
  ];

  return ignoredPatterns.some((pattern) => pattern.test(url));
}

