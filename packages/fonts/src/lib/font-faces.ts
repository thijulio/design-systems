/**
 * Self-hosted webfonts — the pure half: the brand manifest types, how a
 * manifest becomes `@font-face` rules, and how those rules are parsed back.
 * No filesystem access here (see build-fonts.ts / verify-fonts.ts), so it is
 * unit-tested directly.
 */

/** Every brand ships exactly these subsets. latin covers PT/FR/EN accents. */
export const FONT_SUBSETS = ['latin', 'latin-ext'] as const;
export type FontSubset = (typeof FONT_SUBSETS)[number];

export type FontStyle = 'normal' | 'italic';

/**
 * What a face does while its file loads. `swap` (the default) renders the
 * fallback, then swaps the webfont in whenever it arrives: right for apps and
 * for any page that does not preload its fonts. `optional` uses the webfont
 * only if it is ready at first render, otherwise the fallback for that page
 * view: no layout shift, for pages that preload their first-screen faces.
 */
export type FontDisplay = 'swap' | 'optional';

/**
 * Where a family's woff2 files come from. Fontsource names its files
 * `<slug>-<subset>-<axes>-<style>.woff2` (variable) and
 * `<slug>-<subset>-<weight>-<style>.woff2` (static).
 */
export type FontSource =
  /** One file per style per subset covering a weight range (`@fontsource-variable/*`). */
  | {
      kind: 'variable';
      package: string;
      /** `wght` = weight axis only; `opsz` = weight + optical size. */
      axes: 'wght' | 'opsz';
    }
  /** One file per weight per style per subset (`@fontsource/*`). */
  | { kind: 'static'; package: string };

/**
 * A system font that stands in for a webfont until the webfont loads,
 * declared as its own family: `'<family> Fallback <name>'`. Its face is
 * resized (`size-adjust`) to the webfont's average advance and given the
 * webfont's vertical metrics (`ascent-`/`descent-`/`line-gap-override`), so
 * swapping the webfont in moves the text as little as the two designs allow
 * — not at all for a monospace pair, whose advances match exactly.
 */
export interface FallbackFont {
  /** Appended to the family name: `'<family> Fallback <name>'`. */
  name: string;
  /**
   * The `@capsizecss/metrics` entry measured for the system font, e.g.
   * `timesNewRoman` (its `/regular` or `/italic` metrics are used per style).
   */
  metrics: string;
  /**
   * The `local()` names to try, per style the family contracts: full and
   * PostScript names, most common first. Metric-compatible clones (Liberation,
   * Tinos, Cousine, Arimo) share the face: same advances, same overrides.
   */
  local: Partial<Record<FontStyle, readonly string[]>>;
}

export interface FontFamily {
  /** The CSS `font-family` name the brand's tokens reference. */
  family: string;
  source: FontSource;
  /** Weights each style must render — the brand's font contract. */
  styles: Partial<Record<FontStyle, readonly number[]>>;
  /**
   * Metric-matched fallbacks, in the order the brand's font tokens list them
   * right after `family`. None: the tokens fall straight to system fonts.
   */
  fallbacks?: readonly FallbackFont[];
}

export type BrandFonts = readonly FontFamily[];

/** One `@font-face` rule to emit, plus the fontsource file that backs it. */
export interface PlannedFontFace {
  family: string;
  style: FontStyle;
  weight: readonly [min: number, max: number];
  subset: FontSubset;
  unicodeRange: string;
  /** Package that ships `file` (resolved as `<package>/files/<file>`). */
  package: string;
  /** woff2 basename — identical in the fontsource package and in dist/fonts/. */
  file: string;
}

/** `@fontsource-variable/hanken-grotesk` → `hanken-grotesk` (fontsource's file prefix). */
export const fontSlug = (pkg: string): string =>
  pkg.slice(pkg.lastIndexOf('/') + 1);

/** Name the OFL licence of `pkg` is shipped under in dist/fonts/. */
export const licenseFileName = (pkg: string): string =>
  `LICENSE-${fontSlug(pkg)}.txt`;

/**
 * Overlapping unicode-ranges (U+0304, U+0308, U+0329 are in both) resolve to
 * the face declared LAST, so latin-ext is emitted first and latin wins —
 * the same order Google Fonts and fontsource use.
 */
const EMIT_ORDER: readonly FontSubset[] = ['latin-ext', 'latin'];

/**
 * Expand a manifest into `@font-face` rules. A variable family gets one face
 * per style per subset spanning exactly the contracted weights (not the file's
 * full axis range: weights outside the contract keep matching the nearest
 * contracted weight, as they did with Google Fonts); a static family gets one
 * face per weight.
 */
export function planFontFaces(
  fonts: BrandFonts,
  unicodeRange: (pkg: string, subset: FontSubset) => string,
): PlannedFontFace[] {
  const faces: PlannedFontFace[] = [];
  for (const { family, source, styles } of fonts) {
    const slug = fontSlug(source.package);
    for (const [style, weights] of Object.entries(styles) as [
      FontStyle,
      readonly number[],
    ][]) {
      if (weights.length === 0)
        throw new Error(`${family} ${style}: no weights listed`);
      const sorted = [...weights].sort((a, b) => a - b);
      for (const subset of EMIT_ORDER) {
        const base = {
          family,
          style,
          subset,
          unicodeRange: unicodeRange(source.package, subset),
          package: source.package,
        };
        if (source.kind === 'variable') {
          faces.push({
            ...base,
            weight: [sorted[0], sorted[sorted.length - 1]],
            file: `${slug}-${subset}-${source.axes}-${style}.woff2`,
          });
        } else {
          for (const weight of sorted)
            faces.push({
              ...base,
              weight: [weight, weight],
              file: `${slug}-${subset}-${weight}-${style}.woff2`,
            });
        }
      }
    }
  }
  return faces;
}

/** The family name a fallback face declares, as the brand's tokens list it. */
export const fallbackFamily = (
  family: string,
  fallback: FallbackFont,
): string => `${family} Fallback ${fallback.name}`;

/** Vertical metrics and average advance, as `@capsizecss/*` report them. */
export interface FontMetrics {
  ascent: number;
  /** Negative below the baseline, as in the font's tables. */
  descent: number;
  lineGap: number;
  unitsPerEm: number;
  /** Average advance of latin text, weighted by letter frequency. */
  xWidthAvg: number;
}

/** One metric-matched fallback face to emit, and what to measure for it. */
export interface PlannedFallbackFace {
  /** `'<family> Fallback <name>'`. */
  family: string;
  style: FontStyle;
  local: readonly string[];
  /** The webfont file whose metrics the face matches (the latin subset). */
  webfont: { package: string; file: string };
  /** `@capsizecss/metrics` module of the system font, e.g. `timesNewRoman/italic`. */
  metrics: string;
}

/**
 * Plan one fallback face per fallback per contracted style. The webfont is
 * measured on its latin file: the variable file's default instance, or the
 * static weight closest to 400 (the body weight, which most text renders in).
 */
export function planFallbackFaces(fonts: BrandFonts): PlannedFallbackFace[] {
  const faces: PlannedFallbackFace[] = [];
  for (const { family, source, styles, fallbacks = [] } of fonts) {
    const slug = fontSlug(source.package);
    for (const [style, weights] of Object.entries(styles) as [
      FontStyle,
      readonly number[],
    ][]) {
      const body = [...weights].sort(
        (a, b) => Math.abs(a - 400) - Math.abs(b - 400) || a - b,
      )[0];
      const file =
        source.kind === 'variable'
          ? `${slug}-latin-${source.axes}-${style}.woff2`
          : `${slug}-latin-${body}-${style}.woff2`;
      for (const fallback of fallbacks) {
        const local = fallback.local[style];
        if (!local?.length)
          throw new Error(
            `${fallbackFamily(family, fallback)}: no local() names for ${style}`,
          );
        faces.push({
          family: fallbackFamily(family, fallback),
          style,
          local,
          webfont: { package: source.package, file },
          metrics: `${fallback.metrics}/${style === 'italic' ? 'italic' : 'regular'}`,
        });
      }
    }
  }
  return faces;
}

/** The descriptors that make a fallback face take the webfont's room. */
export interface FallbackOverrides {
  sizeAdjust: number;
  ascentOverride: number;
  descentOverride: number;
  lineGapOverride: number;
}

/**
 * Capsize's formula: scale the fallback so its average advance equals the
 * webfont's, then give it the webfont's vertical metrics. The overrides are
 * fractions of the used font size, which `size-adjust` has already scaled —
 * hence the division.
 */
export function fallbackOverrides(
  webfont: FontMetrics,
  fallback: FontMetrics,
): FallbackOverrides {
  const sizeAdjust =
    webfont.xWidthAvg /
    webfont.unitsPerEm /
    (fallback.xWidthAvg / fallback.unitsPerEm);
  const share = (value: number) =>
    Math.abs(value) / webfont.unitsPerEm / sizeAdjust;
  return {
    sizeAdjust,
    ascentOverride: share(webfont.ascent),
    descentOverride: share(webfont.descent),
    lineGapOverride: share(webfont.lineGap),
  };
}

export type ResolvedFallbackFace = PlannedFallbackFace & FallbackOverrides;

/** `0.92973` → `92.97%`: how fallback descriptors are written. */
export const percent = (fraction: number): string =>
  `${Number((fraction * 100).toFixed(2))}%`;

/** Render resolved fallback faces: `local()` sources only, no font-display. */
export function renderFallbackFaces(
  faces: readonly ResolvedFallbackFace[],
): string {
  return faces
    .map(
      (
        face,
      ) => `/* ${face.family} ${face.style}: metric-matched to ${face.webfont.file} */
@font-face {
  font-family: '${face.family}';
  font-style: ${face.style};
  src: ${face.local.map((name) => `local('${name}')`).join(', ')};
  size-adjust: ${percent(face.sizeAdjust)};
  ascent-override: ${percent(face.ascentOverride)};
  descent-override: ${percent(face.descentOverride)};
  line-gap-override: ${percent(face.lineGapOverride)};
}`,
    )
    .join('\n\n');
}

const formatWeight = ([min, max]: PlannedFontFace['weight']): string =>
  min === max ? `${min}` : `${min} ${max}`;

export interface RenderFontFacesOptions {
  /** Directory the `src` urls are relative to. Defaults to `./fonts`. */
  fontsDir?: string;
  /** Defaults to `swap`. */
  display?: FontDisplay;
  /** Metric-matched fallback faces, emitted after the webfont faces. */
  fallbacks?: readonly ResolvedFallbackFace[];
}

/** Render planned faces as CSS whose `src` urls are relative to `fontsDir`. */
export function renderFontFaces(
  faces: readonly PlannedFontFace[],
  {
    fontsDir = './fonts',
    display = 'swap',
    fallbacks = [],
  }: RenderFontFacesOptions = {},
): string {
  const header = `/* Webfonts — AUTO-GENERATED by @thijulio/fonts from fonts.config.mjs; do not
   edit. Self-hosted (no third-party requests): the woff2 files and their SIL
   OFL 1.1 licences ship in ${fontsDir}/, next to this bundle. */`;
  const rules = faces.map(
    (
      face,
    ) => `/* ${fontSlug(face.package)} ${face.style} ${formatWeight(face.weight)} ${face.subset} */
@font-face {
  font-family: '${face.family}';
  font-style: ${face.style};
  font-weight: ${formatWeight(face.weight)};
  font-display: ${display};
  src: url('${fontsDir}/${face.file}') format('woff2');
  unicode-range: ${normalizeUnicodeRange(face.unicodeRange)};
}`,
  );
  const fallbackRules = fallbacks.length
    ? [renderFallbackFaces(fallbacks)]
    : [];
  return [header, ...rules, ...fallbackRules].join('\n\n');
}

/** `U+0000-00FF,U+0131` and `U+0000-00FF, U+0131` compare equal. */
export const normalizeUnicodeRange = (range: string): string =>
  range
    .split(',')
    .map((part) => part.trim().toUpperCase())
    .filter(Boolean)
    .join(', ');

/** A parsed `@font-face` rule — what a browser would see. */
export interface ParsedFontFace {
  family: string;
  style: string;
  weight: readonly [min: number, max: number];
  display: string | undefined;
  srcUrls: string[];
  /** `local()` names in `src`, in order. */
  srcLocals: string[];
  unicodeRange: string | undefined;
  sizeAdjust: string | undefined;
  ascentOverride: string | undefined;
  descentOverride: string | undefined;
  lineGapOverride: string | undefined;
}

export const stripCssComments = (css: string): string =>
  css.replace(/\/\*[\s\S]*?\*\//g, '');

/** Parse every `@font-face` rule in a stylesheet. */
export function parseFontFaces(css: string): ParsedFontFace[] {
  return [...stripCssComments(css).matchAll(/@font-face\s*\{([^}]*)\}/g)].map(
    ([, body]) => {
      const prop = (name: string): string | undefined =>
        body
          .match(new RegExp(`(?:^|;)\\s*${name}\\s*:\\s*([^;]+)`))?.[1]
          ?.trim();
      const [min, max = min] = (prop('font-weight') ?? '400')
        .split(/\s+/)
        .map(Number);
      return {
        family: (prop('font-family') ?? '').replace(/^['"]|['"]$/g, ''),
        style: prop('font-style') ?? 'normal',
        weight: [min, max],
        display: prop('font-display'),
        srcUrls: [
          ...(prop('src') ?? '').matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/g),
        ].map((m) => m[2]),
        srcLocals: [
          ...(prop('src') ?? '').matchAll(/local\(\s*(['"]?)(.*?)\1\s*\)/g),
        ].map((m) => m[2]),
        unicodeRange: prop('unicode-range'),
        sizeAdjust: prop('size-adjust'),
        ascentOverride: prop('ascent-override'),
        descentOverride: prop('descent-override'),
        lineGapOverride: prop('line-gap-override'),
      };
    },
  );
}
