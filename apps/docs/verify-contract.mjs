import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const primitivesCss = await readFile(
  new URL(import.meta.resolve('@thijulio/primitives/styles.css')),
  'utf8',
);
const primitivesJs = await readFile(
  new URL(import.meta.resolve('@thijulio/primitives')),
  'utf8',
);
const required = new Set(
  [
    ...`${primitivesCss}\n${primitivesJs}`.matchAll(
      /var\((--ds-[a-z0-9-]+)\)/g,
    ),
  ].map((match) => match[1]),
);

assert.ok(required.size > 0, 'primitives output has no contract references');

for (const [brand, packageName] of [
  ['Exodus', '@thijulio/exodus-tokens'],
  ['Faune', '@thijulio/faune-tokens'],
]) {
  const css = await readFile(
    new URL(import.meta.resolve(`${packageName}/tokens.css`)),
    'utf8',
  );
  const provided = new Set(
    [...css.matchAll(/^\s*(--ds-[a-z0-9-]+):/gm)].map((match) => match[1]),
  );
  const missing = [...required].filter((name) => !provided.has(name));
  assert.deepEqual(
    missing,
    [],
    `${brand} is missing primitive contract tokens`,
  );
}

console.log(`✓ Exodus and Faune provide all ${required.size} primitive tokens`);
