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

Git is the source of truth. The repo's built packages are pushed **up** to the matching
Claude Design projects via the `/design-sync` skill (repo → Claude Design), so the design
agent builds with the real components. Never pull the other way — Claude Design is a render
target, not a source; nothing in it is authored back into this repo.

> Historical note: this rule used to read "never sync back to Claude Design," describing the
> original import direction (Claude Design exports → Git). The flow was deliberately reversed
> to repo → Claude Design via `/design-sync`; see `.design-sync/{biome,exodus,faune}.NOTES.md` for
> per-brand sync config, target project IDs, and the two-brand (now N-brand) setup.

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
    css/           @thijulio/exodus-css   → dist/exodus.css
    react/         @thijulio/exodus-react — 15 universal components (no PetCard)
  faune/
    tokens/        @thijulio/faune-tokens — palette + contract → tokens.css
    css/           @thijulio/faune-css    → dist/faune.css
    react/         @thijulio/faune-react  — re-exports every primitive (no wrappers)
    web-components/ @thijulio/faune-web-components — re-exports the tj-* elements (private, ADR-0001 spike)
apps/
  docs/            Storybook (SB 10, react-vite) — all brands, theme toolbar (scope:docs)
  docs-web-components/ Storybook (web-components-vite) — tj-* elements, composed into docs via refs
```

`PetCard` is intentionally NOT in Exodus — it's pet-domain-specific and belongs
in PMP, not the reusable catalog. Same rule for Faune: pet-domain pieces (Pet
Passport, Rocket mascot, cat portraits) live in the Maison Féline site repo, not
in `@thijulio/primitives` or `@thijulio/faune-*`.

New generic components belong in `@thijulio/primitives`, styled against the
`--ds-*` contract. Existing brand React packages retain their public APIs while
overlapping components migrate incrementally. Biome `Button`, `Tag`, and the
`Card` root delegate to primitives; Card retains its editorial content and arcs.
Exodus `Button`, `Card`, `Badge`, `Avatar`, `Input`, `Textarea`, and `Select` delegate to
primitives. Local CSS-variable skins retain their native tokens, metrics, and
consumer class overrides without requiring an immediate stylesheet upgrade.
Only genuinely brand-specific components should be added to brand React
packages (e.g. Biome's `TerminalHero`).

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

- `dist/native/` — React Native. `tokens.js` + `tokens.d.ts` (nested, typed)
  with **normalized** values, plus `themes/<name>.js` per overlay and an
  `index.js` barrel exporting `{ tokens, themes, resolve }` (deep-merge).
  Values are converted by a single shared classifier in `packages/core`
  (`src/lib/values.ts`): px/rem → logical px (`rem` assumes a 16px root),
  `s`/`ms` → ms, `cubic-bezier` → `{x1,y1,x2,y2}`, `clamp()` → its min bound,
  colors → `#RRGGBB`/`rgba()`, and web-only strings (font stacks, shadows,
  compound radius) pass through verbatim.
- `dist/dart/` — Flutter. `tokens.dart` (`abstract final class <Brand>Tokens`
  of typed `static const`s), `theme_<name>.dart` per overlay
  (`Map<String, Color>`), and a `themes.dart` barrel (`<Brand>Themes.all`).
  Theme overlays are color-only in this repo, so theme maps are `Map<String,
Color>`.

The native/Dart formats live in `packages/core/src/lib/formats/` and are
registered once per build by `platforms.ts`; the pure config factories only
reference them by name. Packages expose them via `./native` and
`./flutter/{tokens,themes}.dart` exports.

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

- **Where it comes from:** `packages/core/src/lib/formats/manifest.ts`. It's built
  with the CSS transforms and `prefix`, so `name` is the exact custom property.
  `kind` comes from the shared `normalize()` classifier, and `native.accessor`
  is the React Native expression into `@thijulio/<brand>-tokens/native`
  (`tokens.n['500']`, `tokens.ds.brand`). Bump `MANIFEST_VERSION` on any
  breaking shape change; the docs catalog rejects versions it doesn't know.
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
- **Testing:** `nx test-storybook docs` runs two Vitest projects, `unit` (node,
  `src/**/*.spec.ts`, e.g. `_foundations/token-manifest.spec.ts`) and
  `storybook` (browser). The catalog stories use `colorCatalogParameters`,
  which turns off **only** axe's `color-contrast` rule. That rule took ~12.5s
  of a ~16s run on the 95-swatch Exodus catalog. Instead, the play
  (`expectCompleteColorCatalog`) asserts WCAG AA for every text element
  against its effective background, compositing translucent text. It first
  checks that the brand's `--ds-*` vars resolved, and it throws on a
  translucent background rather than guess. Biome's catalog also runs under
  dark mode (`ColorsDark`, test-only via `!dev`). Don't disable the axe rule
  for other stories.

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
`dist/<brand>.css`. Exports `./<brand>.css` and `./fonts/*`. **All three brands
self-host their webfonts** (consumers must make no third-party requests —
GDPR): `fonts.config.mjs` is the brand's font contract (family → fontsource
package → weights per style); `build.mjs` calls `buildFonts()` from
`@thijulio/fonts`, which copies the latin + latin-ext woff2 files and each
family's SIL OFL licence from the exact-pinned `@fontsource(-variable)/*`
devDependencies into `dist/fonts/` and returns generated `@font-face` rules
(relative `url('./fonts/…')`, `font-display: swap`, unicode-ranges read from
fontsource's `unicode.json`) that lead the bundle. `verify.mjs` calls
`verifyFonts()` with every stylesheet in `dist` and the `font-display` its
faces must use (`null` = declares none). It re-derives the contract
independently and fails on any `http(s)://` in a served file, any
`url()`/`@import` not resolving inside `dist`, an unlisted stylesheet, a face
with another `font-display`, any family × style × weight without both a latin
and a latin-ext face, shipped-but-unused fonts, or a missing licence. Bundlers
rewrite the relative urls (Angular → hashed `media/`, Vite → hashed `assets/`).

**`font-display` is the consumer's call, and `<brand>.css` stays `swap`.** It
can't be overridden from outside the `@font-face` rule, so a brand whose
consumers need both ships both. Biome also exports `./biome-core.css`
(`biome.css` without its faces) and `./fonts-optional.css` (the same faces,
`font-display: optional`, from `fontFacesCss()`; same files). `swap` suits apps
and pages without preloads: an SPA under `optional` would keep the fallback for
the whole session on a first visit. `optional` suits pages that preload their
first-screen faces and need zero layout shift. Preload from
`@thijulio/biome-css/fonts/<file>.woff2` so the bundler emits the same URL the
CSS uses. Biome's `verify.mjs` asserts the split is the bundle cut in two, and
that every preload file `packages/biome/css/README.md` names is a face
`fonts-optional.css` uses. That README is the consumer guide (entry points,
preload list, measured CLS). Under `swap`, a late face re-wraps text even from
HTTP cache; metric-matched fallbacks (`size-adjust`, `*-override`) were measured
and only reduce the shift, so `optional` + preloads is the zero-shift path. The
declared family names are `fonts.config.mjs`'s `family` (`'Newsreader'`, not
fontsource's `'Newsreader Variable'`); consumers use the `--font-*` tokens.

**react package** — `@nx/react:library --bundler=vite`. Component per folder:
`Name/{Name.tsx, Name.module.css, Name.spec.tsx}`. CSS Modules reference token
vars. Data-driven palettes (e.g. status tones) are wired via inline CSS custom
properties + the `StyleWithVars` type in `_util/style.ts` (avoids N near-identical
classes). `react`/`react-dom` are peerDependencies; `sideEffects: ["**/*.css"]`.
Also exports `./styles.css`→`dist/index.css` (for Storybook, which consumes built
packages). When a prop name collides with a native HTML attribute you repurpose
(`title`, `onChange`), `Omit` it from the extended `HTMLAttributes`.

The Biome, Exodus, Faune and primitives packages are published to GitHub
Packages (`private: false`, `publishConfig`, `files: ["dist"]`); their current
versions are the `<pkg>@<version>` git tags. `core` and `fonts` stay private
and build-only (tokens build with `core`, css packages with `fonts`). A merge to `main` that touches `packages/` publishes automatically —
see **Release / publish** below.

## How to…

**Add a component to a react package:** create `Name/{Name.tsx, Name.module.css,
Name.spec.tsx}`, export from `src/index.ts`, add a story in
`apps/docs/src/<brand>/Name.stories.tsx`. Style with CSS Modules + token vars.
Write a Jest + RTL **behavior** spec (roles, state, callbacks — not snapshots,
not hashed class names). Run `nx run-many -t test typecheck build lint --projects=<brand>-react`.

**Add or change a token:** edit the JSON in `packages/<brand>/tokens/src`, run
`nx build <brand>-tokens`, update `verify.mjs` if you added a structural
guarantee. Downstream css/react rebuild via the Nx graph.

**Add a theme:** add `src/themes/<name>/*.json` (only the tokens that change) and
a `theme('<name>')` entry in the brand's `build.mjs` with the right selector.

**Add a brand that uses shared components:** create its `tokens`, `css`, and
`react` packages (copy `packages/faune/*` — `react` starts as a re-export of the
primitives), map its source tokens to `--ds-*` in `src/tokens/contract.json`, add it to
`DESIGN_SYSTEMS` in `apps/docs/.storybook/design-system.ts` and its CSS bundle to
`BRAND_CSS` in `preview.tsx` (typed against `DESIGN_SYSTEMS`) plus its `storySort` entry,
and add it to `apps/docs/verify-contract.mjs`. See
`docs/architecture/multi-brand-primitives.md`. `nx verify-contract docs` checks
the variables consumed by primitives; Storybook tests check actual themed
rendering.

**See a change in Storybook:** components are consumed as **built** packages, so
build the changed token/CSS/React package first, then `nx storybook docs`.

**Release / publish packages:** automatic. The **Release** workflow
(`.github/workflows/release.yml`) runs on every push to `main` that touches
`packages/**` — i.e. on merge. Every `feat`/`fix` merged there ships (while a
package is 0.x, Nx turns both into a patch bump) to each package it
**affects** — see the "Release bumps follow `nx affected`" gotcha. It can also
be run manually —
`gh workflow run release.yml -f first_release=<bool> -f dry_run=<bool>`, or the
Actions UI — which is how you preview (dry runs may target any branch with
`--ref`; real releases are refused unless dispatched from `main`). It runs
`nx release --skip-publish` (conventional-commits version → changelog → commit
→ git tag), pushes the version commit + tags to `main` with `--atomic`, and only
then `nx release publish` (GitHub Packages via `GITHUB_TOKEN`). Order matters:
registry versions are immutable, so if `main` moved during the run the push is
rejected **before** anything is published, and the run queued by that other
merge releases both. Publish skips versions already in the registry, so a merge
with nothing releasable is a no-op, and re-running a run that pushed but failed
to publish recovers it. The version commit is pushed with `GITHUB_TOKEN`, which
does not trigger workflows, so it can't loop. Merge-triggered runs check out the
tip of `main`, not the triggering SHA.
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
nx run-many -t build test lint typecheck          # everything
nx run-many -t build test lint --projects=<name>  # one project (+ its deps)
nx build-storybook docs                            # static Storybook → apps/docs/storybook-static
nx verify-contract docs                           # check shared CSS variables for all three brands
nx storybook docs --port 6006                      # dev (needs react packages built first)
nx storybook docs-web-components                   # Web Components Storybook (6007), composed into docs
nx test-storybook docs                             # story interaction tests (headless chromium)
nx format:write   /   nx format:check              # prettier (ignores *.swcrc, Dockerfile)
gh workflow run release.yml -f dry_run=true        # preview a release (no publish)
gh workflow run release.yml -f dry_run=false       # publish manually (merges to main already do)
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
- **Storybook theming:** `preview.tsx` reads the brand from the story `title`
  prefix (`Biome/…` / `Exodus/…` / `Faune/…`) and injects only that brand's token
  CSS (the brands share some `:root` var names), then sets `data-mode`/`data-theme` from the
  toolbar. Story titles MUST start with the brand — the first `/`-segment is the
  brand key used by `preview.tsx` and `manager.tsx` (via `.storybook/design-system.ts`).
- **Sidebar taxonomy:** every brand has the same tree —
  `<Brand>/Foundations`, `<Brand>/Components/<Name>` (flat, alphabetical; no
  category groups), and `<Brand>/Migration/<Name>` for wrapper-bridge stories
  (Compatibility, primitives under the brand skin) that disappear with the wrappers.
  Only `Introduction` is unbranded. `.storybook/design-system.spec.ts` parses every
  story title (here and in `docs-web-components`) and fails on anything else.
  Order is fixed in `preview.tsx` `options.storySort` (a literal — Storybook reads it
  statically). Adding a component = `<Brand>/Components/<Name>`.
- **Design-system picker:** the toolbar's **Design system** dropdown
  (`manager.tsx`) filters the sidebar to one brand's tree (plus unbranded pages)
  via `api.experimental_setFilter`, and switching lands on the same page in the
  target brand when it exists (else its Foundations). The URL's story always wins,
  so deep links select their brand; **All** shows every tree (sidebar search only
  searches the visible tree). The pick is remembered in `localStorage`. The
  per-brand `.storybook-<brand>/` design-sync configs keep the old per-brand
  toolbar on purpose: they are single-brand builds.
- **Composition (`refs`) is decided at boot.** Storybook probes each ref once
  when `docs` starts (server-side `GET <url>/iframe.html`). Reachable → the
  browser fetches the ref's `index.json` without credentials; unreachable →
  `credentials: 'include'`, which the ref's `Access-Control-Allow-Origin: *`
  rejects ("Loading of ref failed … CORS error") until a restart. So `main.ts`
  waits up to 90s for 6007 before composing it, and leaves it out (with a
  warning) if it never answers. Start order doesn't matter; if 6007 came up
  later than that, restart `docs`.
- **Docs & a11y:** `preview.tsx` sets `tags: ['autodocs']` globally, so every
  meta with a `component` gets a Docs page. Docgen does NOT run on the built
  packages, so props tables/descriptions come from **`argTypes` you define in
  each story** (mirror the source JSDoc) — an empty `description` = a gap to
  fill. `@storybook/addon-a11y` adds the Accessibility panel;
  `src/Introduction.mdx` is the landing page.
- **Interaction tests:** stories with a `play` (using `storybook/test`) are run
  headlessly by `@storybook/addon-vitest` in real chromium via
  `nx test-storybook docs` (config: `apps/docs/vitest.config.ts`, provider
  `@vitest/browser-playwright`). Every story is also a smoke test (mount without
  error); `play` functions add assertions. Needs `npx playwright install
chromium` once. The addon also lights up the Storybook **Interactions** panel.
- **prettier** has no parser for `.swcrc` or `Dockerfile` → `**/*.swcrc` and
  `Dockerfile`/`.dockerignore` are in `.prettierignore`.
- **Webfonts are self-hosted — never add a font CDN `@import`/`<link>`.**
  Consumers promise visitors no third-party requests (GDPR); every css
  `verify.mjs` fails on any `http(s)://` in a served file. To change a brand's
  fonts, edit its `fonts.config.mjs` (family, fontsource package, weights per
  style) and add the fontsource package as an **exact-pinned** devDependency.
  Prefer `@fontsource-variable/*` (what Google Fonts serves: same axes, same
  bytes); use static `@fontsource/*` only when no variable cut exists (Spectral)
  or a family needs ≤2 weights and the static files are smaller (JetBrains
  Mono). Keep `opsz` for Newsreader — dropping it changes the rendering. The
  `font-weight` range declared is the contracted weights, not the file's full
  axis, so out-of-contract weights snap to the nearest one as they did on Google.
- **latin-ext is emitted before latin** in the generated CSS: the subsets'
  unicode-ranges overlap (U+0304/0308/0329) and the last-declared face wins.
- **`dist/` belongs to `vite build` alone.** In vite-built packages (primitives,
  biome/exodus react) `tsconfig.lib.json` emits to `out-tsc/lib`, never `dist`:
  `build` (vite `emptyOutDir` + vite-plugin-dts, which writes to `build.outDir`)
  and `typecheck` (`tsc --build`) run in parallel, and sharing `dist` made both
  flake (TS6305 / TS2306 / vite `ENOTEMPTY`). Consequently cross-package types
  resolve to the dependency's vite-built `dist`, so react `typecheck` depends on
  `^build`, and `docs:build` depends on `^typecheck` so its `tsc -b` never
  rebuilds a library's `out-tsc/lib` concurrently with that library's own
  typecheck. Keep this split when adding a vite package.
- **Release bumps follow `nx affected`, not "files in the package".** For each
  `feat`/`fix` since a package's last tag, `nx release` bumps every package the
  commit _affects_: files under its root, anything it depends on (`core` →
  tokens, `fonts` → css, `primitives` → react), and workspace-wide inputs —
  `nx.json`, `eslint.config.mjs`, `jest.preset.js` hit all nine packages,
  `tsconfig.base.json` six. (Project changelogs only list commits touching the
  package's own files, hence "version bump only" entries.) So: keep build
  tooling split by consumer (tokens use `core`, css uses `fonts` — don't merge
  them back), and type commits that only touch root config/tooling as
  `build:`/`ci:`/`chore:`/`refactor:`, never `feat:`/`fix:`. `nx.json` sets
  `@nx/js` `projectsAffectedByDependencyUpdates: 'auto'` so a lockfile change
  only affects projects whose dependencies changed (the default `'all'` bumped
  every package on any install). That also narrows `nx affected`, and no project
  has a graph edge to the toolchain — hence `ci.yml` runs `run-many` whenever
  `package-lock.json` changed. Preview with
  `npx nx release --dry-run --skip-publish`.

## Multi-agent config

Nx generated parallel skill sets under `.agents/`, `.claude/`, `.cursor/`,
`.codex/`, `.gemini/`, `.github/`, `.opencode/` (one per tool — duplicated, not
symlinked; Nx regenerates them). Those are Nx's own workspace skills. This
`AGENTS.md` (+ its `CLAUDE.md` symlink) is the project-level guide.

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
