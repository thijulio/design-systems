import { describe, expect, it } from 'vitest';
import {
  colorCatalog,
  staleNoteKeys,
  UNCATEGORIZED,
  type CatalogGroup,
  type ColorSection,
  type ManifestToken,
  type TokenManifest,
} from './token-manifest.js';

const token = (
  name: string,
  value: string,
  extra: Partial<ManifestToken> = {},
): ManifestToken => ({
  name,
  path: [name.slice(2)],
  source: 'color.json',
  value,
  references: [],
  kind: 'color',
  native: { accessor: `tokens['${name.slice(2)}']` },
  ...extra,
});

const manifest = (partial: Partial<TokenManifest> = {}): TokenManifest => ({
  version: 1,
  tokens: [],
  themes: [],
  ...partial,
});

const titles = (groups: CatalogGroup[]) =>
  groups.map(({ section, tokens }) => [
    section.title,
    tokens.map((t) => t.name),
  ]);

describe('colorCatalog', () => {
  it('keeps only color tokens', () => {
    const groups = colorCatalog(
      manifest({
        tokens: [
          token('--ink', '#000'),
          token('--space-1', '4px', { kind: 'dimension' }),
        ],
      }),
      [],
    );
    expect(titles(groups)).toEqual([['Uncategorized', ['--ink']]]);
  });

  it('assigns each token to the first matching section, in section order, dropping empty sections', () => {
    const sections: ColorSection[] = [
      { title: 'Accent', match: (t) => t.name.startsWith('--accent') },
      { title: 'Empty', match: () => false },
      { title: 'Everything', match: () => true },
    ];
    const groups = colorCatalog(
      manifest({
        tokens: [token('--n-50', '#fff'), token('--accent', '#0f0')],
      }),
      sections,
    );
    expect(titles(groups)).toEqual([
      ['Accent', ['--accent']],
      ['Everything', ['--n-50']],
    ]);
  });

  it('collects unmatched color tokens in a trailing Uncategorized section', () => {
    const groups = colorCatalog(
      manifest({ tokens: [token('--new-thing', '#123456')] }),
      [{ title: 'Accent', match: () => false }],
    );
    expect(groups.at(-1)?.section).toBe(UNCATEGORIZED);
    expect(titles(groups)).toEqual([['Uncategorized', ['--new-thing']]]);
  });

  it('records theme overrides only where the resolved value changes', () => {
    const groups = colorCatalog(
      manifest({
        tokens: [token('--accent', '#3d6344')],
        themes: [
          {
            name: 'sage',
            selector: '[data-theme="sage"]',
            tokens: [token('--accent', '#3d6344')],
          },
          {
            name: 'clay',
            selector: '[data-theme="clay"]',
            tokens: [token('--accent', '#a44a2b')],
          },
        ],
      }),
      [],
    );
    expect(groups[0].tokens[0]).toMatchObject({
      themeOnly: false,
      overrides: { clay: '#a44a2b' },
    });
  });

  it('lists a token defined only inside theme overlays, flagged themeOnly', () => {
    const groups = colorCatalog(
      manifest({
        themes: [
          {
            name: 'dark',
            selector: '[data-mode="dark"]',
            tokens: [token('--glow', '#8fb089')],
          },
          {
            name: 'dim',
            selector: '[data-mode="dim"]',
            tokens: [token('--glow', '#8fb089')],
          },
        ],
      }),
      [],
    );
    expect(groups[0].tokens).toEqual([
      expect.objectContaining({
        name: '--glow',
        themeOnly: true,
        overrides: { dark: '#8fb089', dim: '#8fb089' },
      }),
    ]);
  });

  it('keeps the React Native accessor on every catalog entry', () => {
    const groups = colorCatalog(
      manifest({
        tokens: [
          token('--n-500', '#847d6e', {
            native: { accessor: "tokens.n['500']" },
          }),
        ],
      }),
      [],
    );
    expect(groups[0].tokens[0].native.accessor).toBe("tokens.n['500']");
  });

  it('rejects a manifest version it does not understand', () => {
    expect(() => colorCatalog(manifest({ version: 2 }), [])).toThrow(
      'Unsupported token manifest version 2',
    );
  });
});

describe('staleNoteKeys', () => {
  it('returns note keys that name no color token', () => {
    const m = manifest({
      tokens: [
        token('--bm-mata', '#3F5237'),
        token('--space-1', '4px', { kind: 'dimension' }),
      ],
    });
    expect(
      staleNoteKeys(m, {
        '--bm-mata': 'Mata',
        '--bm-old': 'Renamed',
        '--space-1': 'Not a color',
      }),
    ).toEqual(['--bm-old', '--space-1']);
  });
});
