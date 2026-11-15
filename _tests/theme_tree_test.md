# theme_tree_test.cjs — notes

Regression test for the post `theme:` front-matter taxonomy (theme tree on the
home page + `/themes/` grouping page) and the `theme_subtitle:` front-matter
feature (per-entry subtitle rendered only on `/themes/`).

## How to run

```sh
cd /Users/wenliu/Code/web/personal_homepage
NODE_PATH=/Users/wenliu/.npm/_npx/e41f203b7505f1fb/node_modules \
CHROMIUM_PATH=$HOME/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell \
node _tests/theme_tree_test.cjs
```

Requirements:
- ruby 3.2.2 (`$HOME/.rubies/ruby-3.2.2`) + repo bundle (`GEM_HOME=$HOME/.gem/ruby/3.2.2`);
  the test sets `PATH`/`GEM_HOME`/`LANG` itself when invoking `bundle exec jekyll build`.
- Playwright + a Chromium headless shell (paths above). Pages are loaded over
  `file://`, no server needed.
- Never touches real posts (`docs/_posts`) or the repo `_site`; set
  `KEEP_FIXTURE=1` to keep fixture dirs for inspection. On failure they are
  always kept (under `os.tmpdir()`, i.e. `$TMPDIR/theme-tree-*` on macOS, not
  literally `/tmp`).

## What it builds

Two isolated fixture sites (copies `_config.yml`, `index.html`, `_plugins`,
`_includes`, `_layouts`, `_sass`, `assets`, `_data`, `docs/categories.md`,
`docs/index.html`, `docs/themes.md`, `docs/posts.md`, `docs/markup.md` if
present) with synthetic posts under
`docs/_posts` (the config uses `collections_dir: docs`, so posts MUST live
there — a top-level `_posts` is silently ignored):

1. **themed** — string theme (`Optics`), nested (`Optics/Color`), whitespace
   variant (`Optics / Color`), YAML list (`[Optics/Diffraction, 摄影]`),
   Chinese nested (`摄影/构图`), and one untouched post without theme.
   Subtitles: `optics-overview` has `theme_subtitle: Light and lenses` (and
   `tags: [markup]` so the copied tag page lists it), `diffraction-photo` has
   `Waves and frames`, `chinese-nested` has `光影与构图的练习` (Chinese);
   `color-basics`/`color-spacing` are themed but have NO subtitle.
2. **plain** — only posts without any `theme` key (empty case). One post has an
   orphan `theme_subtitle` with no `theme` — it must render nowhere.

## Contract asserted

- Home (`/`, layout `categories`, `theme_tree: true`): exactly one
  `section.theme-tree` rendered **above** `ul.taxonomy-index-grid`; first-level
  `<li>` per parent with post count (Optics: 4, 摄影: 2 — counts are distinct
  posts including children), nested `<ul>` of child links; every link is
  `{{ "/themes/" | relative_url }}#<slug>` i.e. `/personal_homepage/themes/#...`
  (hrefs compared after `decodeURIComponent`, since Chinese anchors may be
  percent-encoded in the HTML).
- Slugs are Jekyll `slugify` of the **full** value: `Optics/Color` →
  `optics-color`, `摄影/构图` → `摄影-构图` (Jekyll slugify keeps CJK chars,
  verified against `Jekyll::Utils.slugify` in ruby 3.2.2).
- `Optics / Child`-style whitespace merges with `Optics/Child` into ONE node
  (exactly one `#optics-color` child link; both posts grouped under one h3).
- `/themes/`: per-parent h2 groups and per-child h3 groups. Asserted via
  anchor targets: an element with `id=<slug>` that is or contains the matching
  h2/h3 (the implementation puts ids on wrapping `<section>`s, which is a
  valid anchor target — the test accepts id on the heading itself too).
  Parent-only posts are listed directly in the h2 group (not inside any child
  group); list-themed posts appear under every declared value; groups don't
  leak sibling children's posts; untouched posts are absent.
- When the tree renders, an `h2` with exact text `Categories` sits between
  tree and grid (layout gates it on the captured include containing
  "theme-tree").
- Archive `docs/categories.md` (`/categories/`) never renders the tree; its
  grid stays intact.
- Empty case: no `section.theme-tree`, no extra "Categories" heading
  (h2–h6 with exact text `Categories`), grid still renders with baseurl-
  prefixed links.

### theme_subtitle contract

- `_includes/entry.html` renders `<p class="entry-theme-subtitle">…</p>` inside
  `.entry-header` only when `include.show_theme_subtitle` AND
  `entry.theme_subtitle`; `_layouts/themes.html` passes
  `show_theme_subtitle=true` for both parent (h2) and child (h3) groups.
- `/themes/`: exactly 4 subtitles expected (list-themed `diffraction-photo`
  shows its subtitle in BOTH its child group `#optics-diffraction` and its
  parent-only group `#摄影`). Each is a `<p>`, inside `.entry-header`,
  non-empty, matched to its entry title and enclosing group id
  (`el.closest('[id]')`).
- Themed posts WITHOUT `theme_subtitle` (`Color Basics`, `Color Spacing`)
  render zero `.entry-theme-subtitle` elements — no empty `<p>`.
- Leak sweep: every generated `.html` in the themed fixture output is checked;
  only `themes/index.html` may contain `entry-theme-subtitle`. Home,
  `/categories/` (also checked via DOM), `/posts/`, `/tags/markup/` and single
  post pages are proved non-vacuous (the subtitled post's title appears there).
  Plain fixture: no file contains `entry-theme-subtitle` or the orphan text.
- Geometry (rendered DOM): the built fixture's `assets/css/main.css` +
  `skins/default.css` are injected via `addStyleTag` (the `<link>`s use
  baseurl-absolute hrefs that 404 over `file://`), then for every subtitle:
  computed `order == '2'` inside its `.entries-list`/`.entries-grid`,
  non-zero height, `top >= title.bottom - 1` and
  `bottom <= footer.entry-meta.top + 1` — i.e. vertically between its title
  and its meta in the rendered layout.

## Status / history

- Written while the feature was in flight; it went red on the themes-page
  structure (h2/h3 id placement) until assertions were settled on
  "anchor target contains the heading", which matches both heading-id and
  section-id implementations.
- GREEN as of writing against the landed implementation
  (`_includes/theme-tree.html`, `_layouts/themes.html`, `docs/themes.md`,
  `theme_tree: true` in `index.html`, flag check in `_layouts/categories.html`).
- Extended for the expandable note subtitles feature on the home page theme tree
  (`_includes/theme-tree.html` `<details>` per child/direct node,
  direct clickable note links `.theme-tree-post-link` displaying `theme_subtitle`
  or title, SCSS in `_sass/so-simple/_global.scss` and `_skin.scss`). GREEN on full test suite.
- Extended for the landed `theme_subtitle` feature (`_includes/entry.html`
  gate, `_layouts/themes.html` `show_theme_subtitle=true`, SCSS in
  `_sass/so-simple/_entries.scss` + skin color in `_skin.scss`). GREEN against
  that implementation. Mutation-checked: removing the
  `include.show_theme_subtitle` gate fails the leak sweep
  (first in `categories/physics/index.html`); removing the
  `.entries-list/.entries-grid .entry-theme-subtitle { order: 2 }` rule fails
  the geometry `order == '2'` assertion.

## Pitfalls (verified)

- `os.tmpdir()` on macOS is `/var/folders/...`; don't grep `/tmp` for fixtures.
- Fixture build resolves the gem theme config too ("Theme Config file" points
  at the repo) — expected, harmless.
- Ruby one-liners with CJK need `RUBYOPT=-Eutf-8` (or a magic comment) under
  this ruby.
- `liquid.error_mode: strict` — a missing include in a fixture fails the whole
  build, which the test reports as a build error (still red, just not a neat
  assertion).
- Jekyll silently skips future-dated posts; fixture posts must use past dates
  (this test uses 2024-06-*).
- The built site's CSS `<link>`s (`/personal_homepage/assets/css/...`) don't
  resolve over `file://`; for computed-style/geometry assertions inject the
  built `main.css` (and the skin css — `_config.yml` sets
  `skin: /assets/css/skins/default.css`) with `page.addStyleTag`.
- Two nested flex containers are in play: `.entry-header` (flex column;
  items = title order 1, subtitle order 2, image order -1) and `.entry` in
  list/grid layout (flex column; items = header, excerpt order 3,
  `footer.entry-meta` order 2). `order` values only compete between siblings
  of the SAME container, so "subtitle order 2 vs meta order 2" is not a
  conflict — the geometry assertion is what actually proves
  title → subtitle → meta vertical order.
