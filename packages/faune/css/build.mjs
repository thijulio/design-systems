import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildFonts } from '@thijulio/fonts';
import { fonts } from './fonts.config.mjs';

const here = import.meta.dirname;
const src = join(here, 'src');
const dist = join(here, 'dist');

// Token vars come from the sibling package's build output (Nx builds it first).
const tokensCss = await readFile(
  fileURLToPath(import.meta.resolve('@thijulio/faune-tokens/tokens.css')),
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

// @font-face rules lead the bundle, ahead of the tokens that name the families.
const tokensOnly = [fontsCss.trim(), tokensCss.trim()].join('\n\n');
const bundle =
  [tokensOnly, reset.trim(), base.trim(), motion.trim()].join('\n\n') + '\n';

await writeFile(join(dist, 'faune.css'), bundle);
// Fonts + tokens only (no reset/base/motion), for apps that bring their own
// element styles but want the brand's variables and faces.
await writeFile(join(dist, 'faune-tokens.css'), `${tokensOnly}\n`);
console.log(
  '✓ @thijulio/faune-css built → dist/{faune.css,faune-tokens.css} + dist/fonts/',
);
