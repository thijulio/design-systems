import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const css = await readFile(
  join(import.meta.dirname, 'dist', 'faune.css'),
  'utf-8',
);

// The @import must be the first statement — only comments/whitespace before it.
const beforeImport = css
  .slice(0, css.indexOf('@import'))
  .replace(/\/\*[\s\S]*?\*\//g, '');
assert.ok(
  !/[{;]/.test(beforeImport),
  '@import is not first in the bundle — invalid CSS ordering',
);

assert.match(css, /fonts\.googleapis\.com/, 'font @import missing');
assert.match(css, /:root \{/, 'token vars not bundled');
assert.match(css, /--ds-surface: var\(--paper\)/, 'contract not bundled');
assert.match(css, /--paper: #f7f4ed;/, 'palette token missing');
assert.match(css, /background: var\(--paper\)/, 'base body style missing');
assert.match(css, /@keyframes faune-rise/, 'keyframes missing');
assert.match(css, /:focus-visible/, 'focus ring missing');

console.log('✓ @thijulio/faune-css output verified');
