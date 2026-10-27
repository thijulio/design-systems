# Design Systems Monorepo — Agent & Contributor Guide

> Read this first. It is the single source of truth for how this repo is built,
> the decisions behind it, and how to extend it safely. `CLAUDE.md` points here.
> Nx keeps the `<!-- nx configuration -->` block at the bottom up to date — leave
> it alone; add everything else above it.
>
> **Planning / context layer:** the product context, decisions, and memory live in
> the Obsidian workspace at `thijulio-os/projects/professional/design-system/`
> (iCloud; `thijulio-os/AGENTS.md` is the top-level "read this first"). This code
> repo is linked there via a `repo/` symlink. Read it for the "why".

## What this is

One Nx monorepo hosting **three independent brand design systems** that share
build tooling plus a small set of brand-agnostic UI primitives, published as
private npm packages under the `@thijulio` scope.

- **Biome Modernism** (`packages/biome/*`, tag `scope:biome`) — the personal /
  website system. Editorial: serif display (Newsreader), light/dark via
  `[data-mode="dark"]`.
- **Exodus** (`packages/exodus/*`, tag `scope:exodus`) — the professional / work
  system consumed by the Pet Management Platform (PMP) and future client work.
  Product-grade: Hanken Grotesk, warm-stone neutrals, fixed status tones, and
  three swappable accent themes (Sage default / Clay / Harbor) via `[data-theme]`.
- **Faune** (`packages/faune/*`, tag `scope:faune`) — the warm, founder-led
  cat-sitting brand (Maison Féline). Editorial serif (Newsreader) + Inter, deep
  teal ink, coral accent, generous rounded radii. Light-first (no theme overlays
  yet).

The three brands **never import from each other** (enforced by Nx module
boundaries). They share `packages/core` + `packages/fonts` (build tooling
only) and `packages/primitives` (`scope:shared`) — brand-agnostic UI
primitives styled against a shared **semantic contract** of `--ds-*` CSS
custom properties. Each
brand using primitives aliases its own tokens into that contract (see
`packages/{biome,exodus,faune}/tokens/src/tokens/contract.json`), so the primitives
skin automatically per brand. Beyond the contract, the brands' token schemas
genuinely differ — nothing else is shared.

Git is the source of truth. Built packages are pushed **up** to the matching Claude
Design projects via the `/design-sync` skill (repo → Claude Design), so the design agent
builds with the real components. Never pull the other way: Claude Design is a render
target, not a source. (The flow was once the reverse; per-brand sync config and project
IDs live in `.design-sync/{biome,exodus,faune}.NOTES.md`.)

## Golden rules (read before doing anything)

- **Never commit to `main`.** Work on a feature branch, open a PR. Merges to main
  happen only at the owner's direction.
- **Never touch other repos.** `pet-management-platform`, `-infra`, and
  `aws-account-bootstrap` are off-limits (read-only). All work stays here.
- **Node 24** (`.nvmrc`). Shell scripts must load nvm first:
  `export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 24`.
- **Do not bump TypeScript past `5.9.x`.** TS 6 removed `ts.readConfigFile`, which
  breaks Nx 23's project-graph plugin (silently degrades tasks, hard-fails
  generators). Pinned at `typescript@5.9.3`.
- **CSS Modules + CSS variables only.** No Tailwind, no CSS-in-JS in shipped code.
  Components reference token vars (`var(--brand)`, `var(--accent)`) — never
  literal hex.
- **Run tasks through Nx** (`nx build`, `nx run-many`, `nx affected`), not the
  underlying tools.
- **Conventional Commits**, enforced by commitlint (husky `commit-msg`). The
  subject must **start lowercase** (a capitalized proper noun at position 0 —
  "Button", "Storybook" — trips `subject-case`). Body lines ≤ 100 chars.
- Prefer small, reviewable changes.

## Layout

```
packages/
  core/            @thijulio/core — Style Dictionary token build harness (scope:core)
  fonts/           @thijulio/fonts — webfont self-hosting build + verify (scope:core)
  primitives/      @thijulio/primitives — Button, Card, Tag, Badge, Avatar, Input (+Textarea, Select), Eyebrow (scope:shared)
  primitives-web-components/  @thijulio/primitives-web-components — Stencil tj-button, tj-input (scope:shared; private, ADR-0001 spike)
  biome/
    tokens/        @thijulio/biome-tokens — SD JSON → tokens.css (+ .js/.d.ts)
    css/           @thijulio/biome-css    → dist/biome.css (reset+base+motion)
    react/         @thijulio/biome-react  — Button, Card, Tag, ModeToggle, TerminalHero
  exodus/
    tokens/        @thijulio/exodus-tokens
    css/           @thijulio/exodus-css   → dist/exodus.css (+ exodus-tokens.css: fonts + tokens only)
    react/         @thijulio/exodus-react — 15 universal components (no PetCard)
  faune/
    tokens/        @thijulio/faune-tokens — palette + contract → tokens.css
    css/           @thijulio/faune-css    → dist/faune.css (+ faune-tokens.css: fonts + tokens only)
    react/         @thijulio/faune-react  — re-exports every primitive (no wrappers)
    web-components/ @thijulio/faune-web-components — re-exports the tj-* elements (private, ADR-0001 spike)
apps/
  docs/            Storybook (SB 10, react-vite) — shared Components + per-brand trees, design-system picker (scope:docs)
  docs-web-components/ Storybook (web-components-vite) — tj-* elements, composed into docs via refs
```

`PetCard` is intentionally NOT in Exodus — it's pet-domain-specific and belongs
in PMP, not the reusable catalog. Same rule for Faune: pet-domain pieces (Pet
Passport, Rocket mascot, cat portraits) live in the Maison Féline site repo, not
in `@thijulio/primitives` or `@thijulio/faune-*`.

New generic components belong in `@thijulio/primitives`, styled against the
`--ds-*` contract; brand React packages keep their public APIs while overlapping
components migrate. Biome `Button`, `Tag` and the `Card` root, and Exodus
`Button`, `Card`, `Badge`, `Avatar`, `EmptyState`, `ErrorState`, `LoadMore`,
`Input`, `Textarea`, `Select` and `Toast`, delegate to primitives; their local
CSS skins keep native tokens, metrics and consumer class overrides. Exodus
`*Field`s wait on its `Field` delegating (re-exports drop its skins). Only
genuinely brand-specific components go in brand packages (e.g. Biome's `TerminalHero`).

**Every brand has the same shape: `<brand>-tokens → <brand>-css → <brand>-react`.**
Consumers always import components from `@thijulio/<brand>-react`, never from
primitives directly. Faune is the target state: `faune-react` re-exports the
primitives with no wrappers, because its tokens implement the `--ds-*` contract
natively. Biome and Exodus wrappers (compatibility skins) are a migration bridge
and should shrink toward that, component by component. Brands keep different
component _sets_ and themes; only the structure is uniform.
Vue/Angular support: Web Components alongside `-react` (accepted) — see
[ADR-0001](docs/architecture/adr/0001-multi-framework-web-components.md).

## The token pipeline (how tokens become CSS + TS)

`packages/core` (`createBaseConfig` + `createThemeConfig` + `buildBrandTokens`)
is a thin, tested wrapper over Style Dictionary v5. A brand's `build.mjs` calls
`buildBrandTokens({ source, buildPath, themes })`:

1. **Base build** → `tokens.css` (`:root { … }`) plus `tokens.js` / `tokens.d.ts`
   (typed objects — the React Native drop-in path). References are preserved as
   `var(--…)` (`outputReferences: true`).
2. **Each theme overlay** → a selector-scoped block (`[data-mode="dark"]`,
   `[data-theme="clay"]`, …) filtered to only that overlay's tokens, appended to
   `tokens.css`.

The same JSON also feeds **cross-platform artifacts** (additive — the web
outputs above are byte-for-byte unchanged):

- `dist/native/` — React Native: typed nested `tokens.js`/`.d.ts` with
  **normalized** values, `themes/<name>.js` per overlay, and an `index.js`
  exporting `{ tokens, themes, resolve }` (deep-merge). One classifier
  (`packages/core/src/lib/values.ts`) converts: px/rem → logical px (16px
  root), `s`/`ms` → ms, `cubic-bezier` → `{x1,y1,x2,y2}`, `clamp()` → its min,
  colors → `#RRGGBB`/`rgba()`; web-only strings (font stacks, shadows, compound
  radius) pass verbatim.
- `dist/dart/` — Flutter: `tokens.dart` (`abstract final class <Brand>Tokens`),
  `theme_<name>.dart` per overlay (color-only, so `Map<String, Color>`) and a
  `themes.dart` barrel (`<Brand>Themes.all`).

The formats live in `packages/core/src/lib/formats/`, registered once per build
by `platforms.ts` (config factories reference them by name), and ship as the
`./native` and `./flutter/{tokens,themes}.dart` exports.

Token JSON authoring rules (relied upon — do not "fix"):

- Uses legacy `value` + `{ref.path}` references.
- Non-standard top-level categories (`bm`, `surface`, `accent`, `n`, `space`,
  `tone`, …) bypass SD's type transforms, so values emit **verbatim** — px stays
  px, hex case is preserved, `cubic-bezier`/`clamp` intact. This is intentional.
- Use **flat keys** when a name is both an alias and a ramp prefix (Exodus
  `--accent` + `--accent-50..900`): SD can't have a key be both a value and a
  group.
- The CSS `prefix` option applies to the CSS platform only (JS token names stay
  prefix-free); most brands leave it unset and encode any namespace in paths.

## Token manifest & generated color catalog

Every tokens package also builds and exports `dist/tokens.manifest.json`
(`@thijulio/<brand>-tokens/tokens.manifest.json`), a machine-readable index of
every token: `{ name, path, source, value, references, kind, native: { accessor } }`
plus `themes: [{ name, selector, tokens }]`.

- **Source:** `packages/core/src/lib/formats/manifest.ts`, built with the CSS
  transforms and `prefix` (`name` is the exact custom property). `kind` comes
  from `normalize()`; `native.accessor` is the RN expression into
  `@thijulio/<brand>-tokens/native` (`tokens.n['500']`). Bump
  `MANIFEST_VERSION` on a breaking shape change; the catalog rejects unknown
  versions.
- **What `verify.mjs` guarantees:** manifest names equal the custom properties
  declared in each `tokens.css` block (`:root` and every theme selector), and
  every RN accessor, evaluated as written, resolves in `native/tokens.js`
  (colors to the same color).
- **Storybook:** each brand's `Foundations → Colors` story renders
  `apps/docs/src/_foundations/ColorCatalog.tsx` from its manifest. Every color
  token gets a card with its Web name (`var(--name)`) and RN accessor, both
  copyable, plus value, alias and per-theme overrides. The story only declares
  editorial sections (`title`, `description`, `match`); the first match wins.
  A new color token no section claims still renders (under **Uncategorized**),
  but the story's play test fails until you add or extend a matcher. Matchers
  often key on `source` (the JSON file name), so renaming a token file means
  updating them. Human labels go in the story's `notes`, keyed by CSS name;
  the play test fails on notes for tokens that no longer exist.
- **Web Components** (ADR-0001) read the same inherited `var(--ds-*)` / brand
  vars, so the Web names in the catalog apply to them unchanged.
- **Testing:** `nx test-storybook docs` runs `unit` (node,
  `src/**/*.spec.ts`) and `storybook:<brand>` (browser; one per brand via
  `initialGlobals`, in sequence; see `vitest.config.ts`). Catalog stories use
  `colorCatalogParameters`, which turns off **only** axe's `color-contrast`
  (~12.5s of a ~16s run on the 95-swatch Exodus catalog); their play
  (`expectCompleteColorCatalog`) instead asserts WCAG AA for every text element
  against its effective background, compositing translucent text, after
  checking the brand's `--ds-*` vars resolved (it throws on a translucent
  background rather than guess). Biome's catalog also runs in dark mode
  (`ColorsDark`, test-only via `!dev`). Don't disable the axe rule elsewhere.

## Package conventions

**tokens package** — package.json-based, NO tsconfig/tsc. Structure:
`src/tokens/*.json` (base), `src/themes/<name>/*.json` (overlays), `build.mjs`
(imports `@thijulio/core`, uses `import.meta.dirname`), `verify.mjs` (node:assert
on the built output). `package.json`: `type: module`, exports `.`→`dist/tokens.js`
(+`.d.ts`), `./tokens.css`→`dist/tokens.css` and
`./tokens.manifest.json`→`dist/tokens.manifest.json`, `files: ["dist"]`, devDep
`@thijulio/core: "*"`, nx targets `build` (`node {projectRoot}/build.mjs`,
`dependsOn: ["^build"]`, `outputs: ["{projectRoot}/dist"]`) and `test`
(`node {projectRoot}/verify.mjs`, `dependsOn: ["build"]`).

**css package** — CSS-only. `src/{reset,base,motion}.css`; `build.mjs`
concatenates them with the sibling tokens CSS (read via
`import.meta.resolve('@thijulio/<brand>-tokens/tokens.css')`) into
`dist/<brand>.css`. Exports `./<brand>.css` and `./fonts/*`. **All brands
self-host their webfonts** (consumers promise no third-party requests, GDPR).
`fonts.config.mjs` is the font contract (family → fontsource package → weights
per style); `build.mjs` calls `@thijulio/fonts`' `buildFonts()`, which copies the
latin + latin-ext woff2 files and OFL licences from the exact-pinned
`@fontsource(-variable)/*` devDeps into `dist/fonts/` and returns `@font-face`
rules (relative `url('./fonts/…')`, `swap`, fontsource unicode-ranges) that lead
the bundle. `verify.mjs` calls `verifyFonts()` with every `dist` stylesheet and
its required `font-display` (`null` = none); it re-derives the contract and
fails on any `http(s)://`, a `url()`/`@import` escaping `dist`, an unlisted
stylesheet, a wrong `font-display`, a family × style × weight missing latin or
latin-ext, unused shipped fonts, or a missing licence. Bundlers rewrite the
relative urls (Angular → hashed `media/`, Vite → hashed `assets/`).

**`font-display` is the consumer's call, and `<brand>.css` stays `swap`.** It
can't be overridden outside the `@font-face` rule, so a brand needing both ships
both: Biome also exports `./biome-core.css` (no faces), `./fonts-optional.css`
(same faces and files, `font-display: optional`, from `fontFacesCss()`) and
`./faces/<family>-<style>-<swap|optional>.css` (the same faces cut by family ×
style, `fontFacesCss({ only })`, so a page picks the display face by face).
`swap` suits apps and pages without preloads (an SPA under `optional` keeps the
fallback all session on a first visit); `optional` + preloads from
`@thijulio/biome-css/fonts/<file>.woff2` is the zero-shift path for proportional
first-screen faces. A family's optional `fallbacks` in `fonts.config.mjs` make
`@thijulio/fonts` emit metric-matched `local()` faces (`'<family> Fallback
<name>'`, `size-adjust` + `*-override` from capsize: the shipped woff2 via
`@capsizecss/unpack`, the system font via `@capsizecss/metrics`) after the
webfont faces in every face stylesheet; the brand's `--font-*` tokens name them
right after the webfont. They make a monospace swap shift-free (equal advances;
not on Android, which has no Courier New or clone)
and only reduce a proportional one (measured; a re-wrap still shifts), so a
proportional face swaps only where the consumer has measured its own page.
Biome's `verify.mjs` asserts the split and the per-face sheets are the bundle
cut up, that the tokens list the fallbacks, and that every preload in
`packages/biome/css/README.md` (the consumer guide) is a face it uses;
`verifyFonts()` re-derives every fallback face and its overrides. Declared
family names are `fonts.config.mjs`'s `family` (`'Newsreader'`, not
`'Newsreader Variable'`); consumers use the `--font-*` tokens.

**react package** — `@nx/react:library --bundler=vite`. Component per folder:
`Name/{Name.tsx, Name.module.css, Name.spec.tsx}`. CSS Modules reference token
vars. Data-driven palettes (e.g. status tones) are wired via inline CSS custom
properties + the `StyleWithVars` type in `_util/style.ts` (avoids N near-identical
classes). `react`/`react-dom` are peerDependencies; `sideEffects: ["**/*.css"]`.
Also exports `./styles.css`→`dist/index.css` (for Storybook, which consumes built
packages). The vite build emits **one module per source file** (`preserveModules`,
`dist/lib/Name/Name.js`) so a consumer importing one component drops the rest via
`sideEffects`; all CSS still lands in the single `dist/index.css` and no JS module
imports CSS. The `verify-tree-shaking` target (`tools/verify-tree-shaking.mjs`, in
CI and the release gate) bundles `import { Button }` from the built `dist` and
fails if unrelated components leak in or it exceeds 40% of the whole package. When a prop name collides with a native HTML attribute you repurpose
(`title`, `onChange`), `Omit` it from the extended `HTMLAttributes`.

The Biome, Exodus, Faune and primitives packages are published to GitHub
Packages (`private: false`, `publishConfig`, `files: ["dist"]`); their current
versions are the `<pkg>@<version>` git tags. `core` and `fonts` stay private
and build-only (tokens build with `core`, css packages with `fonts`). Nothing
publishes on merge: releases are dispatched by hand — see **Release / publish**
below.

## How to…

**Add a primitive** (the home for anything generic):

1. `packages/primitives/src/lib/Name/{Name.tsx, Name.module.css,
Name.spec.tsx}`: `forwardRef` + `displayName`; the module CSS uses only
   `var(--ds-*)`, never a brand variable or a fallback to one.
2. Generic copy only: no product naming or concepts, and every user-facing
   string (label, accessible name) is a **required** prop with no default.
3. Export it and its props type from `packages/primitives/src/index.ts`,
   `packages/exodus/react/src/index.ts` (the re-exported-unchanged block,
   unless Exodus wraps it) and `packages/faune/react/src/index.ts`. Faune's
   `index.spec.tsx` fails until Faune re-exports every primitive.
4. One shared story, `apps/docs/src/components/Name.stories.tsx` (title
   `Components/Name`, imports `@thijulio/primitives`): argTypes with
   descriptions, a story per variant, and at least one `play` test on role,
   accessible name and keyboard behaviour. The picker and theme toolbar
   restyle it per brand, so write no per-brand copy.
5. Only when `exodus-react` wraps it in its own component (not a re-export),
   add `apps/docs/src/exodus/Name.stories.tsx` (`Exodus/Components/Name`)
   showing just the Exodus skin.
6. `nx run-many -t test typecheck lint --projects=primitives,exodus-react,faune-react`,
   then `nx verify-contract docs` and `nx test-storybook docs`.

**Add a brand-only component** (or a brand skin): create `Name/{Name.tsx,
Name.module.css, Name.spec.tsx}` (`forwardRef` + `displayName`) in
`packages/<brand>/react/src/lib/`, export
from its `src/index.ts`, story in `apps/docs/src/<brand>/Name.stories.tsx`
(`<Brand>/Components/Name`). Style with CSS Modules + token vars.
For either, write a Jest + RTL **behavior** spec (roles, state, callbacks — not
snapshots, not hashed class names). Run `nx run-many -t test typecheck build lint --projects=<brand>-react`.

**Add or change a token:** edit the JSON in `packages/<brand>/tokens/src`, run
`nx build <brand>-tokens`, update `verify.mjs` if you added a structural
guarantee. Downstream css/react rebuild via the Nx graph.

**Add a theme:** add `src/themes/<name>/*.json` (only the tokens that change) and
a `theme('<name>')` entry in the brand's `build.mjs` with the right selector.

**Add a brand that uses shared components:** create its `tokens`, `css`, and
`react` packages (copy `packages/faune/*` — `react` starts as a re-export of the
primitives), map its source tokens to `--ds-*` in `src/tokens/contract.json`, add it to
`DESIGN_SYSTEMS` in `apps/docs/.storybook/design-system.ts` and its CSS bundle to
`BRAND_CSS` in `preview.tsx` (typed against `DESIGN_SYSTEMS`) plus its `storySort` entry
(the shared `Components/…` stories then render in it from the picker),
and add it to `apps/docs/verify-contract.mjs`. See
`docs/architecture/multi-brand-primitives.md`. `nx verify-contract docs` checks
the variables consumed by primitives; Storybook tests check actual themed
rendering.

**See a change in Storybook:** components are consumed as **built** packages, so
build the changed token/CSS/React package first, then `nx storybook docs`.

**Release / publish packages:** manual, never on merge. A merge used to
release whatever its commit message implied — a squash titled `feat:` bumped
every package it touched — so the **Release** workflow
(`.github/workflows/release.yml`) now only runs on dispatch:
`gh workflow run release.yml -f version=<v> -f projects=<a,b> -f dry_run=<bool>`
(or the Actions UI). `version` is an exact version (`0.1.0`) or a bump keyword
(`minor`); empty derives bumps from conventional commits (while a package is
0.x, Nx turns `feat`/`fix` into a patch bump) for each package they
**affect** — see the "Release bumps follow `nx affected`" gotcha. `projects`
is a comma-separated list of nx projects; empty means every release project.
Both inputs are shape-checked before anything runs. Nx also bumps and tags the
listed projects' dependents (a `primitives` release bumps `biome-react` by a
patch), so publish is not filtered: it ships every release project whose
version is not in the registry yet. Check the dry run for them. `dry_run` defaults to `true`:
always preview first (dry runs may target any branch with `--ref`; real
releases are refused unless dispatched from `main`). It runs the full
format/lint/test/build/typecheck/verify-contract gate, then
`nx release --skip-publish` (version → changelog → commit → git tag), pushes the
version commit + tags to `main` with `--atomic`, and only then
`nx release publish` (GitHub Packages via `GITHUB_TOKEN`). Order matters:
registry versions are immutable, so if `main` moved during the run the push is
rejected **before** anything is published — dispatch again from the new tip.
Publish skips versions already in the registry, and re-running a run that
pushed but failed to publish recovers it. The version commit is pushed over
SSH with the `RELEASE_DEPLOY_KEY` deploy key (a repo secret holding the private
half of a write deploy key): the `main` ruleset requires the CI checks `main`
and `Storybook browser checks`, and on a personal repo only deploy keys (not
GitHub Actions) can bypass it. A real release fails fast without the secret.
That push triggers CI and the Pages deploy on the release commit; it can't
loop because Release only runs on dispatch. A breaking
change in a 0.x package needs a hand-written changelog note: Nx only records
it as the minor bump.
Three hard-won gotchas are baked in: **`HUSKY=0`** (the dev pre-commit hook
otherwise blocks nx release's automated version commit), a **release-only
pre-commit hook** (`.github/release-hooks/pre-commit`, wired via
`git config core.hooksPath`) that prettier-formats what nx release staged —
nx writes CHANGELOG.md without a final newline, which failed the next CI
`nx format:check` on main — and an explicit **`git push --follow-tags`** (nx
release commits & tags locally but does **not** push). Use `dry_run=true` to preview versions without publishing. Versions are
resolved from the `<pkg>@<version>` git tags, so never delete them. The new
Faune/primitives projects (including `faune-react`) have a scoped disk fallback
for their initial release; existing projects still require their tags. Biome and Exodus React allow Nx
to update its primitives dependency range during versioning. Use the normal
dry run (`first_release=false`) for this mixed group. The Storybook Pages site
redeploys automatically on push to `main` (`storybook-pages.yml`).

## Commands

```
nx run-many -t build test lint typecheck verify-tree-shaking  # everything
nx run-many -t build test lint --projects=<name>  # one project (+ its deps)
nx build-storybook docs                            # static Storybook → apps/docs/storybook-static
nx verify-contract docs                           # check shared CSS variables for all three brands
nx storybook docs --port 6006                      # dev (needs react packages built first)
nx storybook docs-web-components                   # Web Components Storybook (6007), composed into docs
nx test-storybook docs                             # story interaction tests (headless chromium)
nx format:write   /   nx format:check              # prettier (ignores *.swcrc, Dockerfile)
gh workflow run release.yml -f version=0.1.0 -f projects=primitives  # preview (dry_run defaults to true)
gh workflow run release.yml -f version=0.1.0 -f projects=primitives -f dry_run=false  # publish
```

## Testing

Jest + React Testing Library for react packages (behavior specs). Token/CSS
packages use a `node:assert` `verify.mjs` run as the `test` target — because
**Style Dictionary is pure ESM and Jest's loader can't import ESM in a CJS run**,
so the real build/output is validated by Node, not Jest. In `core`, the pure
config factory (`createBaseConfig`/`createThemeConfig`, type-only SD import) is
Jest-tested; the SD build itself runs at `nx build`.

## Boundaries

ESLint `@nx/enforce-module-boundaries` (`eslint.config.mjs`): `scope:core`
(`core`, `fonts`) depends on nothing; `scope:shared` → shared only; `scope:biome` → core+shared+biome;
`scope:exodus` → core+shared+exodus; `scope:faune` → core+shared+faune (the brands
**never** import each other); `scope:docs` → core+shared+all brands (the only
cross-brand consumer).

## Gotchas / hard-won lessons

- **Jest + ESM:** can't import Style Dictionary (or anything that imports it) in a
  CJS Jest test. Keep pure config separate from the SD runner; validate real
  output with a Node `verify.mjs`. Jest is `commonjs`+swc with a
  `^(\.{1,2}/.*)\.js$`→`$1` moduleNameMapper for ESM-style import specifiers.
- **Storybook consumes BUILT packages, not source.** Source `.module.css` imports
  resolve empty under Storybook's Vite → unstyled components. `apps/docs`
  imports each react package's `dist` (via node_modules exports) + `./styles.css`.
  So: rebuild react packages before Storybook reflects component changes. And
  `main.ts` must keep `@vitejs/plugin-react` in `viteFinal` or JSX-in-`render`
  stories fail the export-order lexer ("Parse error @:LINE").
- **Storybook theming:** a shared primitive has ONE story set
  (`Components/<Name>`), restyled per brand. `preview.tsx` takes the brand from
  the title prefix or, for `Components/…`, the picker's `designSystem` global
  (default Exodus), injects only that brand's CSS (brands share some `:root`
  names), then sets `data-mode`/`data-theme` from the toolbar. A story asserting
  one brand's colours pins `globals: { designSystem: '<Brand>' }` and
  `tags: ['!autodocs']` (on a Docs page it would restyle every other story).
  Logic: `.storybook/design-system.ts` (`activeDesignSystem`).
- **Sidebar taxonomy:** `Components/<Name>` (flat, one file each in
  `apps/docs/src/components/`) holds the shared primitives. Every brand has the
  same tree: `<Brand>/Foundations`, `<Brand>/Components/<Name>` (flat; only
  brand-only components and the brand's own re-skinned wrappers) and
  `<Brand>/Migration/<Name>` (wrapper-bridge stories that go with the wrappers).
  Only `Introduction` is unbranded. `.storybook/design-system.spec.ts` parses
  every story title (here and in `docs-web-components`) and fails on anything
  else. Order is the literal `options.storySort` in `preview.tsx` (read
  statically).
- **Design-system picker:** the **Design system** dropdown (`manager.tsx`)
  filters the sidebar (`api.experimental_setFilter`) to one brand's tree plus
  `Components` and unbranded pages, and sets the `designSystem` global so shared
  stories restyle in place. Switching on a branded page lands on the same page in
  the target brand if it exists (else its Foundations). The URL wins (a branded
  story, or `globals=designSystem:<Brand>`); **All** shows every tree and keeps
  shared stories in the last brand (search only covers the visible tree). The
  pick persists in `localStorage`. The per-brand `.storybook-<brand>/`
  design-sync configs keep the old toolbar on purpose: single-brand builds that
  load `src/components/**` with their brand forced (minus name collisions).
- **Composition (`refs`) is decided at boot.** Storybook probes each ref once
  at start (`GET <url>/iframe.html`). Unreachable → the browser later fetches
  with `credentials: 'include'`, which the ref's `Access-Control-Allow-Origin: *`
  rejects ("Loading of ref failed … CORS error") until a restart. So `main.ts`
  waits up to 90s for 6007, else leaves it out with a warning; if 6007 came up
  later, restart `docs`.
- **Docs & a11y:** `tags: ['autodocs']` is global, so every meta with a
  `component` gets a Docs page. Docgen does NOT run on built packages: props
  tables come from **`argTypes` in each story** (mirror the source JSDoc; an
  empty `description` is a gap). `@storybook/addon-a11y` adds the Accessibility
  panel; `src/Introduction.mdx` is the landing page.
- **Interaction tests:** `nx test-storybook docs` runs every story in headless
  chromium via `@storybook/addon-vitest` (`apps/docs/vitest.config.ts`,
  `@vitest/browser-playwright`): each is a mount smoke test, `play` adds
  assertions. Needs `npx playwright install chromium` once.
- **Test-run load lives on one Node thread.** Vitest, the Vite dev server and
  the Playwright client share one event loop; when it saturates, real pointer
  actions (`userEvent.hover`, all round-trips) stall and time out at random.
  addon-vitest streams each story's axe result in its task meta, so under Vitest
  `preview.tsx` passes axe `resultTypes: ['violations', 'incomplete']` (full
  passes were ~50 MB of RPC per run; dropping them halved the heaviest stories).
  Keep that guard and per-story payloads small; don't raise `testTimeout` to
  hide a stall.
- **prettier** has no parser for `.swcrc` or `Dockerfile` → `**/*.swcrc` and
  `Dockerfile`/`.dockerignore` are in `.prettierignore`.
- **Webfonts are self-hosted: never add a font CDN `@import`/`<link>`** (GDPR;
  see css package above). To change fonts, edit `fonts.config.mjs` and add the
  fontsource package as an **exact-pinned** devDependency. Prefer
  `@fontsource-variable/*` (Google's axes and bytes); static `@fontsource/*` only
  when no variable cut exists (Spectral) or ≤2 weights are smaller static
  (JetBrains Mono). Keep `opsz` for Newsreader (dropping it changes rendering).
  The declared `font-weight` range is the contracted weights, not the file's
  axis, so out-of-contract weights snap to the nearest, as on Google.
- **latin-ext is emitted before latin** in the generated CSS: the subsets'
  unicode-ranges overlap (U+0304/0308/0329) and the last-declared face wins.
- **`dist/` belongs to `vite build` alone.** In vite-built packages
  `tsconfig.lib.json` emits to `out-tsc/lib`: `build` (vite `emptyOutDir` +
  vite-plugin-dts) and `typecheck` (`tsc --build`) run in parallel, and sharing
  `dist` flaked both (TS6305 / TS2306 / `ENOTEMPTY`). So cross-package types
  resolve to the dependency's built `dist` (react `typecheck` depends on
  `^build`), and `docs:build` depends on `^typecheck` so its `tsc -b` never
  races a library's own typecheck. Keep this split for new vite packages.
- **Release bumps follow `nx affected`, not "files in the package".** Each
  `feat`/`fix` since a package's last tag bumps every package it _affects_: its
  own files, its dependencies (`core` → tokens, `fonts` → css, `primitives` →
  react) and workspace inputs (`nx.json`, `eslint.config.mjs`, `jest.preset.js`
  hit all nine; `tsconfig.base.json` six). Changelogs list only own-file
  commits, hence "version bump only". So keep build tooling split by consumer
  (don't merge `core` and `fonts`), and type root config/tooling commits
  `build:`/`ci:`/`chore:`/`refactor:`, never `feat:`/`fix:`. `nx.json` sets
  `@nx/js` `projectsAffectedByDependencyUpdates: 'auto'` (the default `'all'`
  bumped everything on any install); that also narrows `nx affected` (no project has a graph edge to the
  toolchain), so
  `ci.yml` runs `run-many` whenever `package-lock.json` changed. Preview with
  `npx nx release --dry-run --skip-publish`.

## Multi-agent config

Nx's workspace skills live once in `.agents/skills/`; `.claude/skills`,
`.cursor/skills`, `.github/skills` and `.opencode/skills` are symlinks to it
(git mode 120000): edit the real files. `.codex/` and `.gemini/`
hold only Nx's tool config (MCP server, agents, commands). `CLAUDE.md` is a
separate, short file that points here and carries Nx's generated block.

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->
