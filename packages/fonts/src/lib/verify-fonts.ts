import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, relative, sep } from 'node:path';
import {
  createFontsourceResolver,
  inScope,
  resolveFallbackFaces,
  type FaceScope,
  type FontMetricsLoader,
} from './build-fonts.js';
import {
  FONT_SUBSETS,
  licenseFileName,
  normalizeUnicodeRange,
  percent,
  parseFontFaces,
  stripCssComments,
  type BrandFonts,
  type FontDisplay,
  type FontStyle,
} from './font-faces.js';

/** A stylesheet the package ships, and the faces it must declare. */
export interface FontStylesheet {
  /** Path relative to `dist`. */
  file: string;
  /**
   * The `font-display` of its faces: the file must lead with the brand's full
   * face set. `null`: it must declare no `@font-face` (a sibling stylesheet
   * brings the faces).
   */
  display: FontDisplay | null;
  /** A per-face stylesheet: only this family × style's faces and fallbacks. */
  only?: FaceScope;
}

export interface VerifyFontsOptions {
  /** The brand css package root (resolves its fontsource devDependencies). */
  packageRoot: string;
  /** The package's build output — everything a consumer can load. */
  dist: string;
  /** Every stylesheet in `dist`; an unlisted one fails verification. */
  stylesheets: readonly FontStylesheet[];
  fonts: BrandFonts;
  /** Defaults to capsize. */
  metrics?: FontMetricsLoader;
}

const isFont = (file: string) => file.endsWith('.woff2');
// OFL licence texts cite https URLs but are never loaded by a browser.
const isLicense = (file: string) =>
  /^LICENSE-[^/\\]+\.txt$/.test(file.split(sep).pop() ?? '');

/**
 * Assert the built package makes no third-party requests and honours the
 * brand's font contract. Re-derives every expectation from the manifest and
 * fontsource metadata — it never trusts the generator's plan. Throws one Error
 * listing every violation.
 */
export async function verifyFonts({
  packageRoot,
  dist,
  stylesheets,
  fonts,
  metrics,
}: VerifyFontsOptions): Promise<void> {
  const problems: string[] = [];
  const fail = (msg: string) => problems.push(msg);

  const files = (await readdir(dist, { recursive: true, withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name));
  const rel = (file: string) => relative(dist, file);

  // (a) Nothing a browser can load names an absolute URL — no url(https://…),
  // no @import of a font CDN, not even in a comment that might be uncommented.
  for (const file of files.filter((f) => !isFont(f) && !isLicense(f))) {
    const hit = (await readFile(file, 'utf-8')).match(/https?:\/\/\S+/i);
    if (hit) fail(`${rel(file)} references an external URL: ${hit[0]}`);
  }

  // (b) Every url() / @import in every stylesheet is relative and resolves to
  // a file inside dist.
  const referenced = new Set<string>();
  for (const file of files.filter((f) => f.endsWith('.css'))) {
    const css = stripCssComments(await readFile(file, 'utf-8'));
    const refs = [
      ...[...css.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/g)].map((m) => m[2]),
      ...[...css.matchAll(/@import\s+(['"])(.*?)\1/g)].map((m) => m[2]),
    ];
    for (const ref of refs) {
      if (ref.startsWith('data:')) continue;
      if (/^([a-z][a-z0-9+.-]*:|\/)/i.test(ref)) {
        fail(`${rel(file)}: url(${ref}) is not a relative path`);
        continue;
      }
      const target = join(dirname(file), ref.split(/[?#]/)[0]);
      if (!target.startsWith(dist + sep) || !existsSync(target)) {
        fail(`${rel(file)}: url(${ref}) does not resolve to a file in dist`);
        continue;
      }
      referenced.add(target);
    }
  }

  // No dead weight: every shipped font is referenced by some stylesheet.
  for (const font of files.filter(isFont))
    if (!referenced.has(font)) fail(`${rel(font)} is shipped but unused`);

  // Every stylesheet is listed, so none escapes the face checks below.
  const listed = new Set(stylesheets.map(({ file }) => join(dist, file)));
  for (const file of files.filter((f) => f.endsWith('.css')))
    if (!listed.has(file)) fail(`${rel(file)} is not a listed stylesheet`);
  if (!stylesheets.some(({ display }) => display !== null))
    fail('no listed stylesheet declares the faces');

  const resolver = await createFontsourceResolver(packageRoot, fonts);
  const fallbacks = await resolveFallbackFaces(fonts, resolver, metrics);
  const fallbackFamilies = new Set(fallbacks.map((f) => f.family));
  for (const { file, display, only } of stylesheets) {
    if (!existsSync(join(dist, file))) {
      fail(`${file} is listed but was not built`);
      continue;
    }
    const css = await readFile(join(dist, file), 'utf-8');
    const parsed = parseFontFaces(css);

    if (display === null) {
      if (parsed.length > 0)
        fail(`${file}: must declare no @font-face (found ${parsed.length})`);
      continue;
    }
    const faces = parsed.filter((f) => !fallbackFamilies.has(f.family));
    const scoped = inScope(only);

    // The faces lead the stylesheet, ahead of the tokens that name the families.
    if (!/^\s*@font-face\b/.test(stripCssComments(css)))
      fail(`${file}: the first rule must be an @font-face`);

    for (const face of faces) {
      const id = `${file}: ${face.family} ${face.style} ${face.weight.join('–')}`;
      if (face.display !== display)
        fail(`${id}: font-display must be ${display}`);
      if (face.srcUrls.length === 0 || !face.srcUrls.every(isFont))
        fail(`${id}: src must be woff2 only (${face.srcUrls.join(', ')})`);
      if (!scoped({ family: face.family, style: face.style as FontStyle }))
        fail(`${id}: outside ${only?.family} ${only?.style}`);
    }

    // (d) Every contracted fallback face is declared, local() only, with the
    // overrides the webfont's and the system font's metrics give; none other.
    const expected = fallbacks.filter(scoped);
    for (const want of expected) {
      const id = `${file}: ${want.family} ${want.style}`;
      const got = parsed.filter(
        (f) => f.family === want.family && f.style === want.style,
      );
      if (got.length !== 1) {
        fail(`${id}: expected one fallback @font-face, found ${got.length}`);
        continue;
      }
      const [face] = got;
      if (face.srcUrls.length > 0 || face.display !== undefined)
        fail(
          `${id}: a fallback face has only local() sources, no font-display`,
        );
      if (face.srcLocals.join('|') !== want.local.join('|'))
        fail(`${id}: local() must be ${want.local.join(', ')}`);
      for (const [descriptor, actual, value] of [
        ['size-adjust', face.sizeAdjust, want.sizeAdjust],
        ['ascent-override', face.ascentOverride, want.ascentOverride],
        ['descent-override', face.descentOverride, want.descentOverride],
        ['line-gap-override', face.lineGapOverride, want.lineGapOverride],
      ] as const)
        if (actual !== percent(value))
          fail(
            `${id}: ${descriptor} must be ${percent(value)} (found ${actual})`,
          );
    }
    for (const face of parsed.filter((f) => fallbackFamilies.has(f.family)))
      if (
        !expected.some(
          (w) => w.family === face.family && w.style === face.style,
        )
      )
        fail(`${file}: ${face.family} ${face.style}: unexpected fallback face`);

    // (c) Every contracted family × style × weight has a latin and a latin-ext
    // face, with fontsource's unicode-range for that subset.
    for (const { family, source, styles } of fonts) {
      for (const [style, weights] of Object.entries(styles) as [
        FontStyle,
        readonly number[],
      ][]) {
        if (!scoped({ family, style })) continue;
        for (const subset of FONT_SUBSETS) {
          const range = normalizeUnicodeRange(
            resolver.unicodeRange(source.package, subset),
          );
          for (const weight of weights) {
            const covered = faces.some(
              (f) =>
                f.family === family &&
                f.style === style &&
                f.weight[0] <= weight &&
                weight <= f.weight[1] &&
                normalizeUnicodeRange(f.unicodeRange ?? '') === range,
            );
            if (!covered)
              fail(
                `${file}: ${family} ${style} ${weight}: no ${subset} @font-face`,
              );
          }
        }
      }
    }
  }

  for (const { family, source } of fonts) {
    if (!existsSync(join(dist, 'fonts', licenseFileName(source.package))))
      fail(
        `${family}: OFL licence not shipped (${licenseFileName(source.package)})`,
      );
  }

  if (problems.length > 0)
    throw new Error(
      `Font verification failed:\n${problems.map((p) => `  ✗ ${p}`).join('\n')}`,
    );
}
