import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = import.meta.dirname;
const src = join(here, 'src');

// Token vars come from the sibling package's build output (Nx builds it first).
const tokensCss = await readFile(
  fileURLToPath(import.meta.resolve('@thijulio/biome-tokens/tokens.css')),
  'utf-8',
);

const read = (file) => readFile(join(src, file), 'utf-8');
const [fonts, reset, base, motion] = await Promise.all([
  read('fonts.css'),
  read('reset.css'),
  read('base.css'),
  read('motion.css'),
]);

// The fonts @import must precede every rule, so it leads the bundle.
const bundle =
  [
    fonts.trim(),
    tokensCss.trim(),
    reset.trim(),
    base.trim(),
    motion.trim(),
  ].join('\n\n') + '\n';

await mkdir(join(here, 'dist'), { recursive: true });
await writeFile(join(here, 'dist', 'biome.css'), bundle);
console.log('✓ @thijulio/biome-css built → dist/biome.css');
