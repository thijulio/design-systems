# design-sync notes — Exodus → PMP Design System

Target project: `6b197fe5-87b8-4631-9ba2-b8f702fcc603` (PMP Design System).
Source: `packages/exodus/*`. React 19, npm workspaces, node 24.

Last re-synced from `main` on **2026-10-02** (self-hosted fonts + `@thijulio/primitives`
adoption + the `Select` primitive fix).

## Multi-brand repo — READ FIRST

This repo hosts several design systems (biome, exodus, faune) but the design-sync skill
assumes one `.design-sync/config.json` per repo. State is **brand-namespaced**:

- Biome: `.design-sync/biome.{config.json,conventions.md,NOTES.md}`, reference
  `.design-sync/sb-reference`, storybook `apps/docs/.storybook-biome`.
- Exodus: `.design-sync/exodus.{config.json,conventions.md,NOTES.md}`, reference
  `.design-sync/sb-reference-exodus`, storybook `apps/docs/.storybook-exodus`.
- Faune: `.design-sync/faune.{config.json,conventions.md,NOTES.md}`, reference
  `.design-sync/sb-reference-faune`, storybook `apps/docs/.storybook-faune`.
- **Always pass `--config .design-sync/<brand>.config.json`**; a bare
  `.design-sync/config.json` does not exist (and if the skill offers to create a new
  project, it missed the config — stop).
- **Clear `.design-sync/.cache` when switching brands** — the compare cache is keyed by
  component name and brands share names (Button, Card).
- **[GENERAL] Never own a preview (`.design-sync/previews/<Name>.tsx`) for a name two
  brands share.** The converter reads owned previews by name only — no per-brand knob —
  so a biome `Button.tsx` gets compiled into the exodus build (2026-10-02: exodus Button
  showed biome's `Dark/Ghost/Large` cells + 2 unpaired stories). Fix rendering in the
  story source instead. If owned previews ever become unavoidable, move to per-brand
  `.design-sync/` homes (each brand runs from its own directory).

## Setup / build

- Build: `npx nx run-many -t build --projects tag:scope:exodus`
  (dep chain: exodus-tokens → exodus-css → exodus-react, plus primitives).
- Driver: `--config .design-sync/exodus.config.json --node-modules ./node_modules
--entry packages/exodus/react/dist/index.js --max-stories 8`. Button has 8 stories; the
  default cap (6) skips the `Clay`/`Harbor` theme samples. Global name
  `window.ThijulioExodusReact`.
- `cfg.tokensPkg: "@thijulio/exodus-css"` ships `exodus.css` (tokens + the 3 accent themes
  `[data-theme="sage|clay|harbor"]` + reset); `cfg.extraFonts: ["../css/dist/exodus.css"]`
  self-hosts Hanken Grotesk + Baloo 2 (4 faces) to `fonts/`.
- Scoped storybook `apps/docs/.storybook-exodus`: glob
  `../src/exodus/**/!(Shared*).@(mdx|stories.…)`. The `Shared*` exclusion matters:
  `SharedButton`/`SharedCard.stories.tsx` document `@thijulio/primitives` under
  `Exodus/Migration/Primitives/Button|Card` titles, and `titleMap` matches a single title segment, so
  they'd merge into the exodus-react Button/Card cards (duplicate `Default`/`Interactive`
  grade keys).

## [GENERAL] Stories must not depend on storybook globals

- Compiled previews get no storybook `globals`; `Button/Clay` and `Button/Harbor` rendered
  sage until they got a story-level `withAccent()` decorator (`<div data-theme=…>`;
  `exodus.css` keys accents on any `[data-theme]` ancestor). Same rule as biome's `Dark`.

## Component-specific

- **Select** (fixed 2026-10-02): since #5 `Select.module.css` composed exodus `.input`,
  which had become a variables-only compat class — Select rendered as a bare native
  control in storybook too. It now delegates to the new primitives `Select`. If a sync
  shows a form control unstyled on BOTH panels, suspect the component, not the sync.
- **Tabs**: `cfg.overrides.Tabs.cardMode: "column"` — stories are wider than a grid cell
  (`[GRID_OVERFLOW] wide`).
- **NavIcon / Registry**: the auto-fill grid reflows 7→8 columns in the wider preview
  canvas — same icons/order, graded match.

## Grades (2026-10-02) — 15 components

All match except the storybook-`play()` interaction stories, graded **close** (the
story clicks/types/selects and leaves state + a focus ring the static preview can't
reproduce; styling/composition identical): Tabs, Checkbox, Input, Select, Textarea,
Toast — each `Interactive`. Tabs' `[RENDER_THIN] variants render identically` warn is the
same cause.

## Known validate warnings (triaged — not new)

- `! preview decorator bundle failed: No loader … ".woff2"` — harmless; tokens/fonts ship
  via `styles.css`.
- `[TITLE_UNMAPPED] Foundations, Compatibility` — doc stories, not components.

## Re-sync risks (watch-list)

- **Remote content the converter doesn't own**: `_ds/biome-modernism-…/` and
  `_ds/nocturne-…/` are design-system copies Claude Design binds into the project; and
  `_vendor/preview-decorators.{js,css}` are unreferenced orphans from the first sync. The
  anchor doesn't track any of them, so diffs never delete them — leave `_ds/` alone.
- **Group layout**: components live under title-derived groups; no group-remap knob
  exists. Titles were `Exodus/{Core,Forms,Feedback,Identity}/<Name>` until the shared
  sidebar taxonomy (2026-10) flattened them to `Exodus/Components/<Name>`, so the next
  sync regroups the cards (expected, cosmetic).
- The `close` interaction grades carry forward — re-verify only if those stories change.
