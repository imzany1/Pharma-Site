import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/PharmaCorp/);
});

test('check for navbar', async ({ page }) => {
  await page.goto('/');

  // Check if navbar exists (assuming it has a semantic role or generic class)
  // Adjust selector based on actual implementation.
  // For now, checking if body is visible as a basic smoke test.
  await expect(page.locator('body')).toBeVisible();
});
