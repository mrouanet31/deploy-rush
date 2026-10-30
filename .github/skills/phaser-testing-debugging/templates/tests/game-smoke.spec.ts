import { test, expect } from '@playwright/test';

test('game boots without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  expect(errors).toEqual([]);
});
