/* Independent browser regression for skin-compatible pastel Mermaid accents.
 * Requires Playwright, Chromium, and a fresh Jekyll build in _site (or TEST_SITE_DIR).
 * No preview server or external assets are needed. TEST_SITE_URL enables live alpha18 checks.
 * Run: NODE_PATH=/path/to/playwright/node_modules CHROMIUM_PATH=/path/to/chromium \
 *        node _tests/mermaid_palette_test.cjs
 * Uses the real local engine and include script, not a renderer stub. Build the skin CSS
 * after changing _sass/so-simple/_skin.scss; stale _site CSS should fail, not be skipped.
 * Verified engine pitfalls: group/node IDs gain a generated Mermaid prefix, and empty
 * edge-label <text> elements can have an origin outside the SVG. Match ID suffixes and
 * exclude empty labels from containment checks, rather than weakening visible-label checks.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const site = process.env.TEST_SITE_DIR || path.join(root, '_site');
const include = fs.readFileSync(path.join(root, '_includes/mermaid.html'), 'utf8');
const script = include.match(/<script>([\s\S]*?)<\/script>/)[1]
  .replace(/\{\{[\s\S]*?\}\}/g, '"base"');
const includeCSS = [...include.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(match => match[1]).join('\n');
const bundle = path.join(root, 'assets/js/vendor/mermaid-11.17.2.min.js');
const alphaSource = fs.readFileSync(path.join(root, 'docs/_posts/2026-05-14-alpha18.md'), 'utf8');
const alpha = alphaSource.match(/^```mermaid\s*\n([\s\S]*?)^```/m)[1];

const grouped = `flowchart TB
subgraph Outer["Outer group"]
  A["Outer node"]
  subgraph Inner["Inner group"]
    B["Nested node"] --> C["Second nested node"]
  end
  A --> B
end
subgraph East["East group"]
  D["East node"]
end
subgraph West["West group"]
  E["West node"]
end
subgraph South["South group"]
  F["South node"]
end
C --> D --> E --> F --> U["Ungrouped node"]`;
const author = `flowchart LR
subgraph Custom["Author group"]
  A["Class color"]:::paint --> B["Inline color"]
end
C["Stroke only"] --> D["Ordinary node"]
classDef paint fill:#ffcc88,stroke:#884400,color:#331100
style B fill:#d8ecff,stroke:#13579b,color:#102030
style C stroke:#246813
style Custom fill:#e8ddff,stroke:#654321,color:#201030`;
const defaultClass = `flowchart LR
A["Default class"] --> B["Another default"]
classDef default fill:#fce4ec,stroke:#a61c56,color:#351020`;
const shapes = 'flowchart LR\nDB[("Database")] --> Choice{"Decision"} --> Round(("Circle")) --> End(["Rounded"])';
const sources = [grouped, author, defaultClass, 'flowchart LR\nA["Primary tint"] --> B["Another node"]', alpha, shapes];

function rgb(color) {
  const channels = color.match(/[\d.]+/g);
  assert(channels && channels.length >= 3, `Expected a resolved RGB color, got ${color}`);
  return channels.slice(0, 3).map(Number);
}
function distance(a, b) {
  return Math.hypot(...rgb(a).map((channel, i) => channel - rgb(b)[i]));
}
function luminance(color) {
  const channels = rgb(color).map(channel => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
function contrast(a, b) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

// Runs inside the browser so assertions use resolved SVG/CSS colors and layout.
function inspect() {
  function normalized(value) {
    const probe = document.createElement('span');
    probe.style.color = value;
    document.body.appendChild(probe);
    const result = getComputedStyle(probe).color;
    probe.remove();
    return result;
  }
  function shape(group) {
    const container = group.querySelector(':scope > .label-container');
    if (container) {
      return container.tagName.toLowerCase() === 'g' ?
        container.querySelector('rect, polygon, circle, ellipse, path') || container : container;
    }
    return group.querySelector(':scope > rect, :scope > polygon, :scope > circle, :scope > ellipse, :scope > path');
  }
  function contains(outer, inner, tolerance = 1) {
    return inner.left >= outer.left - tolerance && inner.right <= outer.right + tolerance &&
      inner.top >= outer.top - tolerance && inner.bottom <= outer.bottom + tolerance;
  }
  const style = getComputedStyle(document.documentElement);
  return [...document.querySelectorAll('.mermaid-diagram')].map(wrapper => {
    const svg = wrapper.querySelector('svg');
    const bounds = wrapper.getBoundingClientRect();
    const groups = [...svg.querySelectorAll('g.node, g.cluster')].map(group => {
      const box = shape(group);
      const label = group.querySelector(':scope > .label, :scope > .cluster-label');
      const text = label && label.querySelector('text');
      const palette = group.getAttribute('data-mermaid-palette');
      const kind = group.classList.contains('cluster') ? 'cluster' : 'node';
      return {
        id: group.id, kind, palette, label: label && label.textContent.trim(),
        fill: box && normalized(getComputedStyle(box).fill),
        stroke: box && normalized(getComputedStyle(box).stroke),
        text: text && normalized(getComputedStyle(text).fill),
        expectedFill: palette === null ? null : normalized(`var(--mermaid-palette-${palette}-${kind})`),
        expectedBorder: palette === null ? null : normalized(`var(--mermaid-palette-${palette}-border)`),
        labelFits: !label || !box || contains(box.getBoundingClientRect(), label.getBoundingClientRect()),
        insideSVG: !box || contains(svg.getBoundingClientRect(), box.getBoundingClientRect())
      };
    });
    return {
      groups,
      edges: svg.querySelectorAll('.flowchart-link').length,
      edgeIds: [...svg.querySelectorAll('.flowchart-link')].map(edge => edge.id),
      foreignObjects: svg.querySelectorAll('foreignObject').length,
      allLabelsInsideSVG: [...svg.querySelectorAll('text')].filter(text => text.textContent.trim()).every(text =>
        contains(svg.getBoundingClientRect(), text.getBoundingClientRect())),
      background: normalized(style.getPropertyValue('--mermaid-background')),
      paletteVariables: Array.from({ length: 5 }, (_, index) => ['node', 'cluster', 'border'].map(kind =>
        style.getPropertyValue(`--mermaid-palette-${index}-${kind}`).trim())),
      responsive: bounds.left >= -0.5 && bounds.right <= innerWidth + 0.5 &&
        getComputedStyle(wrapper).overflowX === 'auto',
      legibleScale: svg.getBoundingClientRect().width >= svg.viewBox.baseVal.width * 0.9 - 1,
      pageFits: document.documentElement.scrollWidth <= innerWidth
    };
  });
}

function find(diagram, id) {
  const group = diagram.groups.find(group => group.id === id || group.id.endsWith(`-${id}`) || group.id.includes(`flowchart-${id}-`));
  assert(group, `Missing node/group ${id}`);
  return group;
}
function checkDefault(diagram, context, { checkPage = true } = {}) {
  assert(diagram.responsive, `${context}: diagram must scroll inside a viewport-contained wrapper`);
  if (checkPage) assert(diagram.pageFits, `${context}: isolated diagram fixtures must not cause page overflow`);
  assert(diagram.legibleScale, `${context}: mobile must not shrink the diagram to illegible text`);
  assert.equal(diagram.foreignObjects, 0, `${context}: labels must remain native SVG text`);
  assert(diagram.allLabelsInsideSVG, `${context}: all node, group, and edge labels must fit inside the SVG`);
  assert(diagram.paletteVariables.every(variables => variables.every(Boolean)), `${context}: all 15 skin palette variables must exist`);
  for (const group of diagram.groups) {
    assert.match(group.palette || '', /^[0-4]$/, `${context}: ${group.id} requires palette 0..4`);
    assert.equal(group.fill, group.expectedFill, `${context}: ${group.id} must use its skin fill variable`);
    assert.equal(group.stroke, group.expectedBorder, `${context}: ${group.id} must use its skin border variable`);
    assert(group.labelFits, `${context}: clipped label in ${group.id}`);
    assert(group.insideSVG, `${context}: ${group.id} extends outside SVG`);
    assert(group.text && contrast(group.text, group.fill) >= 4.5,
      `${context}: ${group.id} label contrast must be >=4.5 (got ${group.text && contrast(group.text, group.fill).toFixed(2)})`);
    const channels = rgb(group.fill);
    const chroma = Math.max(...channels) - Math.min(...channels);
    assert(chroma >= 3 && chroma <= 72, `${context}: ${group.id} must be visibly tinted but low-chroma (${group.fill})`);
    assert(distance(group.fill, diagram.background) >= 5 && distance(group.fill, diagram.background) <= 115,
      `${context}: ${group.id} must be a subtle tint rather than white/gray or a vivid block`);
  }
}
function checkGrouping(diagram) {
  assert.equal(diagram.groups.filter(group => group.kind === 'node').length, 7);
  assert.equal(diagram.groups.filter(group => group.kind === 'cluster').length, 5);
  assert.equal(diagram.edges, 6);
  const clusters = ['Outer', 'Inner', 'East', 'West', 'South'].map(id => find(diagram, id));
  assert.equal(new Set(clusters.map(group => group.palette)).size, 5, 'Five groups must use all five accents');
  for (let i = 0; i < clusters.length; i++) {
    for (let j = i + 1; j < clusters.length; j++) {
      assert(distance(clusters[i].fill, clusters[j].fill) >= 3,
        `Group fills must be visibly distinct: ${clusters[i].id} (${clusters[i].fill}) vs ${clusters[j].id} (${clusters[j].fill})`);
    }
  }
  for (const [node, cluster] of [['A', 'Outer'], ['B', 'Inner'], ['C', 'Inner'], ['D', 'East'], ['E', 'West'], ['F', 'South']]) {
    assert.equal(find(diagram, node).palette, find(diagram, cluster).palette, `${node} must match its innermost group ${cluster}`);
  }
  assert.equal(find(diagram, 'U').palette, '0', 'Ungrouped nodes use the soft primary tint');
}
function checkAuthor(diagram, defaults) {
  for (const fixture of [diagram, defaults]) {
    assert(fixture.responsive && fixture.pageFits && fixture.allLabelsInsideSVG,
      'Author styles must preserve responsive layout and label containment');
    assert(fixture.groups.every(group => group.labelFits && group.insideSVG),
      'Author-styled labels must remain inside their shapes and SVG');
  }
  for (const [id, fill, stroke] of [
    ['A', 'rgb(255, 204, 136)', 'rgb(136, 68, 0)'],
    ['B', 'rgb(216, 236, 255)', 'rgb(19, 87, 155)'],
    ['Custom', 'rgb(232, 221, 255)', 'rgb(101, 67, 33)']
  ]) {
    assert.equal(find(diagram, id).fill, fill, `${id}: preserve author fill`);
    assert.equal(find(diagram, id).stroke, stroke, `${id}: preserve author stroke`);
  }
  assert.equal(find(diagram, 'C').stroke, 'rgb(36, 104, 19)', 'Preserve a stroke-only author style');
  assert.equal(diagram.edges, 2, 'Author styles must not change edges');
  for (const group of defaults.groups) {
    assert.equal(group.fill, 'rgb(252, 228, 236)', 'Preserve classDef default fill');
    assert.equal(group.stroke, 'rgb(166, 28, 86)', 'Preserve classDef default stroke');
  }
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})
  });
  try {
    const skinSignatures = [];
    for (const skin of ['default', 'light', 'dark']) {
      const css = fs.readFileSync(path.join(site, `assets/css/skins/${skin}.css`), 'utf8');
      for (const width of [1440, 390]) {
        const page = await browser.newPage({ viewport: { width, height: 900 } });
        await page.route('**/*', route => route.abort());
        await page.setContent('<main class="page-content"></main>');
        await page.addStyleTag({ content: css + '\n' + includeCSS + '\nbody { margin: 0; padding: 16px; font-family: sans-serif; }' });
        await page.addScriptTag({ path: bundle });
        await page.evaluate(sources => {
          for (const source of sources) {
            const pre = document.createElement('pre');
            const code = document.createElement('code');
            code.className = 'language-mermaid';
            code.textContent = source;
            pre.appendChild(code);
            document.querySelector('main').appendChild(pre);
          }
          window.configs = [];
          const initialize = window.mermaid.initialize.bind(window.mermaid);
          window.mermaid.initialize = config => { window.configs.push(config); return initialize(config); };
        }, sources);
        await page.evaluate(script);
        await page.waitForFunction(count => document.querySelectorAll('.mermaid-diagram svg').length === count ||
          document.querySelector('.mermaid-error'), sources.length, { timeout: 30000 });
        assert.equal(await page.locator('.mermaid-error').count(), 0, `${skin}/${width}: all diagrams render`);
        const diagrams = await page.evaluate(inspect);
        const context = `${skin}/${width}`;
        checkDefault(diagrams[0], context + '/nested');
        checkGrouping(diagrams[0]);
        checkAuthor(diagrams[1], diagrams[2]);
        checkDefault(diagrams[3], context + '/ungrouped');
        assert(diagrams[3].groups.every(group => group.palette === '0'));
        checkDefault(diagrams[4], context + '/alpha18');
        checkDefault(diagrams[5], context + '/nonrectangular');
        assert.equal(diagrams[5].groups.length, 4, 'Cylinder, diamond, circle, and rounded shapes must survive');
        assert.equal(diagrams[5].edges, 3);
        assert.equal(diagrams[4].groups.filter(group => group.kind === 'node').length, 13);
        assert.equal(diagrams[4].groups.filter(group => group.kind === 'cluster').length, 5);
        assert.equal(diagrams[4].edges, 16);
        assert(diagrams[4].edgeIds.some(id => id.includes('TaskColl_PrioCtrl')),
          'Feedback edge must run from TaskColl to PrioCtrl');
        for (const id of ['TmplGen', 'PrioCtrl', 'SuperGen', 'TaskColl', 'RootLedgers', 'TaskMeta',
          'NormalFetch', 'PrioFetch', 'SlotGate', 'QuotaGate', 'SubmitPOST', 'PollGET', 'StartupRec']) {
          find(diagrams[4], id);
        }
        for (const [node, cluster] of [['NormalFetch', 'Schedulers'], ['PrioFetch', 'Schedulers'], ['SlotGate', 'Consumer'], ['QuotaGate', 'Consumer']]) {
          assert.equal(find(diagrams[4], node).palette, find(diagrams[4], cluster).palette, `alpha18: ${node} matches ${cluster}`);
        }
        if (width === 1440) skinSignatures.push(diagrams[0].groups.map(group => group.fill).join('|'));

        // Variable overrides must affect already-rendered SVG, not just initial engine config.
        await page.evaluate(() => {
          for (let palette = 0; palette < 5; palette++) {
            for (const [kind, color] of [['node', '#d5e8fa'], ['cluster', '#e4f0fa'], ['border', '#456789']]) {
              document.documentElement.style.setProperty(`--mermaid-palette-${palette}-${kind}`, color);
            }
          }
        });
        const overridden = (await page.evaluate(inspect))[0];
        assert.equal(find(overridden, 'B').fill, 'rgb(213, 232, 250)');
        assert.equal(find(overridden, 'Inner').fill, 'rgb(228, 240, 250)');
        assert.equal(find(overridden, 'B').stroke, 'rgb(69, 103, 137)');
        const afterOverride = await page.evaluate(inspect);
        checkAuthor(afterOverride[1], afterOverride[2]);
        const config = await page.evaluate(() => ({
          theme: window.configs[0].theme,
          text: window.configs[0].themeVariables.primaryTextColor,
          skinText: getComputedStyle(document.documentElement).getPropertyValue('--mermaid-text').trim()
        }));
        assert.equal(config.theme, 'base');
        assert.equal(config.text, config.skinText, 'Real engine themeVariables follow the active skin');
        if (skin === 'default' && width === 1440) {
          // A fresh render must also pass custom base theme properties into the real engine.
          await page.evaluate(() => {
            for (const [name, value] of [['background', '#fffdf9'], ['text', '#243447'], ['line', '#5a6b7c']]) {
              document.documentElement.style.setProperty(`--mermaid-${name}`, value);
            }
            const pre = document.createElement('pre');
            const code = document.createElement('code');
            code.className = 'language-mermaid';
            code.textContent = 'flowchart LR\nOverrideA["Theme override"] --> OverrideB["Readable label"]';
            pre.appendChild(code);
            document.querySelector('main').appendChild(pre);
          });
          await page.evaluate(script);
          await page.waitForFunction(count => document.querySelectorAll('.mermaid-diagram svg').length === count,
            sources.length + 1, { timeout: 30000 });
          assert.deepEqual(await page.evaluate(() => {
            const variables = window.configs[window.configs.length - 1].themeVariables;
            return [variables.background, variables.primaryTextColor, variables.lineColor];
          }), ['#fffdf9', '#243447', '#5a6b7c'], 'Custom properties override real Mermaid themeVariables');
          const last = (await page.evaluate(inspect)).at(-1);
          assert(last.groups.every(group => group.text === 'rgb(36, 52, 71)'), 'Custom text color reaches rendered labels');
          assert.equal(await page.locator('.mermaid-diagram').last().locator('.flowchart-link').evaluate(edge =>
            getComputedStyle(edge).stroke), 'rgb(90, 107, 124)', 'Custom line color reaches rendered edges');
        }
        await page.close();
      }
    }
    assert.equal(new Set(skinSignatures).size, 3, 'Default/light/dark skins must derive different palettes');
    if (process.env.TEST_SITE_URL) {
      const base = process.env.TEST_SITE_URL.replace(/\/$/, '');
      for (const width of [1440, 390]) {
        const page = await browser.newPage({ viewport: { width, height: 900 } });
        await page.route('https://**/*', route => route.abort());
        await page.goto(base + '/algorithm/alpha18/', { waitUntil: 'domcontentloaded' });
        const expected = [...alphaSource.matchAll(/^```mermaid\s*$/gm)].length;
        await page.waitForFunction(count => document.querySelectorAll('.mermaid-diagram svg').length === count,
          expected, { timeout: 30000 });
        assert.equal(await page.locator('.mermaid-error').count(), 0);
        const first = (await page.evaluate(inspect))[0];
        // Other article content can overflow independently; isolate the Mermaid wrapper here.
        checkDefault(first, `live/${width}`, { checkPage: false });
        assert.equal(first.groups.filter(group => group.kind === 'node').length, 13);
        assert.equal(first.groups.filter(group => group.kind === 'cluster').length, 5);
        assert.equal(first.edges, 16);
        await page.close();
      }
    }
    console.log('PASS: real Mermaid pastel palettes on 3 skins × desktop/mobile; nesting, author colors, contrast >=4.5, containment, and CSS variable overrides' +
      (process.env.TEST_SITE_URL ? '; live alpha18 desktop/mobile.' : '.'));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
