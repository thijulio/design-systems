/**
 * Token manifest formats (Style Dictionary `format`s).
 *
 * A machine-readable index of every token exactly as the CSS platform names
 * it: custom-property name, source path and file, resolved value, the tokens
 * it aliases, a kind from the shared value classifier, and the accessor for
 * the same token in the React Native tree. Feeds the Storybook color
 * catalogs. Additive: tokens.css / tokens.js are unchanged.
 *
 * Imported by the SD runner only (via `platforms.ts`); the `style-dictionary`
 * import is type-only so this module stays Jest-friendly.
 */
import { basename } from 'node:path';
import type {
  Format,
  FormatFnArguments,
  TransformedToken,
} from 'style-dictionary/types';
import { normalize, type Normalized } from '../values.js';

/** Bump on any breaking change to the shapes below; consumers check it. */
export const MANIFEST_VERSION = 1;

export type ManifestKind =
  'color' | 'dimension' | 'duration' | 'easing' | 'number' | 'other';

export interface ManifestToken {
  /** CSS custom property, including `--` and any platform prefix. */
  name: string;
  /** Path in the source JSON, e.g. `['n', '500']`. */
  path: string[];
  /** File name of the JSON that defined the token, e.g. `color.json`. */
  source: string;
  /** Resolved value, as the CSS platform transforms it. */
  value: string;
  /** Custom properties this token aliases, in order of appearance. */
  references: string[];
  kind: ManifestKind;
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
  version: typeof MANIFEST_VERSION;
  tokens: ManifestToken[];
  themes: ManifestTheme[];
}

const KIND: Record<Normalized['kind'], ManifestKind> = {
  color: 'color',
  dimension: 'dimension',
  duration: 'duration',
  easing: 'easing',
  integer: 'number',
  decimal: 'number',
  opaque: 'other',
};

const REFERENCE_RE = /\{([^}]+)\}/g;
const IDENTIFIER_RE = /^[A-Za-z_$][\w$]*$/;

/**
 * The React Native accessor for a token path. The native tree is nested by
 * exactly these path segments (see `buildTree` in `values.ts`).
 */
export function nativeAccessor(path: string[]): string {
  return path.reduce(
    (expr, seg) =>
      IDENTIFIER_RE.test(seg) ? `${expr}.${seg}` : `${expr}['${seg}']`,
    'tokens',
  );
}

type Dictionary = FormatFnArguments['dictionary'];

/** Manifest entries for the tokens a file emits (`allTokens` is already filtered). */
export function manifestTokens(dictionary: Dictionary): ManifestToken[] {
  // References may point outside the filter, e.g. a theme overlay aliasing a
  // base palette token, so look them up in the unfiltered set.
  const lookup = new Map(
    (dictionary.unfilteredAllTokens ?? dictionary.allTokens).map((t) => [
      t.path.join('.'),
      t,
    ]),
  );
  return dictionary.allTokens.map((token) => toEntry(token, lookup));
}

function toEntry(
  token: TransformedToken,
  lookup: Map<string, TransformedToken>,
): ManifestToken {
  const value = String(token.value);
  const original = String(token.original.value ?? '');
  const references = [...original.matchAll(REFERENCE_RE)]
    .map(([, ref]) => lookup.get(ref))
    .filter((t): t is TransformedToken => t !== undefined)
    .map((t) => `--${t.name}`);
  return {
    name: `--${token.name}`,
    path: token.path,
    source: basename(token.filePath),
    value,
    references,
    kind: KIND[normalize(value).kind],
    native: { accessor: nativeAccessor(token.path) },
  };
}

const json = (data: unknown): string => `${JSON.stringify(data, null, 2)}\n`;

/** `tokens.manifest.json`: base tokens; the runner appends `themes`. */
const manifestJson: Format = {
  name: 'thijulio/manifest-json',
  format: ({ dictionary }: FormatFnArguments) =>
    json({
      version: MANIFEST_VERSION,
      tokens: manifestTokens(dictionary),
      themes: [],
    } satisfies TokenManifest),
};

/** One theme overlay's entries (filtered upstream), merged by the runner. */
const manifestThemeJson: Format = {
  name: 'thijulio/manifest-theme-json',
  format: ({ dictionary }: FormatFnArguments) =>
    json(manifestTokens(dictionary)),
};

/** All manifest formats, registered once by `platforms.ts`. */
export const manifestFormats: Format[] = [manifestJson, manifestThemeJson];
