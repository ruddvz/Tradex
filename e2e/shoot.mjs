// Standalone visual capture — uses the system Playwright Chromium so it works
// without a fresh browser download. Screens every route at mobile + desktop.
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const BASE = 'http://127.0.0.1:4173/Tradex/';
const OUT = '/tmp/shots';

const routes = [
  ['dashboard', ''],
  ['journal', 'journal'],
  ['paper-trading', 'paper-trading'],
  ['risk', 'risk'],
  ['more', 'more'],
  ['playbooks', 'playbooks'],
  ['reports', 'reports'],
  ['calculator', 'calculator'],
  ['notebook', 'notebook'],
  ['settings', 'settings'],
  ['backtests', 'backtests'],
  ['propfirm', 'propfirm'],
  ['action-center', 'action-center'],
  ['live-readiness', 'live-readiness'],
  ['landing', 'landing'],
];

const viewports = [
  ['mobile', { width: 390, height: 844 }],
  ['desktop', { width: 1440, height: 900 }],
];

const run = async () => {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: CHROME });
  const consoleErrors = [];
  for (const [vpName, vp] of viewports) {
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    page.on('console', (m) => {
      if (m.type() === 'error') consoleErrors.push(`[${vpName}] ${m.text()}`);
    });
    page.on('pageerror', (e) => consoleErrors.push(`[${vpName}] PAGEERROR ${e.message}`));
    for (const [name, path] of routes) {
      try {
        await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(500);
        await page.screenshot({ path: `${OUT}/${name}-${vpName}.png`, fullPage: true });
      } catch (e) {
        consoleErrors.push(`[${vpName}] NAV FAIL ${name}: ${e.message}`);
      }
    }
    await ctx.close();
  }
  await browser.close();
  console.log('CONSOLE_ERRORS_START');
  console.log(consoleErrors.length ? [...new Set(consoleErrors)].join('\n') : 'none');
  console.log('CONSOLE_ERRORS_END');
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
