# Local MathJax 3.2.2 runtime

Source: https://registry.npmjs.org/mathjax/-/mathjax-3.2.2.tgz

Archive SHA-256: `1b9c0a1c44df864e915690558e72adb9cc5203360daefd385084ced3b6c64c09`

License: Apache-2.0; original `LICENSE` included. All JavaScript and font files
are copied unchanged from that archive. `SHA256SUMS` enumerates every vendored
runtime/license file and its checksum (paths relative to this directory).

Included: configured `tex-mml-chtml.js`, default `tex-svg.js`, all TeX autoload
extensions, CHTML WOFF fonts, context-menu modules, accessibility modules and
speech-rule mathmaps. Other combined entry points are intentionally omitted;
if changing `mathjax.combo`, vendor its entry point too. `_includes/mathjax.html`
sets a baseurl-aware local loader root and CHTML font URL. It loads local
`textmacros` so original TeX text escapes such as `\text{dataset\_tested}` render
as `dataset_tested` rather than visible escape backslashes.

## Verified regression and reusable findings

On alpha18, a real Chromium request to the former jsDelivr MathJax URL failed
with `net::ERR_CONNECTION_CLOSED`; no formulas rendered. Independently, a direct
Kramdown GFM conversion turned the correct source underscores into an `<em>`
element: `sat_i` and the summation lower bound disappeared. A working engine
alone cannot repair that DOM split. The source TeX was not malformed.

`_plugins/math_delimiters.rb` extends the existing GFM parser with native math
nodes for `$...$`, `\(...\)` and `\[...\]` before emphasis/escape handling. The
native math converter emits HTML-escaped `\(...\)` / `\[...\]` for MathJax.
Kramdown's own block/codespan parsers continue to protect fenced, indented and
inline code. Double-dollar `$$...$$` is always display math, including an equation
on a single source line, adjacent equations without blank lines, and equations
inside lists/tables. Kramdown normally treats some of these as inline math; the
site parser promotes those native math nodes to display nodes so the converter
emits `\[...\]` rather than losing the author's display intent. Single-dollar
`$...$` and `\(...\)` stay inline. No script/math render action is needed with
this installed Kramdown version (2.4.0): it emits MathJax delimiters, not
`script[type="math/tex"]` elements.

A temporary per-formula `<span markdown="0">` workaround was tested, then removed
in favor of the systemic parser fix so future Obsidian syncs need no changes.
The blog and Obsidian source formula lines were restored to their original
bytes. No final source-content changes, Mermaid edits, or sync-script runs are
part of this fix.

### Rebuild, restart and test

New Jekyll plugins are loaded at startup. A pre-existing `jekyll serve` process
will NOT load this new plugin through hot reload: its next rebuild can overwrite
correct built HTML with the old mangled formula. Restart that preview process
before normal live-preview verification. Do not mistake this for a MathJax race.
The repository deployment workflow already runs a fresh, non-safe-mode Jekyll
build and supports `_plugins`.

```sh
# This machine stores installed Jekyll gems here. UTF-8 also avoids the
# gemspec's US-ASCII failure on tracked non-ASCII paths.
LANG=en_US.UTF-8 GEM_HOME="$HOME/.gem/ruby/3.2.2" ruby _tests/math_delimiters_test.rb
LANG=en_US.UTF-8 GEM_HOME="$HOME/.gem/ruby/3.2.2" bundle exec jekyll build
# Restart the preview through its owner before testing localhost:4000.
NODE_PATH="$HOME/.npm/_npx/e41f203b7505f1fb/node_modules" \
CHROMIUM_PATH="$HOME/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell" \
node _tests/math_rendering_test.cjs
(cd assets/js/vendor/mathjax && shasum -a 256 -c SHA256SUMS)
```

The Ruby regression has 9 cases / 77 assertions, comparing code/native display
blocks against unmodified GFM behavior and checking the untouched alpha18 formula
(or its standalone fixture), other delimiters, single-line/adjacent double-dollar
display math, lists/tables/links/emphasis, multiline math, HTML escaping, and
escaped delimiters. The independent browser regression blocks all third-party
requests and checks 1440px/390px viewports, all 17 existing alpha18 equations,
exact saturation TeX, real subscript/summation-bound MathML, clean identifiers,
both inline and display delimiter pairs, unchanged code and intentional Markdown
hard line breaks, local WOFF fonts, local `textmacros`, and the lazy `cancel`
extension.

At 390px the inline saturation fraction measured about 317px in a 278px nested
list column. `_includes/mathjax.html` now wraps only equations wider than their
containing column in a keyboard-focusable `.math-scroll` region after typesetting
and font loading; resizing removes/reapplies wrappers as needed. Math stays at
its original font size. The inline-block math box plus padding keeps fraction and
summation ink fully inside the scroll region vertically. The browser regression
checks these bounds, scrolls to the equation's right end, tests 390→1440→390
resizing, and verifies that math contributes no whole-document horizontal
overflow. At the verified 390px viewport, document width was 400px both with and
without all math (an unrelated existing 10px overflow was not changed).

Verification also passed against a fresh isolated Jekyll build (`--destination
.jekyll-math-test`) served by an owned temporary HTTP server with the configured
`/personal_homepage/` prefix. That avoids stale development-server plugin state;
the temporary server and generated test directory were removed afterward.
