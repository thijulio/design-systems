import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { verifyFonts } from '@thijulio/fonts';
import { fonts } from './fonts.config.mjs';

const here = import.meta.dirname;
const dist = join(here, 'dist');
const css = await readFile(join(dist, 'exodus.css'), 'utf-8');
const tokensOnly = await readFile(join(dist, 'exodus-tokens.css'), 'utf-8');

assert.match(css, /:root \{/, 'token vars not bundled');
assert.match(css, /\[data-theme="clay"\]/, 'theme overlay not bundled');
assert.match(css, /background: var\(--n-50\)/, 'base body style missing');
assert.match(css, /@keyframes exo-shimmer/, 'keyframes missing');
assert.match(css, /:focus-visible/, 'focus ring missing');

// exodus-tokens.css is the bundle's head: faces + tokens, nothing after them.
assert.ok(
  css.startsWith(`${tokensOnly.trimEnd()}\n\n`),
  'exodus.css does not start with exodus-tokens.css',
);
assert.match(tokensOnly, /:root \{/, 'tokens-only entry has no token vars');
assert.doesNotMatch(
  tokensOnly,
  /:focus-visible|@keyframes|^body\s*\{/m,
  'tokens-only entry carries reset/base/motion rules',
);

// Self-hosted fonts: no http(s) URL in any served file; every url()/@import
// resolves inside dist; every family × style × weight has a latin and a
// latin-ext face (font-display: swap) leading the bundle; OFL licences ship.
await verifyFonts({
  packageRoot: here,
  dist,
  stylesheets: [
    { file: 'exodus.css', display: 'swap' },
    { file: 'exodus-tokens.css', display: 'swap' },
  ],
  fonts,
});

console.log('✓ @thijulio/exodus-css output verified');
