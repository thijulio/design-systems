# Exodus (PMP) — build conventions

Product design system for the Pet Management Platform: Hanken Grotesk, warm-stone
neutrals, fixed semantic status tones, and three swappable accent themes. Style
everything through **CSS custom properties (design tokens)** and **component props** —
there is no CSS-utility class vocabulary and no theme-provider component.

## Setup / theming

- Load the design system stylesheet (`styles.css`) — it defines every token (`:root`),
  the three accent themes, the reset, and fonts. Components are unstyled without it.
- **Accent theme is an attribute, not a provider.** Default is **sage**. Switch by setting
  `data-theme` on a root/ancestor element: `data-theme="sage" | "clay" | "harbor"`
  (`<html data-theme="clay">`). Only the `--accent*` tokens change; neutrals, status
  tones, type, and spacing are theme-independent.
- No wrapper component is required; components read tokens from the cascade.

## The token vocabulary (use these — they are the design language)

Accent (re-themed by `data-theme`): `--accent`, `--accent-strong`, `--accent-soft`,
`--accent-on`, `--accent-fg`, `--accent-ring`, plus the ramp `--accent-50 … --accent-900`.
Neutrals (warm stone): `--n-50 … --n-900`.
Fixed semantic status: `--success`, `--danger`, `--info`, `--warning`, each with a
`-fg` and `-soft` companion (e.g. `--danger-fg`, `--success-soft`).
Status-dot tones (for pills/badges): `--tone-{green,blue,teal,amber,violet,red,neutral}-{soft,fg,dot}`.
Type: `--font-sans` (UI/body), `--font-wordmark`; sizes `--text-display`, `--text-h1`,
`--text-h2`, `--text-h3`, `--text-body`, `--text-body-sm`, `--text-caption`;
`--leading-{tight,snug,normal}`.
Space `--space-1 … --space-12`; radius `--radius-{sm,md,lg,xl,full}`;
elevation `--shadow-{xs,sm,md,lg}`.

## Components (props, not classes)

Each has a `.d.ts` (API) and `.prompt.md` (usage) — read those before use.

- `Button` — `variant: "primary"|"secondary"|"soft"|"ghost"|"danger"|"danger-outline"`, `size: "sm"|"md"|"lg"`.
- `Badge` — `tone: "accent"|"neutral"|"success"|"warning"|"danger"|"info"`.
- `StatusBadge` — domain states: `state: "draft"|"pending"|"awaiting-review"|"on-hold"|"confirmed"|"reserved"|"active"|"available"|"completed"|"adopted"|"quarantined"|"cancelled"|"archived"` (maps to a tone automatically); or set `tone` directly.
- `Toast` — `tone: "success"|"warning"|"danger"|"info"`, `title` (required), `onClose`.
- `Avatar` — `variant: "accent"|"soft"`, `shape: "circle"|"rounded"`, `tone`, `size` (number).
- `Field` — wraps a control: `label`, `required`, `hint`, `error` (renders the error state), `htmlFor`.
- `Input` / `Select` / `Textarea` — `invalid?: boolean` toggles the error border.
- `Checkbox` — `label`.
- `Tabs` — `tabs: TabItem[]`, controlled via `value` + `onChange`.
- `NavIcon` — `name` (icon id, e.g. "dashboard"/"animals"/"settings"), `size`, `strokeWidth`.
- `Card`, `EmptyState`, `BrandMark` — composition components.

## Where the truth lives

`styles.css` and its `@import`s (`tokens/exodus.css` = tokens + the 3 accent themes,
`_ds_bundle.css` = component styles) are authoritative for every token and class. Per
component, `components/<group>/<Name>/<Name>.prompt.md` + `.d.ts`.

## Idiomatic build snippet

```tsx
// Library components for controls; tokens for your own layout glue.
<section style={{ background: 'var(--n-50)', padding: 'var(--space-6)' }}>
  <Card>
    <Field label="Animal name" required hint="As it appears on records">
      <Input placeholder="e.g. Luna" />
    </Field>
    <div
      style={{
        display: 'flex',
        gap: 'var(--space-3)',
        marginTop: 'var(--space-4)',
      }}
    >
      <StatusBadge state="active" />
      <Button variant="primary" size="md">
        Save changes
      </Button>
    </div>
  </Card>
</section>
```
