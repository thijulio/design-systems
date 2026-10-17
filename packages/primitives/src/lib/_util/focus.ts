/**
 * Tabbable lookup used by Dialog: anything focusable with a non-negative
 * tabIndex that is not `:disabled`, hidden, inert, or inside a closed
 * `<details>` (whose `<summary>` itself stays tabbable). Visibility is
 * read from attributes, not layout, so it holds in jsdom too.
 */
const FOCUSABLE =
  'a[href], button, input:not([type="hidden"]), select, textarea, summary, [tabindex], [contenteditable="true"]';

const isOutOfReach = (element: HTMLElement): boolean =>
  element.closest('[hidden], [inert]') !== null ||
  element.closest('details:not([open]) > :not(summary)') !== null;

export function tabbableWithin(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (element) =>
      element.tabIndex >= 0 &&
      !element.matches(':disabled') &&
      !isOutOfReach(element),
  );
}

/**
 * Where Tab should land instead of its native next stop, or `undefined` to let
 * it through. Focus outside the container (a focused control was disabled or
 * unmounted, dropping it to the body) re-enters at the end the key travels
 * towards.
 */
export function wrapTarget(
  container: HTMLElement,
  backwards: boolean,
): HTMLElement | undefined {
  const tabbable = tabbableWithin(container);
  const active = container.ownerDocument.activeElement;
  const isInside = active !== null && container.contains(active);
  if (backwards) {
    return !isInside || active === tabbable[0]
      ? tabbable[tabbable.length - 1]
      : undefined;
  }
  return !isInside || active === tabbable[tabbable.length - 1]
    ? tabbable[0]
    : undefined;
}
