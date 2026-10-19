import {
  fallbackOverrides,
  fontSlug,
  normalizeUnicodeRange,
  parseFontFaces,
  planFallbackFaces,
  planFontFaces,
  renderFallbackFaces,
  renderFontFaces,
  type BrandFonts,
  type FontMetrics,
} from './font-faces.js';

const range = (pkg: string, subset: string) => `${fontSlug(pkg)}:${subset}`;

describe('planFontFaces', () => {
  it('emits one variable face per style per subset spanning the contracted weights', () => {
    const fonts: BrandFonts = [
      {
        family: 'Newsreader',
        source: {
          kind: 'variable',
          package: '@fontsource-variable/newsreader',
          axes: 'opsz',
        },
        styles: { normal: [600, 300, 400], italic: [400] },
      },
    ];

    expect(planFontFaces(fonts, range)).toEqual([
      expect.objectContaining({
        style: 'normal',
        subset: 'latin-ext',
        weight: [300, 600],
        file: 'newsreader-latin-ext-opsz-normal.woff2',
        unicodeRange: 'newsreader:latin-ext',
      }),
      expect.objectContaining({
        style: 'normal',
        subset: 'latin',
        weight: [300, 600],
        file: 'newsreader-latin-opsz-normal.woff2',
      }),
      expect.objectContaining({
        style: 'italic',
        subset: 'latin-ext',
        weight: [400, 400],
        file: 'newsreader-latin-ext-opsz-italic.woff2',
      }),
      expect.objectContaining({
        style: 'italic',
        subset: 'latin',
        weight: [400, 400],
      }),
    ]);
  });

  it('emits one static face per weight, latin-ext before latin so latin wins overlaps', () => {
    const faces = planFontFaces(
      [
        {
          family: 'Spectral',
          source: { kind: 'static', package: '@fontsource/spectral' },
          styles: { normal: [300, 400] },
        },
      ],
      range,
    );

    expect(faces.map((f) => f.file)).toEqual([
      'spectral-latin-ext-300-normal.woff2',
      'spectral-latin-ext-400-normal.woff2',
      'spectral-latin-300-normal.woff2',
      'spectral-latin-400-normal.woff2',
    ]);
    expect(faces.every((f) => f.weight[0] === f.weight[1])).toBe(true);
  });

  it('rejects a style with no weights', () => {
    expect(() =>
      planFontFaces(
        [
          {
            family: 'Inter',
            source: { kind: 'static', package: '@fontsource/inter' },
            styles: { normal: [] },
          },
        ],
        range,
      ),
    ).toThrow('Inter normal: no weights listed');
  });
});

describe('renderFontFaces → parseFontFaces', () => {
  it('round-trips relative woff2 urls, weight ranges, swap and unicode-range', () => {
    const css = renderFontFaces(
      planFontFaces(
        [
          {
            family: 'Hanken Grotesk',
            source: {
              kind: 'variable',
              package: '@fontsource-variable/hanken-grotesk',
              axes: 'wght',
            },
            styles: { normal: [400, 800] },
          },
        ],
        () => 'U+0000-00FF,U+0131',
      ),
    );

    expect(css).not.toMatch(/https?:/);
    expect(parseFontFaces(css)).toEqual([
      {
        family: 'Hanken Grotesk',
        style: 'normal',
        weight: [400, 800],
        display: 'swap',
        srcUrls: ['./fonts/hanken-grotesk-latin-ext-wght-normal.woff2'],
        srcLocals: [],
        unicodeRange: 'U+0000-00FF, U+0131',
        sizeAdjust: undefined,
        ascentOverride: undefined,
        descentOverride: undefined,
        lineGapOverride: undefined,
      },
      expect.objectContaining({
        srcUrls: ['./fonts/hanken-grotesk-latin-wght-normal.woff2'],
      }),
    ]);
  });

  it('renders the requested font-display', () => {
    const css = renderFontFaces(
      planFontFaces(
        [
          {
            family: 'Mono',
            source: { kind: 'static', package: '@fontsource/mono' },
            styles: { normal: [400] },
          },
        ],
        range,
      ),
      { display: 'optional' },
    );

    expect(parseFontFaces(css).map((f) => f.display)).toEqual([
      'optional',
      'optional',
    ]);
  });

  it('parses single weights and ignores faces inside comments', () => {
    const faces = parseFontFaces(`
      /* @font-face { font-family: 'Ghost'; } */
      @font-face { font-family: "Inter"; font-weight: 500; src: url(a.woff2) format('woff2'); }
    `);

    expect(faces).toEqual([
      expect.objectContaining({
        family: 'Inter',
        style: 'normal',
        weight: [500, 500],
        display: undefined,
        srcUrls: ['a.woff2'],
      }),
    ]);
  });
});

const TIMES = {
  name: 'Times',
  metrics: 'timesNewRoman',
  local: {
    normal: ['Times New Roman', 'Tinos'],
    italic: ['Times New Roman Italic', 'Tinos Italic'],
  },
};

describe('planFallbackFaces', () => {
  it('plans one face per fallback per style, measured on the latin file', () => {
    expect(
      planFallbackFaces([
        {
          family: 'Newsreader',
          source: {
            kind: 'variable',
            package: '@fontsource-variable/newsreader',
            axes: 'opsz',
          },
          styles: { normal: [300, 600], italic: [400] },
          fallbacks: [TIMES],
        },
      ]),
    ).toEqual([
      {
        family: 'Newsreader Fallback Times',
        style: 'normal',
        local: ['Times New Roman', 'Tinos'],
        webfont: {
          package: '@fontsource-variable/newsreader',
          file: 'newsreader-latin-opsz-normal.woff2',
        },
        metrics: 'timesNewRoman/regular',
      },
      expect.objectContaining({
        style: 'italic',
        local: ['Times New Roman Italic', 'Tinos Italic'],
        webfont: expect.objectContaining({
          file: 'newsreader-latin-opsz-italic.woff2',
        }),
        metrics: 'timesNewRoman/italic',
      }),
    ]);
  });

  it('measures a static family on the weight closest to 400', () => {
    const [face] = planFallbackFaces([
      {
        family: 'Spectral',
        source: { kind: 'static', package: '@fontsource/spectral' },
        styles: { normal: [300, 500, 700] },
        fallbacks: [TIMES],
      },
    ]);

    expect(face.webfont.file).toBe('spectral-latin-300-normal.woff2');
  });

  it('plans nothing for a family without fallbacks', () => {
    expect(
      planFallbackFaces([
        {
          family: 'Mono',
          source: { kind: 'static', package: '@fontsource/mono' },
          styles: { normal: [400] },
        },
      ]),
    ).toEqual([]);
  });

  it('rejects a fallback with no local() names for a contracted style', () => {
    expect(() =>
      planFallbackFaces([
        {
          family: 'Spectral',
          source: { kind: 'static', package: '@fontsource/spectral' },
          styles: { italic: [400] },
          fallbacks: [{ ...TIMES, local: { normal: ['Times New Roman'] } }],
        },
      ]),
    ).toThrow('Spectral Fallback Times: no local() names for italic');
  });
});

describe('fallbackOverrides', () => {
  // JetBrains Mono and Courier New, as capsize measures them.
  const jetbrainsMono: FontMetrics = {
    ascent: 1020,
    descent: -300,
    lineGap: 0,
    unitsPerEm: 1000,
    xWidthAvg: 600,
  };
  const courierNew: FontMetrics = {
    ascent: 1705,
    descent: -615,
    lineGap: 0,
    unitsPerEm: 2048,
    xWidthAvg: 1229,
  };

  it('matches the average advance, then hands over the vertical metrics', () => {
    const o = fallbackOverrides(jetbrainsMono, courierNew);

    expect(o.sizeAdjust).toBeCloseTo(0.6 / (1229 / 2048), 6);
    expect(o.ascentOverride).toBeCloseTo(1.02 / o.sizeAdjust, 6);
    expect(o.descentOverride).toBeCloseTo(0.3 / o.sizeAdjust, 6);
    expect(o.lineGapOverride).toBe(0);
  });

  it('round-trips through render and parse', () => {
    const css = renderFallbackFaces([
      {
        family: 'JetBrains Mono Fallback Courier',
        style: 'normal',
        local: ['Courier New', 'CourierNewPSMT'],
        webfont: { package: '@fontsource/jetbrains-mono', file: 'x.woff2' },
        metrics: 'courierNew/regular',
        ...fallbackOverrides(jetbrainsMono, courierNew),
      },
    ]);

    expect(parseFontFaces(css)).toEqual([
      expect.objectContaining({
        family: 'JetBrains Mono Fallback Courier',
        style: 'normal',
        display: undefined,
        srcUrls: [],
        srcLocals: ['Courier New', 'CourierNewPSMT'],
        sizeAdjust: '99.98%',
        ascentOverride: '102.02%',
        descentOverride: '30%',
        lineGapOverride: '0%',
      }),
    ]);
  });
});

describe('normalizeUnicodeRange', () => {
  it('ignores spacing and case', () => {
    expect(normalizeUnicodeRange('u+0000-00ff ,U+0131')).toBe(
      normalizeUnicodeRange('U+0000-00FF, U+0131'),
    );
  });
});
