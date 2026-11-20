/* Requires a running, freshly built Jekyll preview and Playwright + Chromium.
 * TEST_SITE_URL=http://localhost:4000/personal_homepage node _tests/math_rendering_test.cjs
 * Set NODE_PATH / CHROMIUM_PATH for installations outside this repository.
 * Third-party network requests are blocked: engine, fonts and TeX autoload must be local.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const base = (process.env.TEST_SITE_URL || 'http://localhost:4000/personal_homepage').replace(/\/$/, '');
const source = fs.readFileSync(path.join(__dirname, '../docs/_posts/2026-05-14-alpha18.md'), 'utf8');
const formula = String.raw`\text{sat}_i = \min\left(\frac{\sum_{ds \in \text{item}_i} \text{dataset\_tested}[ds]}{\text{total\_tested}}, 1.0\right)`;
assert(source.includes(`$${formula}$`), 'The original Obsidian formula must need no per-post wrapper or rewrite');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})
  });
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const localFailures = [];
      const localResponses = [];
      const thirdPartyMath = [];
      await page.route('**/*', route => {
        const url = new URL(route.request().url());
        if (url.origin === new URL(base).origin) return route.continue();
        if (/mathjax/i.test(url.href)) thirdPartyMath.push(url.href);
        return route.abort();
      });
      page.on('requestfailed', request => {
        if (request.url().includes('/vendor/mathjax/')) localFailures.push(request.url());
      });
      page.on('response', response => {
        if (response.url().includes('/vendor/mathjax/')) {
          localResponses.push(response.url());
          if (!response.ok()) localFailures.push(`${response.status()} ${response.url()}`);
        }
      });
      await page.goto(base + '/algorithm/alpha18/', { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => !!window.MathJax?.startup?.document);
      await page.evaluate(() => MathJax.startup.promise);
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator('[data-mjx-error], mjx-merror, merror').count(), 0);
      const items = await page.evaluate(() => [...MathJax.startup.document.math].map(item => ({ tex: item.math, display: item.display })));
      assert.equal(items.filter(item => item.tex === formula && !item.display).length, 1,
        'The exact saturation formula must be parsed once as inline math');
      assert(items.some(item => item.tex.startsWith('S_i = \\sum_{g=0}')), 'Existing weighted-score math must still render');
      assert(items.some(item => item.tex.startsWith('\\text{gain} = \\frac')), 'Existing gain fraction must still render');
      assert(items.some(item => item.tex.startsWith('w_i = (S_i')), 'Existing decay-factor math must still render');
      assert.equal(await page.locator('mjx-container').count(), 17, 'All existing alpha18 equations must render');

      const line = page.locator('li').filter({ hasText: '已回测的样本数占比' }).last();
      assert.equal(await line.locator('em').count(), 0, 'Markdown must not split the TeX into emphasis nodes');
      assert.equal(await line.locator('mjx-container').count(), 1);
      assert.equal(await line.locator('mjx-container[display="true"]').count(), 0);
      assert.equal(await line.locator('mjx-assistive-mml math > msub').first().textContent(), 'sati', 'sat must have a real i subscript');
      assert.equal(await line.locator('mjx-assistive-mml munder').textContent(), '∑ds∈itemi', 'The summation must have a real lower bound');
      assert.deepEqual(await line.locator('mjx-assistive-mml mtext').allTextContents(),
        ['sat', 'item', 'dataset_tested', 'total_tested'], 'Identifiers must not show stray escape backslashes');

      if (width === 390) {
        const scroll = line.locator('.math-scroll');
        assert.equal(await scroll.count(), 1, 'Oversized inline math must scroll inside its list column');
        const geometry = await scroll.evaluate(wrapper => {
          const bounds = wrapper.getBoundingClientRect();
          const ink = wrapper.querySelector('mjx-math, svg').getBoundingClientRect();
          return { left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom,
            inkTop: ink.top, inkBottom: ink.bottom, client: wrapper.clientWidth, scroll: wrapper.scrollWidth,
            overflow: getComputedStyle(wrapper).overflowX };
        });
        assert(geometry.left >= 0 && geometry.right <= width, 'The scrolling region must fit the viewport');
        assert(geometry.scroll > geometry.client, 'The equation must remain full size, not be shrunk');
        assert.equal(geometry.overflow, 'auto');
        assert(geometry.inkTop >= geometry.top && geometry.inkBottom <= geometry.bottom,
          'Fractions and summation bounds must not be clipped vertically');
        assert.equal(await scroll.getAttribute('tabindex'), '0', 'The scroll region must be keyboard reachable');
        assert.equal(await scroll.evaluate(wrapper => {
          wrapper.scrollLeft = wrapper.scrollWidth;
          return wrapper.querySelector('mjx-math, svg').getBoundingClientRect().right <= wrapper.getBoundingClientRect().right + 1;
        }), true, 'The right end of the formula must be reachable by scrolling');
        const pageWidths = await page.evaluate(() => {
          const withMath = document.documentElement.scrollWidth;
          const nodes = [...document.querySelectorAll('mjx-container')];
          const display = nodes.map(node => node.style.display);
          nodes.forEach(node => { node.style.display = 'none'; });
          const withoutMath = document.documentElement.scrollWidth;
          nodes.forEach((node, index) => { node.style.display = display[index]; });
          return { withMath, withoutMath };
        });
        assert(pageWidths.withMath <= pageWidths.withoutMath + 1, 'Equations must not add whole-page horizontal overflow');
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.waitForFunction(() => ![...document.querySelectorAll('li')].filter(node => node.textContent.includes('已回测的样本数占比')).pop().querySelector('.math-scroll'));
        await page.setViewportSize({ width, height: 900 });
        await page.waitForFunction(() => !![...document.querySelectorAll('li')].filter(node => node.textContent.includes('已回测的样本数占比')).pop().querySelector('.math-scroll'));
      } else {
        assert.equal(await line.locator('.math-scroll').count(), 0, 'Fitting equations must remain inline');
      }

      // Exercise both delimiter styles, display math, lazy extensions, and literal code.
      const literals = await page.locator('pre, code').allTextContents();
      await page.evaluate(async () => {
        const fixture = document.createElement('section');
        fixture.id = 'math-regression-fixture';
        fixture.innerHTML = String.raw`<p>$x_i^2$ and \(y+1\)</p>
          <p>$$\frac{1}{2}$$</p><p>\[a^2+b^2=c^2\]</p>
          <p>$\cancel{x}$</p>
          <code>$literal_i$ \(not\)</code><pre><code>$$also_literal$$</code></pre>`;
        document.body.appendChild(fixture);
        await MathJax.typesetPromise([fixture]);
        await document.fonts.ready;
      });
      const fixture = page.locator('#math-regression-fixture');
      assert.equal(await fixture.locator('mjx-container').count(), 5);
      assert.equal(await fixture.locator('mjx-container[display="true"]').count(), 2);
      assert.equal(await fixture.locator('[data-mjx-error], mjx-merror, merror').count(), 0);
      assert.equal(await fixture.locator('pre mjx-container, code mjx-container').count(), 0);
      assert.deepEqual(await fixture.locator('code').allTextContents(), [String.raw`$literal_i$ \(not\)`, '$$also_literal$$']);
      await fixture.evaluate(node => { MathJax.typesetClear([node]); node.remove(); });
      assert.deepEqual(await page.locator('pre, code').allTextContents(), literals, 'Existing code fences and inline code must be unchanged');
      assert(localResponses.some(url => url.endsWith('/tex-mml-chtml.js')), 'Configured engine must load locally');
      assert(localResponses.some(url => url.endsWith('/input/tex/extensions/cancel.js')), 'Lazy TeX extensions must load locally');
      assert(localResponses.some(url => url.endsWith('/input/tex/extensions/textmacros.js')), 'Text macros must interpret original escaped identifiers locally');
      assert(localResponses.some(url => url.endsWith('.woff')), 'CHTML fonts must load locally');
      assert.deepEqual(localFailures, []);
      assert.deepEqual(thirdPartyMath, []);
      await page.close();
    }
    console.log('PASS: alpha18 saturation formula + 16 existing equations, mobile math scrolling/resizing, delimiters, code isolation, local fonts and TeX autoload (desktop/mobile; CDN blocked).');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
