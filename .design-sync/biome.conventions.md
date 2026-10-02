# Biome Modernism — build conventions

Editorial design system: serif display, warm "bone" paper, canopy-green brand,
terracotta accent. Light and dark. Style everything through **CSS custom
properties (design tokens)** — there is no CSS-utility vocabulary and no theme
provider component. Do not invent class names; compose the exported components and
use `var(--token)` for any layout glue you write.

## Setup / theming

- Load the design system stylesheet (`styles.css`) — it defines all tokens (`:root`),
  the dark overrides, the reset, and the webfonts. Components are unstyled without it.
- **Light is the default. For dark mode set `data-mode="dark"` on a root/ancestor
  element** (`<html data-mode="dark">`): the `[data-mode="dark"]` block re-points the
  semantic tokens. There is no `<ThemeProvider>` — theming is attribute + tokens only.
- No wrapper is required around components; they read tokens from the cascade.

## The token vocabulary (use these — they are the design language)

Surfaces & text (semantic — prefer these over the raw `--bm-*` palette):
`--surface-page`, `--surface-raised`, `--surface-inverse`; `--brand`, `--brand-hover`,
`--on-brand`; `--accent-warm`, `--accent-highlight`; `--text-heading`, `--text-body`,
`--text-muted`, `--text-strong`, `--text-label`, `--text-code`; `--border`, `--focus`.

Type: `--font-display` (serif, headlines), `--font-reading` (serif body prose),
`--font-ui` (sans, UI/labels), `--font-mono` (code). Sizes `--size-xs … --size-display`;
weights `--weight-light … --weight-bold`; `--leading-*`, `--tracking-*`.

Space & shape: `--space-1 … --space-24`; radii `--radius-ui`, `--radius-ui-lg`,
`--radius-soft`, `--radius-organic`, `--radius-pill`. Motion: `--dur-fast|base|slow`,
`--ease-organic`, `--ease-out`.

The raw palette (`--bm-canopy`, `--bm-terracotta`, `--bm-bone`, `--bm-ink`, …) exists but
reach for the semantic tokens above first — they flip correctly in dark mode.

## Components (props, not classes)

Style via props; each has a `.d.ts` (API) and `.prompt.md` (usage) — read those before use.

- `Button` — `variant: "primary" | "secondary" | "ghost"`, `size: "sm" | "md" | "lg"`, `href?`.
- `Card` — `variant: "editorial" | "expressive"`, `kicker`, `title`, children.
- `Tag` — `variant: "outline" | "solid" | "muted"`, `status?: boolean` (leading status dot).
- `ModeToggle` — controlled: `value: "explorer" | "recruiter"`, `onChange`.
- `TerminalHero` — full-bleed marketing hero: `eyebrow`, `title`, `lede`, `primary/secondaryLabel+Href`, `lines`, `showContours`.

## Where the truth lives

`styles.css` and its `@import`s (`tokens/biome.css` = tokens + dark + fonts,
`_ds_bundle.css` = component styles) are authoritative for every token and class. Per
component, `components/<group>/<Name>/<Name>.prompt.md` + `.d.ts`.

## Idiomatic build snippet

```tsx
// Components come from the library; your own layout glue uses tokens.
<section
  style={{ background: 'var(--surface-page)', padding: 'var(--space-12)' }}
>
  <Card variant="editorial" kicker="Case study" title="Living interface">
    <p style={{ color: 'var(--text-muted)', font: 'var(--font-reading)' }}>
      A resilient, real-time surface that grows with its data.
    </p>
    <Button variant="primary" size="md" href="#">
      Explore projects →
    </Button>
  </Card>
</section>
```
