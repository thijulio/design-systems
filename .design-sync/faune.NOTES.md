# design-sync notes — Faune (Faune Design System)

Target project: `57ab62c5-e212-4939-8da4-02298548389b` (Faune Design System).
Source: `packages/faune/*` (`faune-tokens → faune-css → faune-react`). React 19, npm
workspaces, node 24.

First synced **2026-10-02** (first-time import into a fresh project). Read
`exodus.NOTES.md` § "Multi-brand repo" too — the cross-brand rules there (per-brand
config, clear `.design-sync/.cache` between brands, never own a preview for a shared
component name) apply here.

## Setup / build

- Build: `npx nx run-many -t build --projects tag:scope:faune` (faune-tokens →
  faune-css → faune-react, plus primitives).
- Driver: `--config .design-sync/faune.config.json --node-modules ./node_modules
--entry packages/faune/react/dist/index.js`. Global name `window.ThijulioFauneReact`.
- `faune-react` re-exports every primitive with no wrappers (Faune implements the
  `--ds-*` contract natively), so the synced components ARE the primitives skinned by
  `faune.css`. A new primitive reaches this project only via a Faune story — the
  converter cards only storied components (2026-10-02: `Select`/`Textarea` were in
  the bundle but uncarded until `Select.stories.tsx`/`Textarea.stories.tsx` existed).
- `cfg.tokensPkg: "@thijulio/faune-css"`; `cfg.extraFonts: ["../css/dist/faune.css"]`
  self-hosts Inter + Newsreader (6 faces) to `fonts/`.
- Scoped storybook `apps/docs/.storybook-faune` (glob `../src/faune/**`), same template
  as the biome/exodus ones. Reference built to `.design-sync/sb-reference-faune`.

## Grades (2026-10-02) — 9 components

All match except **Button / Primary** — graded **close**: its storybook `play()` clicks
the button and leaves a `:focus-visible` ring the static preview can't show.
`Button / Accent Hovered` only hovers inside the vitest browser runner
(`hoverInBrowserTest`), so both panels show rest state — match.
Input/Textarea borders _look_ fainter in the preview only because the preview canvas
is white vs storybook's warm paper; sampled pixels are identical.

## Known validate warnings (triaged — not new)

- `! preview decorator bundle failed: No loader … ".woff2"` — harmless; tokens/fonts
  ship via `styles.css`.
- `[TITLE_UNMAPPED] Foundations` — doc story, not a component.

## Re-sync risks (watch-list)

- `faune-react`'s spec pins its exports to the primitives catalog — when a primitive is
  added, add a Faune story for it or it ships uncarded (see above).
- Light only: if Faune gains theme overlays, stories must scope them with a story-level
  decorator (compiled previews get no storybook `globals` — see biome/exodus NOTES).
