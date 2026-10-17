import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { verifyFonts } from '@thijulio/fonts';
import { fonts } from './fonts.config.mjs';

const here = import.meta.dirname;
const dist = join(here, 'dist');
const css = await readFile(join(dist, 'faune.css'), 'utf-8');
const tokensOnly = await readFile(join(dist, 'faune-tokens.css'), 'utf-8');

assert.match(css, /:root \{/, 'token vars not bundled');
assert.match(css, /--ds-surface: var\(--paper\)/, 'contract not bundled');
assert.match(css, /--paper: #f7f4ed;/, 'palette token missing');
assert.match(css, /background: var\(--paper\)/, 'base body style missing');
assert.match(css, /@keyframes faune-rise/, 'keyframes missing');
assert.match(css, /:focus-visible/, 'focus ring missing');

// faune-tokens.css is the bundle's head: faces + tokens, nothing after them.
assert.ok(
  css.startsWith(`${tokensOnly.trimEnd()}\n\n`),
  'faune.css does not start with faune-tokens.css',
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
    { file: 'faune.css', display: 'swap' },
    { file: 'faune-tokens.css', display: 'swap' },
  ],
  fonts,
});

console.log('✓ @thijulio/faune-css output verified');
