import { join } from 'node:path';
import { buildBrandTokens } from '@thijulio/core';

const here = import.meta.dirname;

await buildBrandTokens({
  source: join(here, 'src/tokens'),
  buildPath: join(here, 'dist'),
  displayName: 'Faune',
  // Light-first for now — no theme overlays yet. A dark palette would add
  // src/themes/<name>/*.json + a theme('<name>') entry here, same as Exodus.
  themes: [],
});

console.log(
  '✓ @thijulio/faune-tokens built → dist/{tokens.css,tokens.js,tokens.d.ts,native,dart}',
);
