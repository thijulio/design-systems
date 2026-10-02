# @thijulio/faune-react

React components for the **Faune** brand. Faune is contract-native: it ships no
wrappers or compatibility skins, so every component is the shared
`@thijulio/primitives` implementation, skinned by the `--ds-*` aliases in
`@thijulio/faune-css`.

```tsx
import '@thijulio/faune-css/faune.css';
import '@thijulio/faune-react/styles.css';
import { Button, Card } from '@thijulio/faune-react';
```

Importing from `@thijulio/faune-react` (rather than primitives directly) keeps
every brand on the same `tokens → css → react` shape and gives Faune-only
components a home when they appear. Pet-domain pieces still belong in the
consuming site (see AGENTS.md).

Run `nx test faune-react` for the unit tests (Jest + RTL).
