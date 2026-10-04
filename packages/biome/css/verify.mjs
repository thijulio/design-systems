import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { parseFontFaces, stripCssComments, verifyFonts } from '@thijulio/fonts';
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
  ],
  fonts,
});

console.log('✓ @thijulio/biome-css output verified');
