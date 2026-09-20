import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const dist = join(import.meta.dirname, 'dist');
const css = await readFile(join(dist, 'tokens.css'), 'utf-8');
const dts = await readFile(join(dist, 'tokens.d.ts'), 'utf-8');

// Base :root — light-first for now (no theme overlays).
assert.match(css, /:root \{/, 'missing :root block');
assert.match(css, /--ink: #183d3c;/, 'ink token altered');
assert.match(css, /--coral: #e56c50;/, 'coral token altered');
assert.match(css, /--radius-xl: 2\.3rem;/, 'radius-xl altered');
assert.match(
  css,
  /--text-display: clamp\(3rem, 5\.3vw, 5\.5rem\);/,
  'display size altered',
);
assert.doesNotMatch(css, /\[data-(?:mode|theme)=/, 'unexpected theme overlay');

// Semantic contract — every brand aliases its palette into --ds-* so
// @thijulio/primitives skins automatically. These names are the shared language.
assert.match(css, /--ds-surface: var\(--paper\);/g, 'ds surface alias missing');
assert.match(css, /--ds-brand: var\(--ink\);/g, 'ds brand alias missing');
assert.match(css, /--ds-accent: var\(--coral\);/g, 'ds accent alias missing');
assert.match(
  css,
  /--ds-radius-control: var\(--radius-full\);/g,
  'ds radius-control alias missing',
);
assert.match(
  css,
  /--ds-font-display: var\(--font-display\);/g,
  'ds font-display alias missing',
);
assert.match(css, /--ds-danger: var\(--danger\);/g, 'ds danger alias missing');

// Typed objects (web JS/DTS drop-in path).
assert.match(dts, /export const Ink: string;/, 'ink declaration missing');
assert.match(
  dts,
  /export const DsSurface: string;/,
  'ds contract declaration missing',
);

// React Native (normalized) + Flutter artifacts exist.
const native = await readFile(join(dist, 'native/tokens.js'), 'utf-8');
assert.match(native, /export const tokens = \{/, 'native tokens missing');
assert.match(native, /"ink": "#183D3C"/, 'native ink missing');

const dart = await readFile(join(dist, 'dart/tokens.dart'), 'utf-8');
assert.match(
  dart,
  /abstract final class FauneTokens/,
  'dart base class missing',
);

// Zero-theme barrel must stay valid Dart (no stray comma).
const dartThemes = await readFile(join(dist, 'dart/themes.dart'), 'utf-8');
assert.match(
  dartThemes,
  /<String, Map<String, Color>>\{\}/,
  'empty dart themes barrel invalid',
);

console.log('✓ @thijulio/faune-tokens output verified');
