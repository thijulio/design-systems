// Biome Modernism — webfont contract. Newsreader (display), Spectral
// (reading), Space Grotesk (UI), JetBrains Mono (code). Weights are what the
// brand renders (and what it requested from Google Fonts before
// self-hosting) — @thijulio/fonts generates the @font-face rules from this
// list and verify.mjs holds the build to it. Newsreader keeps its
// optical-size axis (opsz 6–72), as Google served it. Spectral has no
// variable cut; JetBrains Mono needs two weights, which static files serve
// smaller than the variable one.

/** @type {import('@thijulio/fonts').BrandFonts} */
export const fonts = [
  {
    family: 'Newsreader',
    source: {
      kind: 'variable',
      package: '@fontsource-variable/newsreader',
      axes: 'opsz',
    },
    styles: { normal: [300, 400, 500, 600], italic: [300, 400, 500] },
  },
  {
    family: 'Spectral',
    source: { kind: 'static', package: '@fontsource/spectral' },
    styles: { normal: [300, 400, 500], italic: [400] },
  },
  {
    family: 'Space Grotesk',
    source: {
      kind: 'variable',
      package: '@fontsource-variable/space-grotesk',
      axes: 'wght',
    },
    styles: { normal: [400, 500, 600, 700] },
  },
  {
    family: 'JetBrains Mono',
    source: { kind: 'static', package: '@fontsource/jetbrains-mono' },
    styles: { normal: [400, 500] },
  },
];
