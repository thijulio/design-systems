/**
 * Consumer-side model of `@thijulio/<brand>-tokens/tokens.manifest.json`
 * (format v1, written by @thijulio/core). Pure: unit-tested in node.
 */
export const SUPPORTED_MANIFEST_VERSION = 1;

export interface ManifestToken {
  /** CSS custom property, e.g. `--n-500`. */
  name: string;
  path: string[];
  /** Source JSON file name, e.g. `color.json`. */
  source: string;
  /** Resolved web value. */
  value: string;
  /** Custom properties this token aliases. */
  references: string[];
  kind: string;
  native: {
    /** Expression into `@thijulio/<brand>-tokens/native`'s `tokens`, e.g. `tokens.n['500']`. */
    accessor: string;
  };
}

export interface ManifestTheme {
  name: string;
  selector: string;
  tokens: ManifestToken[];
}

export interface TokenManifest {
  version: number;
  tokens: ManifestToken[];
  themes: ManifestTheme[];
}

export interface CatalogToken extends ManifestToken {
  /** Theme name → value, only where that overlay changes the resolved value. */
  overrides: Record<string, string>;
  /** Defined only inside theme overlays; nothing at :root. */
  themeOnly: boolean;
}

export interface ColorSection {
  title: string;
  description?: string;
  match: (token: ManifestToken) => boolean;
}

export interface CatalogGroup {
  section: ColorSection;
  tokens: CatalogToken[];
}

export const UNCATEGORIZED: ColorSection = {
  title: 'Uncategorized',
  description:
    'Color tokens no section claims yet. Give them a section in this story.',
  match: () => true,
};

/** Fixed-meaning feedback colors (`--success`, `--danger-soft`, …). */
export const isSemanticColor = (token: ManifestToken): boolean =>
  /^--(success|warning|danger|info)(-|$)/.test(token.name);

/** Color tokens grouped into `sections` (first match wins), then Uncategorized. */
export function colorCatalog(
  manifest: TokenManifest,
  sections: ColorSection[],
): CatalogGroup[] {
  if (manifest.version !== SUPPORTED_MANIFEST_VERSION) {
    throw new Error(
      `Unsupported token manifest version ${manifest.version}; the docs catalog reads v${SUPPORTED_MANIFEST_VERSION}.`,
    );
  }

  const byName = new Map<string, CatalogToken>();
  for (const token of manifest.tokens) {
    if (token.kind === 'color') {
      byName.set(token.name, { ...token, overrides: {}, themeOnly: false });
    }
  }
  for (const theme of manifest.themes) {
    for (const token of theme.tokens) {
      if (token.kind !== 'color') continue;
      const known = byName.get(token.name);
      if (!known) {
        byName.set(token.name, {
          ...token,
          overrides: { [theme.name]: token.value },
          themeOnly: true,
        });
      } else if (known.themeOnly || token.value !== known.value) {
        known.overrides[theme.name] = token.value;
      }
    }
  }

  const groups: CatalogGroup[] = [...sections, UNCATEGORIZED].map(
    (section) => ({ section, tokens: [] }),
  );
  for (const token of byName.values()) {
    // UNCATEGORIZED matches everything, so a group is always found.
    groups.find(({ section }) => section.match(token))?.tokens.push(token);
  }
  return groups.filter(({ tokens }) => tokens.length > 0);
}

/** Note keys that name no color token, e.g. notes left behind by a rename. */
export function staleNoteKeys(
  manifest: TokenManifest,
  notes: Record<string, string>,
): string[] {
  const names = new Set(
    colorCatalog(manifest, []).flatMap(({ tokens }) =>
      tokens.map((t) => t.name),
    ),
  );
  return Object.keys(notes).filter((name) => !names.has(name));
}
