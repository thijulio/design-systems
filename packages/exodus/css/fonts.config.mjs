// Exodus — webfont contract. Hanken Grotesk carries every surface; Baloo 2 is
// the wordmark only. Weights are what the brand renders (and what it requested
// from Google Fonts before self-hosting) — @thijulio/fonts generates the
// @font-face rules from this list and verify.mjs holds the build to it.
// Variable files match what Google served (same axes, same bytes).

/** @type {import('@thijulio/fonts').BrandFonts} */
export const fonts = [
  {
    family: 'Hanken Grotesk',
    source: {
      kind: 'variable',
      package: '@fontsource-variable/hanken-grotesk',
      axes: 'wght',
    },
    styles: { normal: [400, 500, 600, 700, 800] },
  },
  {
    family: 'Baloo 2',
    source: {
      kind: 'variable',
      package: '@fontsource-variable/baloo-2',
      axes: 'wght',
    },
    styles: { normal: [600, 700, 800] },
  },
];
