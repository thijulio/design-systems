import { createTokenConfig } from './token-config.js';

describe('createTokenConfig', () => {
  it('emits a prefixed css platform (with outputReferences) and a prefix-free js/ts platform', () => {
    const cfg = createTokenConfig({
      source: '/brand/tokens',
      buildPath: '/brand/dist',
      prefix: 'bm',
    });

    const platforms = cfg.platforms ?? {};

    expect(platforms['css']?.prefix).toBe('bm');
    expect(platforms['css']?.files?.[0]).toMatchObject({
      destination: 'tokens.css',
      format: 'css/variables',
      options: { outputReferences: true },
    });

    // The prefix is a CSS-namespacing concern; it must not leak into JS token names.
    expect(platforms['ts']?.prefix).toBeUndefined();
    expect(platforms['ts']?.files?.map((f) => f.destination)).toEqual([
      'tokens.js',
      'tokens.d.ts',
    ]);
    expect(platforms['ts']?.files?.map((f) => f.format)).toEqual([
      'javascript/es6',
      'typescript/es6-declarations',
    ]);
  });

  it('globs the source directory recursively and normalizes a trailing slash on buildPath', () => {
    const cfg = createTokenConfig({ source: '/s/', buildPath: '/out' });
    expect(cfg.source).toEqual(['/s/**/*.json']);
    expect(cfg.platforms?.['css']?.buildPath).toBe('/out/');
  });
});
