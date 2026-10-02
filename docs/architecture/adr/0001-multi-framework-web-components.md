# ADR-0001: Multi-framework components via Web Components (Stencil), alongside React

**Status:** Accepted (2026-10-02)
**Date:** 2026-10-02
**Deciders:** Thiago Valença

## Context

- Every brand ships `<brand>-tokens → <brand>-css → <brand>-react` (AGENTS.md). All
  components, shared (`@thijulio/primitives`) and brand-only, are **React-only**.
- **Vue and Angular consumers are coming.** Reimplementing every component per framework
  would triple behavior code (keyboard, ARIA, invalid state) and let the brands drift.
- **React consumers may already exist** (packages are published to GitHub Packages).
  Nothing we do may change their behavior without an explicit major release.
- **`-react` cannot go away.** Claude Design builds from real React code; `/design-sync`
  bundles `<brand>-react` and compiles React previews (see `.design-sync/*.NOTES.md`).
- **Tokens are already platform-neutral.** One JSON source per brand; `@thijulio/core`
  (Style Dictionary) emits CSS, JS/TS, React Native and Dart. Brands skin shared
  components only through the `--ds-*` CSS contract; theming is `[data-theme]` /
  `[data-mode]` on an ancestor.
- Constraint from the owner: **follow established practice, invent nothing.**

What established multi-framework design systems ship (npm, 2026-10-02):

| System           | Web Components               | React                            |
| ---------------- | ---------------------------- | -------------------------------- |
| IBM Carbon       | `@carbon/web-components`     | `@carbon/react`                  |
| Microsoft Fluent | `@fluentui/web-components`   | —                                |
| Adobe Spectrum   | `@spectrum-web-components/*` | —                                |
| SAP UI5          | `@ui5/webcomponents`         | `@ui5/webcomponents-react`       |
| Google Material  | `@material/web`              | —                                |
| Ionic (Stencil)  | `@ionic/core`                | `@ionic/react`, `@ionic/angular` |

All three target frameworks consume custom elements well: Angular, React 19 and Vue 3
each score 100% on Custom Elements Everywhere.

## Decision

1. **Write framework-agnostic components as Web Components with Stencil**, in new
   packages that live **alongside** the React ones:
   - `@thijulio/primitives-web-components` (`packages/primitives-web-components`):
     brand-agnostic shared elements. Read **only** the `--ds-*` contract, the same rule
     as `@thijulio/primitives`.
   - `@thijulio/<brand>-web-components` (`packages/<brand>/web-components`): re-exports
     the shared elements plus that brand's own ones. Brand-only elements may read brand
     variables, the same rule as `<brand>-react`.
   - The `-web-components` suffix follows the most common market convention (Carbon,
     Fluent, Spectrum, UI5). It also avoids "web" reading as "web vs native", since
     tokens also target native.
2. **Framework adapters are generated, not hand-written.** Angular and Vue wrappers come
   from Stencil output targets (`@thijulio/<brand>-angular`, `@thijulio/<brand>-vue`),
   including Angular `ControlValueAccessor`s for form controls (`valueAccessorConfigs`).
   This is the Ionic model (`@ionic/core` + `@ionic/angular`). Create each adapter
   package only when its first real consumer needs it.
3. **Tokens: no new output, no bundling.** Elements read `var(--ds-*)` inherited from the
   page. Custom properties cross shadow boundaries, so the app loads `<brand>-css` exactly
   as today. Elements never bundle `tokens.css` (that would hard-code a brand) and never
   read `tokens.js` at runtime. Theming stays ancestor-driven (`[data-theme]`,
   `[data-mode]`); there is no per-element theme prop.
4. **Encapsulation: Shadow DOM** (`shadow: true`). Customization is exposed only through
   `--ds-*` / component custom properties declared on `:host` and through `::part()`
   (`exportparts` for nested elements). Confirmed by the owner. `scoped: true` was
   rejected: it lets light-DOM styles reach inside, which only helps a possible Phase 2,
   and Phase 1 has no legacy consumers of the new packages.
5. **Phased rollout. `<brand>-react` is untouched in Phase 1.**
   - **Phase 1 (additive, zero risk for current consumers).** Ship `-web-components` and,
     on demand, `-angular`/`-vue`. `@thijulio/primitives` and every `<brand>-react` keep
     their implementation, API and DOM. Visual parity between the React and Web
     Components implementations is enforced in Storybook (see 6).
   - **Phase 2 (optional, gated).** `<brand>-react` _may_ be reimplemented as wrappers
     over `-web-components` only if all of the following hold: its existing specs and the
     Compatibility stories pass **unchanged**; a real consumer project's own tests pass;
     consumer `className` overrides keep working; and it ships as a **major** version
     with migration notes and a transition period. If Phase 2 doesn't pay for itself,
     `-react` stays as is. It is permanent either way (Claude Design).
6. **Storybook: one UI, one instance per renderer, via Composition** (`refs`).
   - `apps/docs` (React) stays the **host** and the full visual catalog. It is also the
     `/design-sync` reference, so it must remain React.
   - Add a Web Components Storybook for the elements' visual catalog and parity checks,
     and Vue/Angular Storybooks only when their adapters exist. Those carry
     **integration** stories (forms, `v-model`, reactive forms, events), not
     re-documented visual variants.

## Options Considered

### Option A: Stencil Web Components + generated framework wrappers (chosen)

| Dimension        | Assessment                                                          |
| ---------------- | ------------------------------------------------------------------- |
| Complexity       | Medium: a compiler and output targets, but no hand-written adapters |
| Cost             | Behavior written once; wrappers regenerate                          |
| Scalability      | New framework = new output target                                   |
| Team familiarity | New tool; JSX/TSX + decorators feel close to React/Angular          |

**Pros:** official React/Vue/Angular wrappers including Angular form value accessors;
proven at scale by Ionic; one behavior implementation.
**Cons:** Stencil-specific compiler and toolchain to learn and keep updated; second
implementation alongside React during Phase 1.

### Option B: Lit Web Components + hand-written adapters

| Dimension        | Assessment                                                     |
| ---------------- | -------------------------------------------------------------- |
| Complexity       | Low runtime, but adapters are ours                             |
| Cost             | React via `@lit/react`; Angular CVAs and Vue glue hand-written |
| Scalability      | Each framework adds adapter code to maintain                   |
| Team familiarity | Small, standards-based API                                     |

**Pros:** lightweight, close to the platform, React wrapper officially supported
(`@lit/react` `createComponent`).
**Cons:** Angular `ControlValueAccessor`s and Vue `v-model` glue are custom code, which is
exactly where integrations break. Lit SSR is still experimental (Lit Labs).

### Option C: Reimplement components per framework

| Dimension        | Assessment                                 |
| ---------------- | ------------------------------------------ |
| Complexity       | High: N implementations × every component  |
| Cost             | Triples behavior code and tests            |
| Scalability      | Worsens with every component and framework |
| Team familiarity | Highest (native to each framework)         |

**Pros:** idiomatic per framework; no custom-element caveats.
**Cons:** behavior and accessibility drift between frameworks; maintenance multiplies.

### Option D: CSS-only component classes in `<brand>-css` + per-framework markup

| Dimension        | Assessment                                       |
| ---------------- | ------------------------------------------------ |
| Complexity       | Low to start                                     |
| Cost             | Styling once; behavior duplicated per framework  |
| Scalability      | Behavior drift grows with interactive components |
| Team familiarity | High                                             |

**Pros:** fastest path; no new runtime.
**Cons:** keyboard/ARIA/state logic duplicated per framework. Acceptable only as a
stopgap.

## Trade-off Analysis

The real cost of multi-framework support is **behavior**, not styling. Tokens and the
`--ds-*` contract already make styling portable. A and B both write behavior once. A also
generates the framework glue (notably Angular forms) that B leaves to us, which matters
given the "invent nothing" constraint. C and D duplicate behavior and are rejected.

The main risk of moving to Web Components is **breaking existing React consumers**:
`className` overrides blocked by Shadow DOM, consumer jsdom tests that can't query shadow
roots, `ref` pointing at the host instead of the native control, `onChange` semantics,
native form participation, SSR. Phase 1 removes that risk entirely by not touching
`-react`. Phase 2 has to prove each point before shipping.

## Consequences

- **Easier:** Vue and Angular get the real components with one behavior implementation;
  framework wrappers regenerate instead of being maintained; tokens/theming need no
  change.
- **Harder:** during Phase 1, behavior exists twice (React primitives + Web Components)
  and must be kept at parity. Parity is checked in Storybook, not assumed.
- **More packages:** per brand up to `tokens`, `css`, `react`, `web-components`,
  `angular`, `vue`. Adapters are created only on demand.
- **Revisit:** Phase 2 go/no-go once the elements are complete; Lit SSR / Declarative
  Shadow DOM if a consumer needs server rendering.

## Open questions

1. ~~Shadow DOM vs scoped CSS.~~ Resolved: Shadow DOM (Decision 4). If Phase 2 is ever
   attempted, `className` compatibility must be solved there (Decision 5 gates).
2. **How component CSS is shared** between `@thijulio/primitives` (CSS Modules) and the
   Stencil elements, so visual parity has one source. To be settled by the spike.
3. **Form participation:** form-associated custom elements (`ElementInternals`) for
   Input/Select/Textarea/Checkbox. To be validated in the spike.

## Action Items

1. [x] Owner confirms this ADR (and open question 1). Status → Accepted.
2. [ ] Spike, Button + Input, end to end:
       `primitives-web-components`, one brand package, the Angular output target with a
       reactive form, Vue usage with `v-model`, a Web Components Storybook composed into
       `apps/docs`, and a visual parity check against the React primitives. Confirm
       `/design-sync` is unaffected (it keeps using `-react`).
3. [ ] Decide open questions 2–3 from the spike; record them here.
4. [ ] Migrate remaining primitives component by component, parity-checked.
5. [ ] Create `-angular` / `-vue` adapter packages when their first consumer arrives.
6. [ ] Phase 2 go/no-go review against the gates in Decision 5.

## Sources

- Stencil: [overview](https://stenciljs.com/docs/overview), [Angular output target](https://stenciljs.com/docs/angular), [styling](https://stenciljs.com/docs/styling)
- Lit: [React](https://lit.dev/docs/frameworks/react/), [SSR status](https://lit.dev/docs/ssr/overview/)
- [React 19: custom elements](https://react.dev/blog/2024/12/05/react-19), [Vue and Web Components](https://vuejs.org/guide/extras/web-components.html), [Custom Elements Everywhere](https://custom-elements-everywhere.com/)
- [Storybook Composition](https://storybook.js.org/docs/sharing/storybook-composition)
- Package names: npm registry entries for the libraries in the table above.
