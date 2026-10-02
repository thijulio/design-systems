import { mkdtempSync, rmSync } from 'node:fs';
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildFonts } from './build-fonts.js';
import type { BrandFonts } from './font-faces.js';
import { verifyFonts } from './verify-fonts.js';

const UNICODE = {
  latin: 'U+0000-00FF,U+0131',
  'latin-ext': 'U+0100-02BA,U+1E00-1E9F',
  vietnamese: 'U+0102-0103',
};

/** A minimal fontsource-shaped package installed under `root/node_modules`. */
async function fakeFontsource(root: string, pkg: string, files: string[]) {
  const dir = join(root, 'node_modules', pkg);
  await mkdir(join(dir, 'files'), { recursive: true });
  await writeFile(
    join(dir, 'package.json'),
    JSON.stringify({
      name: pkg,
      exports: {
        './LICENSE': './LICENSE',
        './unicode.json': './unicode.json',
        './files/*': './files/*',
      },
    }),
  );
  await writeFile(join(dir, 'unicode.json'), JSON.stringify(UNICODE));
  await writeFile(
    join(dir, 'LICENSE'),
    'SIL OPEN FONT LICENSE 1.1 https://openfontlicense.org',
  );
  for (const file of files) await writeFile(join(dir, 'files', file), file);
}

const FONTS: BrandFonts = [
  {
    family: 'Sans',
    source: {
      kind: 'variable',
      package: '@fontsource-variable/sans',
      axes: 'wght',
    },
    styles: { normal: [400, 500, 700] },
  },
  {
    family: 'Mono',
    source: { kind: 'static', package: '@fontsource/mono' },
    styles: { normal: [400] },
  },
];

describe('buildFonts + verifyFonts', () => {
  let root: string;
  let dist: string;

  /** Build the fonts into dist and write a bundle that leads with them. */
  async function build(rest = ':root { --x: 1; }') {
    const css = await buildFonts({
      packageRoot: root,
      outDir: dist,
      fonts: FONTS,
    });
    await writeFile(join(dist, 'brand.css'), `${css}\n\n${rest}\n`);
  }
  const verify = () =>
    verifyFonts({ packageRoot: root, dist, bundle: 'brand.css', fonts: FONTS });

  beforeEach(async () => {
    root = mkdtempSync(join(tmpdir(), 'fonts-'));
    dist = join(root, 'dist');
    await writeFile(join(root, 'package.json'), '{"name":"brand-css"}');
    await fakeFontsource(root, '@fontsource-variable/sans', [
      'sans-latin-wght-normal.woff2',
      'sans-latin-ext-wght-normal.woff2',
      'sans-vietnamese-wght-normal.woff2',
    ]);
    await fakeFontsource(root, '@fontsource/mono', [
      'mono-latin-400-normal.woff2',
      'mono-latin-ext-400-normal.woff2',
      'mono-latin-700-normal.woff2',
    ]);
  });
  afterEach(() => rmSync(root, { recursive: true, force: true }));

  it('ships only the contracted subsets/weights plus one licence per package, and verifies', async () => {
    await build();

    expect((await readdir(join(dist, 'fonts'))).sort()).toEqual([
      'LICENSE-mono.txt',
      'LICENSE-sans.txt',
      'mono-latin-400-normal.woff2',
      'mono-latin-ext-400-normal.woff2',
      'sans-latin-ext-wght-normal.woff2',
      'sans-latin-wght-normal.woff2',
    ]);
    await expect(verify()).resolves.toBeUndefined();
  });

  it('clears stale font files from a previous build', async () => {
    await mkdir(join(dist, 'fonts'), { recursive: true });
    await writeFile(join(dist, 'fonts', 'stale.woff2'), '');
    await build();

    expect(await readdir(join(dist, 'fonts'))).not.toContain('stale.woff2');
  });

  it('fails on a third-party @import', async () => {
    await build(
      "@import url('https://fonts.googleapis.com/css2?family=Sans');",
    );

    await expect(verify()).rejects.toThrow(
      /brand\.css references an external URL: https:\/\/fonts\.googleapis\.com/,
    );
  });

  it('fails when a url() does not resolve inside dist', async () => {
    await build();
    await rm(join(dist, 'fonts', 'mono-latin-400-normal.woff2'));

    await expect(verify()).rejects.toThrow(
      'url(./fonts/mono-latin-400-normal.woff2) does not resolve to a file in dist',
    );
  });

  it('fails on shipped-but-unused fonts and a missing licence', async () => {
    await build();
    await writeFile(join(dist, 'fonts', 'extra.woff2'), '');
    await rm(join(dist, 'fonts', 'LICENSE-sans.txt'));

    const error = verify();
    await expect(error).rejects.toThrow(
      'fonts/extra.woff2 is shipped but unused',
    );
    await expect(error).rejects.toThrow('Sans: OFL licence not shipped');
  });

  it('fails when a contracted weight or subset has no face', async () => {
    await build();
    const narrowed: BrandFonts = [
      { ...FONTS[0], styles: { normal: [400, 500, 700, 800] } },
      FONTS[1],
    ];

    await expect(
      verifyFonts({
        packageRoot: root,
        dist,
        bundle: 'brand.css',
        fonts: narrowed,
      }),
    ).rejects.toThrow(
      /Sans normal 800: no latin @font-face[\s\S]*Sans normal 800: no latin-ext @font-face/,
    );
  });

  it('fails when the bundle does not lead with the faces', async () => {
    const fontsCss = await buildFonts({
      packageRoot: root,
      outDir: dist,
      fonts: FONTS,
    });
    await writeFile(join(dist, 'brand.css'), `:root { --x: 1; }\n${fontsCss}`);

    await expect(verify()).rejects.toThrow(
      'the first rule must be an @font-face',
    );
  });
});
