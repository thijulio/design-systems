import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import {
  colorCatalog,
  staleNoteKeys,
  type TokenManifest,
} from '../_foundations/token-manifest.js';
import { contrastRatio } from './contrast.js';

/**
 * Every color token in the manifest renders exactly once, every note names a
 * real token, and every caption stays legible on its card.
 */
export async function expectCompleteColorCatalog(
  canvasElement: HTMLElement,
  manifest: TokenManifest,
  notes: Record<string, string> = {},
) {
  const expected = colorCatalog(manifest, [])
    .flatMap(({ tokens }) => tokens.map((t) => t.name))
    .sort();
  // Array.from: the lib tsconfig has no dom.iterable, so NodeLists are not iterable.
  const cards = Array.from(
    canvasElement.querySelectorAll<HTMLElement>('[data-token]'),
  );
  await expect(cards.map((card) => card.dataset['token']).sort()).toEqual(
    expected,
  );
  await expect(staleNoteKeys(manifest, notes)).toEqual([]);

  for (const card of cards) {
    const background = getComputedStyle(card).backgroundColor;
    const labels = Array.from(
      card.querySelectorAll<HTMLElement>('figcaption code, figcaption > span'),
    );
    for (const label of labels) {
      await expect(
        contrastRatio(getComputedStyle(label).color, background),
      ).toBeGreaterThanOrEqual(4.5);
    }
  }
}

/**
 * The "Copy <text>" button writes exactly `text`; a rejected clipboard write
 * (insecure context, denied permission) shows "Copy failed" instead of throwing.
 */
export async function expectCopyInteraction(
  canvasElement: HTMLElement,
  text: string,
) {
  const button = within(canvasElement).getByRole('button', {
    name: `Copy ${text}`,
  });
  const writeText = fn(async (): Promise<void> => undefined);
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
  try {
    await userEvent.click(button);
    await expect(writeText).toHaveBeenCalledWith(text);
    await waitFor(() => expect(button).toHaveTextContent('Copied'));

    writeText.mockRejectedValueOnce(
      new DOMException('Denied', 'NotAllowedError'),
    );
    await userEvent.click(button);
    await waitFor(() => expect(button).toHaveTextContent('Copy failed'));
  } finally {
    // Drop the own-property stub so Navigator.prototype's real getter applies again.
    delete (navigator as { clipboard?: unknown }).clipboard;
  }
}
