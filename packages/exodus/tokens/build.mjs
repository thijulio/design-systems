import { join } from 'node:path';
import { buildBrandTokens } from '@thijulio/core';

const here = import.meta.dirname;
const theme = (name) => ({
  selector: `[data-theme="${name}"]`,
  source: join(here, 'src/themes', name),
});

await buildBrandTokens({
  source: join(here, 'src/tokens'),
  buildPath: join(here, 'dist'),
  // Sage is also the :root default (in tokens/color.json); the overlay lets a
  // subtree be forced back to Sage under another theme. Clay & Harbor reskin the accent.
  themes: [theme('sage'), theme('clay'), theme('harbor')],
});

console.log(
  '✓ @thijulio/exodus-tokens built → dist/{tokens.css,tokens.js,tokens.d.ts}',
);
