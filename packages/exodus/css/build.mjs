import { readFile, writeFile, mkdir, copyFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = import.meta.dirname;
const src = join(here, 'src');
const dist = join(here, 'dist');

// Self-hosted webfonts: one variable woff2 per family per subset, copied from
// the pinned @fontsource-variable packages. src/fonts.css references these by
// relative url('./fonts/…'); verify.mjs checks every url() resolves in dist.
const FONT_FAMILIES = ['baloo-2', 'hanken-grotesk'];
const FONT_SUBSETS = ['latin', 'latin-ext'];

const tokensCss = await readFile(
  fileURLToPath(import.meta.resolve('@thijulio/exodus-tokens/tokens.css')),
  'utf-8',
);

const read = (file) => readFile(join(src, file), 'utf-8');
const [fonts, reset, base, motion] = await Promise.all([
  read('fonts.css'),
  read('reset.css'),
  read('base.css'),
  read('motion.css'),
]);

// @font-face rules lead the bundle, ahead of the tokens that name the families.
const bundle =
  [
    fonts.trim(),
    tokensCss.trim(),
    reset.trim(),
    base.trim(),
    motion.trim(),
  ].join('\n\n') + '\n';

const fontsDir = join(dist, 'fonts');
await rm(fontsDir, { recursive: true, force: true });
await mkdir(fontsDir, { recursive: true });

const resolveFrom = (family, subpath) =>
  fileURLToPath(
    import.meta.resolve(`@fontsource-variable/${family}/${subpath}`),
  );

await Promise.all(
  FONT_FAMILIES.flatMap((family) => [
    ...FONT_SUBSETS.map((subset) => {
      const file = `${family}-${subset}-wght-normal.woff2`;
      return copyFile(
        resolveFrom(family, `files/${file}`),
        join(fontsDir, file),
      );
    }),
    // SIL OFL 1.1 requires the license to travel with the font files.
    copyFile(
      resolveFrom(family, 'LICENSE'),
      join(fontsDir, `LICENSE-${family}.txt`),
    ),
  ]),
);

await writeFile(join(dist, 'exodus.css'), bundle);
console.log('✓ @thijulio/exodus-css built → dist/exodus.css + dist/fonts/');
