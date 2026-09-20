# @thijulio/primitives

Brand-agnostic UI primitives shared by every `@thijulio` brand. They are styled
against a **semantic contract** — a fixed set of `--ds-*` CSS custom properties —
rather than any brand's palette. A brand "skins" these components by emitting the
contract from its own tokens (see `packages/faune/tokens/src/tokens/contract.json`
for the reference implementation).

## How it works

1. A brand's token build aliases its palette into the `--ds-*` names (surface,
   text, brand, accent, border, focus, status tones, font/size/space/radius/
   shadow).
2. Load that brand's CSS bundle (`@thijulio/<brand>-css`) — it defines the
   `--ds-*` vars.
3. Import components from this package; they resolve colours and metrics
   through the contract, so they skin automatically.

## Contract reference

| Group          | Names                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------- |
| Surfaces       | `--ds-surface`, `-raised`, `-sunken`, `-inverse`, `-inverse-raised`                                |
| Text           | `--ds-text`, `-muted`, `-inverse`                                                                  |
| Brand          | `--ds-brand`, `-hover`, `--ds-on-brand`                                                            |
| Accent         | `--ds-accent`, `-hover`, `-soft`, `-fg`, `--ds-on-accent`                                          |
| Highlight      | `--ds-highlight`, `--ds-on-highlight`                                                              |
| Border / focus | `--ds-border`, `-inverse`, `--ds-focus`                                                            |
| Status         | `--ds-{success,warning,danger,info}` + `-soft` + `-fg`                                             |
| Typography     | `--ds-font-{display,body,ui}`, `--ds-size-*`, `--ds-weight-*`, `--ds-leading-*`, `--ds-tracking-*` |
| Layout         | `--ds-space-*`, `--ds-radius-{control,field,card,sm,md,lg,full}`, `--ds-shadow-{sm,md,lg}`         |

## Components

Button, Card, Tag, Badge, Avatar, Input (+`Textarea`), Eyebrow.
