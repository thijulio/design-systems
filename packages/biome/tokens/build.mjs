import { join } from 'node:path';
import { buildBrandTokens } from '@thijulio/core';

const here = import.meta.dirname;

await buildBrandTokens({
  source: join(here, 'src/tokens'),
  buildPath: join(here, 'dist'),
  themes: [
    { selector: '[data-mode="dark"]', source: join(here, 'src/themes/dark') },
  ],
});

console.log(
  '✓ @thijulio/biome-tokens built → dist/{tokens.css,tokens.js,tokens.d.ts}',
);
