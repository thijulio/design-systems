// Biome Modernism — webfont contract. Newsreader (display), Spectral
// (reading), Space Grotesk (UI), JetBrains Mono (code). Weights are what the
// brand renders (and what it requested from Google Fonts before
// self-hosting) — @thijulio/fonts generates the @font-face rules from this
// list and verify.mjs holds the build to it. Newsreader keeps its
// optical-size axis (opsz 6–72), as Google served it. Spectral has no
// variable cut; JetBrains Mono needs two weights, which static files serve
// smaller than the variable one.
//
// Fallbacks: the system fonts each family swaps from, metric-matched (see
// @thijulio/fonts FallbackFont) and named by the --font-* tokens right after
// the webfont. One face per metric family: Times New Roman, Liberation and
// Tinos share advances, as do Arial, Liberation Sans and Arimo, and Courier
// New, Liberation Mono and Cousine. Noto Serif and Roboto are Android's serif
// and sans. verify.mjs holds the tokens to this list.

const times = {
  name: 'Times',
  metrics: 'timesNewRoman',
  local: {
    normal: [
      'Times New Roman',
      'TimesNewRomanPSMT',
      'Liberation Serif',
      'LiberationSerif',
      'Tinos',
      'Tinos-Regular',
    ],
    italic: [
      'Times New Roman Italic',
      'TimesNewRomanPS-ItalicMT',
      'Liberation Serif Italic',
      'LiberationSerif-Italic',
      'Tinos Italic',
      'Tinos-Italic',
    ],
  },
};

const notoSerif = {
  name: 'Noto',
  metrics: 'notoSerif',
  local: {
    normal: ['Noto Serif', 'Noto Serif Regular', 'NotoSerif-Regular'],
    italic: ['Noto Serif Italic', 'NotoSerif-Italic'],
  },
};

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
    fallbacks: [times, notoSerif],
  },
  {
    family: 'Spectral',
    source: { kind: 'static', package: '@fontsource/spectral' },
    styles: { normal: [300, 400, 500], italic: [400] },
    fallbacks: [times, notoSerif],
  },
  {
    family: 'Space Grotesk',
    source: {
      kind: 'variable',
      package: '@fontsource-variable/space-grotesk',
      axes: 'wght',
    },
    styles: { normal: [400, 500, 600, 700] },
    fallbacks: [
      {
        name: 'Arial',
        metrics: 'arial',
        local: {
          normal: [
            'Arial',
            'ArialMT',
            'Liberation Sans',
            'LiberationSans',
            'Arimo',
            'Arimo-Regular',
          ],
        },
      },
      {
        name: 'Roboto',
        metrics: 'roboto',
        local: { normal: ['Roboto', 'Roboto Regular', 'Roboto-Regular'] },
      },
    ],
  },
  {
    family: 'JetBrains Mono',
    source: { kind: 'static', package: '@fontsource/jetbrains-mono' },
    styles: { normal: [400, 500] },
    fallbacks: [
      {
        name: 'Courier',
        metrics: 'courierNew',
        local: {
          normal: [
            'Courier New',
            'CourierNewPSMT',
            'Liberation Mono',
            'LiberationMono',
            'Cousine',
            'Cousine-Regular',
          ],
        },
      },
    ],
  },
];
