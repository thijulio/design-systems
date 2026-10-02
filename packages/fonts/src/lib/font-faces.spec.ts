import {
  fontSlug,
  normalizeUnicodeRange,
  parseFontFaces,
  planFontFaces,
  renderFontFaces,
  type BrandFonts,
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
        unicodeRange: 'U+0000-00FF, U+0131',
      },
      expect.objectContaining({
        srcUrls: ['./fonts/hanken-grotesk-latin-wght-normal.woff2'],
      }),
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

describe('normalizeUnicodeRange', () => {
  it('ignores spacing and case', () => {
    expect(normalizeUnicodeRange('u+0000-00ff ,U+0131')).toBe(
      normalizeUnicodeRange('U+0000-00FF, U+0131'),
    );
  });
});
