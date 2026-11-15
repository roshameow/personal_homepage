/* Browser regressions. Requires Playwright + Chromium installed in the test environment.
 * Run: node _tests/content_rendering_test.cjs
 * Optional: TEST_SITE_URL=http://127.0.0.1:4000/personal_homepage/ for live checks.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

function includeScript(name) {
  const include = fs.readFileSync(path.join(__dirname, '../_includes', name), 'utf8');
  return include.match(/<script>([\s\S]*?)<\/script>/)[1]
    .replace(/\{\{[\s\S]*?\}\}/g, '"default"');
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})
  });
  try {
    const page = await browser.newPage();
    await page.setContent(`<main class="page-content">
      <blockquote id="warning"><p>[!WARNING] 注意：不要直接查 <code>route get default</code>！
Clash/VPN 的 TUN 模式为了<strong>防止断网和死循环</strong>。
保留 <code>default -&gt; en0</code>。</p><p>第二段</p></blockquote>
      <blockquote id="note"><p>[!NOTE]<br>正文 <em>格式</em></p></blockquote>
      <blockquote id="tip"><p>[!TIP]- <strong>提示</strong></p><ul><li>内容</li></ul></blockquote>
      <blockquote id="danger"><p>[!ERROR]+ 错误\n详情</p></blockquote>
      <blockquote id="ordinary"><p>普通引用 [!WARNING]</p></blockquote>
      <blockquote id="literal"><p><code>[!WARNING]</code> 不应转换</p></blockquote>
      <blockquote id="unknown"><p>[!unknown] 不支持的类型</p></blockquote>
      <blockquote id="outer"><p>[!CAUTION] 外层\n内容</p>
        <blockquote id="inner"><p>[!INFO] 内层\n内容</p></blockquote>
      </blockquote>
    </main>`);
    await page.evaluate(includeScript('callouts.html'));
    assert.equal(await page.locator('.callout').count(), 6);
    assert.equal(await page.locator('#warning .callout-title-text').innerText(), '注意：不要直接查 route get default！');
    assert.equal(await page.locator('#warning .callout-title code').count(), 1);
    assert.equal(await page.locator('#warning .callout-body strong').innerText(), '防止断网和死循环');
    assert.equal(await page.locator('#warning .callout-body p').count(), 2);
    assert(!await page.locator('#warning').innerText().then(text => text.includes('[!WARNING]')));
    assert.equal(await page.locator('#note .callout-title-text').innerText(), 'Note');
    assert.equal(await page.locator('#note .callout-body em').innerText(), '格式');
    assert.equal(await page.locator('#tip').getAttribute('open'), null);
    assert.equal(await page.locator('#danger').getAttribute('open'), '');
    await page.locator('#tip summary').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#tip').getAttribute('open'), '');
    assert.equal(await page.locator('blockquote').count(), 3);
    assert.equal(await page.locator('#outer #inner.callout').count(), 1);
    await page.evaluate(includeScript('callouts.html'));
    assert.equal(await page.locator('.callout').count(), 6, 'Callouts must be idempotent');

    // Stub only the Mermaid engine: verify source/wrapper handling and error isolation.
    await page.setContent(`<main class="page-content">
      <pre><code class="language-mermaid">flowchart TD\nsubgraph Mode1["代理"]\n A --&gt; B\nend\nsubgraph Mode2["TUN"]\n C --&gt; D\nend</code></pre>
      <div class="language-mermaid highlighter-rouge"><div class="highlight"><pre><code class="language-mermaid">invalid diagram</code></pre></div></div>
      <pre><code class="language-mermaid">sequenceDiagram\nAlice-&gt;&gt;Bob: Hello</code></pre>
    </main>`);
    await page.evaluate(() => {
      window.diagramSources = [];
      window.mermaid = {
        initialize(config) { window.mermaidConfig = config; },
        async run({ nodes }) {
          const node = nodes[0];
          window.diagramSources.push(node.textContent);
          if (node.textContent === 'invalid diagram') throw new Error('Bad syntax');
          node.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';
          node.setAttribute('data-processed', 'true');
        }
      };
    });
    await page.evaluate(includeScript('mermaid.html'));
    await page.waitForFunction(() => window.diagramSources.length === 3);
    assert.equal(await page.locator('.mermaid-diagram svg').count(), 2);
    assert.equal(await page.locator('.mermaid-list').count(), 0);
    assert.equal(await page.locator('.mermaid-error').count(), 1);
    assert.equal(await page.locator('code.language-mermaid').innerText(), 'invalid diagram');
    const sources = await page.evaluate(() => window.diagramSources);
    assert(sources[0].includes('A --> B') && sources[0].includes('C --> D'));
    assert.equal(await page.evaluate(() => window.mermaidConfig.startOnLoad), false);
    assert.equal(await page.evaluate(() => window.mermaidConfig.flowchart.inheritDir), true);
    assert.equal(await page.evaluate(() => window.mermaidConfig.theme), 'base');
    assert.equal(await page.evaluate(() => window.mermaidConfig.htmlLabels), false);
    assert.equal(await page.evaluate(() => window.mermaidConfig.flowchart.nodeSpacing), 24);
    assert.equal(await page.evaluate(() => window.mermaidConfig.flowchart.rankSpacing), 28);
    assert.equal(await page.evaluate(() => window.mermaidConfig.flowchart.padding), 8);
    assert.equal(await page.evaluate(() => window.mermaidConfig.themeVariables.fontSize), '14px');
    assert.equal(await page.evaluate(() => window.mermaidConfig.themeVariables.primaryColor), '#e4eaf0');
    assert.equal(await page.evaluate(() => window.mermaidConfig.themeVariables.fontFamily),
      await page.evaluate(() => getComputedStyle(document.body).fontFamily));

    // Custom skin properties, not hard-coded Mermaid defaults, drive the palette.
    await page.evaluate(() => {
      document.documentElement.style.setProperty('--mermaid-background', '#101010');
      document.documentElement.style.setProperty('--mermaid-palette-0-node', '#18232b');
      document.documentElement.style.setProperty('--mermaid-text', '#eeeeee');
      document.documentElement.style.setProperty('--mermaid-cluster-background', '#202020');
    });
    await page.evaluate(includeScript('mermaid.html'));
    assert.equal(await page.evaluate(() => window.mermaidConfig.themeVariables.primaryColor), '#18232b');
    assert.equal(await page.evaluate(() => window.mermaidConfig.themeVariables.primaryTextColor), '#eeeeee');
    assert.equal(await page.evaluate(() => window.mermaidConfig.themeVariables.clusterBkg), '#202020');

    const missingEnginePage = await browser.newPage();
    await missingEnginePage.setContent('<pre><code class="language-mermaid">flowchart TD\\nA --&gt; B</code></pre>');
    await missingEnginePage.evaluate(includeScript('mermaid.html'));
    assert.equal(await missingEnginePage.locator('code.language-mermaid').count(), 1);
    assert.equal(await missingEnginePage.locator('.mermaid-error[role="status"]').count(), 1,
      'A failed engine load should report an error, not silently leave code');
    await missingEnginePage.close();

    const fontPage = await browser.newPage();
    await fontPage.setContent('<pre><code class="language-mermaid">flowchart TD\\nA --&gt; B</code></pre>');
    await fontPage.evaluate(() => {
      window.engineCalled = false;
      Object.defineProperty(document, 'fonts', {
        configurable: true,
        value: { ready: new Promise(resolve => { window.releaseFonts = resolve; }) }
      });
      window.mermaid = {
        initialize() { window.engineCalled = true; },
        async run({ nodes }) { nodes[0].innerHTML = '<svg></svg>'; }
      };
    });
    await fontPage.evaluate(includeScript('mermaid.html'));
    assert.equal(await fontPage.evaluate(() => window.engineCalled), false, 'Layout must wait for font readiness');
    await fontPage.evaluate(() => window.releaseFonts());
    await fontPage.waitForFunction(() => window.engineCalled);
    await fontPage.close();

    if (process.env.TEST_SITE_URL) {
      const url = process.env.TEST_SITE_URL.replace(/\/$/, '') + '/daily/' + encodeURIComponent('网络问题') + '/';
      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('.mermaid-diagram svg', { timeout: 30000 });
        assert.equal(await page.locator('.callout--warning').count(), 1);
        assert.equal(await page.locator('.mermaid-error').count(), 0);
        assert.equal(await page.locator('.mermaid-list').count(), 0);
        assert.equal(await page.locator('.mermaid-diagram svg .cluster').count(), 2);
        const palette = await page.evaluate(() => {
          const svg = document.querySelector('.mermaid-diagram svg');
          const body = getComputedStyle(document.body);
          const probe = document.createElement('span');
          const node = svg.querySelector('.node');
          const cluster = svg.querySelector('.cluster');
          function skinColor(index, kind) {
            probe.style.color = getComputedStyle(document.documentElement)
              .getPropertyValue(`--mermaid-palette-${index}-${kind}`).trim();
            document.body.appendChild(probe);
            const color = getComputedStyle(probe).color;
            probe.remove();
            return color;
          }
          const clusterColor = skinColor(cluster.dataset.mermaidPalette, 'cluster');
          const nodeColor = skinColor(node.dataset.mermaidPalette, 'node');
          return {
            node: getComputedStyle(svg.querySelector('.node rect')).fill,
            background: body.backgroundColor,
            nodeColor,
            cluster: getComputedStyle(svg.querySelector('.cluster rect')).fill,
            clusterColor,
            font: getComputedStyle(svg.querySelector('.node text')).fontFamily,
            bodyFont: body.fontFamily
          };
        });
        assert.equal(palette.node, palette.nodeColor, 'Nodes should use their active skin accent');
        assert.notEqual(palette.node, palette.background, 'Nodes should have a subtle color, not plain white');
        assert.equal(palette.cluster, palette.clusterColor, 'Groups should use the active skin palette');
        assert.equal(palette.font, palette.bodyFont, 'Diagram and article fonts should match');
        assert.equal(await page.locator('.mermaid-diagram foreignObject').count(), 0,
          'Native SVG labels should not use clipping-prone HTML boxes');
        const clipped = await page.locator('.mermaid-diagram .node').evaluateAll(nodes =>
          nodes.filter(node => {
            const box = node.querySelector('rect.label-container').getBoundingClientRect();
            const label = node.querySelector('text').getBoundingClientRect();
            const tolerance = 0.75;
            return label.left < box.left - tolerance || label.right > box.right + tolerance ||
              label.top < box.top - tolerance || label.bottom > box.bottom + tolerance;
          }).map(node => node.textContent));
        assert.deepEqual(clipped, [], 'All node text must fit inside its rectangle');
        assert(await page.locator('.mermaid-diagram svg').evaluate(svg =>
          svg.viewBox.baseVal.height < 520 && svg.viewBox.baseVal.width < 1150),
          'The comparison flowchart should have a compact layout');
        assert(await page.locator('.mermaid-diagram svg .edgePath, .mermaid-diagram svg .flowchart-link').count() >= 7);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Page should not overflow horizontally');
        assert(await page.locator('.mermaid-diagram svg').evaluate(svg =>
          svg.getBoundingClientRect().width >= svg.viewBox.baseVal.width * 0.9 - 1),
          'Diagram labels should stay readable on mobile');
      }
    }
    console.log('PASS: callout formatting/folding/literals, Mermaid subgraphs/error isolation/font readiness' +
      (process.env.TEST_SITE_URL ? ', live desktop/mobile palette, label containment and compact layout.' : '.'));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
