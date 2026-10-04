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
| `@thijulio/biome-css/fonts/*`            | The woff2 files and licences, for preloads                         |

Use **one** of:

- **`biome.css`**: apps, SPAs, Storybook, and pages that don't preload fonts.
  The webfonts always show up, but a face that arrives after first paint
  swaps in and can re-wrap text, which is a layout shift.
- **`biome-core.css` + `fonts-optional.css` + preloads**: pages that must not
  shift (CLS 0). A face not ready at first render is skipped for that page
  view and the fallback stays. Once a face is in the HTTP cache, later page
  views use it.

`verify.mjs` holds the split to being `biome.css` cut in two, so both choices
get the same styles and the same font files.

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
