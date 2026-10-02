import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
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

// --- React Native artifacts (normalized) ---
const nativeTokens = await readFile(join(dist, 'native/tokens.js'), 'utf-8');
const nativeClay = await readFile(join(dist, 'native/themes/clay.js'), 'utf-8');
const nativeThemes = await readFile(join(dist, 'native/themes.js'), 'utf-8');

assert.match(nativeTokens, /export const tokens = \{/, 'native tokens missing');
assert.match(
  nativeTokens,
  /"accent-50": "#F2F7F2"/,
  'native accent-50 missing',
);
assert.match(nativeTokens, /"caption": 12/, 'rem not converted to px');
assert.match(nativeTokens, /"1": 4/, 'spacing not normalized to number');
assert.match(
  nativeClay,
  /"accent-600": "#A44A2B"/,
  'native clay accent missing',
);
assert.match(
  nativeThemes,
  /themes = \{ sage, clay, harbor \}/,
  'native themes barrel missing',
);

// --- Flutter (Dart) artifacts ---
const dartTokens = await readFile(join(dist, 'dart/tokens.dart'), 'utf-8');
const dartClay = await readFile(join(dist, 'dart/theme_clay.dart'), 'utf-8');
const dartThemes = await readFile(join(dist, 'dart/themes.dart'), 'utf-8');

assert.match(
  dartTokens,
  /abstract final class ExodusTokens/,
  'dart base class missing',
);
assert.match(
  dartTokens,
  /static const Color accent600 = Color\(0xFF3D6344\);/,
  'dart accent-600 missing',
);
assert.match(
  dartTokens,
  /static const double textCaption = 12\.0;/,
  'dart rem size missing',
);
assert.match(
  dartClay,
  /abstract final class ExodusThemeClay/,
  'dart theme class missing',
);
assert.match(
  dartClay,
  /'accent600': Color\(0xFFA44A2B\)/,
  'dart clay accent missing',
);
assert.match(
  dartThemes,
  /'clay': ExodusThemeClay\.colors/,
  'dart themes barrel missing',
);
assert.match(
  dartThemes,
  /'harbor': ExodusThemeHarbor\.colors/,
  'dart harbor missing',
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
  entry('--accent'),
  {
    name: '--accent',
    path: ['accent'],
    source: 'color.json',
    value: '#3d6344',
    references: ['--accent-600'],
    kind: 'color',
    native: { accessor: 'tokens.accent' },
  },
  'accent manifest entry altered',
);
assert.equal(
  entry('--n-500')?.native.accessor,
  "tokens.n['500']",
  'n-500 RN accessor altered',
);
assert.equal(
  entry('--space-1')?.kind,
  'dimension',
  'space-1 not classified as a dimension',
);
assert.deepEqual(
  manifest.themes.map((t) => [t.name, t.selector]),
  [
    ['sage', '[data-theme="sage"]'],
    ['clay', '[data-theme="clay"]'],
    ['harbor', '[data-theme="harbor"]'],
  ],
  'manifest themes altered',
);
assert.equal(
  entry('--accent-600', manifest.themes[1].tokens)?.value,
  '#a44a2b',
  'clay manifest value missing',
);

console.log('✓ @thijulio/exodus-tokens output verified');
