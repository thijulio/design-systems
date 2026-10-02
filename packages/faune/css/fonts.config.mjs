// Faune — webfont contract. Newsreader carries the editorial display voice;
// Inter is body + UI. Weights are what the brand renders (and what it
// requested from Google Fonts before self-hosting) — @thijulio/core generates
// the @font-face rules from this list and verify.mjs holds the build to it.
// Newsreader keeps its optical-size axis (opsz 6–72), as Google served it.

/** @type {import('@thijulio/core').BrandFonts} */
export const fonts = [
  {
    family: 'Inter',
    source: {
      kind: 'variable',
      package: '@fontsource-variable/inter',
      axes: 'wght',
    },
    styles: { normal: [400, 500, 600, 700, 800] },
  },
  {
    family: 'Newsreader',
    source: {
      kind: 'variable',
      package: '@fontsource-variable/newsreader',
      axes: 'opsz',
    },
    styles: { normal: [400, 500, 600], italic: [400] },
  },
];
