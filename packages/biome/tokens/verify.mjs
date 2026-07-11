import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const dist = join(import.meta.dirname, 'dist');
const css = await readFile(join(dist, 'tokens.css'), 'utf-8');
const dts = await readFile(join(dist, 'tokens.d.ts'), 'utf-8');

// Structure: a base :root block and the dark overlay.
assert.match(css, /:root \{/, 'missing :root block');
assert.match(
  css,
  /\[data-mode="dark"\] \{/,
  'missing [data-mode="dark"] block',
);

// Palette is emitted verbatim (case preserved — no color transform).
assert.match(
  css,
  /--bm-mata: #3F5237;/,
  'palette token --bm-mata missing/altered',
);

// Semantic aliases remap between light and dark, references preserved.
assert.match(css, /--brand: var\(--bm-mata\);/, 'light --brand alias missing');
assert.match(css, /--brand: var\(--bm-sage\);/, 'dark --brand alias missing');

// Scales pass through without unit rewriting.
assert.match(css, /--space-1: 4px;/, 'spacing token altered');
assert.match(css, /--weight-bold: 700;/, 'weight token altered');

// Typed JS/TS objects exist.
assert.match(dts, /export const BmMata: string;/, 'ts declaration missing');

console.log('✓ @thijulio/biome-tokens output verified');
