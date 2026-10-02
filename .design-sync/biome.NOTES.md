# design-sync notes — Biome Modernism → PMP... (Biome Modernism Design System)

Target project: `f9ab4b18-4451-4f23-a084-1d628aaa271e` (Biome Modernism Design System).
Source: `packages/biome/*` in this Nx monorepo. React 19, npm workspaces, node 24.

> ⚠️ **This sync was run from a branch ~10 commits behind `main` (2026-10-02).** Since
> then main has: **self-hosted the webfonts** (#6/#7 — the CDN-`@import` note below no
> longer reflects main), **adopted shared/contract-driven primitives across brands** (#3/#5
> — component _names_ unchanged, but rendering may differ), and added a **third brand
> `faune`** (unsynced, no target project assigned). The uploaded project reflects the
> branch state — **re-sync against current `main` before trusting it as live**, and decide
> whether `faune` gets its own sync/project.

## Setup / build

- **Build DS packages via Nx**: `npx nx run-many -t build --projects tag:scope:biome`
  (dep chain: biome-tokens → biome-css → biome-react). In-repo there is no
  `node_modules/@thijulio/biome-react` dist to resolve as an installed pkg, so the
  converter is pointed at the built dist directly:
  `--entry packages/biome/react/dist/index.js --node-modules ./node_modules`
  (react/react-dom are hoisted to the root node_modules; the @thijulio/* names are
  workspace symlinks).
- Global name auto-derives to `window.ThijulioBiomeReact`.

## [GENERAL] Scoped storybook — single docs app covers BOTH brands

- `apps/docs/.storybook/` documents biome AND exodus (`src/biome/*`, `src/exodus/*`).
  Both brands define `Button`/`Card`, so an unscoped reference would let exodus
  stories cross-pair against the biome bundle.
- Fix: committed a biome-only variant config `apps/docs/.storybook-biome/`
  (narrowed `stories` glob to `../src/biome/**`; trimmed exodus imports out of
  `preview.tsx` so the reference build doesn't depend on exodus). `cfg.storybookConfigDir`
  points at it. Reference built to `.design-sync/sb-reference` (gitignored).
  The exodus/PMP sync uses its own scoped config the same way.

## [GENERAL] Tokens missing — biome-react declares no deps

- `@thijulio/biome-react` has NO dependencies in its package.json, so the converter's
  token-sibling auto-detect found nothing → `[TOKENS_MISSING]` (22 vars: --brand,
  --font-ui, --radius-ui, --ease-organic, …). These are injected at RUNTIME in
  storybook by the `withBrandTokens` decorator (`@thijulio/biome-css/biome.css?inline`),
  so they are NOT in the scraped `[CSS_FROM_STORYBOOK]` component CSS.
- Fix: `cfg.tokensPkg: "@thijulio/biome-css"` → ships `biome.css` (token :root defs +
  `[data-mode="dark"]` + reset + the Google-Fonts `@import`), exactly what the decorator
  injects. Validate is clean after this.

## Component-specific

- **TerminalHero**: full-bleed marketing hero (`layout: 'fullscreen'`, grid
  `repeat(auto-fit, minmax(330px,1fr))`, max-width 1180). At the default 900px capture
  viewport the width straddles the 2-column breakpoint (storybook rendered 2-col, preview
  1-col stacked) — same component, different responsive state. Fix:
  `cfg.overrides.TerminalHero = { cardMode: "single", primaryStory: "Default",
viewport: "1280x820" }`. Both compare panels then capture at 1280 → 2-column → match,
  and the product card renders the hero properly (matches the remote
  `components/marketing/TerminalHero.card.html`).
- **ModeToggle**: graded **close** (not a defect). The `Interactive` story runs a
  storybook `play()` that selects "Recruiter"; the compiled preview renders the
  component's initial "Explorer"-selected state (play functions run in storybook only).
  Styling/composition identical. Not fixable without neutralizing the interaction.

## Grades (first sync)

Button 4/4 match · Card 2/2 match · Tag 4/4 match · TerminalHero 2/2 match ·
ModeToggle 1/1 close. `Foundations` story dropped (`[TITLE_UNMAPPED]` — a foundations
page, not a component export).

## Re-sync risks (watch-list)

- **Fonts — CHANGED ON MAIN.** At sync time (this branch) `biome.css` loaded Newsreader /
  Spectral / Space Grotesk / JetBrains Mono via a Google Fonts `@import` (CDN). **Main now
  self-hosts them (#6/#7 via shared core tooling)** — so the uploaded bundle's font handling
  is stale. A re-sync against current main will pick up the self-hosted `@font-face`s; watch
  `[FONT_MISSING]` there since the CDN `@import` that previously satisfied it is gone.
- **The remote project holds hand-authored content the converter does NOT regenerate**:
  `guidelines/*` (brand/colors/type/spacing/motion HTML), `templates/personal-website/*`,
  and Foundations-derived cards. The converter emits only the 5 components + tokens +
  fonts + bundle. On the first (un-anchored) atomic upload these were PRESERVED, not
  deleted (owner decision). Once `_ds_sync.json` is uploaded, the anchor tracks only
  converter output — a future re-sync's diff will not "see" the preserved guidelines/
  templates and must not delete them unless intentionally retiring them.
- **ModeToggle close** and the **TerminalHero single-mode viewport** are deliberate; both
  carry forward — re-verify only if the component source changes.
