import { test, expect } from '@playwright/test';

test.describe('Tradex demo shell', () => {
  test('home loads with demo context', async ({ page }) => {
    await page.goto('/Tradex/');
    await expect(page.getByRole('heading', { name: 'Home' })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/demo/i).first()).toBeVisible();
  });

  test('journal route loads trade list', async ({ page }) => {
    await page.goto('/Tradex/journal');
    await expect(page.getByText(/trades recorded/i)).toBeVisible({ timeout: 20_000 });
  });

  test('service worker registered in production build', async ({ page, context }) => {
    await page.goto('/Tradex/');
    await page.waitForLoadState('networkidle');
    const swOk = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false;
      const reg = await navigator.serviceWorker.getRegistration();
      return Boolean(reg);
    });
    expect(swOk).toBe(true);
    await context.close();
  });
});
