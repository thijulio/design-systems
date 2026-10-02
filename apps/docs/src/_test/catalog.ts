import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import {
  colorCatalog,
  staleNoteKeys,
  UNCATEGORIZED,
  type ColorSection,
  type TokenManifest,
} from '../_foundations/token-manifest.js';
import { contrastRatio } from './contrast.js';

/**
 * Story parameters for a color catalog. axe's `color-contrast` rule costs
 * ~12.5s of a ~16s run on the 95-swatch Exodus catalog (measured), which
 * puts the story near the 30s test timeout. `expectCompleteColorCatalog`
 * asserts the same WCAG AA ratio for every text element in milliseconds;
 * every other axe rule still runs.
 */
export const colorCatalogParameters = {
  a11y: { config: { rules: [{ id: 'color-contrast', enabled: false }] } },
};

/**
 * First opaque background behind `element`, falling back to the page's.
 * A partially translucent layer would need compositing against what is
 * painted beneath it, which this check doesn't model, so it fails loudly
 * instead of measuring the wrong pair.
 */
function effectiveBackground(element: HTMLElement): string {
  for (
    let node: HTMLElement | null = element;
    node;
    node = node.parentElement
  ) {
    const background = getComputedStyle(node).backgroundColor;
    const alpha = background.match(/[\d.]+/g)?.[3];
    if (alpha === undefined || Number(alpha) === 1) return background;
    if (Number(alpha) > 0) {
      throw new Error(
        `Translucent background ${background} behind "${element.textContent?.trim().slice(0, 40)}": the catalog contrast check needs opaque surfaces.`,
      );
    }
  }
  return 'rgb(255, 255, 255)';
}

/** Contract vars the catalog chrome reads; empty means brand CSS isn't applied. */
const CHROME_VARS = [
  '--ds-text',
  '--ds-text-muted',
  '--ds-surface-raised',
  '--ds-border',
];

/**
 * The color a possibly translucent foreground actually paints over an opaque
 * background (source-over compositing), as axe measures it, e.g. Faune's
 * `--ink-muted: rgba(24, 61, 60, 0.74)`.
 */
function paintedColor(foreground: string, background: string): string {
  const [r = 0, g = 0, b = 0, a = 1] =
    foreground.match(/[\d.]+/g)?.map(Number) ?? [];
  const [br = 255, bg = 255, bb = 255] =
    background.match(/[\d.]+/g)?.map(Number) ?? [];
  const mix = (front: number, back: number) =>
    Math.round(front * a + back * (1 - a));
  return `rgb(${mix(r, br)}, ${mix(g, bg)}, ${mix(b, bb)})`;
}

/**
 * Every color token in the manifest renders exactly once, every one is
 * claimed by a curated section (none fall to Uncategorized), every note names
 * a real token, and every piece of text in the catalog meets WCAG AA (4.5:1)
 * against its effective background, with the brand's CSS actually applied.
 */
export async function expectCompleteColorCatalog(
  canvasElement: HTMLElement,
  manifest: TokenManifest,
  {
    sections,
    notes = {},
  }: { sections: ColorSection[]; notes?: Record<string, string> },
) {
  const missingChrome = CHROME_VARS.filter(
    (name) => !getComputedStyle(canvasElement).getPropertyValue(name).trim(),
  );
  await expect(missingChrome).toEqual([]);

  const expected = colorCatalog(manifest, [])
    .flatMap(({ tokens }) => tokens.map((t) => t.name))
    .sort();
  // The page still renders unclaimed tokens (nothing silently disappears),
  // but CI asks for a section so they don't ship as "Uncategorized".
  const uncategorized = colorCatalog(manifest, sections)
    .filter(({ section }) => section === UNCATEGORIZED)
    .flatMap(({ tokens }) => tokens.map((t) => t.name));
  await expect(uncategorized).toEqual([]);
  // Array.from: the lib tsconfig has no dom.iterable, so NodeLists are not iterable.
  const cards = Array.from(
    canvasElement.querySelectorAll<HTMLElement>('[data-token]'),
  );
  await expect(cards.map((card) => card.dataset['token']).sort()).toEqual(
    expected,
  );
  await expect(staleNoteKeys(manifest, notes)).toEqual([]);

  // Collected synchronously and asserted once, so a failure lists every
  // offender and the check stays fast on large catalogs.
  const illegible = Array.from(canvasElement.querySelectorAll<HTMLElement>('*'))
    .filter((el) =>
      Array.from(el.childNodes).some(
        (n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim(),
      ),
    )
    .map((el) => {
      const background = effectiveBackground(el);
      return {
        text: el.textContent?.trim().slice(0, 40),
        ratio: contrastRatio(
          paintedColor(getComputedStyle(el).color, background),
          background,
        ),
      };
    })
    .filter(({ ratio }) => ratio < 4.5);
  await expect(illegible).toEqual([]);
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
    // The accessible name follows the visible label (WCAG 2.5.3).
    await expect(button).toHaveAccessibleName(`Copied ${text}`);

    writeText.mockRejectedValueOnce(
      new DOMException('Denied', 'NotAllowedError'),
    );
    await userEvent.click(button);
    await waitFor(() => expect(button).toHaveTextContent('Copy failed'));
    await expect(button).toHaveAccessibleName(`Copy failed ${text}`);
  } finally {
    // Drop the own-property stub so Navigator.prototype's real getter applies again.
    delete (navigator as { clipboard?: unknown }).clipboard;
  }
}
