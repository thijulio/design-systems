# design-sync notes — Exodus → PMP Design System

Target project: `6b197fe5-87b8-4631-9ba2-b8f702fcc603` (PMP Design System).
Source: `packages/exodus/*`. React 19, npm workspaces, node 24.

> ⚠️ **This sync was run from a branch ~10 commits behind `main` (2026-10-02).** Since then
> main **self-hosted the webfonts** (#6/#7 — the CDN-`@import` note below is stale),
> **adopted shared/contract-driven primitives across brands** (#3/#5 — exodus component
> _names_ unchanged, rendering may differ), and added a **third brand `faune`** plus a
> `primitives` package. The repo is **no longer two brands** — the section below should read
> as "N brands"; `faune` is unsynced with no target project. Re-sync against current `main`
> before trusting the uploaded project as live.

## Two-brand monorepo — READ FIRST

This repo hosts TWO design systems (biome + exodus) but the design-sync skill assumes
one `.design-sync/config.json` per repo. To keep both, state is **brand-namespaced**:

- Biome: `.design-sync/biome.config.json`, `biome.conventions.md`, `biome.NOTES.md`,
  reference `.design-sync/sb-reference`, storybook `apps/docs/.storybook-biome`.
- Exodus: `.design-sync/exodus.config.json`, `exodus.conventions.md`, `exodus.NOTES.md`,
  reference `.design-sync/sb-reference-exodus`, storybook `apps/docs/.storybook-exodus`.
- **Always pass `--config .design-sync/exodus.config.json`** to the converter/driver;
  a bare `.design-sync/config.json` does not exist.
- **The shared cache `.design-sync/.cache/compare` is keyed by component name and biome +
  exodus share names (Button, Card).** Clear `.design-sync/.cache` when switching brands
  so a stale same-named grade can't leak across. (Component srcSha differs, so a leak
  would recapture anyway, but clearing is the safe habit.)

## Setup / build

- Build: `npx nx run-many -t build --projects tag:scope:exodus`
  (dep chain: exodus-tokens → exodus-css → exodus-react).
- Converter: `--config .design-sync/exodus.config.json --node-modules ./node_modules
--entry packages/exodus/react/dist/index.js`. Global name `window.ThijulioExodusReact`.
- `cfg.tokensPkg: "@thijulio/exodus-css"` ships `exodus.css` (tokens + the 3 accent themes
  `[data-theme="sage|clay|harbor"]` + reset + fonts). Same reason as biome: exodus-react
  declares no deps, so token auto-detect finds nothing → set it explicitly. Validate clean
  on first build with it (no `[TOKENS_MISSING]`).
- Scoped storybook `apps/docs/.storybook-exodus` (glob narrowed to `../src/exodus/**`,
  exodus-only preview) so biome stories can't cross-pair against the exodus bundle.

## Grades (first sync) — 15 components

12 fully match. 3 have one `close` story each — all the SAME storybook-`play()` pattern
(the story runs an interaction the compiled preview can't; styling/composition identical):

- **Tabs / Interactive** — storybook play() selects the "Active" tab (+ focus ring); preview shows initial "All".
- **Input / Default** — storybook play() types "Luna" + focuses; preview shows the placeholder state. (Invalid + Disabled match — proves fidelity.)
- **Checkbox / Interactive** — checked state differs (storybook vs preview) due to play().
  All acceptable, not defects. Everything else (Button, Card, Toast, Field, Select, Textarea,
  Badge, StatusBadge, EmptyState, Avatar, BrandMark, NavIcon) matches exactly.

`Foundations` story dropped (`[TITLE_UNMAPPED]` — not a component).

## Re-sync risks (watch-list)

- **Fonts — CHANGED ON MAIN.** At sync time (this branch) Hanken Grotesk loaded via the
  `exodus.css` Google Fonts `@import` (CDN). **Main now self-hosts it (#6/#7)** — uploaded
  bundle's font handling is stale; re-sync against current main to pick up self-hosted faces.
- **The three `close` interactive stories carry forward** — re-verify only if those story
  files change. They are interaction-state deltas, not fixable without reducing fidelity.
- **PMP project had a large curated tree the converter does NOT regenerate**: a full
  `design_handoff_pmp_design_system/` duplicate export, `guidelines/*`, `templates/*`
  (companion-site, vivarium-admin), `screenshots/`, `uploads/`, `assets/`, a `patterns/PetCard`
  component (no exodus story), plus prior aux. The first upload was a FULL REPLACE (owner
  decision) — see the upload record. Once anchored, the anchor tracks only converter output.
- **Group divergence**: converter groups from story titles = core/feedback/forms/identity;
  the old remote used core/display/forms/navigation/patterns. No group-remap knob exists
  (would require editing story titles), so components live under the title-derived groups.
