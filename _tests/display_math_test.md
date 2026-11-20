# Display-math browser regression

Run from the repository root:

```sh
NODE_PATH=/Users/wenliu/.npm/_npx/e41f203b7505f1fb/node_modules \
CHROMIUM_PATH=$HOME/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell \
node _tests/display_math_test.cjs
```

Requires the installed repository Ruby bundle and Playwright/Chromium. The test supplies the Ruby 3.2.2 PATH, GEM_HOME and UTF-8 locale used by this checkout.

The test copies the real configuration, plugins, MathJax include and local MathJax assets into an owned temporary fixture. A minimal layout replaces the theme; real posts are never copied. Jekyll performs actual Markdown conversion. Playwright routes an isolated HTTP origin to the built files (including engine, extensions and fonts), without opening a listening server. All external requests fail. Browser and fixture cleanup run on success or failure. No preview restart, source rewriting or DOM-injected math is involved.

At 1440px and 390px it verifies exact MathJax source/formula order and display flags, distinct vertical geometry relative to surrounding prose, consecutive equations, list/table containment, single-dollar and parenthesis inline geometry, native multiline display math, literal backticks/fences, and mobile overflow/scroll reachability with unclipped fraction/summation ink.

## Verified methods and pitfalls

- Passed with the current `parse_inline_math` category override. Removing only that override from the **temporary fixture copy** produces the expected failure: native Kramdown converts single-line double-dollar expressions to inline MathJax items. The repository plugin was not modified by this mutation check.
- A two-fraction sample was not actually wider than the mobile column. The fixture uses three fractions and asserts real scrollWidth/clientWidth overflow rather than assuming a formula is wide.
- Literal preformatted examples can themselves overflow a narrow page. The fixture gives `pre` horizontal scrolling, so its whole-page overflow assertion measures math behavior rather than an unrelated code block.
- This isolated fixture deliberately asserts zero TeX errors only for its known-valid formulas; it makes no claim about unrelated existing errors on the full alpha25 page.
- Optional follow-up against the existing preview found `q_i` still reporting `display: false`. Both the served HTML and `_site/algorithm/alpha25/index.html` contained `\\(q_i =` / `\\(b_i = 0.48`, not display delimiters. A fresh isolated fixture passes independently; the live snapshot therefore remains stale (consistent with the reported old-module watcher). No preview process was restarted or killed.
