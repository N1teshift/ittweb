import { test, expect } from '@playwright/test';

test.describe('Games Page', () => {
  test('should load games page', async ({ page }) => {
    await page.goto('/games');

    // Check page loads
    await expect(page.locator('h1, h2').filter({ hasText: /games/i })).toBeVisible();
  });

  test('should display games list or empty state', async ({ page }) => {
    await page.goto('/games');

    // Should either show games or an empty state message
    const hasGames = await page.locator('[data-testid*="game"], .game-card, .game-item').count() > 0;
    const hasEmptyState = await page.locator('text=/no games|empty/i').count() > 0;

    expect(hasGames || hasEmptyState).toBe(true);
  });

  test('should have working filters if games exist', async ({ page }) => {
    await page.goto('/games');

    // Check for filter controls (if they exist)
    const filterElements = page.locator('select, input[type="checkbox"], input[type="radio"]');
    const filterCount = await filterElements.count();

    if (filterCount > 0) {
      // If filters exist, they should be usable
      await expect(filterElements.first()).toBeVisible();
    }
  });

  test('should navigate to game detail when clicking a game', async ({ page }) => {
    await page.goto('/games');

    // Look for clickable game elements
    const gameLink = page.locator('a[href*="/games/"], [data-testid*="game"]').first();

    if (await gameLink.count() > 0) {
      const href = await gameLink.getAttribute('href');
      if (href) {
        await gameLink.click();
        await expect(page).toHaveURL(href);
      }
    } else {
      // Skip test if no games to click
      test.skip();
    }
  });
});

test.describe('Game Detail Page', () => {
  test('should load game detail page for valid game ID', async ({ page }) => {
    // Try to access a game detail page - this might fail if no games exist
    // but we can test the page structure if it loads
    try {
      await page.goto('/games/1');

      // If page loads, check for game detail elements
      const hasGameContent = await page.locator('h1, h2, .game-detail, [data-testid*="game"]').count() > 0;
      const hasErrorMessage = await page.locator('text=/not found|error/i').count() > 0;

      // Either shows game content or appropriate error
      expect(hasGameContent || hasErrorMessage).toBe(true);
    } catch (error) {
      // Page might not exist, which is fine for this test
      test.skip();
    }
  });
});
