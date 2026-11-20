/* Requires Playwright + Chromium and a running Jekyll preview.
 * TEST_SITE_URL=http://localhost:4000/personal_homepage node _tests/alpha18_mermaid_test.cjs
 * All external HTTPS requests are blocked to exercise the local Mermaid bundle.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const base = (process.env.TEST_SITE_URL || 'http://localhost:4000/personal_homepage').replace(/\/$/, '');
const source = fs.readFileSync(path.join(__dirname, '../docs/_posts/2026-05-14-alpha18.md'), 'utf8');
const expectedDiagrams = [...source.matchAll(/^```mermaid\s*$/gm)].length;

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})
  });
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.route('https://**/*', route => route.abort());
      const engine = page.waitForResponse(response =>
        response.url().endsWith('/assets/js/vendor/mermaid-11.17.2.min.js'));
      await page.goto(base + '/algorithm/alpha18/', { waitUntil: 'domcontentloaded' });
      assert.equal((await engine).status(), 200);
      await page.waitForFunction(expected =>
        document.querySelectorAll('.mermaid-diagram svg').length === expected,
      expectedDiagrams, { timeout: 30000 });
      assert.equal(await page.locator('.mermaid-error').count(), 0);
      assert.equal(await page.locator('code.language-mermaid').count(), 0);
      const first = page.locator('.mermaid-diagram').first();
      assert.equal(await first.locator('.node').count(), 13);
      assert.equal(await first.locator('.cluster').count(), 5);
      assert.equal(await first.locator('.flowchart-link').count(), 16);
      const feedback = first.locator('.flowchart-link[id*="TaskColl_PrioCtrl"]');
      assert.equal(await feedback.count(), 1, 'Feedback must run from TaskColl to PrioCtrl');
      assert.equal(await feedback.getAttribute('data-edge'), 'true');
      assert.equal(await page.locator('.mermaid-diagram').evaluateAll(diagrams =>
        diagrams.every(diagram => {
          const bounds = diagram.getBoundingClientRect();
          return bounds.left >= -0.5 && bounds.right <= innerWidth + 0.5 &&
            getComputedStyle(diagram).overflowX === 'auto';
        })), true, 'Large diagrams must scroll inside their own container');
      const titleGap = await first.evaluate(diagram => {
        const consumer = diagram.querySelector('.cluster[id$="-Consumer"]');
        const schedulers = diagram.querySelector('.cluster[id$="-Schedulers"]');
        return schedulers.querySelector(':scope > rect').getBoundingClientRect().top -
          consumer.querySelector(':scope > .cluster-label').getBoundingClientRect().bottom;
      });
      assert(titleGap >= 4, 'The nested scheduler border must not cover the Consumer title');
      await page.close();
    }
    console.log(`PASS: all ${expectedDiagrams} alpha18 diagrams render on desktop/mobile without CDN access; feedback edge preserved.`);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
