import { test, expect } from '@playwright/test';

test.describe('Tradex demo shell', () => {
  test('home loads with demo context', async ({ page }) => {
    await page.goto('/Tradex/');
    await expect(page.getByRole('heading', { name: 'Today' })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/demo/i).first()).toBeVisible();
  });

  test('journal route loads trade list', async ({ page }) => {
    await page.goto('/Tradex/journal');
    await expect(page.getByRole('heading', { name: 'Journal' })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByPlaceholder(/search symbol/i)).toBeVisible();
  });

  test('mobile nav includes Risk and More', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/Tradex/');
    await expect(page.getByRole('navigation', { name: 'Primary mobile' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Risk' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'More' })).toBeVisible();
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
