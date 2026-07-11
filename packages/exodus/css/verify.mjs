import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const css = await readFile(
  join(import.meta.dirname, 'dist', 'exodus.css'),
  'utf-8',
);

// The @import must be the first statement — only comments/whitespace before it.
// Strip CSS comments first so a semicolon inside a comment isn't mistaken for a rule.
const beforeImport = css
  .slice(0, css.indexOf('@import'))
  .replace(/\/\*[\s\S]*?\*\//g, '');
assert.ok(
  !/[{;]/.test(beforeImport),
  '@import is not first in the bundle — invalid CSS ordering',
);

assert.match(css, /fonts\.googleapis\.com/, 'font @import missing');
assert.match(css, /:root \{/, 'token vars not bundled');
assert.match(css, /\[data-theme="clay"\]/, 'theme overlay not bundled');
assert.match(css, /background: var\(--n-50\)/, 'base body style missing');
assert.match(css, /@keyframes exo-shimmer/, 'keyframes missing');
assert.match(css, /:focus-visible/, 'focus ring missing');

console.log('✓ @thijulio/exodus-css output verified');
