import type {
  FormatFnArguments,
  TransformedToken,
} from 'style-dictionary/types';
import {
  MANIFEST_VERSION,
  manifestFormats,
  manifestTokens,
  nativeAccessor,
} from './manifest.js';

type Dictionary = FormatFnArguments['dictionary'];

function token(
  name: string,
  path: string[],
  value: string,
  original = value,
  filePath = '/brand/src/tokens/color.json',
): TransformedToken {
  return {
    name,
    path,
    value,
    original: { value: original },
    filePath,
    isSource: true,
  } as TransformedToken;
}

function dictionary(
  allTokens: TransformedToken[],
  unfilteredAllTokens?: TransformedToken[],
): Dictionary {
  return {
    allTokens,
    tokens: {},
    tokenMap: new Map(),
    unfilteredAllTokens,
  } as unknown as Dictionary;
}

const ramp = token('accent-600', ['accent-600'], '#3d6344');
const alias = token('accent', ['accent'], '#3d6344', '{accent-600}');

describe('manifestTokens', () => {
  it('names tokens as CSS custom properties and records path, source file, value and RN accessor', () => {
    expect(manifestTokens(dictionary([alias, ramp]))[0]).toEqual({
      name: '--accent',
      path: ['accent'],
      source: 'color.json',
      value: '#3d6344',
      references: ['--accent-600'],
      kind: 'color',
      native: { accessor: 'tokens.accent' },
    });
  });

  it.each([
    ['#F2EEE2', 'color'],
    ['rgba(35, 42, 32, 0.12)', 'color'],
    ['4px', 'dimension'],
    ['1.125rem', 'dimension'],
    ['240ms', 'duration'],
    ['cubic-bezier(0.2, 0.7, 0.2, 1)', 'easing'],
    ['700', 'number'],
    ['1.5', 'number'],
    ['0 1px 2px rgba(38, 36, 31, 0.06)', 'other'],
    ["'Inter', system-ui, sans-serif", 'other'],
  ])('classifies %s as %s via the shared value classifier', (value, kind) => {
    expect(manifestTokens(dictionary([token('t', ['t'], value)]))[0].kind).toBe(
      kind,
    );
  });

  it('resolves references against unfiltered tokens so overlays can alias base tokens', () => {
    const sage = token('bm-sage', ['bm', 'sage'], '#8FB089');
    const darkBrand = token(
      'brand',
      ['brand'],
      '#8FB089',
      '{bm.sage}',
      '/brand/src/themes/dark/semantic.json',
    );
    expect(
      manifestTokens(dictionary([darkBrand], [sage, darkBrand]))[0],
    ).toMatchObject({ source: 'semantic.json', references: ['--bm-sage'] });
  });

  it('records every reference inside a compound value, in order of appearance', () => {
    const width = token('x', ['x'], '1px');
    const color = token('c', ['c'], '#000');
    const edge = token('edge', ['edge'], '1px solid #000', '{x} solid {c}');
    expect(
      manifestTokens(dictionary([edge, width, color]))[0].references,
    ).toEqual(['--x', '--c']);
  });

  it('finds references inside object-valued (composite) tokens', () => {
    const color = token('c', ['c'], '#000');
    const shadow = {
      ...token('shadow', ['shadow'], '0 1px 2px #000'),
      original: { value: { offsetY: '1px', color: '{c}' } },
    } as unknown as TransformedToken;
    expect(manifestTokens(dictionary([shadow, color]))[0].references).toEqual([
      '--c',
    ]);
  });

  it('ignores brace text that names no token', () => {
    const odd = token('odd', ['odd'], 'url({nope})');
    expect(manifestTokens(dictionary([odd]))[0].references).toEqual([]);
  });
});

describe('nativeAccessor', () => {
  it.each([
    [['accent'], 'tokens.accent'],
    [['accent-50'], "tokens['accent-50']"],
    [['n', '500'], "tokens.n['500']"],
    [['ds', 'surface-raised'], "tokens.ds['surface-raised']"],
    [['size', '2xl'], "tokens.size['2xl']"],
    [['bm', 'bone'], 'tokens.bm.bone'],
    [["it's"], "tokens['it\\'s']"],
    [['back\\slash'], "tokens['back\\\\slash']"],
  ])(
    'maps %j to %s, the key buildTree nests the RN token tree by',
    (path, expected) => {
      expect(nativeAccessor(path)).toBe(expected);
    },
  );
});

describe('manifest formats', () => {
  async function run(name: string, dict: Dictionary): Promise<unknown> {
    const format = manifestFormats.find((f) => f.name === name);
    if (!format) throw new Error(`format ${name} is not exported`);
    return JSON.parse(
      String(
        await format.format({
          dictionary: dict,
        } as unknown as FormatFnArguments),
      ),
    );
  }

  it('wraps base tokens with the manifest version and an empty theme list', async () => {
    expect(await run('thijulio/manifest-json', dictionary([ramp]))).toEqual({
      version: MANIFEST_VERSION,
      tokens: [expect.objectContaining({ name: '--accent-600' })],
      themes: [],
    });
  });

  it('emits a bare entry array for a theme overlay', async () => {
    expect(
      await run('thijulio/manifest-theme-json', dictionary([ramp])),
    ).toEqual([expect.objectContaining({ name: '--accent-600' })]);
  });
});
