import { expect, waitFor } from 'storybook/test';
import primitiveStyles from '@thijulio/primitives/styles.css?inline';

/** Exercise public components with the pre-contract brand token surface. */
export async function withLegacyTokens(check: () => Promise<void>) {
  await waitFor(() =>
    expect(document.getElementById('brand-tokens')?.textContent).toContain(
      ':root',
    ),
  );
  const stylesheet = document.getElementById('brand-tokens');
  if (!stylesheet?.textContent) throw new Error('Brand tokens were not loaded');
  const original = stylesheet.textContent;
  const sharedLast = document.createElement('style');
  sharedLast.textContent = primitiveStyles;
  try {
    stylesheet.textContent = original.replace(/--ds-[a-z0-9-]+\s*:[^;]+;/g, '');
    // The skin must also work when shared property declarations load last.
    document.head.append(sharedLast);
    await check();
  } finally {
    sharedLast.remove();
    stylesheet.textContent = original;
  }
}
