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

One Nx monorepo hosting **two independent brand design systems** that share only
build tooling, published as private npm packages under the `@thijulio` scope.

- **Biome Modernism** (`packages/biome/*`, tag `scope:biome`) — the personal /
  website system. Editorial: serif display (Newsreader), light/dark via
  `[data-mode="dark"]`.
- **Exodus** (`packages/exodus/*`, tag `scope:exodus`) — the professional / work
  system consumed by the Pet Management Platform (PMP) and future client work.
  Product-grade: Hanken Grotesk, warm-stone neutrals, fixed status tones, and
  three swappable accent themes (Sage default / Clay / Harbor) via `[data-theme]`.

The two brands **never import from each other** (enforced by Nx module
boundaries). They share `packages/core` — build tooling only, **no design
tokens**. This is deliberate: the brands' token schemas genuinely differ, so
there is nothing meaningful to share beyond the Style Dictionary harness.

Tokens/components originate from Claude Design exports; Git is the source of
truth (one-way flow — never sync back to Claude Design).

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
  core/            @thijulio/core — Style Dictionary build harness (scope:core)
  biome/
    tokens/        @thijulio/biome-tokens — SD JSON → tokens.css (+ .js/.d.ts)
    css/           @thijulio/biome-css    → dist/biome.css (reset+base+motion)
    react/         @thijulio/biome-react  — Button, Card, Tag, ModeToggle, TerminalHero
  exodus/
    tokens/        @thijulio/exodus-tokens
    css/           @thijulio/exodus-css   → dist/exodus.css
    react/         @thijulio/exodus-react — 15 universal components (no PetCard)
apps/
  docs/            Storybook (SB 10, react-vite) — both brands, theme toolbar (scope:docs)
```

`PetCard` is intentionally NOT in Exodus — it's pet-domain-specific and belongs
in PMP, not the reusable catalog.

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

## Package conventions

**tokens package** — package.json-based, NO tsconfig/tsc. Structure:
`src/tokens/*.json` (base), `src/themes/<name>/*.json` (overlays), `build.mjs`
(imports `@thijulio/core`, uses `import.meta.dirname`), `verify.mjs` (node:assert
on the built output). `package.json`: `type: module`, exports `.`→`dist/tokens.js`
(+`.d.ts`) and `./tokens.css`→`dist/tokens.css`, `files: ["dist"]`, devDep
`@thijulio/core: "*"`, nx targets `build` (`node {projectRoot}/build.mjs`,
`dependsOn: ["^build"]`, `outputs: ["{projectRoot}/dist"]`) and `test`
(`node {projectRoot}/verify.mjs`, `dependsOn: ["build"]`).

**css package** — CSS-only. `src/{fonts,reset,base,motion}.css`; `build.mjs`
concatenates them with the sibling tokens CSS (read via
`import.meta.resolve('@thijulio/<brand>-tokens/tokens.css')`) into
`dist/<brand>.css`. The fonts `@import` MUST lead the bundle (CSS rule). Exports
only `./<brand>.css`.

**react package** — `@nx/react:library --bundler=vite`. Component per folder:
`Name/{Name.tsx, Name.module.css, Name.spec.tsx}`. CSS Modules reference token
vars. Data-driven palettes (e.g. status tones) are wired via inline CSS custom
properties + the `StyleWithVars` type in `_util/style.ts` (avoids N near-identical
classes). `react`/`react-dom` are peerDependencies; `sideEffects: ["**/*.css"]`.
Also exports `./styles.css`→`dist/index.css` (for Storybook, which consumes built
packages). When a prop name collides with a native HTML attribute you repurpose
(`title`, `onChange`), `Omit` it from the extended `HTMLAttributes`.

All publishable packages are `private: true` for now — flip to publishable at the
release step.

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

**See a change in Storybook:** components are consumed as **built** packages, so
run `nx build <brand>-react` first, then `nx storybook docs`.

## Commands

```
nx run-many -t build test lint typecheck          # everything
nx run-many -t build test lint --projects=<name>  # one project (+ its deps)
nx build-storybook docs                            # static Storybook → apps/docs/storybook-static
nx storybook docs --port 6006                      # dev (needs react packages built first)
nx format:write   /   nx format:check              # prettier (ignores *.swcrc)
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
depends on nothing; `scope:biome` → core+biome; `scope:exodus` → core+exodus
(**never** each other); `scope:docs` → core+both brands (the only cross-brand
consumer).

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
  prefix (`Biome/…` / `Exodus/…`) and injects only that brand's token CSS (the
  two share some `:root` var names), then sets `data-mode`/`data-theme` from the
  toolbar. Story titles MUST start with the brand — the first `/`-segment is the
  brand key used by both `preview.tsx` and the per-brand toolbar in `manager.tsx`.
- **Sidebar taxonomy:** titles are `Brand/Group/Component` — Biome uses
  `Foundations` + `Components`; Exodus uses `Foundations`/`Core`/`Forms`/
  `Feedback`/`Identity`. Order is fixed in `preview.tsx` `options.storySort`
  (`Introduction` first). Adding a component = pick the right group in its title.
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
- **prettier** has no parser for `.swcrc` → `**/*.swcrc` is in `.prettierignore`.
- **CSS `@import`** (fonts) must be the first statement in a bundle; the css
  `verify.mjs` checks this after stripping comments.

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
