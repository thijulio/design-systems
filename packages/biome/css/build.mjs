import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildFonts, fontFacesCss } from '@thijulio/fonts';
import { fonts } from './fonts.config.mjs';

const here = import.meta.dirname;
const src = join(here, 'src');
const dist = join(here, 'dist');

// Token vars come from the sibling package's build output (Nx builds it first).
const tokensCss = await readFile(
  fileURLToPath(import.meta.resolve('@thijulio/biome-tokens/tokens.css')),
  'utf-8',
);

const read = (file) => readFile(join(src, file), 'utf-8');
const [reset, base, motion] = await Promise.all([
  read('reset.css'),
  read('base.css'),
  read('motion.css'),
]);

// Self-hosted webfonts: copies the woff2 files + OFL licences into dist/fonts/
// and returns the @font-face rules that reference them by relative url.
await mkdir(dist, { recursive: true });
const fontsCss = await buildFonts({ packageRoot: here, outDir: dist, fonts });

const core =
  [tokensCss.trim(), reset.trim(), base.trim(), motion.trim()].join('\n\n') +
  '\n';

// biome.css: everything, @font-face rules (font-display: swap) first, ahead of
// the tokens that name the families. Works with no setup, apps included.
await writeFile(join(dist, 'biome.css'), `${fontsCss.trim()}\n\n${core}`);

// The split for pages that preload their first-screen fonts: biome-core.css
// (no faces) + fonts-optional.css (the same faces, font-display: optional — a
// face not ready at first render is skipped for that page view: no layout shift).
await writeFile(join(dist, 'biome-core.css'), core);
const optionalFontsCss = await fontFacesCss({
  packageRoot: here,
  fonts,
  display: 'optional',
});
await writeFile(
  join(dist, 'fonts-optional.css'),
  `${optionalFontsCss.trim()}\n`,
);

console.log(
  '✓ @thijulio/biome-css built → dist/{biome.css,biome-core.css,fonts-optional.css} + dist/fonts/',
);
