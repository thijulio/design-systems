import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
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
assert.match(css, /--ds-surface: var\(--paper\);/, 'ds surface alias missing');
assert.match(css, /--ds-brand: var\(--ink\);/, 'ds brand alias missing');
assert.match(css, /--ds-accent: var\(--coral\);/, 'ds accent alias missing');
assert.match(
  css,
  /--ds-on-accent: var\(--ink-deep\);/,
  'ds on-accent alias missing/altered',
);
assert.match(
  css,
  /--ds-radius-control: var\(--radius-full\);/,
  'ds radius-control alias missing',
);
assert.match(
  css,
  /--ds-radius-field: var\(--radius-sm\);/,
  'ds radius-field alias missing',
);
assert.match(
  css,
  /--ds-font-display: var\(--font-display\);/,
  'ds font-display alias missing',
);
assert.match(css, /--ds-focus: var\(--coral-ring\);/, 'ds focus alias missing');
assert.match(css, /--ds-danger: var\(--danger\);/, 'ds danger alias missing');

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

// --- Token manifest (feeds the Storybook color catalog) ---
const manifest = JSON.parse(
  await readFile(join(dist, 'tokens.manifest.json'), 'utf-8'),
);
const entry = (name, tokens = manifest.tokens) =>
  tokens.find((t) => t.name === name);
assert.equal(manifest.version, 1, 'manifest version changed');

// Manifest names are exactly the custom properties each tokens.css block declares.
const declared = (selector) => {
  const start = css.indexOf(`${selector} {`);
  assert.notEqual(start, -1, `tokens.css has no ${selector} block`);
  return [
    ...css.slice(start, css.indexOf('}', start)).matchAll(/^\s*(--[\w-]+):/gm),
  ]
    .map((m) => m[1])
    .sort();
};
const listed = (tokens) => tokens.map((t) => t.name).sort();
assert.deepEqual(
  listed(manifest.tokens),
  declared(':root'),
  'manifest ≠ :root custom properties',
);
for (const theme of manifest.themes) {
  assert.deepEqual(
    listed(theme.tokens),
    declared(theme.selector),
    `manifest ${theme.name} ≠ ${theme.selector} custom properties`,
  );
}

// Every RN accessor, evaluated as written, reaches a leaf of native/tokens.js;
// colors resolve to the same color as the web value.
const { tokens: nativeTree } = await import(
  pathToFileURL(join(dist, 'native/tokens.js')).href
);
const canonicalColor = (value) => {
  const v = String(value).replace(/\s+/g, '').toLowerCase();
  const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/.exec(v);
  return short
    ? `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`
    : v;
};
const expectAccessors = (tokens, tree, file) => {
  for (const token of tokens) {
    const leaf = new Function('tokens', `return ${token.native.accessor};`)(
      tree,
    );
    assert.notEqual(
      leaf,
      undefined,
      `${token.native.accessor} is not in ${file}`,
    );
    if (token.kind === 'color') {
      assert.equal(
        canonicalColor(leaf),
        canonicalColor(token.value),
        `${file}: ${token.native.accessor} ≠ ${token.name}`,
      );
    }
  }
};
expectAccessors(manifest.tokens, nativeTree, 'native/tokens.js');
// Theme entries (including theme-only tokens) resolve in that theme's RN overlay.
for (const theme of manifest.themes) {
  const file = `native/themes/${theme.name}.js`;
  const { default: themeTree } = await import(
    pathToFileURL(join(dist, file)).href
  );
  expectAccessors(theme.tokens, themeTree, file);
}

assert.deepEqual(
  entry('--ds-brand'),
  {
    name: '--ds-brand',
    path: ['ds', 'brand'],
    source: 'contract.json',
    value: '#183d3c',
    references: ['--ink'],
    kind: 'color',
    native: { accessor: 'tokens.ds.brand' },
  },
  'ds-brand manifest entry altered',
);
assert.deepEqual(manifest.themes, [], 'faune has no theme overlays');

console.log('✓ @thijulio/faune-tokens output verified');
