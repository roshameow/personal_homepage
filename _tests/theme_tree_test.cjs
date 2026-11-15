/* Regression test for the post "theme" taxonomy tree (front matter `theme:`).
 * Builds two isolated fixture sites in /tmp (never touches real posts), then
 * asserts the built HTML with Playwright over file:// URLs.
 *
 * Run from the repo root:
 *   NODE_PATH=/Users/wenliu/.npm/_npx/e41f203b7505f1fb/node_modules \
 *   CHROMIUM_PATH=$HOME/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell \
 *   node _tests/theme_tree_test.cjs
 *
 * Requires ruby 3.2.2 ($HOME/.rubies/ruby-3.2.2) + repo bundle (see BUILD_ENV).
 * Expected RED until the theme-tree feature (theme-tree include, themes page,
 * theme_tree flag on index.html) is implemented.
 *
 * Contract enforced (see _tests/theme_tree_test.md for rationale):
 * - Posts may declare `theme` as a string "Parent" or "Parent/Child", or a
 *   YAML list of such values. "Parent / Child" (extra whitespace) is the same
 *   node as "Parent/Child".
 * - Home page (/, layout categories + theme_tree: true) renders a
 *   `section.theme-tree` ABOVE the categories grid: top-level <li> per parent
 *   with a post count, nested <ul> of second-level links. Every link targets
 *   {{ "/themes/" | relative_url }}#<slug> where slug = Jekyll slugify of the
 *   full value ("Optics/Color" -> optics-color, "摄影/构图" -> 摄影-构图).
 * - /themes/ groups posts per parent (h2 heading) and per Parent/Child (h3
 *   heading), listing entry titles. Each group is anchor-addressable: an
 *   element with id=<slug> contains (or is) the matching heading, so
 *   /themes/#optics-color lands on the right group. Posts without theme are
 *   excluded from /themes/ entirely.
 * - When NO post has a theme: home has NO theme section and NO extra
 *   "Categories" heading (layout unchanged); categories grid still renders.
 * - The archive page /categories/ (docs/categories.md) NEVER shows the tree.
 *
 * theme_subtitle contract (front matter `theme_subtitle:` string, optional):
 * - _includes/entry.html renders <p class="entry-theme-subtitle">…</p> inside
 *   .entry-header ONLY when include.show_theme_subtitle AND entry.theme_subtitle.
 * - _layouts/themes.html passes show_theme_subtitle=true for both parent (h2)
 *   and child (h3) groups; no other caller does, so home, /categories/, tag
 *   pages and single post pages NEVER contain .entry-theme-subtitle.
 * - A themed post WITHOUT theme_subtitle gets NO (empty) <p> at all.
 * - SCSS orders it after .entry-title (flex order 2) before .entry-meta within
 *   .entries-list/.entries-grid — asserted geometrically in the rendered DOM
 *   (file:// + CSS injected from the built site).
 */
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');

const REPO = path.resolve(__dirname, '..');
const HOME = os.homedir();
const BASEURL = '/personal_homepage';
const BUILD_ENV = {
  ...process.env,
  PATH: `${HOME}/.rubies/ruby-3.2.2/bin:${process.env.PATH}`,
  GEM_HOME: `${HOME}/.gem/ruby/3.2.2`,
  LANG: 'en_US.UTF-8',
};

function makeFixture(name, posts) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `theme-tree-${name}-`));
  for (const d of ['_plugins', '_includes', '_layouts', '_sass', 'assets', '_data']) {
    fs.cpSync(path.join(REPO, d), path.join(dir, d), { recursive: true });
  }
  for (const f of ['_config.yml', 'index.html']) {
    fs.copyFileSync(path.join(REPO, f), path.join(dir, f));
  }
  fs.mkdirSync(path.join(dir, 'docs/_posts'), { recursive: true });
  for (const f of ['docs/categories.md', 'docs/index.html', 'docs/themes.md',
                   'docs/posts.md', 'docs/markup.md']) {
    const src = path.join(REPO, f);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(dir, f));
  }
  for (const [file, content] of Object.entries(posts)) {
    fs.writeFileSync(path.join(dir, 'docs/_posts', file), content);
  }
  const out = path.join(dir, '_out');
  execFileSync('bundle', ['exec', 'jekyll', 'build', '--source', dir, '--destination', out],
    { cwd: REPO, env: BUILD_ENV, stdio: ['ignore', 'pipe', 'inherit'] });
  return { dir, out };
}

// --- Fixture posts -----------------------------------------------------------
const THEMED_POSTS = {
  // string theme, parent only
  '2024-06-01-optics-overview.md': `---
title: Optics Overview
categories:
  - Physics
tags:
  - markup
theme: Optics
theme_subtitle: Light and lenses
---
parent-only themed post
`,
  // string theme, Parent/Child
  '2024-06-02-color-basics.md': `---
title: Color Basics
categories:
  - Physics
theme: Optics/Color
---
nested themed post
`,
  // same node declared with extra whitespace -> must merge with Optics/Color
  '2024-06-03-color-spacing.md': `---
title: Color Spacing
theme: Optics / Color
---
whitespace-normalized themed post
`,
  // YAML list: one nested, one Chinese parent-only; has a subtitle too
  '2024-06-04-diffraction-photo.md': `---
title: Diffraction And Photo
theme:
  - Optics/Diffraction
  - 摄影
theme_subtitle: Waves and frames
---
list themed post
`,
  // Chinese Parent/Child string with a Chinese subtitle
  '2024-06-05-chinese-nested.md': `---
title: 构图入门
theme: 摄影/构图
theme_subtitle: 光影与构图的练习
---
chinese nested themed post
`,
  // untouched post: no theme at all
  '2024-06-06-plain-post.md': `---
title: Plain Post
categories:
  - Misc
---
post without theme
`,
};

const PLAIN_POSTS = {
  '2024-06-06-plain-post.md': THEMED_POSTS['2024-06-06-plain-post.md'],
  // theme_subtitle WITHOUT any theme: must never render anywhere (the subtitle
  // is only emitted on /themes/, which excludes un-themed posts entirely).
  '2024-06-01-optics-overview.md': `---
title: Optics Overview
categories:
  - Physics
theme_subtitle: Orphan subtitle that must never render
---
no theme here either
`,
};

// Expected subtitles on /themes/: [groupId, entryTitle, subtitleText].
// On /themes/, show_theme_subtitle displays the theme_subtitle as the primary
// title and the original post title as the secondary .entry-theme-subtitle.
// diffraction-photo is list-themed, so its subtitle shows in BOTH its child
// group (h3 optics-diffraction) and its parent-only group (h2 摄影).
const EXPECTED_SUBTITLES = [
  ['optics', 'Light and lenses', 'Optics Overview'],                   // parent h2 group
  ['optics-diffraction', 'Waves and frames', 'Diffraction And Photo'], // child h3 group
  ['摄影', 'Waves and frames', 'Diffraction And Photo'],                // parent h2 group (list value)
  ['摄影-构图', '光影与构图的练习', '构图入门'],                            // Chinese child h3 group
];

// Recursively collect built .html files under a dir.
function htmlFiles(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...htmlFiles(p));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

// Expected tree for the themed fixture.
// Parent count = number of distinct posts under the parent (children included).
const EXPECTED_TREE = {
  Optics: {
    count: 4, // optics-overview, color-basics, color-spacing, diffraction-photo
    children: { Color: 'optics-color', Diffraction: 'optics-diffraction' },
    slug: 'optics',
  },
  '摄影': {
    count: 2, // diffraction-photo, chinese-nested
    children: { '构图': '摄影-构图' },
    slug: '摄影',
  },
};

function fileUrl(p) { return 'file://' + p; }
function decodedHref(href) { try { return decodeURIComponent(href); } catch { return href; } }

(async () => {
  console.log('Building themed fixture...');
  const themed = makeFixture('themed', THEMED_POSTS);
  console.log('Building plain (no-theme) fixture...');
  const plain = makeFixture('plain', PLAIN_POSTS);

  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
  });
  try {
    const page = await browser.newPage();

    // ---------------- Themed fixture: home page ----------------
    const themedHome = path.join(themed.out, 'index.html');
    assert.ok(fs.existsSync(themedHome), 'themed fixture must build index.html');
    await page.goto(fileUrl(themedHome));

    assert.equal(await page.locator('section.theme-tree').count(), 1,
      'home with themed posts must render exactly one section.theme-tree');

    // Tree must sit ABOVE the categories grid.
    assert.ok(await page.evaluate(() => {
      const tree = document.querySelector('section.theme-tree');
      const grid = document.querySelector('ul.taxonomy-index-grid');
      return !!(tree && grid) &&
        !!(tree.compareDocumentPosition(grid) & Node.DOCUMENT_POSITION_FOLLOWING);
    }), 'section.theme-tree must appear before ul.taxonomy-index-grid');

    // Parse the rendered tree: top-level li -> { parentLink, countText, children }.
    const tree = await page.evaluate(() => {
      const root = document.querySelector('section.theme-tree > ul, section.theme-tree ul');
      if (!root) return null;
      return [...root.children].filter(el => el.tagName === 'LI').map(li => {
        const parentLink = li.querySelector('.theme-tree-parent-link') || li.querySelector(':scope > a') || li.querySelector('a');
        const childEls = [...li.querySelectorAll('.theme-tree-child')].filter(el => !el.classList.contains('theme-tree-direct'));
        const ownText = [...li.childNodes]
          .filter(n => !(n.nodeType === 1 && (n.tagName === 'UL' || n.tagName === 'DETAILS')))
          .map(n => n.textContent).join(' ');
        return {
          href: parentLink ? parentLink.getAttribute('href') : null,
          text: (parentLink ? parentLink.textContent : ownText).replace(/\s+/g, ' ').trim(),
          children: childEls.map(cel => {
            const a = cel.querySelector('.theme-tree-archive-link') || cel.querySelector('a');
            const titleSpan = cel.querySelector('.theme-tree-child-title');
            const countSpan = cel.querySelector('.taxonomy-count');
            const text = `${titleSpan ? titleSpan.textContent : ''} ${countSpan ? countSpan.textContent : ''}`.trim() || cel.textContent.replace(/\s+/g, ' ').trim();
            const postLinks = [...cel.querySelectorAll('.theme-tree-post-link')].map(p => ({
              href: p.getAttribute('href'),
              text: p.textContent.replace(/\s+/g, ' ').trim(),
              title: p.getAttribute('title'),
            }));
            return {
              href: a ? a.getAttribute('href') : null,
              text,
              posts: postLinks,
            };
          }),
        };
      });
    });
    assert.ok(tree, 'theme tree must contain a <ul>');
    assert.equal(tree.length, Object.keys(EXPECTED_TREE).length,
      `theme tree must have exactly ${Object.keys(EXPECTED_TREE).length} first-level parents, got ${JSON.stringify(tree, null, 2)}`);

    for (const [parent, spec] of Object.entries(EXPECTED_TREE)) {
      const node = tree.find(n => n.text.includes(parent));
      assert.ok(node, `tree must contain first-level parent "${parent}"`);
      assert.equal(decodedHref(node.href), `${BASEURL}/themes/#${spec.slug}`,
        `parent "${parent}" must link to the themes page anchor via relative_url`);
      assert.ok(new RegExp(`\\b${spec.count}\\b`).test(node.text),
        `parent "${parent}" must show post count ${spec.count}; li text was "${node.text}"`);
      const expectedChildren = Object.entries(spec.children);
      assert.equal(node.children.length, expectedChildren.length,
        `parent "${parent}" must have ${expectedChildren.length} second-level children (whitespace variants merged), got ${JSON.stringify(node.children)}`);
      for (const [child, slug] of expectedChildren) {
        const childNode = node.children.find(c => c.text.includes(child));
        assert.ok(childNode, `parent "${parent}" must nest child "${child}"`);
        assert.equal(decodedHref(childNode.href), `${BASEURL}/themes/#${slug}`,
          `child "${parent}/${child}" must anchor to slugified full value`);
      }
    }

    // Whitespace normalization: "Optics / Color" and "Optics/Color" are ONE node.
    const colorLinks = tree.flatMap(n => n.children).filter(c => decodedHref(c.href).endsWith('#optics-color'));
    assert.equal(colorLinks.length, 1, '"Optics / Color" and "Optics/Color" must merge into one tree node');

    // Untouched post must not leak into the tree.
    assert.ok(!tree.some(n => /Plain|Misc/.test(n.text)), 'posts without theme must not appear in the tree');

    // When the tree renders, the grid gets an explicit "Categories" heading
    // between tree and grid (so the two sections are visually separated).
    assert.ok(await page.evaluate(() => {
      const tree = document.querySelector('section.theme-tree');
      const grid = document.querySelector('ul.taxonomy-index-grid');
      const heading = [...document.querySelectorAll('h2')]
        .find(h => h.textContent.trim() === 'Categories');
      return !!(tree && grid && heading) &&
        !!(tree.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING) &&
        !!(heading.compareDocumentPosition(grid) & Node.DOCUMENT_POSITION_FOLLOWING);
    }), 'with a rendered tree, an h2 "Categories" heading must sit between tree and grid');

    // Categories grid must stay intact on the home page.
    const gridText = await page.locator('ul.taxonomy-index-grid').innerText();
    assert.ok(gridText.includes('Physics'), 'categories grid must still list Physics');
    assert.ok(gridText.includes('Misc'), 'categories grid must still list Misc');
    const physicsHref = await page.locator('ul.taxonomy-index-grid a', { hasText: 'Physics' }).getAttribute('href');
    assert.equal(physicsHref, `${BASEURL}/categories/physics/`, 'grid links must stay baseurl-prefixed');

    // theme_subtitle: on home page, rendered inside the expandable theme tree
    // as direct note links (.theme-tree-post-title), NOT as .entry-theme-subtitle.
    assert.equal(await page.locator('.entry-theme-subtitle').count(), 0,
      'home page must NOT render any .entry-theme-subtitle (reserved for /themes/ archive entries)');

    // Subtitles must appear in the tree as clickable note links:
    const homeTreeSubtitles = (await page.locator('.theme-tree-post-title').allTextContents()).map(t => t.trim());
    assert.ok(homeTreeSubtitles.includes('Light and lenses'),
      'home page theme tree must show subtitle "Light and lenses"');
    assert.ok(homeTreeSubtitles.includes('Waves and frames'),
      'home page theme tree must show subtitle "Waves and frames"');
    assert.ok(homeTreeSubtitles.includes('光影与构图的练习'),
      'home page theme tree must show subtitle "光影与构图的练习"');
    assert.ok(homeTreeSubtitles.includes('Color Basics'),
      'themed post without subtitle must fallback to title "Color Basics"');

    // Collapsible details in theme tree (initially collapsed):
    const detailsList = page.locator('.theme-tree-collapse');
    const detailsCount = await detailsList.count();
    assert.ok(detailsCount > 0, 'must have collapsible details in theme tree');
    assert.equal(await page.locator('.theme-tree-collapse[open]').count(), 0,
      'details should initially be collapsed');

    // Click individual child summary to expand:
    const firstSummary = detailsList.first().locator('summary');
    await firstSummary.click();
    assert.equal(await page.locator('.theme-tree-collapse[open]').count(), 1,
      'clicking a summary must expand its details');

    // Click again to collapse:
    await firstSummary.click();
    assert.equal(await page.locator('.theme-tree-collapse[open]').count(), 0,
      'clicking summary again must collapse its details');

    // Verify direct note link navigation:
    const opticsNoteLink = page.locator('.theme-tree-post-link', { hasText: 'Light and lenses' }).first();
    const opticsHref = await opticsNoteLink.getAttribute('href');
    assert.ok(opticsHref && opticsHref.includes('optics-overview'),
      'note link must point to post URL');

    // ---------------- Themed fixture: /themes/ page ----------------
    const themesPage = path.join(themed.out, 'themes', 'index.html');
    assert.ok(fs.existsSync(themesPage), '/themes/ page must be generated (docs/themes.md)');
    await page.goto(fileUrl(themesPage));

    // Anchor targets: for each slug an element with that id must exist and
    // contain (or be) a heading of the right level with the right label.
    const anchors = await page.evaluate(() => {
      const result = {};
      for (const el of document.querySelectorAll('[id]')) {
        const heading = /^H[23]$/.test(el.tagName) ? el : el.querySelector('h2, h3');
        result[el.id] = {
          headingTag: heading ? heading.tagName : null,
          headingText: heading ? heading.textContent.replace(/\s+/g, ' ').trim() : null,
          text: el.textContent.replace(/\s+/g, ' ').trim(),
          // text of this group excluding any nested anchored subgroup
          ownText: (() => {
            const clone = el.cloneNode(true);
            for (const sub of clone.querySelectorAll('[id]')) sub.remove();
            return clone.textContent.replace(/\s+/g, ' ').trim();
          })(),
        };
      }
      return result;
    });
    function anchor(id, tag, label) {
      const a = anchors[id];
      assert.ok(a, `themes page must have an anchor target id="${id}"`);
      assert.equal(a.headingTag, tag, `anchor "${id}" must be headed by <${tag.toLowerCase()}>`);
      assert.ok(a.headingText.includes(label), `anchor "${id}" heading must read "${label}", got "${a.headingText}"`);
      return a;
    }
    const opticsSec = anchor('optics', 'H2', 'Optics');
    const colorSec = anchor('optics-color', 'H3', 'Color');
    const diffSec = anchor('optics-diffraction', 'H3', 'Diffraction');
    const photoSec = anchor('摄影', 'H2', '摄影');
    const compSec = anchor('摄影-构图', 'H3', '构图');

    assert.ok(opticsSec.ownText.includes('Optics Overview'),
      'parent-only post must be listed directly under its h2 group (not inside a child group)');
    assert.ok(colorSec.text.includes('Color Basics'), 'nested post listed under its h3 group');
    assert.ok(colorSec.text.includes('Color Spacing'),
      'whitespace variant "Optics / Color" must be grouped into the same h3 group');
    assert.ok(diffSec.text.includes('Diffraction And Photo'), 'list theme: nested value grouped');
    assert.ok(photoSec.text.includes('Diffraction And Photo'),
      'list-themed post must also be listed under its second, parent-only value 摄影');
    assert.ok(compSec.text.includes('构图入门'), 'Chinese Parent/Child grouped under slugified anchor');
    assert.ok(!colorSec.text.includes('Diffraction And Photo'),
      'groups must not leak posts from sibling children');
    const bodyText = await page.evaluate(() => document.body.innerText);
    assert.ok(!bodyText.includes('Plain Post'), 'posts without theme must be excluded from /themes/');

    // ---------------- theme_subtitle on /themes/ ----------------
    const subtitles = await page.evaluate(() => {
      return [...document.querySelectorAll('.entry-theme-subtitle')].map(el => {
        const article = el.closest('article');
        return {
          tag: el.tagName,
          text: el.textContent.replace(/\s+/g, ' ').trim(),
          inHeader: !!el.closest('.entry-header'),
          title: article
            ? (article.querySelector('.entry-title') || {}).textContent?.replace(/\s+/g, ' ').trim() ?? null
            : null,
          groupId: el.closest('[id]') ? el.closest('[id]').id : null,
        };
      });
    });
    assert.equal(subtitles.length, EXPECTED_SUBTITLES.length,
      `/themes/ must render exactly ${EXPECTED_SUBTITLES.length} subtitles, got ${JSON.stringify(subtitles, null, 2)}`);
    for (const s of subtitles) {
      assert.equal(s.tag, 'P', 'theme subtitle must be a <p class="entry-theme-subtitle">');
      assert.ok(s.inHeader, `subtitle "${s.text}" must sit inside .entry-header`);
      assert.ok(s.text.length > 0, 'no empty theme-subtitle <p> may be rendered');
    }
    for (const [groupId, title, text] of EXPECTED_SUBTITLES) {
      assert.ok(subtitles.some(s => s.groupId === groupId && s.title === title && s.text === text),
        `group "${groupId}" must show subtitle "${text}" under entry "${title}"; got ${JSON.stringify(subtitles)}`);
    }

    // Themed posts WITHOUT theme_subtitle get no <p> at all (not even empty).
    const noSubtitleArticles = await page.evaluate(() =>
      [...document.querySelectorAll('article.entry')]
        .filter(a => /Color Basics|Color Spacing/.test(a.textContent))
        .map(a => ({
          title: a.querySelector('.entry-title').textContent.trim(),
          subtitleEls: a.querySelectorAll('.entry-theme-subtitle').length,
        })));
    assert.ok(noSubtitleArticles.length >= 2, 'Color Basics / Color Spacing entries must be on /themes/');
    for (const a of noSubtitleArticles) {
      assert.equal(a.subtitleEls, 0,
        `themed post "${a.title}" has no theme_subtitle, so it must render NO .entry-theme-subtitle (not an empty <p>)`);
    }

    // ---- Rendered-DOM geometry: subtitle vertically between title and meta ----
    // The stylesheet links use baseurl-absolute hrefs that can't resolve over
    // file://, so inject the CSS compiled into the built fixture site.
    const mainCss = fs.readFileSync(path.join(themed.out, 'assets/css/main.css'), 'utf8');
    const skinCssPath = path.join(themed.out, 'assets/css/skins/default.css');
    const skinCss = fs.existsSync(skinCssPath) ? fs.readFileSync(skinCssPath, 'utf8') : '';
    await page.addStyleTag({ content: mainCss });
    if (skinCss) await page.addStyleTag({ content: skinCss });

    const geometries = await page.evaluate(() => {
      const picks = [];
      for (const sub of document.querySelectorAll('.entry-theme-subtitle')) {
        const article = sub.closest('article');
        const title = article.querySelector('.entry-title');
        const meta = article.querySelector('footer.entry-meta');
        const container = article.closest('.entries-list, .entries-grid');
        picks.push({
          id: `${sub.closest('[id]')?.id}/${title.textContent.trim()}`,
          layoutClass: container ? container.className : null,
          order: getComputedStyle(sub).order,
          titleBottom: title.getBoundingClientRect().bottom,
          subTop: sub.getBoundingClientRect().top,
          subBottom: sub.getBoundingClientRect().bottom,
          subHeight: sub.getBoundingClientRect().height,
          metaTop: meta ? meta.getBoundingClientRect().top : null,
        });
      }
      return picks;
    });
    assert.equal(geometries.length, EXPECTED_SUBTITLES.length, 'geometry check must see every subtitle');
    for (const g of geometries) {
      assert.ok(/entries-(list|grid)/.test(g.layoutClass || ''),
        `subtitle ${g.id} must live inside an .entries-list/.entries-grid container`);
      assert.equal(g.order, '2',
        `subtitle ${g.id} must have flex order 2 inside ${g.layoutClass} (after title order 1)`);
      assert.ok(g.subHeight > 0, `subtitle ${g.id} must be visible (non-zero height)`);
      assert.ok(g.subTop >= g.titleBottom - 1,
        `subtitle ${g.id} must render BELOW its title (title bottom ${g.titleBottom}, subtitle top ${g.subTop})`);
      assert.ok(g.metaTop !== null, `entry ${g.id} must render a footer.entry-meta (posts are dated)`);
      assert.ok(g.subBottom <= g.metaTop + 1,
        `subtitle ${g.id} must render ABOVE the entry meta (subtitle bottom ${g.subBottom}, meta top ${g.metaTop})`);
    }

    // ---------------- Themed fixture: archive never shows the tree ----------------
    const archive = path.join(themed.out, 'categories', 'index.html');
    assert.ok(fs.existsSync(archive), 'category archive must build');
    await page.goto(fileUrl(archive));
    assert.equal(await page.locator('section.theme-tree').count(), 0,
      'docs/categories.md archive must NEVER render the theme tree');
    assert.equal(await page.locator('ul.taxonomy-index-grid').count(), 1,
      'archive categories grid must stay intact');
    assert.equal(await page.locator('.entry-theme-subtitle').count(), 0,
      '/categories/ archive must NOT render any .entry-theme-subtitle');

    // ---------------- theme_subtitle leaks NOWHERE outside /themes/ ----------------
    // Full sweep of every generated HTML file (home, pagination, category/tag
    // archives, single post pages, feeds-adjacent pages, ...).
    const themesIndex = path.join(themed.out, 'themes', 'index.html');
    for (const f of htmlFiles(themed.out)) {
      const html = fs.readFileSync(f, 'utf8');
      if (path.resolve(f) === path.resolve(themesIndex)) {
        assert.ok(html.includes('entry-theme-subtitle'),
          '/themes/ must contain entry-theme-subtitle elements');
        continue;
      }
      assert.ok(!html.includes('entry-theme-subtitle'),
        `entry-theme-subtitle must not appear outside /themes/, found in ${path.relative(themed.out, f)}`);
    }
    // Make the sweep non-vacuous: the pages the contract names must have been
    // built AND must actually list the subtitled post (title shows, no subtitle).
    const postPages = htmlFiles(themed.out)
      .filter(f => fs.readFileSync(f, 'utf8').includes('parent-only themed post'));
    assert.ok(postPages.length >= 1, 'optics-overview single post page must build');
    const postsArchive = path.join(themed.out, 'posts', 'index.html');
    assert.ok(fs.existsSync(postsArchive), '/posts/ archive must build (docs/posts.md)');
    assert.ok(fs.readFileSync(postsArchive, 'utf8').includes('Optics Overview'),
      '/posts/ must list the subtitled post (whose subtitle the sweep proved absent)');
    const tagPage = path.join(themed.out, 'tags', 'markup', 'index.html');
    assert.ok(fs.existsSync(tagPage), '/tags/markup/ tag page must build (docs/markup.md)');
    assert.ok(fs.readFileSync(tagPage, 'utf8').includes('Optics Overview'),
      'tag page must list the subtitled post (whose subtitle the sweep proved absent)');

    // ---------------- Plain fixture: empty case ----------------
    const plainHome = path.join(plain.out, 'index.html');
    assert.ok(fs.existsSync(plainHome), 'plain fixture must build index.html');
    await page.goto(fileUrl(plainHome));
    assert.equal(await page.locator('section.theme-tree').count(), 0,
      'home must show NO theme section when no post has a theme');
    const extraCategoryHeadings = await page.evaluate(() =>
      [...document.querySelectorAll('h2, h3, h4, h5, h6')]
        .filter(h => h.textContent.trim() === 'Categories').length);
    assert.equal(extraCategoryHeadings, 0,
      'home must show NO extra "Categories" heading when the tree is absent (layout unchanged)');
    assert.equal(await page.locator('ul.taxonomy-index-grid').count(), 1,
      'empty case: categories grid must still render');
    assert.ok((await page.locator('ul.taxonomy-index-grid').innerText()).includes('Physics'),
      'empty case: grid content unchanged');

    // Plain fixture: a theme_subtitle without a theme must render nowhere at all.
    for (const f of htmlFiles(plain.out)) {
      const html = fs.readFileSync(f, 'utf8');
      assert.ok(!html.includes('entry-theme-subtitle'),
        `plain fixture must have no entry-theme-subtitle anywhere, found in ${path.relative(plain.out, f)}`);
      assert.ok(!html.includes('Orphan subtitle that must never render'),
        `orphan theme_subtitle text leaked into ${path.relative(plain.out, f)}`);
    }

    console.log('OK: theme tree regression tests passed.');
    if (!process.env.KEEP_FIXTURE) {
      fs.rmSync(themed.dir, { recursive: true, force: true });
      fs.rmSync(plain.dir, { recursive: true, force: true });
    }
  } finally {
    await browser.close();
  }
})().catch(err => {
  console.error(err);
  console.error('\nFixture dirs are kept in /tmp for inspection (theme-tree-*).');
  process.exit(1);
});
