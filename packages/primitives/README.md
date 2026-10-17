# @thijulio/primitives

Brand-agnostic UI primitives available to every `@thijulio` brand. They are styled
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
3. Load `@thijulio/primitives/styles.css` and import components from this package; they resolve colours and metrics
   through the contract, so they skin automatically.

```tsx
import '@thijulio/faune-css/faune.css';
import '@thijulio/primitives/styles.css';
import { Button } from '@thijulio/primitives';

export function Example() {
  return <Button variant="accent">Save changes</Button>;
}
```

Biome, Exodus, and Faune implement the web contract. Existing Biome and Exodus
imports remain supported by wrappers around the shared implementations; see
`docs/architecture/multi-brand-primitives.md` for the adoption matrix.
Load only one brand's root-level CSS per page, or isolate
brands in separate scopes/frames.

Optional overrides include `--ds-on-accent-hover`, `--ds-on-warning`, and
`--ds-card-{border,border-width,padding-y,padding-x,hover-border}`. Legacy brand
wrappers also use local `--ds-button-*`, `--ds-input-*`, and `--ds-tag-*` skin
overrides. These are optional, not additions to the required global contract.
They change defaults through CSS variables instead of stronger property
selectors, preserving consumer classes and stylesheet-order independence.
Components retain their default contract values when overrides are absent.

## Contract reference

| Group          | Names                                                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Surfaces       | `--ds-surface`, `-raised`, `-sunken`, `-inverse`, `-inverse-raised`, `--ds-overlay` (modal scrim)                                     |
| Text           | `--ds-text`, `-secondary`, `-soft`, `-muted`, `-placeholder`, `-disabled`, `-inverse`, `-inverse-muted`                               |
| Brand          | `--ds-brand`, `-hover`, `--ds-on-brand`                                                                                               |
| Accent         | `--ds-accent`, `-hover`, `-soft`, `-fg`, `-fg-hover`, `--ds-on-accent`                                                                |
| Highlight      | `--ds-highlight`, `--ds-on-highlight`                                                                                                 |
| Border / focus | `--ds-border`, `-inverse`, `-subtle`, `--ds-focus` (solid, ≥ 3:1 on surfaces)                                                         |
| Status         | `--ds-{success,warning,danger,info}` + `-soft` + `-fg` + `-border`                                                                    |
| Typography     | `--ds-font-{display,body,ui,mono}`, `--ds-size-*` (incl. `-lead`), `--ds-weight-*`, `--ds-leading-*`, `--ds-tracking-*` (incl. `-eyebrow`) |
| Layout         | `--ds-space-{1,2,3,4,5,6,8,10,12,16}`, `--ds-radius-{control,field,card,sm,md,lg,xl,2xl,full}`, `--ds-shadow-{sm,md,lg}`              |
| Layering       | `--ds-z-{overlay,toast}`                                                                                                              |

## Components

Each one lives in `src/lib/<Name>/` with its spec; its story is `Components/<Name>` in
`apps/docs/src/components/`. `@thijulio/exodus-react` and `@thijulio/faune-react` re-export
all of them; Biome consumers import them from here.

Alert, Avatar, Badge, Button, Card, Carousel, Code, Container, DescriptionList, Dialog, Disclosure, Divider, EmptyState, ErrorState, Eyebrow, Field, Fieldset, FileInput, Grid, GridItem, Heading, HoneypotField, Icon, IconButton, Inline, Input (+`Textarea`, `Select`), InputField (+`SelectField`, `TextareaField`), Link, List, LiveRegion, LoadMore, MultiSelect, NavList, PageHeader, Pager, ProgressBar, RadioGroup, Rating, ReorderableList, ResultState, Section, SegmentedControl, Skeleton, SkipLink, Spinner, Stack, Stat, Table, Tag, Text, ThemeScope (+`useThemeScope`), Timeline, Toast, ToastViewport, ToggleButton, Tooltip, VisuallyHidden.
