/* Independent Markdown -> Jekyll -> native browser MathJax regression.
 * See display_math_test.md for invocation. No preview server or real posts used.
 */
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');

const REPO = path.resolve(__dirname, '..');
const BASE = '/personal_homepage';
const ORIGIN = 'http://display-math.test';
const ENV = {
  ...process.env,
  PATH: `${os.homedir()}/.rubies/ruby-3.2.2/bin:${process.env.PATH}`,
  GEM_HOME: `${os.homedir()}/.gem/ruby/3.2.2`,
  LANG: 'en_US.UTF-8',
};
const wide = String.raw`\frac{\sum_{i=1}^{n} a_i b_i c_i d_i e_i f_i g_i}{\sqrt{1+x_i^2}} + \frac{\sum_{j=1}^{m} h_j k_j l_j p_j q_j r_j s_j}{\sqrt{1+y_j^2}} + \frac{\sum_{k=1}^{n} a_k b_k c_k d_k e_k f_k g_k}{\sqrt{1+z_k^2}}`;
// Each case is parsed from Markdown, never injected into an already rendered DOM.
const cases = [
  ['no-blank', 'Before no blank\n$$a_i$$\nAfter no blank', ['a_i']],
  ['blank', 'Before blank\n\n$$b_i$$\n\nAfter blank', ['b_i']],
  ['adjacent', 'Before adjacent\n$$c_i = 1$$\n$$d_i = 2$$\nAfter adjacent', ['c_i = 1', 'd_i = 2']],
  ['list', '- Before list\n  $$e_i = 3$$\n  $$f_i = 4$$\n  After list', ['e_i = 3', 'f_i = 4']],
  ['prose', 'Before prose $$g_i = 5$$ After prose', ['g_i = 5']],
  ['table', '| Equation |\n| --- |\n| Before table $$h_i = 6$$ After table |', ['h_i = 6']],
  ['native', 'Before native\n\n$$\nj_i = \\frac{1}{2}\n$$\n\nAfter native', [String.raw`j_i = \frac{1}{2}`]],
  ['wide', `Before wide\n$$${wide}$$\nAfter wide`, [wide]],
];
const code = String.raw`$$literal_i$$ $literal_j$ \(literal_k\)`;
const markdown = cases.map(([id, source]) => `<div id="${id}" markdown="1">\n\n${source}\n\n</div>`).join('\n\n') + String.raw`

<div id="inline" markdown="1">

Before inline $x_i$ middle \(y_j\) After inline

</div>

` + '`' + code + '`\n\n```text\n' + code + '\n```\n';

function fixture(dir) {
  fs.mkdirSync(path.join(dir, '_layouts'), { recursive: true });
  fs.mkdirSync(path.join(dir, '_includes'), { recursive: true });
  fs.cpSync(path.join(REPO, '_plugins'), path.join(dir, '_plugins'), { recursive: true });
  fs.copyFileSync(path.join(REPO, '_includes/mathjax.html'), path.join(dir, '_includes/mathjax.html'));
  fs.cpSync(path.join(REPO, 'assets/js/vendor/mathjax'), path.join(dir, 'assets/js/vendor/mathjax'), { recursive: true });
  fs.copyFileSync(path.join(REPO, '_config.yml'), path.join(dir, '_config.yml'));
  // Keep actual Markdown/MathJax configuration, but no theme, archives, posts or CDN.
  fs.writeFileSync(path.join(dir, '_isolated.yml'), `theme: null\nremote_theme: null\nplugins: []\ndefaults: []\npaginate: null\ncollections: {}\n`);
  fs.writeFileSync(path.join(dir, '_layouts/fixture.html'), `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body { margin: 0; font: 18px/1.5 serif; } main { max-width: 900px; margin: auto; padding: 20px; } td { padding: 4px; } pre { overflow-x: auto; } </style>
{% include mathjax.html %}</head><body><main>{{ content }}</main></body></html>`);
  fs.writeFileSync(path.join(dir, 'index.md'), `---\nlayout: fixture\n---\n${markdown}`);
  const out = path.join(dir, '_out');
  execFileSync('bundle', ['exec', 'jekyll', 'build', '--source', dir, '--destination', out,
    '--config', `${dir}/_config.yml,${dir}/_isolated.yml`],
  { cwd: REPO, env: ENV, stdio: ['ignore', 'pipe', 'pipe'], timeout: 60000 });
  return out;
}

(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'display-math-'));
  let browser;
  try {
    const out = fixture(dir);
    browser = await chromium.launch({ headless: true,
      ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const failures = [];
      const loaded = [];
      const mime = { '.html': 'text/html', '.js': 'application/javascript', '.woff': 'font/woff', '.css': 'text/css' };
      // Serve built files via Playwright's URL routing: actual scripts/fonts, no server.
      await page.route('**/*', async route => {
        const url = new URL(route.request().url());
        const relative = decodeURIComponent(url.pathname).slice(BASE.length).replace(/^\//, '') || 'index.html';
        const file = path.resolve(out, relative);
        if (url.origin !== ORIGIN || !url.pathname.startsWith(BASE + '/') ||
            !file.startsWith(out + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
          failures.push(url.href);
          return route.abort();
        }
        loaded.push(relative);
        return route.fulfill({ path: file, contentType: mime[path.extname(file)] || 'application/octet-stream' });
      });
      page.on('pageerror', error => failures.push(error.message));
      await page.goto(`${ORIGIN}${BASE}/`, { waitUntil: 'load' });
      await page.waitForFunction(() => !!window.MathJax?.startup?.document);
      await page.evaluate(async () => { await MathJax.startup.promise; await document.fonts.ready; });
      assert.equal(await page.locator('[data-mjx-error], mjx-merror, merror').count(), 0, `${width}: valid fixture must have no TeX errors`);
      const items = await page.evaluate(() => [...MathJax.startup.document.math].map(item => ({ tex: item.math.trim(), display: item.display })));
      assert.deepEqual(items, [
        ...cases.flatMap(([, , tex]) => tex.map(value => ({ tex: value, display: true }))),
        { tex: 'x_i', display: false }, { tex: 'y_j', display: false },
      ], `${width}: exact source formulas must each typeset once with the intended display flag`);

      for (const [id, , tex] of cases) {
        assert.equal(await page.locator(`#${id} mjx-container[display="true"]`).count(), tex.length, `${width}: ${id} display containers`);
        const geometry = await page.locator(`#${id}`).evaluate(section => {
          const rect = node => { const r = node.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, height: r.height }; };
          const walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT);
          const text = [];
          while (walker.nextNode()) {
            const node = walker.currentNode;
            if (!node.parentElement.closest('mjx-container') && /Before|After/.test(node.textContent)) {
              for (const match of node.textContent.matchAll(/(?:Before|After) [a-z]+/g)) {
                const range = document.createRange();
                range.setStart(node, match.index); range.setEnd(node, match.index + match[0].length);
                text.push({ value: match[0], ...rect(range) });
              }
            }
          }
          return { text, math: [...section.querySelectorAll('mjx-container')].map(rect) };
        });
        assert.equal(geometry.text.length, 2, `${id}: both prose anchors must survive Markdown`);
        const before = geometry.text.find(t => t.value.startsWith('Before'));
        const after = geometry.text.find(t => t.value.startsWith('After'));
        assert(geometry.math.every(m => m.height > 0), `${id}: math must be visible`);
        assert(before.bottom <= geometry.math[0].top + 1, `${width}: ${id} must be below preceding text`);
        assert(after.top >= geometry.math.at(-1).bottom - 1, `${width}: ${id} must be above following text`);
        for (let i = 1; i < geometry.math.length; i++) {
          assert(geometry.math[i].top >= geometry.math[i - 1].bottom - 1, `${width}: ${id} adjacent formulas need separate lines`);
        }
      }
      assert.equal(await page.locator('#list li mjx-container').count(), 2, 'List math must remain in its list item');
      assert.equal(await page.locator('#table td mjx-container').count(), 1, 'Table math must remain in its cell');
      assert.equal(await page.locator('#inline mjx-container[display="true"]').count(), 0);
      assert(await page.locator('#inline').evaluate(section => {
        const range = document.createRange();
        range.setStart(section.querySelector('p').firstChild, 0);
        range.setEnd(section.querySelector('p').firstChild, 6);
        const prose = range.getBoundingClientRect();
        return [...section.querySelectorAll('mjx-container')].every(node => {
          const r = node.getBoundingClientRect(); return r.top < prose.bottom && r.bottom > prose.top;
        });
      }), `${width}: single-dollar and parenthesis math must share the prose line`);
      assert.equal(await page.locator('pre mjx-container, code mjx-container').count(), 0);
      assert.deepEqual(await page.locator('code').allTextContents(), [code, code + '\n'], 'Backticks and code fences must retain their literal source');

      if (width === 390) {
        const scroll = page.locator('#wide .math-scroll');
        assert.equal(await scroll.count(), 1, 'Mobile wide math must get a scroll region');
        assert.equal(await scroll.getAttribute('tabindex'), '0');
        const g = await scroll.evaluate(wrapper => {
          const bounds = wrapper.getBoundingClientRect();
          const ink = wrapper.querySelector('mjx-math, svg').getBoundingClientRect();
          wrapper.scrollLeft = wrapper.scrollWidth;
          const end = wrapper.querySelector('mjx-math, svg').getBoundingClientRect();
          return { left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom,
            inkTop: ink.top, inkBottom: ink.bottom, end: end.right, client: wrapper.clientWidth,
            scroll: wrapper.scrollWidth, overflow: getComputedStyle(wrapper).overflowX };
        });
        assert(g.left >= 0 && g.right <= width, 'Scroll region must fit the mobile viewport');
        assert(g.scroll > g.client && g.overflow === 'auto', 'Keep full-sized, horizontally scrollable math');
        assert(g.inkTop >= g.top - 1 && g.inkBottom <= g.bottom + 1, 'Fractions and summation bounds must not clip vertically');
        assert(g.end <= g.right + 1, 'The right edge must be reachable by scrolling');
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Math must not cause whole-page mobile overflow');
      }
      assert(loaded.some(f => f.endsWith('/tex-mml-chtml.js')), 'Use the real configured local MathJax engine');
      assert(loaded.some(f => f.endsWith('.woff')), 'Use actual local CHTML fonts');
      assert.deepEqual(failures, [], 'No missing assets, external requests, or browser errors');
      await page.close();
    }
    console.log('PASS: native Markdown display/inline math, adjacent/list/table cases, code isolation and mobile scrolling (1440/390; local MathJax only).');
  } finally {
    if (browser) await browser.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
