import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import assert from 'node:assert/strict';

const dist = join(import.meta.dirname, 'dist');
const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

const css = await readFile(join(dist, 'exodus.css'), 'utf-8');

assert.match(css, /:root \{/, 'token vars not bundled');
assert.match(css, /\[data-theme="clay"\]/, 'theme overlay not bundled');
assert.match(css, /background: var\(--n-50\)/, 'base body style missing');
assert.match(css, /@keyframes exo-shimmer/, 'keyframes missing');
assert.match(css, /:focus-visible/, 'focus ring missing');

// --- Self-hosted fonts: no third-party requests -----------------------------

const files = (await readdir(dist, { recursive: true, withFileTypes: true }))
  .filter((entry) => entry.isFile())
  .map((entry) => join(entry.parentPath, entry.name));

const isFont = (file) => file.endsWith('.woff2');
// OFL license texts cite https URLs but are never loaded by a browser.
const isLicense = (file) => /[/\\]LICENSE-[^/\\]+\.txt$/.test(file);

// Every file a consumer's browser can load must be free of absolute URLs.
for (const file of files.filter((f) => !isFont(f) && !isLicense(f))) {
  const text = await readFile(file, 'utf-8');
  const hit = text.match(/https?:\/\/\S+/i);
  assert.equal(
    hit,
    null,
    `${relative(dist, file)} references an external URL: ${hit?.[0]}`,
  );
}

// Every url() / @import in every CSS file is relative and resolves in dist.
const referenced = new Set();
for (const file of files.filter((f) => f.endsWith('.css'))) {
  const text = stripComments(await readFile(file, 'utf-8'));
  const refs = [
    ...[...text.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/g)].map((m) => m[2]),
    ...[...text.matchAll(/@import\s+(['"])(.*?)\1/g)].map((m) => m[2]),
  ];
  for (const ref of refs) {
    if (ref.startsWith('data:')) continue;
    assert.ok(
      !/^([a-z][a-z0-9+.-]*:|\/)/i.test(ref),
      `${relative(dist, file)}: url(${ref}) is not a relative path`,
    );
    const target = join(dirname(file), ref.split(/[?#]/)[0]);
    assert.ok(
      target.startsWith(dist + '/') && existsSync(target),
      `${relative(dist, file)}: url(${ref}) does not resolve to a file in dist`,
    );
    referenced.add(target);
  }
}

// No dead weight: every shipped font is referenced by the CSS.
for (const font of files.filter(isFont)) {
  assert.ok(
    referenced.has(font),
    `${relative(dist, font)} is shipped but unused`,
  );
}

// Both families keep their exact names, latin + latin-ext, font-display: swap.
const fontFaces = [...stripComments(css).matchAll(/@font-face\s*\{([^}]*)\}/g)];
for (const [family, slug] of [
  ['Baloo 2', 'baloo-2'],
  ['Hanken Grotesk', 'hanken-grotesk'],
]) {
  const faces = fontFaces
    .map((m) => m[1])
    .filter((body) => body.includes(`font-family: '${family}'`));
  assert.equal(faces.length, 2, `${family}: expected latin + latin-ext faces`);
  for (const body of faces) {
    assert.match(body, /font-display: swap/, `${family}: font-display: swap`);
    assert.match(body, /unicode-range:/, `${family}: unicode-range missing`);
  }
  assert.ok(
    existsSync(join(dist, 'fonts', `LICENSE-${slug}.txt`)),
    `${family}: OFL license not shipped`,
  );
}

console.log('✓ @thijulio/exodus-css output verified');
