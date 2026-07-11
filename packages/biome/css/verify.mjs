import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const css = await readFile(
  join(import.meta.dirname, 'dist', 'biome.css'),
  'utf-8',
);

// The @import must be the first statement — only comments/whitespace may precede it.
const beforeImport = css.slice(0, css.indexOf('@import'));
assert.ok(
  !/[{;]/.test(beforeImport),
  '@import is not first in the bundle — invalid CSS ordering',
);

assert.match(css, /fonts\.googleapis\.com/, 'font @import missing');
assert.match(css, /:root \{/, 'token vars not bundled');
assert.match(css, /\[data-mode="dark"\]/, 'dark block not bundled');
assert.match(
  css,
  /background: var\(--surface-page\)/,
  'base body style missing',
);
assert.match(css, /@keyframes bm-breath/, 'motion keyframes missing');
assert.match(css, /:focus-visible/, 'focus ring missing');

console.log('✓ @thijulio/biome-css output verified');
