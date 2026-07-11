import {
  createBaseConfig,
  createThemeConfig,
  themeTempFile,
} from './token-config.js';

describe('createBaseConfig', () => {
  it('emits a prefixed :root css block and a prefix-free js/ts platform', () => {
    const cfg = createBaseConfig({
      source: '/brand/tokens',
      buildPath: '/brand/dist',
      prefix: 'bm',
    });

    const platforms = cfg.platforms ?? {};

    expect(platforms['css']?.prefix).toBe('bm');
    expect(platforms['css']?.files?.[0]).toMatchObject({
      destination: 'tokens.css',
      format: 'css/variables',
      options: { selector: ':root', outputReferences: true },
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
    const cfg = createBaseConfig({ source: '/s/', buildPath: '/out' });
    expect(cfg.source).toEqual(['/s/**/*.json']);
    expect(cfg.platforms?.['css']?.buildPath).toBe('/out/');
  });
});

describe('createThemeConfig', () => {
  const opts = { source: '/brand/tokens', buildPath: '/brand/dist' };
  const theme = {
    selector: '[data-mode="dark"]',
    source: '/brand/themes/dark',
  };

  it('scopes to the theme selector and includes base sources for reference resolution', () => {
    const cfg = createThemeConfig(opts, theme, 0);

    expect(cfg.source).toEqual([
      '/brand/tokens/**/*.json',
      '/brand/themes/dark/**/*.json',
    ]);

    const file = cfg.platforms?.['css']?.files?.[0];
    expect(file?.destination).toBe(themeTempFile(0));
    expect(file?.options).toMatchObject({
      selector: '[data-mode="dark"]',
      outputReferences: true,
    });
    // Overlay collisions with base are intentional; the warning is silenced.
    expect(cfg.log).toMatchObject({ warnings: 'disabled' });
    // No JS/TS platform for overlays — base values only.
    expect(cfg.platforms?.['ts']).toBeUndefined();
  });

  it('filters output to tokens originating in the overlay directory', () => {
    const cfg = createThemeConfig(opts, theme, 1);
    const filter = cfg.platforms?.['css']?.files?.[0]?.filter as (t: {
      filePath: string;
    }) => boolean;

    expect(typeof filter).toBe('function');
    expect(filter({ filePath: '/brand/themes/dark/colors.json' })).toBe(true);
    expect(filter({ filePath: '/brand/tokens/colors.json' })).toBe(false);
  });
});
