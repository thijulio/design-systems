import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const dist = join(import.meta.dirname, 'dist');
const css = await readFile(join(dist, 'tokens.css'), 'utf-8');
const dts = await readFile(join(dist, 'tokens.d.ts'), 'utf-8');

// Base :root: Sage accent default + theme-independent neutrals/semantics/tones.
assert.match(css, /:root \{/, 'missing :root block');
assert.match(
  css,
  /--accent-600: #3d6344;/,
  'sage accent default missing/altered',
);
assert.match(
  css,
  /--accent: var\(--accent-600\);/,
  'accent alias not a reference',
);
assert.match(css, /--n-900: #26241f;/, 'neutral token altered');
assert.match(css, /--success: #3f8f5b;/, 'semantic token altered');
assert.match(css, /--tone-teal-dot: #2f8a85;/, 'status tone missing');

// Three accent theme overlays, each reskinning only the accent ramp.
assert.match(css, /\[data-theme="sage"\] \{/, 'sage overlay missing');
assert.match(css, /\[data-theme="clay"\] \{/, 'clay overlay missing');
assert.match(css, /\[data-theme="harbor"\] \{/, 'harbor overlay missing');
assert.match(css, /--accent-600: #a44a2b;/, 'clay accent value missing');
assert.match(css, /--accent-600: #2a5688;/, 'harbor accent value missing');

// Typed objects.
assert.match(dts, /export const Accent600: string;/, 'ts declaration missing');

console.log('✓ @thijulio/exodus-tokens output verified');
