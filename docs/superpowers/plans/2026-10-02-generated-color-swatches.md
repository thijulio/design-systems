# Generated Color Swatches Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every brand's Storybook `Foundations → Colors` page lists every color token, generated from the token build, with its exact CSS custom-property name, value, alias, theme overrides, and a copy button. The page stays complete when someone adds or renames a token.

**Architecture:** `@thijulio/core` gains a Style Dictionary format that writes `dist/tokens.manifest.json` next to `tokens.css`. The manifest is a machine-readable index produced with the same name transforms as the CSS platform. The three tokens packages export it. `apps/docs` gets a brand-neutral `ColorCatalog` component, styled only with the shared `--ds-*` contract. Each brand's Colors story feeds it that brand's manifest plus a short list of editorial sections. Swatch fills use `var(--name)`, so they follow the toolbar theme or mode live.

**Tech Stack:** Node 24, npm workspaces, Nx 23, TypeScript 5.9, Style Dictionary 5.5, Jest + SWC (core), Storybook 10 + Vitest browser (Playwright/Chromium), React.

**Spec:** No separate spec doc. The decisions were agreed in the 2026-10-02 session and are recorded in **Decisions** below. `AGENTS.md` remains authoritative for repo conventions.

## Amendment (2026-10-02): "web and native"

Thiago asked for the catalog to serve **web** (the planned Web Components alongside `-react`) and **native** (React Native).

- **Web Components:** confirmed with the "Biome/PMP design system re-sync" session. The planned WC packages read `var(--ds-*)` (shared elements) or brand vars (brand-only elements), inherited from the host page's `<brand>-css`. No new build output is needed: the CSS var names this catalog already shows are exactly what WC code uses. Nothing to build for WC now.
- **React Native:** each manifest entry gains `native: { accessor }`. This is the JS expression into `@thijulio/<brand>-tokens/native`'s `tokens` tree: `tokens.n['500']`, `tokens['accent-50']`, `tokens.ds.brand`. Core derives it from the token `path` (the same key `buildTree` uses), with `.seg` for identifier-safe segments and `['seg']` otherwise. Each card gets a second copyable row with the RN accessor. `ColorCatalog` takes a `brand` prop and renders a short usage header: web uses `var(--name)` from `@thijulio/<brand>-css`; RN uses `import { tokens, themes, resolve } from '@thijulio/<brand>-tokens/native'`, with themed values via `resolve(tokens, themes.<name>)`, shown only when the brand has themes.
- **Task changes:**
  - Task 1: `ManifestToken.native`, `nativeAccessor(path)`, and specs for it.
  - Task 2: each `verify.mjs` walks every manifest accessor into the built `native/tokens.js` and asserts a leaf exists. For colors it also asserts the same color, ignoring case.
  - Task 3: docs `ManifestToken.native`.
  - Task 4: RN row, `brand` prop, and a usage header. `expectCopyInteraction` takes the exact copied text, so it covers both `var(--accent)` and `tokens.accent`.
- Flutter/Dart names are **not** in scope (not requested). The manifest's `native` object leaves room for a `dart` sibling later.

## Decisions (the spec)

1. **Data source = a new manifest, not `tokens.js`.** The built `tokens.js` only has PascalCase JS names and base values (`export const Accent50 = "#f2f7f2"`). It has no CSS var name, path, source file, alias, or theme data. Parsing `tokens.css` in the docs would work, but it would add a second parser of our own output and still lose the source file.
2. **Manifest entry shape (v1):** `{ name, path, source, value, references, kind }`.
   - `name`: `--` plus the CSS-platform token name, prefix included.
   - `source`: the file basename.
   - `value`: the resolved value after the CSS transforms.
   - `references`: the CSS names this token aliases.
   - `kind`: from the existing shared classifier `normalize()` in `packages/core/src/lib/values.ts`.
   - Top level is `{ version: 1, tokens, themes: [{ name, selector, tokens }] }`.
3. **Catalog membership is generated; presentation is curated.** Stories declare ordered sections (`title`, `description`, `match`). A token goes into the first section that matches. Unmatched color tokens go into a trailing "Uncategorized" section, so they never disappear. Human labels (Biome's "Pine Ink · text") live in a per-story `notes` map keyed by CSS name, and a test fails if a key names no token.
4. **Copy** copies `var(--name)`. If the Clipboard API is missing or denied, the button shows "Copy failed" instead of throwing.
5. **Displayed values are deterministic.** Each card shows the `:root` value plus one row per theme that changes it. Values aren't read from the DOM, which avoids a race with the preview decorator injecting brand CSS in its own effect.
6. **Out of scope:** Typography, Spacing, and Motion stories; moving notes into token JSON `comment`s (that changes `tokens.css` bytes); Exodus `Themes` story.

## Global Constraints

- Use Node 24 (`.nvmrc` = `24`). This machine was on 22.13 during planning, so run `nvm use` first.
- Run project tasks through Nx: `npx nx …`. Package manager is npm with the committed `package-lock.json`.
- The web outputs `tokens.css`, `tokens.js`, and `tokens.d.ts` must stay byte-for-byte unchanged. The manifest is purely additive.
- Token JSON authoring rules in `AGENTS.md` ("do not fix") are untouched. No token JSON edits in this plan.
- `packages/core` must stay Jest-friendly: the new format module may only `import type` from `style-dictionary`.
- Storybook consumes **built** packages. Rebuild the tokens packages before running or testing Storybook.
- Story titles keep their brand prefix (`Exodus/Foundations`, …). The preview decorator depends on it.
- Catalog chrome uses only `--ds-*` contract variables. Every brand defines the ones used: `--ds-font-body`, `--ds-text`, `--ds-text-muted`, `--ds-surface-raised`, `--ds-border`, `--ds-radius-md`.
- Format every touched file with the repo's Prettier (`npx prettier --write <files>`) before committing. Snippets in this plan are not pre-formatted.
- Commits use Conventional Commits with lower-case subjects (commitlint `subject-case`). End each commit message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Release impact: commits touching `packages/**` publish on merge. A `feat` in `core` bumps every package `nx affected` links to it, starting with the three tokens packages. Preview this with `gh workflow run release.yml -f dry_run=true --ref <branch>` before merging.

## Review Focus

1. **A token defined only in a theme overlay** must still get a swatch, labelled "theme only", with its per-theme values. It must not vanish. Pinned in Task 3 (`lists a token defined only inside theme overlays`).
2. **A theme overlay that restates the base value** (Exodus `sage`) must not add a noisy override row. Only real changes show. Pinned in Task 3 (`records theme overrides only where the resolved value changes`).
3. **A newly added color token with no matching section** must appear under "Uncategorized", and the page must stay complete. Pinned in Task 3 (unit) and Tasks 4–6 (`expectCompleteColorCatalog`).
4. **Clipboard unavailable or permission denied** (plain-http host, locked-down browser) must show "Copy failed", with no unhandled rejection. Pinned in Task 4 (`expectCopyInteraction`, rejected-promise path).
5. **A prefixed brand (`prefix: 'bm'`)** must get manifest names identical to its CSS custom properties. Pinned in Task 2: the config spec asserts the shared `transformGroup`/`prefix`, and each `verify.mjs` asserts the manifest names equal the declared vars per CSS block.

**Known limitations (accepted, not tested):**

- Colors written as `hsl()`, `oklch()`, or named keywords classify as `other` (the same policy native/Dart already use), so they would be left out of the catalog. Today no token uses those formats; I checked by grepping every literal `value` under `packages/*/tokens/src`.
- The `docs:typecheck` cache inputs don't include the manifest JSON. A manifest _shape_ change in `core` could therefore hit a stale typecheck cache. Mitigation: shape changes bump `MANIFEST_VERSION`, and the catalog throws on an unknown version at runtime, which `test-storybook` catches.

---

## File Structure

| Path                                                         | Action | Responsibility                                                           |
| ------------------------------------------------------------ | ------ | ------------------------------------------------------------------------ |
| `packages/core/src/lib/formats/manifest.ts`                  | Create | Manifest types, entry builder, two SD formats                            |
| `packages/core/src/lib/formats/manifest.spec.ts`             | Create | Jest spec for the above                                                  |
| `packages/core/src/lib/token-config.ts`                      | Modify | `manifest` platform in base + theme configs; file-name constants         |
| `packages/core/src/lib/token-config.spec.ts`                 | Modify | Config assertions for the manifest platform                              |
| `packages/core/src/lib/platforms.ts`                         | Modify | Register manifest formats                                                |
| `packages/core/src/lib/build-tokens.ts`                      | Modify | Merge per-theme manifest temps into `tokens.manifest.json`               |
| `packages/{biome,exodus,faune}/tokens/package.json`          | Modify | Export `./tokens.manifest.json`                                          |
| `packages/{biome,exodus,faune}/tokens/verify.mjs`            | Modify | Manifest assertions + CSS-parity check                                   |
| `apps/docs/src/_foundations/token-manifest.ts`               | Create | Consumer-side manifest types + pure `colorCatalog` / `staleNoteKeys`     |
| `apps/docs/src/_foundations/token-manifest.spec.ts`          | Create | Vitest unit spec                                                         |
| `apps/docs/src/_foundations/ColorCatalog.tsx`                | Create | `ColorCatalog`, `TokenSwatch`, `CopyButton`                              |
| `apps/docs/src/_test/catalog.ts`                             | Create | Play helpers: completeness, contrast, copy interaction                   |
| `apps/docs/vitest.config.ts`                                 | Modify | Add a `unit` (node) project beside `storybook`                           |
| `apps/docs/tsconfig.storybook.json`                          | Modify | `resolveJsonModule: true`                                                |
| `apps/docs/src/{exodus,biome,faune}/Foundations.stories.tsx` | Modify | `Colors` story → `ColorCatalog`; delete now-unused `Swatch`/`Grid`/lists |
| `AGENTS.md`                                                  | Modify | Document the manifest, the export, the catalog, the unit project         |

---

### Task 1: Manifest format in core

**Files:**

- Create: `packages/core/src/lib/formats/manifest.ts`
- Test: `packages/core/src/lib/formats/manifest.spec.ts`

**Interfaces:**

- Consumes: `normalize`, `Normalized` from `packages/core/src/lib/values.ts`; SD types `Format`, `FormatFnArguments`, `TransformedToken` (type-only).
- Produces:
  - `MANIFEST_VERSION = 1`
  - `type ManifestKind = 'color' | 'dimension' | 'duration' | 'easing' | 'number' | 'other'`
  - `interface ManifestToken { name: string; path: string[]; source: string; value: string; references: string[]; kind: ManifestKind }`
  - `interface ManifestTheme { name: string; selector: string; tokens: ManifestToken[] }`
  - `interface TokenManifest { version: typeof MANIFEST_VERSION; tokens: ManifestToken[]; themes: ManifestTheme[] }`
  - `manifestTokens(dictionary: FormatFnArguments['dictionary']): ManifestToken[]`
  - `manifestFormats: Format[]`, with format names `'thijulio/manifest-json'` (base: `{ version, tokens, themes: [] }`) and `'thijulio/manifest-theme-json'` (a bare `ManifestToken[]`).

- [ ] **Step 1: Write the failing test**

`packages/core/src/lib/formats/manifest.spec.ts`:

```ts
import type {
  FormatFnArguments,
  TransformedToken,
} from 'style-dictionary/types';
import {
  MANIFEST_VERSION,
  manifestFormats,
  manifestTokens,
} from './manifest.js';

type Dictionary = FormatFnArguments['dictionary'];

function token(
  name: string,
  path: string[],
  value: string,
  original = value,
  filePath = '/brand/src/tokens/color.json',
): TransformedToken {
  return {
    name,
    path,
    value,
    original: { value: original },
    filePath,
    isSource: true,
  } as TransformedToken;
}

function dictionary(
  allTokens: TransformedToken[],
  unfilteredAllTokens?: TransformedToken[],
): Dictionary {
  return {
    allTokens,
    tokens: {},
    tokenMap: new Map(),
    unfilteredAllTokens,
  } as unknown as Dictionary;
}

const ramp = token('accent-600', ['accent-600'], '#3d6344');
const alias = token('accent', ['accent'], '#3d6344', '{accent-600}');

describe('manifestTokens', () => {
  it('names tokens as CSS custom properties and records path, source file and resolved value', () => {
    expect(manifestTokens(dictionary([alias, ramp]))[0]).toEqual({
      name: '--accent',
      path: ['accent'],
      source: 'color.json',
      value: '#3d6344',
      references: ['--accent-600'],
      kind: 'color',
    });
  });

  it.each([
    ['#F2EEE2', 'color'],
    ['rgba(35, 42, 32, 0.12)', 'color'],
    ['4px', 'dimension'],
    ['1.125rem', 'dimension'],
    ['240ms', 'duration'],
    ['cubic-bezier(0.2, 0.7, 0.2, 1)', 'easing'],
    ['700', 'number'],
    ['1.5', 'number'],
    ['0 1px 2px rgba(38, 36, 31, 0.06)', 'other'],
    ["'Inter', system-ui, sans-serif", 'other'],
  ])('classifies %s as %s via the shared value classifier', (value, kind) => {
    expect(manifestTokens(dictionary([token('t', ['t'], value)]))[0].kind).toBe(
      kind,
    );
  });

  it('resolves references against unfiltered tokens so overlays can alias base tokens', () => {
    const sage = token('bm-sage', ['bm', 'sage'], '#8FB089');
    const darkBrand = token(
      'brand',
      ['brand'],
      '#8FB089',
      '{bm.sage}',
      '/brand/src/themes/dark/semantic.json',
    );
    expect(
      manifestTokens(dictionary([darkBrand], [sage, darkBrand]))[0],
    ).toMatchObject({ source: 'semantic.json', references: ['--bm-sage'] });
  });

  it('records every reference inside a compound value, in order of appearance', () => {
    const width = token('x', ['x'], '1px');
    const color = token('c', ['c'], '#000');
    const edge = token('edge', ['edge'], '1px solid #000', '{x} solid {c}');
    expect(
      manifestTokens(dictionary([edge, width, color]))[0].references,
    ).toEqual(['--x', '--c']);
  });

  it('ignores brace text that names no token', () => {
    const odd = token('odd', ['odd'], 'url({nope})');
    expect(manifestTokens(dictionary([odd]))[0].references).toEqual([]);
  });
});

describe('manifest formats', () => {
  async function run(name: string, dict: Dictionary): Promise<unknown> {
    const format = manifestFormats.find((f) => f.name === name);
    if (!format) throw new Error(`format ${name} is not exported`);
    return JSON.parse(
      String(
        await format.format({
          dictionary: dict,
        } as unknown as FormatFnArguments),
      ),
    );
  }

  it('wraps base tokens with the manifest version and an empty theme list', async () => {
    expect(await run('thijulio/manifest-json', dictionary([ramp]))).toEqual({
      version: MANIFEST_VERSION,
      tokens: [expect.objectContaining({ name: '--accent-600' })],
      themes: [],
    });
  });

  it('emits a bare entry array for a theme overlay', async () => {
    expect(
      await run('thijulio/manifest-theme-json', dictionary([ramp])),
    ).toEqual([expect.objectContaining({ name: '--accent-600' })]);
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npx nx test core --skip-nx-cache`
Expected: FAIL. `Cannot find module './manifest.js'`.

- [ ] **Step 3: Implement**

`packages/core/src/lib/formats/manifest.ts`:

```ts
/**
 * Token manifest formats (Style Dictionary `format`s).
 *
 * A machine-readable index of every token exactly as the CSS platform names
 * it: custom-property name, source path and file, resolved value, the tokens
 * it aliases, and a kind from the shared value classifier. Feeds the Storybook
 * color catalogs. Additive: tokens.css / tokens.js are unchanged.
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
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `npx nx run-many -t test typecheck lint -p core --skip-nx-cache`
Expected: PASS. Existing `values`/`token-config` specs stay green.

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/lib/formats/manifest.ts packages/core/src/lib/formats/manifest.spec.ts
git commit -m "feat(core): add token manifest style dictionary formats"
```

---

### Task 2: Emit `tokens.manifest.json` from every brand build

**Files:**

- Modify: `packages/core/src/lib/token-config.ts` (constants after `themeTempFile`; a `manifest` platform in `createBaseConfig` and `createThemeConfig`)
- Modify: `packages/core/src/lib/token-config.spec.ts`
- Modify: `packages/core/src/lib/platforms.ts`
- Modify: `packages/core/src/lib/build-tokens.ts` (`buildBrandTokens`)
- Modify: `packages/{biome,exodus,faune}/tokens/package.json` (`exports`)
- Modify: `packages/{biome,exodus,faune}/tokens/verify.mjs` (append before the final `console.log`)

**Interfaces:**

- Consumes: `manifestFormats`, `ManifestToken`, `TokenManifest` (Task 1).
- Produces:
  - `MANIFEST_FILE = 'tokens.manifest.json'`
  - `themeManifestTempFile(index: number): string`, which returns `` `__theme-${index}.manifest.json` ``
  - a `manifest` SD platform in both configs
  - published subpath `@thijulio/<brand>-tokens/tokens.manifest.json`

- [ ] **Step 0: Snapshot the current web outputs**

Task 1 doesn't touch the build, so a fresh build now gives the baseline:

```bash
npx nx run-many -t build -p biome-tokens,exodus-tokens,faune-tokens --skip-nx-cache && for b in biome exodus faune; do mkdir -p "$TMPDIR/tokens-before/$b" && cp packages/$b/tokens/dist/tokens.css packages/$b/tokens/dist/tokens.js packages/$b/tokens/dist/tokens.d.ts "$TMPDIR/tokens-before/$b/"; done
```

- [ ] **Step 1: Write the failing config test**

Add `MANIFEST_FILE` and `themeManifestTempFile` to the import list at the top of `packages/core/src/lib/token-config.spec.ts`. Append:

```ts
describe('manifest platform', () => {
  it('names tokens with the css transforms and prefix, next to tokens.css', () => {
    const platforms =
      createBaseConfig({ source: '/s', buildPath: '/out', prefix: 'bm' })
        .platforms ?? {};

    expect(platforms['manifest']).toMatchObject({
      transformGroup: platforms['css']?.transformGroup,
      prefix: 'bm',
      buildPath: '/out/',
    });
    expect(platforms['manifest']?.files).toEqual([
      { destination: MANIFEST_FILE, format: 'thijulio/manifest-json' },
    ]);
  });

  it('builds each overlay to an indexed temp file with the overlay filter', () => {
    const platforms =
      createThemeConfig(
        { source: '/s', buildPath: '/out', prefix: 'bm' },
        { selector: '[data-mode="dark"]', source: '/s/themes/dark' },
        2,
      ).platforms ?? {};
    const file = platforms['manifest']?.files?.[0];

    expect(themeManifestTempFile(2)).toBe('__theme-2.manifest.json');
    expect(platforms['manifest']).toMatchObject({
      transformGroup: 'css',
      prefix: 'bm',
    });
    expect(file).toMatchObject({
      destination: themeManifestTempFile(2),
      format: 'thijulio/manifest-theme-json',
    });
    // Same predicate as the CSS overlay, so names/sets can't diverge.
    expect(file?.filter).toBe(platforms['css']?.files?.[0]?.filter);
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npx nx test core --skip-nx-cache`
Expected: FAIL. `MANIFEST_FILE` and `themeManifestTempFile` are not exported.

- [ ] **Step 3: Implement the config**

In `packages/core/src/lib/token-config.ts`, after `themeTempFile`:

```ts
/** Machine-readable token index written next to tokens.css. */
export const MANIFEST_FILE = 'tokens.manifest.json';

/** Temp file an overlay's manifest entries are built to before being merged in. */
export const themeManifestTempFile = (index: number): string =>
  `__theme-${index}.manifest.json`;
```

In `createBaseConfig`, add after the `css` platform:

```ts
      // Same transforms + prefix as `css`, so manifest names are the exact
      // custom properties tokens.css declares.
      manifest: {
        transformGroup: 'css',
        prefix,
        buildPath: out,
        files: [{ destination: MANIFEST_FILE, format: 'thijulio/manifest-json' }],
      },
```

In `createThemeConfig`, add after the `css` platform:

```ts
      manifest: {
        transformGroup: 'css',
        prefix,
        buildPath: out,
        files: [
          {
            destination: themeManifestTempFile(index),
            format: 'thijulio/manifest-theme-json',
            filter,
          },
        ],
      },
```

In `packages/core/src/lib/platforms.ts`, import `manifestFormats` from `./formats/manifest.js` and register it:

```ts
  for (const format of [...nativeFormats, ...dartFormats, ...manifestFormats]) {
```

- [ ] **Step 4: Run the config test and confirm it passes**

Run: `npx nx test core --skip-nx-cache`
Expected: PASS.

- [ ] **Step 5: Merge theme entries in the runner**

In `packages/core/src/lib/build-tokens.ts`:

- Extend the `./token-config.js` import with `MANIFEST_FILE` and `themeManifestTempFile`.
- Add `import type { ManifestToken, TokenManifest } from './formats/manifest.js';`.
- Replace steps 1–2 of `buildBrandTokens` with:

```ts
// 1. Base: writes tokens.css (:root) + tokens.js/d.ts (web) + manifest + native + dart.
await new StyleDictionary(createBaseConfig(options)).buildAllPlatforms();

// 2. Each theme overlay → its own CSS temp (appended), manifest temp (merged)
//    and native/dart theme files.
const tokensCss = join(buildPath, 'tokens.css');
const manifestPath = join(buildPath, MANIFEST_FILE);
const manifest = JSON.parse(
  await readFile(manifestPath, 'utf-8'),
) as TokenManifest;
for (let i = 0; i < themes.length; i++) {
  await new StyleDictionary(
    createThemeConfig(options, themes[i], i),
  ).buildAllPlatforms();

  const tempPath = join(buildPath, themeTempFile(i));
  const overlay = stripHeader(await readFile(tempPath, 'utf-8'));
  await appendFile(tokensCss, `\n${overlay}`);
  await rm(tempPath);

  const manifestTemp = join(buildPath, themeManifestTempFile(i));
  manifest.themes.push({
    name: names[i],
    selector: themes[i].selector,
    tokens: JSON.parse(
      await readFile(manifestTemp, 'utf-8'),
    ) as ManifestToken[],
  });
  await rm(manifestTemp);
}
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
```

Also update the JSDoc bullet list above `buildBrandTokens` with:
``*  - `tokens.manifest.json`  machine-readable index (CSS names, values, aliases, themes)``

- [ ] **Step 6: Export the file from each tokens package**

In each of `packages/biome/tokens/package.json`, `packages/exodus/tokens/package.json` and `packages/faune/tokens/package.json`, add this under `"exports"`, directly after `"./tokens.css"`:

```json
    "./tokens.manifest.json": "./dist/tokens.manifest.json",
```

- [ ] **Step 7: Write the failing verify assertions**

Append the following to each `verify.mjs`, before its final `console.log`. `dist` and `css` are already defined at the top of each file.

Shared block, added to **all three** files:

```js
// --- Token manifest (feeds the Storybook color catalog) ---
const manifest = JSON.parse(
  await readFile(join(dist, 'tokens.manifest.json'), 'utf-8'),
);
const entry = (name, tokens = manifest.tokens) =>
  tokens.find((t) => t.name === name);
assert.equal(manifest.version, 1, 'manifest version changed');

// Manifest names are exactly the custom properties each tokens.css block declares.
const declared = (selector) => {
  const start = css.indexOf(`${selector} {`);
  assert.notEqual(start, -1, `tokens.css has no ${selector} block`);
  return [
    ...css.slice(start, css.indexOf('}', start)).matchAll(/^\s*(--[\w-]+):/gm),
  ]
    .map((m) => m[1])
    .sort();
};
const listed = (tokens) => tokens.map((t) => t.name).sort();
assert.deepEqual(
  listed(manifest.tokens),
  declared(':root'),
  'manifest ≠ :root custom properties',
);
for (const theme of manifest.themes) {
  assert.deepEqual(
    listed(theme.tokens),
    declared(theme.selector),
    `manifest ${theme.name} ≠ ${theme.selector} custom properties`,
  );
}
```

Exodus only (`packages/exodus/tokens/verify.mjs`):

```js
assert.deepEqual(
  entry('--accent'),
  {
    name: '--accent',
    path: ['accent'],
    source: 'color.json',
    value: '#3d6344',
    references: ['--accent-600'],
    kind: 'color',
  },
  'accent manifest entry altered',
);
assert.equal(
  entry('--space-1')?.kind,
  'dimension',
  'space-1 not classified as a dimension',
);
assert.deepEqual(
  manifest.themes.map((t) => [t.name, t.selector]),
  [
    ['sage', '[data-theme="sage"]'],
    ['clay', '[data-theme="clay"]'],
    ['harbor', '[data-theme="harbor"]'],
  ],
  'manifest themes altered',
);
assert.equal(
  entry('--accent-600', manifest.themes[1].tokens)?.value,
  '#a44a2b',
  'clay manifest value missing',
);
```

Biome only (`packages/biome/tokens/verify.mjs`):

```js
assert.deepEqual(
  entry('--brand'),
  {
    name: '--brand',
    path: ['brand'],
    source: 'semantic.json',
    value: '#3F5237',
    references: ['--bm-mata'],
    kind: 'color',
  },
  'brand manifest entry altered',
);
assert.deepEqual(
  manifest.themes.map((t) => [t.name, t.selector]),
  [['dark', '[data-mode="dark"]']],
  'manifest themes altered',
);
assert.deepEqual(
  entry('--brand', manifest.themes[0].tokens)?.references,
  ['--bm-sage'],
  'dark brand alias not resolved against the base palette',
);
```

Faune only (`packages/faune/tokens/verify.mjs`):

```js
assert.deepEqual(
  entry('--ds-brand'),
  {
    name: '--ds-brand',
    path: ['ds', 'brand'],
    source: 'contract.json',
    value: '#183d3c',
    references: ['--ink'],
    kind: 'color',
  },
  'ds-brand manifest entry altered',
);
assert.deepEqual(manifest.themes, [], 'faune has no theme overlays');
```

- [ ] **Step 8: Build, verify, and check the web outputs are unchanged**

This step uses the snapshot taken in **Step 0** of this task.

Run: `npx nx run-many -t test -p core,biome-tokens,exodus-tokens,faune-tokens --skip-nx-cache`
Expected: PASS. Each brand prints `✓ @thijulio/<brand>-tokens output verified`.

Then compare:

```bash
for b in biome exodus faune; do for f in tokens.css tokens.js tokens.d.ts; do cmp -s "$TMPDIR/tokens-before/$b/$f" "packages/$b/tokens/dist/$f" || echo "CHANGED $b/$f"; done; done; ls packages/*/tokens/dist/__theme-* 2>/dev/null
```

Expected: no output at all. That means no web output changed and no temp files were left behind.

- [ ] **Step 9: Commit**

```bash
git add packages/core/src/lib packages/biome/tokens packages/exodus/tokens packages/faune/tokens
git commit -m "feat(core): emit tokens.manifest.json alongside tokens.css"
```

---

### Task 3: Docs catalog model and unit test project

**Files:**

- Create: `apps/docs/src/_foundations/token-manifest.ts`
- Create: `apps/docs/src/_foundations/token-manifest.spec.ts`
- Modify: `apps/docs/vitest.config.ts`

**Interfaces:**

- Consumes: the manifest JSON shape from Task 2. The docs keep their own consumer-side types because `@thijulio/core` is private and build-only.
- Produces:
  - `SUPPORTED_MANIFEST_VERSION = 1`
  - `interface ManifestToken { name: string; path: string[]; source: string; value: string; references: string[]; kind: string }`
  - `interface ManifestTheme { name: string; selector: string; tokens: ManifestToken[] }`
  - `interface TokenManifest { version: number; tokens: ManifestToken[]; themes: ManifestTheme[] }`
  - `interface CatalogToken extends ManifestToken { overrides: Record<string, string>; themeOnly: boolean }`
  - `interface ColorSection { title: string; description?: string; match: (token: ManifestToken) => boolean }`
  - `interface CatalogGroup { section: ColorSection; tokens: CatalogToken[] }`
  - `UNCATEGORIZED: ColorSection`
  - `isSemanticColor(token: ManifestToken): boolean`
  - `colorCatalog(manifest: TokenManifest, sections: ColorSection[]): CatalogGroup[]`
  - `staleNoteKeys(manifest: TokenManifest, notes: Record<string, string>): string[]`

- [ ] **Step 1: Add the `unit` project to Vitest**

In `apps/docs/vitest.config.ts`, insert this as the **first** entry of `test.projects`. The existing `storybook` project stays unchanged.

```ts
      {
        // Pure catalog/model logic: plain node, no browser.
        test: {
          name: 'unit',
          root: dirname,
          include: ['src/**/*.spec.ts'],
          environment: 'node',
        },
      },
```

- [ ] **Step 2: Write the failing test**

`apps/docs/src/_foundations/token-manifest.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  colorCatalog,
  staleNoteKeys,
  UNCATEGORIZED,
  type CatalogGroup,
  type ColorSection,
  type ManifestToken,
  type TokenManifest,
} from './token-manifest';

const token = (
  name: string,
  value: string,
  extra: Partial<ManifestToken> = {},
): ManifestToken => ({
  name,
  path: [name.slice(2)],
  source: 'color.json',
  value,
  references: [],
  kind: 'color',
  ...extra,
});

const manifest = (partial: Partial<TokenManifest> = {}): TokenManifest => ({
  version: 1,
  tokens: [],
  themes: [],
  ...partial,
});

const titles = (groups: CatalogGroup[]) =>
  groups.map(({ section, tokens }) => [
    section.title,
    tokens.map((t) => t.name),
  ]);

describe('colorCatalog', () => {
  it('keeps only color tokens', () => {
    const groups = colorCatalog(
      manifest({
        tokens: [
          token('--ink', '#000'),
          token('--space-1', '4px', { kind: 'dimension' }),
        ],
      }),
      [],
    );
    expect(titles(groups)).toEqual([['Uncategorized', ['--ink']]]);
  });

  it('assigns each token to the first matching section, in section order, dropping empty sections', () => {
    const sections: ColorSection[] = [
      { title: 'Accent', match: (t) => t.name.startsWith('--accent') },
      { title: 'Empty', match: () => false },
      { title: 'Everything', match: () => true },
    ];
    const groups = colorCatalog(
      manifest({
        tokens: [token('--n-50', '#fff'), token('--accent', '#0f0')],
      }),
      sections,
    );
    expect(titles(groups)).toEqual([
      ['Accent', ['--accent']],
      ['Everything', ['--n-50']],
    ]);
  });

  it('collects unmatched color tokens in a trailing Uncategorized section', () => {
    const groups = colorCatalog(
      manifest({ tokens: [token('--new-thing', '#123456')] }),
      [{ title: 'Accent', match: () => false }],
    );
    expect(groups.at(-1)?.section).toBe(UNCATEGORIZED);
    expect(titles(groups)).toEqual([['Uncategorized', ['--new-thing']]]);
  });

  it('records theme overrides only where the resolved value changes', () => {
    const groups = colorCatalog(
      manifest({
        tokens: [token('--accent', '#3d6344')],
        themes: [
          {
            name: 'sage',
            selector: '[data-theme="sage"]',
            tokens: [token('--accent', '#3d6344')],
          },
          {
            name: 'clay',
            selector: '[data-theme="clay"]',
            tokens: [token('--accent', '#a44a2b')],
          },
        ],
      }),
      [],
    );
    expect(groups[0].tokens[0]).toMatchObject({
      themeOnly: false,
      overrides: { clay: '#a44a2b' },
    });
  });

  it('lists a token defined only inside theme overlays, flagged themeOnly', () => {
    const groups = colorCatalog(
      manifest({
        themes: [
          {
            name: 'dark',
            selector: '[data-mode="dark"]',
            tokens: [token('--glow', '#8fb089')],
          },
          {
            name: 'dim',
            selector: '[data-mode="dim"]',
            tokens: [token('--glow', '#8fb089')],
          },
        ],
      }),
      [],
    );
    expect(groups[0].tokens).toEqual([
      expect.objectContaining({
        name: '--glow',
        themeOnly: true,
        overrides: { dark: '#8fb089', dim: '#8fb089' },
      }),
    ]);
  });

  it('rejects a manifest version it does not understand', () => {
    expect(() => colorCatalog(manifest({ version: 2 }), [])).toThrow(
      'Unsupported token manifest version 2',
    );
  });
});

describe('staleNoteKeys', () => {
  it('returns note keys that name no color token', () => {
    const m = manifest({
      tokens: [
        token('--bm-mata', '#3F5237'),
        token('--space-1', '4px', { kind: 'dimension' }),
      ],
    });
    expect(
      staleNoteKeys(m, {
        '--bm-mata': 'Mata',
        '--bm-old': 'Renamed',
        '--space-1': 'Not a color',
      }),
    ).toEqual(['--bm-old', '--space-1']);
  });
});
```

- [ ] **Step 3: Run the test and confirm it fails**

Run: `npx vitest run --config apps/docs/vitest.config.ts --project unit`
Expected: FAIL. `Failed to resolve import "./token-manifest"`.

- [ ] **Step 4: Implement**

`apps/docs/src/_foundations/token-manifest.ts`:

```ts
/**
 * Consumer-side model of `@thijulio/<brand>-tokens/tokens.manifest.json`
 * (format v1, written by @thijulio/core). Pure: unit-tested in node.
 */
export const SUPPORTED_MANIFEST_VERSION = 1;

export interface ManifestToken {
  name: string;
  path: string[];
  source: string;
  value: string;
  references: string[];
  kind: string;
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
```

- [ ] **Step 5: Run the test and confirm it passes**

Run: `npx vitest run --config apps/docs/vitest.config.ts --project unit`
Expected: PASS (7 tests).

Then: `npx nx run-many -t typecheck lint -p docs`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/docs/vitest.config.ts apps/docs/src/_foundations/token-manifest.ts apps/docs/src/_foundations/token-manifest.spec.ts
git commit -m "test(docs): add token catalog model with a node unit project"
```

---

### Task 4: `ColorCatalog` component and the Exodus Colors story

**Files:**

- Create: `apps/docs/src/_foundations/ColorCatalog.tsx`
- Create: `apps/docs/src/_test/catalog.ts`
- Modify: `apps/docs/tsconfig.storybook.json` (`compilerOptions`)
- Modify: `apps/docs/src/exodus/Foundations.stories.tsx`: the `Colors` story, and delete `Swatch`, `Grid`, `NEUTRALS`, `SEMANTICS`, `TONES`

**Interfaces:**

- Consumes: `colorCatalog`, `staleNoteKeys`, `isSemanticColor`, `CatalogToken`, `ColorSection`, `TokenManifest` (Task 3); `@thijulio/exodus-tokens/tokens.manifest.json` (Task 2); `contrastRatio` from `apps/docs/src/_test/contrast.ts`.
- Produces:
  - `ColorCatalog(props: { manifest: TokenManifest; sections: ColorSection[]; notes?: Record<string, string> })`
  - `CopyButton(props: { text: string })`
  - DOM contract: each swatch is a `figure[data-token="--name"]`, and each copy button has the accessible name `Copy var(--name)`.
  - `expectCompleteColorCatalog(canvasElement: HTMLElement, manifest: TokenManifest, notes?: Record<string, string>): Promise<void>`
  - `expectCopyInteraction(canvasElement: HTMLElement, tokenName: string): Promise<void>`

- [ ] **Step 1: Allow JSON imports in stories**

In `apps/docs/tsconfig.storybook.json` → `compilerOptions`, add `"resolveJsonModule": true`.

- [ ] **Step 2: Write the play helpers**

`apps/docs/src/_test/catalog.ts`:

```ts
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import {
  colorCatalog,
  staleNoteKeys,
  type TokenManifest,
} from '../_foundations/token-manifest';
import { contrastRatio } from './contrast';

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
  const cards = [
    ...canvasElement.querySelectorAll<HTMLElement>('[data-token]'),
  ];
  await expect(cards.map((card) => card.dataset.token).sort()).toEqual(
    expected,
  );
  await expect(staleNoteKeys(manifest, notes)).toEqual([]);

  for (const card of cards) {
    const background = getComputedStyle(card).backgroundColor;
    for (const label of card.querySelectorAll<HTMLElement>(
      'figcaption code, figcaption > span',
    )) {
      await expect(
        contrastRatio(getComputedStyle(label).color, background),
      ).toBeGreaterThanOrEqual(4.5);
    }
  }
}

/** Copy writes `var(--name)`; a rejected clipboard write shows "Copy failed". */
export async function expectCopyInteraction(
  canvasElement: HTMLElement,
  tokenName: string,
) {
  const button = within(canvasElement).getByRole('button', {
    name: `Copy var(${tokenName})`,
  });
  const writeText = fn(async (_text: string): Promise<void> => undefined);
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
  try {
    await userEvent.click(button);
    await expect(writeText).toHaveBeenCalledWith(`var(${tokenName})`);
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
```

- [ ] **Step 3: Add the play to the existing Exodus story and confirm it fails**

In `apps/docs/src/exodus/Foundations.stories.tsx`, add the imports:

```ts
import exodusTokens from '@thijulio/exodus-tokens/tokens.manifest.json';
import type { TokenManifest } from '../_foundations/token-manifest';
import {
  expectCompleteColorCatalog,
  expectCopyInteraction,
} from '../_test/catalog';

const manifest: TokenManifest = exodusTokens;
```

Add to the current `Colors` story object, keeping its existing `render` for now:

```ts
  play: async ({ canvasElement }) => {
    await expectCompleteColorCatalog(canvasElement, manifest, NOTES);
    await expectCopyInteraction(canvasElement, '--accent');
  },
```

Also add the final `NOTES` constant from Step 5 now, so the play can reference it.

Run: `npx nx run-many -t build -p exodus-tokens && npx nx test-storybook docs -- exodus/Foundations`
Expected: FAIL in `Exodus/Foundations › Colors`. The rendered `data-token` list is `[]`, but the expected list has the full color set.

- [ ] **Step 4: Implement the component**

`apps/docs/src/_foundations/ColorCatalog.tsx`:

```tsx
import { useEffect, useState, type CSSProperties } from 'react';
import {
  colorCatalog,
  type CatalogToken,
  type ColorSection,
  type TokenManifest,
} from './token-manifest';

// Chrome uses only the shared --ds-* contract, so one component renders
// correctly under every brand, and under Biome dark mode.
const chrome: CSSProperties = {
  fontFamily: 'var(--ds-font-body)',
  color: 'var(--ds-text)',
};
const muted: CSSProperties = { fontSize: 12, color: 'var(--ds-text-muted)' };
const visuallyHidden: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

type CopyState = 'idle' | 'copied' | 'failed';
const COPY_LABEL: Record<CopyState, string> = {
  idle: 'Copy',
  copied: 'Copied',
  failed: 'Copy failed',
};

export function CopyButton({ text }: { text: string }) {
  const [state, setState] = useState<CopyState>('idle');

  useEffect(() => {
    if (state === 'idle') return;
    const timer = setTimeout(() => setState('idle'), 1500);
    return () => clearTimeout(timer);
  }, [state]);

  async function copy() {
    try {
      // Throws when the Clipboard API is missing (insecure context) or denied.
      await navigator.clipboard.writeText(text);
      setState('copied');
    } catch {
      setState('failed');
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label={`Copy ${text}`}
        onClick={copy}
        style={{
          font: 'inherit',
          fontSize: 12,
          padding: '2px 8px',
          color: 'var(--ds-text)',
          background: 'transparent',
          border: '1px solid var(--ds-border)',
          borderRadius: 'var(--ds-radius-md)',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        {COPY_LABEL[state]}
      </button>
      <span role="status" style={visuallyHidden}>
        {state === 'idle' ? '' : `${COPY_LABEL[state]}: ${text}`}
      </span>
    </>
  );
}

function TokenSwatch({ token, note }: { token: CatalogToken; note?: string }) {
  return (
    <figure
      data-token={token.name}
      style={{
        margin: 0,
        overflow: 'hidden',
        background: 'var(--ds-surface-raised)',
        border: '1px solid var(--ds-border)',
        borderRadius: 'var(--ds-radius-md)',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          height: 56,
          background: `var(${token.name})`,
          borderBottom: '1px solid var(--ds-border)',
        }}
      />
      <figcaption style={{ display: 'grid', gap: 2, padding: '8px 10px' }}>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 6,
          }}
        >
          <code
            style={{ fontSize: 12, fontWeight: 700, overflowWrap: 'anywhere' }}
          >
            {token.name}
          </code>
          <CopyButton text={`var(${token.name})`} />
        </span>
        {note && <span style={muted}>{note}</span>}
        <span style={muted}>
          {token.themeOnly ? 'theme only' : token.value}
          {token.references.length > 0 && ` → ${token.references.join(', ')}`}
        </span>
        {Object.entries(token.overrides).map(([theme, value]) => (
          <span key={theme} style={muted}>
            {theme}: {value}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

export function ColorCatalog({
  manifest,
  sections,
  notes = {},
}: {
  manifest: TokenManifest;
  sections: ColorSection[];
  notes?: Record<string, string>;
}) {
  return (
    <div style={chrome}>
      {colorCatalog(manifest, sections).map(({ section, tokens }) => (
        <section key={section.title} style={{ marginBottom: 34 }}>
          <h3 style={{ fontSize: 21, fontWeight: 700, margin: '0 0 2px' }}>
            {section.title}
          </h3>
          {section.description && (
            <p style={{ ...muted, fontSize: 14, margin: '0 0 14px' }}>
              {section.description}
            </p>
          )}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 10,
              maxWidth: 960,
            }}
          >
            {tokens.map((token) => (
              <TokenSwatch
                key={token.name}
                token={token}
                note={notes[token.name]}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Replace the Exodus Colors story**

In `apps/docs/src/exodus/Foundations.stories.tsx`:

- Delete `Swatch`, `Grid`, `NEUTRALS`, `SEMANTICS` and `TONES`. All their uses are inside `Colors`.
- Keep `Section` and `sans`; `Themes`, `Typography` and `Spacing` use them.
- Add these imports: `import { ColorCatalog } from '../_foundations/ColorCatalog';` and `import { isSemanticColor, type ColorSection } from '../_foundations/token-manifest';` (merge the latter with the existing `TokenManifest` type import).
- Replace `Colors` with:

```tsx
const SECTIONS: ColorSection[] = [
  {
    title: 'Accent — theme-driven',
    description:
      'The brand ramp reskins per data-theme (Sage default). Switch theme in the toolbar; see Themes.',
    match: (t) => t.name.startsWith('--accent'),
  },
  {
    title: 'Neutrals — warm stone',
    description:
      'Warm, not cool grey. Surfaces 50/100, borders 200/300, text 700/900.',
    match: (t) => t.name.startsWith('--n-'),
  },
  {
    title: 'Semantics — fixed meaning',
    description:
      'success / warning / danger / info. Never reskin with the accent theme.',
    match: isSemanticColor,
  },
  {
    title: 'Status tones — 7 fixed',
    description:
      "Lifecycle states map onto these; a state's colour never themes.",
    match: (t) => t.name.startsWith('--tone-'),
  },
  {
    title: 'Contract — --ds-*',
    description:
      'What @thijulio/primitives reads. Each aliases an Exodus token above.',
    match: (t) => t.source === 'contract.json',
  },
];

const NOTES: Record<string, string> = {
  '--accent-soft': 'tint bg',
  '--accent': 'primary fill',
  '--accent-strong': 'hover',
};

export const Colors: Story = {
  render: () => (
    <ColorCatalog manifest={manifest} sections={SECTIONS} notes={NOTES} />
  ),
  play: async ({ canvasElement }) => {
    await expectCompleteColorCatalog(canvasElement, manifest, NOTES);
    await expectCopyInteraction(canvasElement, '--accent');
  },
};
```

The tone pill demo goes away on purpose. Each tone's `soft`/`fg`/`dot` now gets its own named swatch, and the composed pill is what the `StatusBadge` story already shows.

- [ ] **Step 6: Run the story tests and confirm they pass**

Run: `npx nx test-storybook docs -- exodus/Foundations`
Expected: PASS for all four Exodus Foundations stories, including the axe `a11y` check, which is set to `error`.

Then: `npx nx run-many -t typecheck lint -p docs`
Expected: PASS.

- [ ] **Step 7: Check it in the browser**

Run: `npx nx storybook docs --port 6006`. Open `Exodus → Foundations → Colors` and check:

- the sections are, in order, Accent, Neutrals, Semantics, Status tones, Contract, with no "Uncategorized" section;
- switching the toolbar theme Sage → Clay → Harbor reskins the accent and `--ds-brand` swatches;
- a Copy click pastes `var(--accent)`.

- [ ] **Step 8: Commit**

```bash
git add apps/docs/tsconfig.storybook.json apps/docs/src/_foundations/ColorCatalog.tsx apps/docs/src/_test/catalog.ts apps/docs/src/exodus/Foundations.stories.tsx
git commit -m "feat(docs): generate exodus color swatches from the token manifest"
```

---

### Task 5: Biome Colors story

**Files:**

- Modify: `apps/docs/src/biome/Foundations.stories.tsx`: the `Colors` story, and delete `Swatch` and `Grid`

**Interfaces:**

- Consumes: `ColorCatalog` (Task 4); `ColorSection`, `TokenManifest` (Task 3); `expectCompleteColorCatalog`, `expectCopyInteraction` (Task 4); `@thijulio/biome-tokens/tokens.manifest.json` (Task 2).
- Produces: nothing new.

- [ ] **Step 1: Add the play to the current story and confirm it fails**

Add these imports:

```ts
import biomeTokens from '@thijulio/biome-tokens/tokens.manifest.json';
import { ColorCatalog } from '../_foundations/ColorCatalog';
import type {
  ColorSection,
  TokenManifest,
} from '../_foundations/token-manifest';
import {
  expectCompleteColorCatalog,
  expectCopyInteraction,
} from '../_test/catalog';

const manifest: TokenManifest = biomeTokens;
```

Add `NOTES` (below) and this play to the existing `Colors`:

```ts
  play: async ({ canvasElement }) => {
    await expectCompleteColorCatalog(canvasElement, manifest, NOTES);
    await expectCopyInteraction(canvasElement, '--brand');
  },
```

Run: `npx nx run-many -t build -p biome-tokens && npx nx test-storybook docs -- biome/Foundations`
Expected: FAIL in `Biome/Foundations › Colors`. The rendered list is empty.

- [ ] **Step 2: Replace the story**

Delete `Swatch` and `Grid`; all their uses are inside `Colors`. If `mono` is now unused, delete it too (`npx nx lint docs` flags it). Then add:

```tsx
const SECTIONS: ColorSection[] = [
  {
    title: 'Palette — bm',
    description:
      'Raw Biome palette. Components reach for the semantic layer, not these.',
    match: (t) => t.source === 'palette.json',
  },
  {
    title: 'Semantic',
    description:
      'Role aliases components use. Dark mode reassigns them; toggle Mode in the toolbar.',
    match: (t) => t.source === 'semantic.json',
  },
  {
    title: 'Components',
    description: 'Component-scoped tokens (TerminalHero, nav).',
    match: (t) => t.source === 'components.json',
  },
  {
    title: 'Contract — --ds-*',
    description:
      'What @thijulio/primitives reads. Each aliases a semantic token above.',
    match: (t) => t.source === 'contract.json',
  },
];

// Editorial names from the previous hand-made swatches, kept by CSS name.
const NOTES: Record<string, string> = {
  '--bm-bone': 'Bone · ground',
  '--bm-bone-raised': 'Bone Raised · surface',
  '--bm-mata': 'Mata · primary',
  '--bm-mata-deep': 'Mata Deep · hover',
  '--bm-cerrado': 'Cerrado · secondary',
  '--bm-ink': 'Pine Ink · text',
  '--bm-ink-soft': 'Soft Ink · body',
  '--bm-stone': 'Stone · muted',
  '--bm-terracotta': 'Terracotta · accent',
  '--bm-ipe': 'Ipê · highlight',
  '--bm-canopy': 'Canopy · dark ground',
  '--bm-understory': 'Understory · dark surface',
  '--bm-sage': 'Sage · dark primary',
  '--bm-terracotta-dk': 'Terracotta · dark accent',
};

export const Colors: Story = {
  render: () => (
    <ColorCatalog manifest={manifest} sections={SECTIONS} notes={NOTES} />
  ),
  play: async ({ canvasElement }) => {
    await expectCompleteColorCatalog(canvasElement, manifest, NOTES);
    await expectCopyInteraction(canvasElement, '--brand');
  },
};
```

- [ ] **Step 3: Run the story tests and confirm they pass**

Run: `npx nx test-storybook docs -- biome/Foundations`
Expected: PASS, including axe.

Then: `npx nx run-many -t typecheck lint -p docs`
Expected: PASS.

- [ ] **Step 4: Check it in the browser**

On `Biome → Foundations → Colors`:

- there is no "Uncategorized" section;
- semantic and contract cards show `dark: …` rows;
- toggling the toolbar Mode to dark flips the semantic swatches and the card chrome together.

- [ ] **Step 5: Commit**

```bash
git add apps/docs/src/biome/Foundations.stories.tsx
git commit -m "feat(docs): generate biome color swatches from the token manifest"
```

---

### Task 6: Faune Colors story

**Files:**

- Modify: `apps/docs/src/faune/Foundations.stories.tsx`: the `Colors` story, and delete `Swatch`, `Grid`, `BRAND` and `SEMANTICS`

**Interfaces:**

- Consumes: the same as Task 5, plus `isSemanticColor`; `@thijulio/faune-tokens/tokens.manifest.json`.
- Produces: nothing new.

- [ ] **Step 1: Add the new play next to the existing one and confirm it fails**

Add the imports, following Task 5 with `faune` in place of `biome` (`import fauneTokens from '@thijulio/faune-tokens/tokens.manifest.json'`, `const manifest: TokenManifest = fauneTokens;`, and `isSemanticColor` in the `token-manifest` import).

Replace the body of the current `Colors.play` with:

```ts
  play: async ({ canvasElement }) => {
    await expectCompleteColorCatalog(canvasElement, manifest);
    await expectCopyInteraction(canvasElement, '--ink');
  },
```

This keeps the old ink-caption contrast guarantee: `expectCompleteColorCatalog` asserts ≥ 4.5:1 for every caption.

Run: `npx nx run-many -t build -p faune-tokens && npx nx test-storybook docs -- faune/Foundations`
Expected: FAIL in `Faune/Foundations › Colors`. The rendered list is empty.

- [ ] **Step 2: Replace the story**

Delete `Swatch`, `Grid`, `BRAND` and `SEMANTICS`; all their uses are inside `Colors`. Keep the `contrastRatio`, `expect`, `waitFor`, `within` and `hoverInBrowserTest` imports, because `LinksHovered` uses them. Then add:

```tsx
const SECTIONS: ColorSection[] = [
  {
    title: 'Brand palette — warm & founder-led',
    description:
      'Deep-teal ink, coral accent, yellow highlight, sage support, warm paper surfaces.',
    match: (t) => t.source === 'color.json' && !isSemanticColor(t),
  },
  {
    title: 'Semantics — fixed meaning',
    description:
      'success / warning / danger / info. Never reskin with a theme.',
    match: isSemanticColor,
  },
  {
    title: 'Contract — the shared language',
    description:
      'Every brand aliases its palette into --ds-*; @thijulio/primitives skins from these.',
    match: (t) => t.source === 'contract.json',
  },
];

export const Colors: Story = {
  render: () => <ColorCatalog manifest={manifest} sections={SECTIONS} />,
  play: async ({ canvasElement }) => {
    await expectCompleteColorCatalog(canvasElement, manifest);
    await expectCopyInteraction(canvasElement, '--ink');
  },
};
```

- [ ] **Step 3: Run the story tests and confirm they pass**

Run: `npx nx test-storybook docs -- faune/Foundations`
Expected: PASS, including `LinksHovered` and axe.

Then: `npx nx run-many -t typecheck lint -p docs`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/docs/src/faune/Foundations.stories.tsx
git commit -m "feat(docs): generate faune color swatches from the token manifest"
```

---

### Task 7: Documentation and full verification

**Files:**

- Modify: `AGENTS.md`

**Interfaces:**

- Consumes: everything above.
- Produces: nothing new.

- [ ] **Step 1: Update AGENTS.md**

- **The token pipeline**: in the numbered base build, add `` `tokens.manifest.json` `` to step 1's outputs. Add this paragraph after the cross-platform list: "`dist/tokens.manifest.json` is a machine-readable index of every token as the CSS platform names it: `{ name, path, source, value, references, kind }`, plus `themes[]` with each overlay's entries. It's built with the CSS transforms and prefix, and each `verify.mjs` asserts its names equal the declared custom properties. The Storybook color catalogs read it; bump `MANIFEST_VERSION` in `packages/core/src/lib/formats/manifest.ts` on any breaking shape change."
- **Package conventions → tokens package**: the exports list gains `./tokens.manifest.json`→`dist/tokens.manifest.json`.
- **How to… → Add or change a token**: append "Color tokens appear automatically in the brand's `Foundations → Colors` story. If one lands under _Uncategorized_, add or extend a section matcher in that story."
- **Gotchas**: add "`nx test-storybook docs` runs two Vitest projects: `unit` (node, `src/**/*.spec.ts`) and `storybook` (browser). Pure docs logic lives in `src/_foundations/*.ts` with a `.spec.ts`."

- [ ] **Step 2: Run the full gate on Node 24**

Run: `nvm use && npx nx run-many -t lint test build typecheck --skip-nx-cache && npx nx build-storybook docs && npx nx test-storybook docs`
Expected: everything passes. `build-storybook` also runs `verify-contract`.

- [ ] **Step 3: Check the release impact with a dry run (after pushing the branch)**

Run: `gh workflow run release.yml -f dry_run=true --ref <branch>` and read the run log.
Expected: patch bumps for the three tokens packages, plus any `nx affected` dependents as described in `AGENTS.md`. Share the list with the owner before merging.

- [ ] **Step 4: Commit**

```bash
git add AGENTS.md
git commit -m "docs: document the token manifest and generated color catalog"
```
