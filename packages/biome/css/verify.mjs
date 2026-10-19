import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import {
  fallbackFamily,
  fontSlug,
  parseFontFaces,
  stripCssComments,
  verifyFonts,
} from '@thijulio/fonts';
import { fonts } from './fonts.config.mjs';

const here = import.meta.dirname;
const dist = join(here, 'dist');
const css = await readFile(join(dist, 'biome.css'), 'utf-8');

assert.match(css, /:root \{/, 'token vars not bundled');
assert.match(css, /\[data-mode="dark"\]/, 'dark block not bundled');
assert.match(
  css,
  /background: var\(--surface-page\)/,
  'base body style missing',
);
assert.match(css, /@keyframes bm-breath/, 'motion keyframes missing');
assert.match(css, /:focus-visible/, 'focus ring missing');

// The split is the bundle, cut in two: biome-core.css is biome.css minus its
// faces, and fonts-optional.css is exactly those faces with another
// font-display — so a consumer of the split gets the same styles and fonts.
const core = await readFile(join(dist, 'biome-core.css'), 'utf-8');
const optionalFonts = await readFile(join(dist, 'fonts-optional.css'), 'utf-8');
assert.ok(css.endsWith(`\n\n${core}`), 'biome.css does not end with core');
assert.equal(
  stripCssComments(css.slice(0, -core.length))
    .replace(/@font-face\s*\{[^}]*\}/g, '')
    .trim(),
  '',
  'biome.css has rules other than @font-face ahead of biome-core.css',
);
const facesWithoutDisplay = (stylesheet) =>
  parseFontFaces(stylesheet).map((face) => ({ ...face, display: undefined }));
assert.deepEqual(
  facesWithoutDisplay(optionalFonts),
  facesWithoutDisplay(css),
  'fonts-optional.css does not declare the same faces as biome.css',
);

// The per-face stylesheets are the same faces again, cut by family × style:
// for each display, together they declare exactly the faces of the stylesheet
// with that display (biome.css is swap), urls resolved from dist/faces/.
const faceFiles = fonts.flatMap(({ family, source, styles }) =>
  Object.keys(styles).flatMap((style) =>
    ['swap', 'optional'].map((display) => ({
      file: `faces/${fontSlug(source.package)}-${style}-${display}.css`,
      display,
      only: { family, style },
    })),
  ),
);
const key = (face) =>
  JSON.stringify({
    ...face,
    srcUrls: face.srcUrls.map((u) => u.replace(/^\.\.\//, './')),
  });
for (const [display, whole] of [
  ['swap', css],
  ['optional', optionalFonts],
]) {
  const cut = (
    await Promise.all(
      faceFiles
        .filter((f) => f.display === display)
        .map(async ({ file }) =>
          parseFontFaces(await readFile(join(dist, file), 'utf-8')),
        ),
    )
  ).flat();
  assert.deepEqual(
    cut.map(key).sort(),
    parseFontFaces(whole).map(key).sort(),
    `faces/*-${display}.css do not declare exactly the faces of the ${display} stylesheet`,
  );
}

// The font tokens name each family's fallbacks right after it, in the
// contract's order, so a browser reaches the metric-matched faces before any
// unadjusted system font.
const stacks = Object.fromEntries(
  [...stripCssComments(core).matchAll(/--font-(\w+):\s*([^;]+);/g)].map(
    ([, name, value]) => [
      name,
      value.split(',').map((f) => f.trim().replace(/^['"]|['"]$/g, '')),
    ],
  ),
);
for (const { family, fallbacks = [] } of fonts) {
  const stack = Object.values(stacks).find((s) => s[0] === family);
  assert.ok(stack, `no --font-* token leads with ${family}`);
  assert.deepEqual(
    stack.slice(1, 1 + fallbacks.length),
    fallbacks.map((f) => fallbackFamily(family, f)),
    `the ${family} token does not list its fallbacks right after it`,
  );
}

// Self-hosted fonts: no http(s) URL in any served file; every url()/@import
// resolves inside dist; every family × style × weight has a latin and a
// latin-ext face with the listed font-display, leading its stylesheet; OFL
// licences ship.
await verifyFonts({
  packageRoot: here,
  dist,
  stylesheets: [
    { file: 'biome.css', display: 'swap' },
    { file: 'biome-core.css', display: null },
    { file: 'fonts-optional.css', display: 'optional' },
    ...faceFiles,
  ],
  fonts,
});

// The README tells consumers which files to preload for the optional split.
// Each one must be a face fonts-optional.css uses (verifyFonts above already
// proved every such url resolves in dist), or a fontsource rename would leave
// consumers preloading a 404 and skipping the face.
const readme = await readFile(join(here, 'README.md'), 'utf-8');
const documentedPreloads = new Set(
  [...readme.matchAll(/fonts\/([\w.-]+\.woff2)/g)].map(([, file]) => file),
);
assert.ok(documentedPreloads.size > 0, 'README.md documents no preload files');
const optionalSrcs = new Set(
  parseFontFaces(optionalFonts).flatMap((face) => face.srcUrls),
);
for (const file of documentedPreloads)
  assert.ok(
    optionalSrcs.has(`./fonts/${file}`),
    `README.md preloads ${file}, which fonts-optional.css does not use`,
  );

console.log('✓ @thijulio/biome-css output verified');
