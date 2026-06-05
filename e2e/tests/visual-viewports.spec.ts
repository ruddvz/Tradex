import { test, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const VIEWPORTS = [
  { name: 'iphone-se', width: 375, height: 667 },
  { name: 'iphone-15', width: 390, height: 844 },
  { name: 'iphone-pro-max', width: 430, height: 932 },
  { name: 'ipad-portrait', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
] as const;

const ROUTES = [
  { slug: 'home', path: '/Tradex/' },
  { slug: 'journal', path: '/Tradex/journal' },
  { slug: 'risk', path: '/Tradex/risk' },
] as const;

const OUT_DIR = path.join(process.cwd(), '..', 'planning', 'screenshots', 'pwa-emulated');

test.describe('PWA viewport screenshots (emulated)', () => {
  test.beforeAll(() => {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  });

  for (const vp of VIEWPORTS) {
    for (const route of ROUTES) {
      test(`${vp.name} — ${route.slug}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(route.path);
        await expect(page.locator('body')).toBeVisible({ timeout: 20_000 });
        await page.waitForTimeout(400);
        const file = path.join(OUT_DIR, `${route.slug}-${vp.name}.png`);
        await page.screenshot({ path: file, fullPage: true });
        const stat = fs.statSync(file);
        expect(stat.size).toBeGreaterThan(10_000);
      });
    }
  }
});
