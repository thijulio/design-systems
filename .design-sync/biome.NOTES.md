# design-sync notes — Biome Modernism (Biome Modernism Design System)

Target project: `f9ab4b18-4451-4f23-a084-1d628aaa271e` (Biome Modernism Design System).
Source: `packages/biome/*` in this Nx monorepo. React 19, npm workspaces, node 24.

Last re-synced from `main` on **2026-10-02** (self-hosted fonts + `@thijulio/primitives`
adoption). Read `exodus.NOTES.md` § "Multi-brand repo" too — the cross-brand rules
there apply to every brand synced from this repo.

## Setup / build

- **Build DS packages via Nx**: `npx nx run-many -t build --projects tag:scope:biome`
  (dep chain: biome-tokens → biome-css → biome-react, plus primitives). In-repo there is
  no `node_modules/@thijulio/biome-react` dist to resolve as an installed pkg, so the
  converter is pointed at the built dist directly:
  `--entry packages/biome/react/dist/index.js --node-modules ./node_modules`
  (react/react-dom are hoisted to the root node_modules; the @thijulio/* names are
  workspace symlinks).
- Global name auto-derives to `window.ThijulioBiomeReact`.
- **Run the driver with `--max-stories 7`**: Button has 7 stories and the default cap (6)
  silently skips `Dark`, the only dark-mode sample the design agent gets.

## [GENERAL] Scoped storybook — single docs app covers every brand

- `apps/docs/.storybook/` documents all brands. Biome and Exodus both define
  `Button`/`Card`, so an unscoped reference would cross-pair stories against the wrong
  bundle. `cfg.storybookConfigDir` points at the biome-only `apps/docs/.storybook-biome/`
  (stories glob narrowed to `../src/biome/**`). Reference built to
  `.design-sync/sb-reference` (gitignored).

## [GENERAL] Tokens — biome-react declares no deps

- `@thijulio/biome-react` has NO dependencies in its package.json, so token auto-detect
  finds nothing → `cfg.tokensPkg: "@thijulio/biome-css"` ships `biome.css` (token `:root`
  defs + `[data-mode="dark"]` + reset + `@font-face`s), what the `withBrandTokens`
  decorator injects in storybook.
- **Fonts are self-hosted**: `cfg.extraFonts: ["../css/dist/biome.css"]` ships 18 faces
  to `fonts/` (Newsreader, Spectral, Space Grotesk, JetBrains Mono). `tokens/biome.css`
  carries its own copy of the same `@font-face`s with `./fonts/…` urls that resolve to a
  non-existent `tokens/fonts/`; harmless — `fonts/fonts.css` is imported after it in
  `styles.css` and wins. Compare shots confirmed the real faces on both panels.

## [GENERAL] Stories must not depend on storybook globals

- Compiled previews get NO storybook `globals` (and the `withBrandTokens` toolbar
  decorator never runs there). A story that only sets `globals: { mode: 'dark' }` renders
  light in the preview. Fix lives in the story: `Button/Dark` adds a story-level
  decorator wrapping in `<div data-mode="dark">` (`biome.css` keys dark tokens on any
  `[data-mode="dark"]` ancestor). Same pattern for any future mode/theme story.

## Component-specific

- **TerminalHero**: full-bleed hero straddling its 2-column breakpoint at the default
  capture width → `cfg.overrides.TerminalHero = { cardMode: "single", primaryStory:
"Default", viewport: "1280x820" }`.
- **ModeToggle / Interactive** and **Button / Interactive**: graded **close** — storybook
  `play()` clicks the control and leaves a `:focus-visible` ring the static preview
  can't show. Styling/composition identical. ModeToggle's `[RENDER_THIN] variants render
identically` warn is the same cause (both stories render the initial state) — known,
  not a defect.

## Known validate warnings (triaged — not new)

- `! preview decorator bundle failed: No loader … ".woff2"` — `.storybook-biome/preview`
  imports CSS with font urls; tokens/fonts ship via `styles.css` anyway. No `cfg.provider`
  needed.
- `[TOKENS_MISSING] --badge-bg, --badge-fg, --av-size, --av-font, --av-bg, --av-fg` —
  set inline at runtime by the primitives `Badge`/`Avatar` (bundled transitively; not
  biome components). Expected.
- `[TITLE_UNMAPPED] Foundations, Compatibility, Sharedprimitives` — doc stories, not
  components.

## Re-sync risks (watch-list)

- **Remote orphans**: `_vendor/preview-decorators.{js,css}` from the first (branch) sync
  are unreferenced by the current build and outside the anchor, so diffs never list them.
  Harmless; delete by hand if the project ever needs a clean-up.
- The remote holds **only converter output** (no hand-authored `guidelines/`/`templates/`
  — an earlier note claiming otherwise was wrong).
- Close grades (ModeToggle, Button `Interactive`) and TerminalHero's single-mode viewport
  carry forward — re-verify only if those stories change.
