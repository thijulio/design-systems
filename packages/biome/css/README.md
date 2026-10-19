# @thijulio/biome-css

Biome Modernism's stylesheet: tokens, reset, base element styles, motion and
the brand's self-hosted webfonts. No third-party requests: the woff2 files and
their SIL OFL licences ship in `fonts/`, next to the CSS.

## Entry points

| Import                                   | What it is                                                         |
| ---------------------------------------- | ------------------------------------------------------------------ |
| `@thijulio/biome-css/biome.css`          | Everything: `@font-face` rules (`font-display: swap`), then styles |
| `@thijulio/biome-css/biome-core.css`     | `biome.css` without its `@font-face` rules                         |
| `@thijulio/biome-css/fonts-optional.css` | The same faces, same files, with `font-display: optional`          |
| `@thijulio/biome-css/faces/*`            | The same faces cut by family × style, one file per display         |
| `@thijulio/biome-css/fonts/*`            | The woff2 files and licences, for preloads                         |

Every face stylesheet also declares the
[metric-matched fallbacks](#metric-matched-fallbacks) of its faces.

Use **one** of:

- **`biome.css`**: apps, SPAs, Storybook, and pages that don't preload fonts.
  The webfonts always show up, but a face that arrives after first paint
  swaps in and can re-wrap text, which is a layout shift.
- **`biome-core.css` + `fonts-optional.css` + preloads**: pages that must not
  shift (CLS 0). A face not ready at first render is skipped for that page
  view and the fallback stays. Once a face is in the HTTP cache, later page
  views use it.
- **`biome-core.css` + one `faces/<family>-<style>-<display>.css` per
  family × style + preloads**: pages that must not shift but also need faces
  they don't preload. See [Picking the display per face](#picking-the-display-per-face).

`verify.mjs` holds the split and the per-face files to being `biome.css` cut
up, so every choice gets the same styles and the same font files.

## Font families

Use the tokens, not the names: `var(--font-display)`, `var(--font-reading)`,
`var(--font-ui)`, `var(--font-mono)`. If you need the names, these are what
the `@font-face` rules declare:

| Token            | Family           | Weights (styles)                     |
| ---------------- | ---------------- | ------------------------------------ |
| `--font-display` | `Newsreader`     | 300–600 (normal), 300–500 (italic)   |
| `--font-reading` | `Spectral`       | 300, 400, 500 (normal), 400 (italic) |
| `--font-ui`      | `Space Grotesk`  | 400–700 (normal)                     |
| `--font-mono`    | `JetBrains Mono` | 400, 500 (normal)                    |

It's `Newsreader`, not `Newsreader Variable` (that is fontsource's own name
for its CSS; Biome writes its own rules from the same files).

## Metric-matched fallbacks

The `--font-*` tokens list, right after each webfont, fallback families that
the face stylesheets declare from system fonts:

| Token            | Fallbacks (`'<family> Fallback <name>'`) | System fonts (`local()`)                                         |
| ---------------- | ---------------------------------------- | ---------------------------------------------------------------- |
| `--font-display` | `Times`, `Noto`                          | Times New Roman / Liberation Serif / Tinos; Noto Serif (Android) |
| `--font-reading` | `Times`, `Noto`                          | the same                                                         |
| `--font-ui`      | `Arial`, `Roboto`                        | Arial / Liberation Sans / Arimo; Roboto (Android)                |
| `--font-mono`    | `Courier`                                | Courier New / Liberation Mono / Cousine                          |

Each is resized (`size-adjust`) to the webfont's average advance and given
its vertical metrics (`ascent-`, `descent-`, `line-gap-override`), computed at
build time with capsize from the shipped woff2 and capsize's measurements of
the system font. Clones such as Liberation and Tinos share a face: their
advances are identical to the font they clone.

What that buys:

- **JetBrains Mono**: every glyph of both fonts is 0.6 em wide, so the swap
  moves nothing. It can `swap` with no preload and no layout shift where
  Courier New or a clone is installed (Windows, macOS, most Linux). Android
  has none of them: it falls to its own `monospace`, the same width but with
  other vertical metrics, which can move inline mono within prose.
- **Newsreader, Spectral, Space Grotesk**: the average matches, single words
  and lines don't. A line can still re-wrap when the webfont arrives, which
  shifts what follows it (the 2026-10-04 measurement below). Newsreader is
  also an optical-size font: its widths change with the rendered size, and
  the fallback is matched to the file's default instance. At 17 px and 24 px
  Chrome renders the italic 1 to 3% wider than the computed ratio.
- **Optional faces** that miss first paint stay in a fallback that looks
  closer to the brand for the whole page view.

## Picking the display per face

```css
@import '@thijulio/biome-css/biome-core.css';
/* First screen, proportional: optional, preloaded (see below). */
@import '@thijulio/biome-css/faces/newsreader-normal-optional.css';
@import '@thijulio/biome-css/faces/spectral-normal-optional.css';
@import '@thijulio/biome-css/faces/space-grotesk-normal-optional.css';
/* Shift-free swap (monospace), or measured shift-free on this page. */
@import '@thijulio/biome-css/faces/jetbrains-mono-normal-swap.css';
@import '@thijulio/biome-css/faces/newsreader-italic-swap.css';
@import '@thijulio/biome-css/faces/spectral-italic-optional.css';
```

Import exactly one file per family × style; two displays of the same face
would declare it twice, and the last one wins. A proportional face set to
`swap` is only safe on a page whose CLS you measure with the fonts arriving
late (thijulio.com does, in its `fonts.spec.ts`).

## Zero layout shift: the optional split

```html
<link
  rel="preload"
  href="…/fonts/newsreader-latin-opsz-normal.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
<link
  rel="preload"
  href="…/fonts/spectral-latin-400-normal.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
<link
  rel="preload"
  href="…/fonts/space-grotesk-latin-wght-normal.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
<link
  rel="preload"
  href="…/fonts/jetbrains-mono-latin-400-normal.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
<link rel="stylesheet" href="…/biome-core.css" />
<link rel="stylesheet" href="…/fonts-optional.css" />
```

- Preload only the faces your first screen renders. These are the latin
  files for the four families at their body weights:
  - `@thijulio/biome-css/fonts/newsreader-latin-opsz-normal.woff2` (every
    upright Newsreader weight: one variable file)
  - `@thijulio/biome-css/fonts/spectral-latin-400-normal.woff2`
  - `@thijulio/biome-css/fonts/space-grotesk-latin-wght-normal.woff2` (every
    Space Grotesk weight)
  - `@thijulio/biome-css/fonts/jetbrains-mono-latin-400-normal.woff2`

  Spectral and JetBrains Mono are static, one file per weight. If the first
  screen uses Spectral 300 or 500, or an italic, preload that file too.
  `verify.mjs` fails if a file listed here stops being one
  `fonts-optional.css` uses.

- Resolve the preload `href` from `@thijulio/biome-css/fonts/<file>` through
  the same bundler as the CSS, so both reference the same (hashed) URL.
  Otherwise the browser downloads the font twice and the preload doesn't
  count.
- `crossorigin` is required on font preloads, even same-origin.
- Without preloads, `optional` almost never shows the webfonts on a first
  visit: the browser discovers the files too late. That's the "never" row in
  the measurements below.

## Measured (2026-10-19): per-face swap on thijulio.com

The home page with Newsreader, Spectral and Space Grotesk optional and
preloaded, and JetBrains Mono and the Newsreader italic on `swap`. Chromium
via Playwright 1.63, JavaScript off, every `.woff2` response delayed 600 ms,
CLS from CDP `PerformanceTimeline`, widths 320 to 1440 px.

| Setup                                        | CLS (every width)  | Mono and italic on first view |
| -------------------------------------------- | ------------------ | ----------------------------- |
| all `optional` (`fonts-optional.css`)        | 0                  | never                         |
| mono and italic `swap`, no fallback faces    | 0.00001 to 0.00009 | yes                           |
| mono and italic `swap`, metric-matched faces | 0                  | yes                           |

## Measured (2026-10-04)

A sample page with the four families (nav and eyebrow, display name,
positioning line in a `34ch` column, code line, prose). Chromium via
Playwright 1.61, JavaScript off, fresh context per load, every `.woff2`
response delayed 600 ms server-side. CLS is the sum of layout-shift entries
(CDP `PerformanceTimeline`); "webfonts" is what CDP reports as the rendered
font. Worst of two runs.

| Setup                                   | CLS 1280 px | CLS 390 px | Webfonts on first view                  |
| --------------------------------------- | ----------- | ---------- | --------------------------------------- |
| `biome.css`                             | 0.0073      | 0.0182     | yes                                     |
| `biome.css` + preloads                  | 0.0073      | 0.0182     | yes                                     |
| `biome-core.css` + `fonts-optional.css` | 0           | 0          | never (even with no delay)              |
| … + preloads                            | 0           | 0          | only if they arrive in time (see below) |

With preloads, the webfonts made it at 0 ms delay on both widths, at 150 ms
only at 390 px, and at 600 ms or slower on neither: from then on, that page
view keeps the fallback.

With fonts in the HTTP cache, the second page view under `swap` still
shifted (0.0069 / 0.0182): a cached font loads asynchronously and can land
after first paint. Under `optional` the second view used the webfonts with
CLS 0.

The shift itself was the positioning line re-wrapping from four lines to five
when Spectral replaced Georgia. A `ch` width follows the rendered font's "0",
so the same `34ch` column was 396 px in Georgia and 323 px in Spectral.
Metric-matched fallback faces (`size-adjust` and the `*-override`
descriptors) were tried and only reduced it (0.0051 / 0.0134): they match
average advance and vertical metrics, not the "0" or any particular line.
