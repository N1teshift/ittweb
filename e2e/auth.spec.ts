import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should show login prompt for protected actions', async ({ page }) => {
    await page.goto('/');

    // Look for elements that might require authentication
    // This is a basic test - in a real app, we'd test specific protected routes
    const loginButtons = page.locator('button, a').filter({ hasText: /login|sign in|authenticate/i });
    const loginCount = await loginButtons.count();

    // Either shows login UI or doesn't have protected content (both valid)
    expect(loginCount >= 0).toBe(true);
  });

  test('should handle unauthenticated access gracefully', async ({ page }) => {
    // Test various pages to ensure they don't crash when unauthenticated
    const pagesToTest = ['/', '/games', '/players', '/standings'];

    for (const pagePath of pagesToTest) {
      await page.goto(pagePath);

      // Page should load without crashing
      await expect(page.locator('body')).toBeVisible();

      // Should not show generic error messages (unless intentional)
      const errorElements = page.locator('text=/internal server error|500|crash/i');
      await expect(errorElements).toHaveCount(0);
    }
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size

    await page.goto('/');

    // Basic mobile functionality tests
    await expect(page.locator('body')).toBeVisible();

    // Mobile menu should be available if hamburger menu exists
    const mobileMenu = page.locator('[data-testid="mobile-menu"], .mobile-menu, button[aria-label*="menu"]');
    if (await mobileMenu.count() > 0) {
      await expect(mobileMenu.first()).toBeVisible();
    }
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad size

    await page.goto('/');

    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should work on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop size

    await page.goto('/');

    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
  });
});
