import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
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

// Component decisions remain explicit tokens; the function color is bright
// enough to be read on the terminal surface.
assert.match(
  css,
  /--terminal-syntax-fn: #D1794C;/,
  'terminal function token missing/altered',
);

// Typed JS/TS objects exist.
assert.match(dts, /export const BmMata: string;/, 'ts declaration missing');

// --- React Native artifacts (normalized) ---
const nativeTokens = await readFile(join(dist, 'native/tokens.js'), 'utf-8');
const nativeDark = await readFile(join(dist, 'native/themes/dark.js'), 'utf-8');
const nativeThemes = await readFile(join(dist, 'native/themes.js'), 'utf-8');
const nativeIndex = await readFile(join(dist, 'native/index.js'), 'utf-8');

assert.match(nativeTokens, /export const tokens = \{/, 'native tokens missing');
assert.match(nativeTokens, /"fast": 250/, 'duration not normalized to ms');
assert.match(nativeTokens, /"1": 4/, 'spacing not normalized to number');
assert.match(nativeTokens, /"x1": 0\.2/, 'easing not decomposed');
assert.match(nativeTokens, /"mata": "#3F5237"/, 'native palette color missing');
assert.match(nativeDark, /"brand": "#8FB089"/, 'native dark brand missing');
assert.match(
  nativeThemes,
  /themes = \{ dark \}/,
  'native themes barrel missing dark',
);
assert.match(
  nativeIndex,
  /export \{ tokens \}/,
  'native barrel missing tokens',
);
assert.match(
  nativeIndex,
  /export \{ themes \}/,
  'native barrel missing themes',
);

// --- Flutter (Dart) artifacts ---
const dartTokens = await readFile(join(dist, 'dart/tokens.dart'), 'utf-8');
const dartDark = await readFile(join(dist, 'dart/theme_dark.dart'), 'utf-8');
const dartThemes = await readFile(join(dist, 'dart/themes.dart'), 'utf-8');

assert.match(
  dartTokens,
  /abstract final class BiomeTokens/,
  'dart base class missing',
);
assert.match(
  dartTokens,
  /static const Color bmMata = Color\(0xFF3F5237\);/,
  'dart color missing',
);
assert.match(
  dartTokens,
  /static const int durFast = 250;/,
  'dart duration missing',
);
assert.match(
  dartTokens,
  /static const double space1 = 4\.0;/,
  'dart spacing missing',
);
assert.match(
  dartDark,
  /abstract final class BiomeThemeDark/,
  'dart theme class missing',
);
assert.match(
  dartDark,
  /'brand': Color\(0xFF8FB089\)/,
  'dart theme brand missing',
);
assert.match(
  dartThemes,
  /'dark': BiomeThemeDark\.colors/,
  'dart themes barrel missing',
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
for (const token of manifest.tokens) {
  const leaf = new Function('tokens', `return ${token.native.accessor};`)(
    nativeTree,
  );
  assert.notEqual(
    leaf,
    undefined,
    `${token.native.accessor} is not in native/tokens.js`,
  );
  if (token.kind === 'color') {
    assert.equal(
      canonicalColor(leaf),
      canonicalColor(token.value),
      `${token.native.accessor} ≠ ${token.name}`,
    );
  }
}

assert.deepEqual(
  entry('--brand'),
  {
    name: '--brand',
    path: ['brand'],
    source: 'semantic.json',
    value: '#3F5237',
    references: ['--bm-mata'],
    kind: 'color',
    native: { accessor: 'tokens.brand' },
  },
  'brand manifest entry altered',
);
assert.equal(
  entry('--bm-bone-raised')?.native.accessor,
  "tokens.bm['bone-raised']",
  'bm-bone-raised RN accessor altered',
);
assert.deepEqual(
  manifest.themes.map((t) => [t.name, t.selector]),
  [['dark', '[data-mode="dark"]']],
  'manifest themes altered',
);
assert.deepEqual(
  entry('--brand', manifest.themes[0].tokens)?.references,
  ['--bm-sage'],
  'dark brand alias not resolved against the base palette',
);

console.log('✓ @thijulio/biome-tokens output verified');
