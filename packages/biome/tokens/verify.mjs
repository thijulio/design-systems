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

// --- Cast shadow: one paint (color + alpha) per mode ---
// Light keeps the reference garden's ink at 0.11. Dark is near-black: the dark
// page is the darkest palette color, so any lighter paint reads as a glow.
assert.match(
  css,
  /--shadow-cast: rgba\(35, 42, 32, 0\.11\);/,
  'light --shadow-cast missing/altered',
);
assert.match(
  css,
  /--shadow-cast: rgba\(0, 0, 0, 0\.55\);/,
  'dark --shadow-cast missing/altered',
);
const darkTheme = manifest.themes.find((t) => t.name === 'dark');
assert.equal(
  entry('--shadow-cast', darkTheme.tokens)?.value,
  'rgba(0, 0, 0, 0.55)',
  'dark --shadow-cast is not a [data-mode="dark"] override',
);
assert.match(
  nativeTokens,
  /"shadow-cast": "rgba\(35, 42, 32, 0\.11\)"/,
  'native --shadow-cast missing/altered',
);
assert.match(
  nativeDark,
  /"shadow-cast": "rgba\(0, 0, 0, 0\.55\)"/,
  'native dark --shadow-cast missing/altered',
);
assert.match(
  dartTokens,
  /static const Color shadowCast = Color\.fromRGBO\(35, 42, 32, 0\.11\);/,
  'dart shadowCast missing/altered',
);
assert.match(
  dartDark,
  /'shadowCast': Color\.fromRGBO\(0, 0, 0, 0\.55\)/,
  'dart theme shadowCast missing/altered',
);

// No glow: in every mode the shadow, composited over each surface it falls on,
// is darker than that surface.
const valueIn = (name, theme) => {
  const token =
    (theme && entry(name, theme.tokens)) ?? entry(name, manifest.tokens);
  assert.ok(token, `${name} missing from the manifest`);
  return token.value;
};
const rgba = (value) => {
  const hex = /^#([0-9a-f]{6})$/i.exec(value);
  if (hex) {
    return [0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16)).concat(1);
  }
  const fn =
    /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/.exec(
      value,
    );
  assert.ok(fn, `unparseable color ${value}`);
  return [+fn[1], +fn[2], +fn[3], fn[4] === undefined ? 1 : +fn[4]];
};
const luminance = (rgb) => {
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
for (const theme of [undefined, ...manifest.themes]) {
  const mode = theme?.name ?? 'light';
  const [r, g, b, a] = rgba(valueIn('--shadow-cast', theme));
  for (const surface of ['--surface-page', '--surface-raised']) {
    const bg = rgba(valueIn(surface, theme));
    assert.equal(bg[3], 1, `${mode} ${surface} is not opaque`);
    const shaded = [r, g, b].map((c, i) => c * a + bg[i] * (1 - a));
    assert.ok(
      luminance(shaded) < luminance(bg),
      `${mode} --shadow-cast lightens ${surface} (reads as a glow)`,
    );
  }
}

console.log('✓ @thijulio/biome-tokens output verified');
