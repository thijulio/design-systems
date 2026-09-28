/** DOM-simulated hover does not activate CSS :hover. Use the browser provider. */
export async function hoverInBrowserTest(element: Element) {
  // Storybook previews remain manually hoverable outside the Vitest browser.
  if (!('__vitest_browser__' in globalThis)) return false;
  const { userEvent } = await import('vitest/browser');
  await userEvent.hover(element);
  return true;
}
