// Fails when a published React or Vue package stops being tree-shakeable.
//
// usage: node tools/verify-tree-shaking.mjs <projectRoot> <Import> <Unrelated,...>
//
// Bundles `import { <Import> }` from the package's BUILT entry the way a
// consumer's bundler would (package.json `sideEffects` honoured, peers and CSS
// external) and asserts that:
//   1. no unrelated component (matched by its React `displayName` or its Vue
//      `name` option) survives, and
//   2. the result stays well under the size of importing everything.
// Run it after `build` (the nx target `verify-tree-shaking` depends on it).
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { rolldown } from 'rolldown';

// One-component import must stay under this share of the whole package.
const MAX_SHARE = 0.4;

const [projectRoot, importName, unrelatedArg = ''] = process.argv.slice(2);
if (!projectRoot || !importName) {
  console.error(
    'usage: node tools/verify-tree-shaking.mjs <projectRoot> <Import> <Unrelated,...>',
  );
  process.exit(2);
}
const unrelated = unrelatedArg.split(',').filter(Boolean);

const root = resolve(projectRoot);
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const entry = resolve(root, pkg.exports['.'].import);
const peers = Object.keys(pkg.peerDependencies ?? {});

async function bundle(source) {
  const build = await rolldown({
    input: 'entry',
    logLevel: 'silent',
    external: (id) =>
      id.endsWith('.css') ||
      peers.some((peer) => id === peer || id.startsWith(`${peer}/`)),
    plugins: [
      {
        name: 'virtual-entry',
        resolveId: (id) => (id === 'entry' ? '\0entry' : null),
        load: (id) => (id === '\0entry' ? source : null),
      },
    ],
  });
  const { output } = await build.generate({ format: 'es' });
  await build.close();
  const code = output
    .filter((chunk) => chunk.type === 'chunk')
    .map((chunk) => chunk.code)
    .join('\n');
  return { code, gzip: gzipSync(code).length };
}

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} kB`;

const one = await bundle(
  `export { ${importName} } from ${JSON.stringify(entry)};`,
);
const all = await bundle(`export * from ${JSON.stringify(entry)};`);
const share = one.gzip / all.gzip;

console.log(
  `${pkg.name}: import { ${importName} } → ${kb(one.gzip)} gzip, ` +
    `everything → ${kb(all.gzip)} gzip (${(share * 100).toFixed(0)}%)`,
);

const failures = [];
const leaked = unrelated.filter((name) =>
  new RegExp(`(?:displayName\\s*=|\\bname\\s*:)\\s*["'\`]${name}["'\`]`).test(
    one.code,
  ),
);
if (leaked.length > 0) {
  failures.push(
    `import { ${importName} } also bundles unrelated: ${leaked.join(', ')}`,
  );
}
if (share > MAX_SHARE) {
  failures.push(
    `import { ${importName} } is ${(share * 100).toFixed(0)}% of the whole ` +
      `package (limit ${MAX_SHARE * 100}%)`,
  );
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`✗ ${failure}`);
  console.error(
    'The build must emit one module per source file (preserveModules) so ' +
      'unused components are dropped via package.json `sideEffects`.',
  );
  process.exit(1);
}
console.log('✓ tree-shakeable');
