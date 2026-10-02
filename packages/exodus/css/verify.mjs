import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { verifyFonts } from '@thijulio/fonts';
import { fonts } from './fonts.config.mjs';

const here = import.meta.dirname;
const dist = join(here, 'dist');
const css = await readFile(join(dist, 'exodus.css'), 'utf-8');

assert.match(css, /:root \{/, 'token vars not bundled');
assert.match(css, /\[data-theme="clay"\]/, 'theme overlay not bundled');
assert.match(css, /background: var\(--n-50\)/, 'base body style missing');
assert.match(css, /@keyframes exo-shimmer/, 'keyframes missing');
assert.match(css, /:focus-visible/, 'focus ring missing');

// Self-hosted fonts: no http(s) URL in any served file; every url()/@import
// resolves inside dist; every family × style × weight has a latin and a
// latin-ext face (font-display: swap) leading the bundle; OFL licences ship.
await verifyFonts({ packageRoot: here, dist, bundle: 'exodus.css', fonts });

console.log('✓ @thijulio/exodus-css output verified');
