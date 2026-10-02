# Faune (Maison Féline) — build conventions

Warm, founder-led cat-sitting brand: editorial serif (Newsreader) for display,
Inter for UI, deep teal ink, coral accent, warm paper surfaces, generous rounded
radii. Light only (no dark mode or theme overlays). Style everything through
**CSS custom properties (design tokens)** and **component props** — there is no
CSS-utility class vocabulary and no theme-provider component. Do not invent class
names; compose the exported components and use `var(--token)` for layout glue.

## Setup

- Load the design system stylesheet (`styles.css`) — it defines every token
  (`:root`), the reset, and the webfonts. Components are unstyled without it.
- No wrapper or provider is required; components read tokens from the cascade.

## The token vocabulary (use these — they are the design language)

Prefer the semantic `--ds-*` tokens — they are what the components themselves use:

- Surfaces & text: `--ds-surface`, `--ds-surface-raised`, `--ds-surface-sunken`,
  `--ds-surface-inverse`; `--ds-text`, `--ds-text-muted`, `--ds-text-inverse`;
  `--ds-border`, `--ds-focus`.
- Brand & accent: `--ds-brand`, `--ds-brand-hover`, `--ds-on-brand` (teal ink);
  `--ds-accent`, `--ds-accent-hover`, `--ds-accent-soft`, `--ds-on-accent` (coral);
  `--ds-highlight`.
- Status: `--ds-success`, `--ds-warning`, `--ds-danger`, `--ds-info`, each with
  `-soft` and `-fg` companions (e.g. `--ds-danger-soft`, `--ds-success-fg`).
- Type: `--ds-font-display` (serif headlines), `--ds-font-body`, `--ds-font-ui`
  (sans); sizes `--ds-size-display`, `--ds-size-h1`, `--ds-size-h2`, `--ds-size-h3`,
  `--ds-size-body`, `--ds-size-body-sm`, `--ds-size-caption`; weights
  `--ds-weight-regular … --ds-weight-extra`; `--ds-leading-*`, `--ds-tracking-*`.
- Space & shape: `--ds-space-1 … --ds-space-12`; radii `--ds-radius-sm|md|lg|full`,
  `--ds-radius-control`, `--ds-radius-field`, `--ds-radius-card`; elevation
  `--ds-shadow-sm|md|lg`.

The raw palette (`--ink`, `--coral`, `--paper`, `--cream`, `--sage`, `--yellow`, …)
exists, but reach for the `--ds-*` tokens first.

## Components (props, not classes)

Each has a `.d.ts` (API) and `.prompt.md` (usage) — read those before use.

- `Button` — `variant: "primary" | "accent" | "secondary" | "soft" | "ghost" | "danger" | "danger-outline"`, `size: "sm" | "md" | "lg"`, `href?`.
- `Card` — `pad?: boolean`, `interactive?: boolean`; content is children.
- `Tag` — `variant: "outline" | "solid" | "muted"`, `status?: boolean`.
- `Badge` — `tone: "brand" | "accent" | "neutral" | "success" | "warning" | "danger" | "info"`.
- `Avatar` — `variant: "brand" | "accent" | "neutral"`, `tone`, `shape: "circle" | "rounded"`, `size` (number).
- `Eyebrow` — small uppercase label, `line?: boolean`.
- `Input` / `Textarea` / `Select` — `invalid?: boolean` toggles the danger outline;
  `Select` takes `<option>` children.

## Where the truth lives

`styles.css` and its `@import`s (`tokens/faune.css` = tokens + reset + fonts,
`_ds_bundle.css` = component styles) are authoritative for every token and class.
Per component, `components/<group>/<Name>/<Name>.prompt.md` + `.d.ts`.

## Idiomatic build snippet

```tsx
// Library components for controls; --ds-* tokens for your own layout glue.
<section
  style={{ background: 'var(--ds-surface)', padding: 'var(--ds-space-8)' }}
>
  <Eyebrow line>Nos services</Eyebrow>
  <Card pad>
    <p
      style={{
        color: 'var(--ds-text-muted)',
        marginBottom: 'var(--ds-space-4)',
      }}
    >
      Visite à domicile — 30 minutes, repas et litière.
    </p>
    <div style={{ display: 'flex', gap: 'var(--ds-space-3)' }}>
      <Tag status>Disponible</Tag>
      <Button variant="accent">Réserver une visite</Button>
    </div>
  </Card>
</section>
```
