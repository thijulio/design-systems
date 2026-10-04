// The catalog's single sidebar model. Every story title is
// `<DesignSystem>/<Section>/…`; the manager's "Design system" picker shows one
// design system's tree at a time, and preview.tsx injects that design
// system's tokens. Pure logic only, so it is unit-tested in node
// (design-system.spec.ts). preview.tsx `storySort` mirrors SECTIONS as a
// literal: Storybook reads it statically and cannot follow imports.

export const DESIGN_SYSTEMS = ['Biome', 'Exodus', 'Faune'] as const;
export type DesignSystem = (typeof DESIGN_SYSTEMS)[number];

/** Picker value that shows every design system's tree. */
export const ALL = 'All';
export type Selection = DesignSystem | typeof ALL;

/** Sidebar sections, in order. Each design system uses the same ones. */
export const SECTIONS = ['Foundations', 'Components', 'Migration'] as const;

/** Catalog-wide pages that belong to no design system; always visible. */
export const UNBRANDED_TITLES: readonly string[] = ['Introduction'];

/** The leaf-entry fields the picker needs from Storybook's index. */
export interface CatalogEntry {
  id: string;
  title: string;
  name: string;
  type: 'story' | 'docs';
}

export function designSystemOf(
  title: string | undefined,
): DesignSystem | undefined {
  const first = title?.split('/')[0];
  return DESIGN_SYSTEMS.find((ds) => ds === first);
}

export function isSelection(value: unknown): value is Selection {
  return value === ALL || DESIGN_SYSTEMS.some((ds) => ds === value);
}

/** Sidebar filter: does `title` belong in the tree for `selection`? */
export function isVisible(title: string, selection: Selection): boolean {
  if (selection === ALL) return true;
  const ds = designSystemOf(title);
  return ds === undefined || ds === selection;
}

/**
 * Where to land when switching to `target` from the page `currentTitle`
 * (story `currentName`): the same page and story if the target has them, else
 * that page's Docs entry or first story, else the target's Foundations, else
 * its first entry. `entries` must be in sidebar order.
 */
export function counterpartEntry(
  currentTitle: string | undefined,
  currentName: string | undefined,
  target: DesignSystem,
  entries: readonly CatalogEntry[],
): CatalogEntry | undefined {
  const pageOf = (title: string) => {
    const page = entries.filter((e) => e.title === title);
    return (
      page.find((e) => e.name === currentName) ??
      page.find((e) => e.type === 'docs') ??
      page[0]
    );
  };

  const current = designSystemOf(currentTitle);
  const samePage =
    current && currentTitle
      ? pageOf(target + currentTitle.slice(current.length))
      : undefined;

  return (
    samePage ??
    pageOf(`${target}/Foundations`) ??
    entries.find((e) => designSystemOf(e.title) === target)
  );
}

/**
 * Why `title` breaks the shared sidebar taxonomy, or undefined if it follows
 * it: `<DesignSystem>/Foundations[/<Page>]`, `<DesignSystem>/Components/<Name>`
 * (flat), or `<DesignSystem>/Migration/<Name>[/…]`.
 */
export function taxonomyViolation(title: string): string | undefined {
  if (UNBRANDED_TITLES.includes(title)) return undefined;

  const segments = title.split('/');
  if (segments.some((s) => s === '' || s.trim() !== s)) {
    return `"${title}" has an empty or padded segment`;
  }

  const [ds, section, ...rest] = segments;
  if (!designSystemOf(ds)) {
    return `"${title}" must start with a design system (${DESIGN_SYSTEMS.join(', ')}) or be one of: ${UNBRANDED_TITLES.join(', ')}`;
  }

  switch (section) {
    case 'Foundations':
      return rest.length <= 1
        ? undefined
        : `"${title}": Foundations allows at most one page level`;
    case 'Components':
      if (rest.length === 0) return `"${title}" needs a component name`;
      return rest.length === 1
        ? undefined
        : `"${title}": Components is flat — use ${ds}/Components/<Name>`;
    case 'Migration':
      return rest.length >= 1
        ? undefined
        : `"${title}": Migration needs a page name`;
    default:
      return `"${title}" must use a section from: ${SECTIONS.join(', ')}`;
  }
}
