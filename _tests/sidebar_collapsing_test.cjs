/* Requires Playwright + Chromium. Run against a running Jekyll preview:
 * TEST_SITE_URL=http://127.0.0.1:4000/personal_homepage/ node _tests/sidebar_collapsing_test.cjs
 * Optional CHROMIUM_PATH selects an already installed Chromium executable.
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = (process.env.TEST_SITE_URL || 'http://127.0.0.1:4000/personal_homepage').replace(/\/$/, '');
const url = base + '/daily/' + encodeURIComponent('网络问题') + '/';

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})
  });
  try {
    for (const javaScriptEnabled of [true, false]) {
      for (const width of [1440, 390]) {
        const context = await browser.newContext({ javaScriptEnabled, viewport: { width, height: 900 } });
        if (!javaScriptEnabled) {
          // Folding and the chevrons must work with no CDN scripts/fonts available.
          await context.route('https://**/*', route => route.abort());
        }
        const page = await context.newPage();
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        const toc = page.locator('#entry-table-of-contents');
        const related = page.locator('#entry-related-posts');
        assert.equal(await page.locator('.page-sidebar details.toc-wrapper').count(), 2);
        assert.equal(await toc.locator('a').count() > 0, true);
        assert.equal(await related.locator('a').count() > 0, true);
        assert.equal(await page.locator('.page-sidebar [id]').evaluateAll(elements =>
          new Set(elements.map(element => element.id)).size === elements.length), true,
          'Sidebar IDs must be unique');

        for (const panel of [toc, related]) {
          assert.equal(await panel.getAttribute('open'), '');
          assert.equal(await panel.locator('.toc-content').isVisible(), true);
          assert.equal(await panel.locator('summary svg').count(), 1);
        }

        await toc.locator('summary').click();
        assert.equal(await toc.getAttribute('open'), null);
        assert.equal(await toc.locator('.toc-content').isVisible(), false);
        assert.equal(await related.getAttribute('open'), '', 'TOC must not affect Related Posts');

        await related.locator('summary').click();
        assert.equal(await related.getAttribute('open'), null);
        assert.equal(await related.locator('.toc-content').isVisible(), false);

        // Native summaries support both keyboard activation keys.
        await toc.locator('summary').focus();
        await page.keyboard.press('Enter');
        assert.equal(await toc.getAttribute('open'), '');
        assert.equal(await related.getAttribute('open'), null);
        await related.locator('summary').focus();
        await page.keyboard.press('Space');
        assert.equal(await related.getAttribute('open'), '');
        assert.equal(await related.locator('.toc-content').isVisible(), true);

        // No delayed animation timer should undo quick toggles or couple panels.
        for (let i = 0; i < 4; i++) await toc.locator('summary').click();
        assert.equal(await toc.getAttribute('open'), '');
        assert.equal(await toc.locator('.toc-content').isVisible(), true);
        assert.equal(await related.locator('.toc-content').isVisible(), true);

        const firstLink = toc.locator('a').first();
        const href = await firstLink.getAttribute('href');
        await firstLink.click();
        await page.waitForURL(current => decodeURIComponent(current.hash) === decodeURIComponent(href));
        assert.equal(await toc.getAttribute('open'), '', 'TOC links should still navigate without collapsing');
        assert.equal(await page.locator('.page-sidebar').evaluate(sidebar =>
          sidebar.getBoundingClientRect().width <= innerWidth), true, 'Sidebar should fit the viewport');
        await context.close();
      }
    }
    console.log('PASS: independent sidebar folding, pointer/keyboard/rapid toggles, links, desktop/mobile, JavaScript disabled.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
