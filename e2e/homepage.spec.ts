import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');

    // Check that the page loads
    await expect(page).toHaveTitle(/Island Troll Tribes/);

    // Check for main navigation elements
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('text=Games')).toBeVisible();
    await expect(page.locator('text=Players')).toBeVisible();
    await expect(page.locator('text=Standings')).toBeVisible();
  });

  test('should navigate to games page', async ({ page }) => {
    await page.goto('/');

    // Click on Games link
    await page.locator('text=Games').click();

    // Should navigate to games page
    await expect(page).toHaveURL(/.*\/games/);
    await expect(page.locator('h1, h2').filter({ hasText: /games/i })).toBeVisible();
  });

  test('should navigate to players page', async ({ page }) => {
    await page.goto('/');

    // Click on Players link
    await page.locator('text=Players').click();

    // Should navigate to players page
    await expect(page).toHaveURL(/.*\/players/);
    await expect(page.locator('h1, h2').filter({ hasText: /players/i })).toBeVisible();
  });

  test('should navigate to standings page', async ({ page }) => {
    await page.goto('/');

    // Click on Standings link
    await page.locator('text=Standings').click();

    // Should navigate to standings page
    await expect(page).toHaveURL(/.*\/standings/);
    await expect(page.locator('h1, h2').filter({ hasText: /standings|leaderboard/i })).toBeVisible();
  });
});
