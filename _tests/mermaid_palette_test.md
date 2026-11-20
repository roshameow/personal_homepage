# Mermaid pastel palette regression

`_tests/mermaid_palette_test.cjs` uses the real local Mermaid engine, include CSS/JS and freshly built skin CSS. It does not start or restart the preview server or modify article sources. Standalone fixtures block all network requests.

## Run

Build Jekyll first after changing Sass. Then:

```sh
NODE_PATH=/Users/wenliu/.npm/_npx/e41f203b7505f1fb/node_modules \
CHROMIUM_PATH="$HOME/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell" \
node _tests/mermaid_palette_test.cjs
```

Optional variables:
- `TEST_SITE_DIR`: existing Jekyll output directory (default `_site`).
- `TEST_SITE_URL=http://localhost:4000/personal_homepage`: also check live alpha18 at desktop/mobile widths.

## Verified result

PASS against a fresh build and the live preview: default/light/dark skins × 1440/390 widths; five subtle distinct group fills; innermost-group node colors; ungrouped tint; alpha18 topology and feedback direction; label containment; native SVG labels; text contrast ≥4.5; horizontal scrolling; explicit `classDef`, `classDef default`, inline and stroke-only author styles; CSS palette overrides; theme-variable overrides; cylinder, diamond, circle and rounded shapes.

The implementation blends 85% skin background into node fills and 90% into group fills. Group titles use the skin's readable text rather than its link/accent color. Merely lightening every hue equally can make blue/green/purple indistinguishable; hue blends were checked against all three skins without making backgrounds vivid.

## Reusable pitfalls

- Mermaid prefixes node/cluster IDs with generated identifiers. Match semantic suffixes rather than complete IDs.
- Empty edge-label SVG `text` elements can have zero-size boxes at an unrelated origin. Exclude only empty labels from containment checks.
- Rounded shapes can put geometry inside `g.label-container`. Apply accents to actual paths as well as the container; otherwise child stroke defaults override the inherited color. Check author styles on both levels before applying accents, and retain `fill="none"` decorations.
- Mermaid's cluster SVG groups are flat, not nested. Use layout bounds to match each node to its smallest enclosing cluster.
- CSS palette assertions require fresh build output; missing/stale skin CSS should fail rather than be skipped.
- Alpha18 has unrelated article-wide mobile overflow. Live checks enforce Mermaid wrapper containment; isolated fixtures additionally enforce no whole-page overflow.
