# ADR-0002: Biome ships a native Vue package (exception to ADR-0001)

**Status:** Accepted (2026-10-27)
**Date:** 2026-10-27
**Deciders:** Thiago Valença

## Context

- [ADR-0001](0001-multi-framework-web-components.md) makes Web Components (Stencil) the
  multi-framework path: Vue support is a **generated** `@thijulio/<brand>-vue` wrapper
  over `<brand>-web-components`. Reimplementing components per framework (its Option C)
  was rejected.
- Biome's first Vue consumer is Smart Library (`thijulio/thiago-smart-library`, M1),
  which needs `@thijulio/biome-vue` (#22–#24).
- Biome has no `-web-components` package. The only elements are the shared `tj-button`
  and `tj-input`, so the ADR-0001 route would first need Stencil versions of `Card`,
  `Tag`, `ModeToggle` and `TerminalHero`, then a Vue output target.
- Biome's component set is small (five) and two of them (`ModeToggle`,
  `TerminalHero`) are brand-only.

## Decision

1. **Biome gets a hand-written Vue 3 package, `@thijulio/biome-vue`**
   (`packages/biome/vue`, `scope:biome`), alongside `biome-react`. This is an
   exception for Biome only. Exodus, Faune and the shared primitives stay on
   ADR-0001.
2. **Same shape as `biome-react`:** Vite library mode (ES only, one module per source
   file), declarations from Volar (`vite-plugin-dts`; `vue-tsc` for `typecheck`), CSS
   Modules (`<style module>`) on token variables, published to GitHub Packages and
   released with the other Biome packages.
3. **`./styles.css` is the complete stylesheet:** it `@import`s
   `@thijulio/biome-css/biome.css` and then the component styles, so `biome-css` is a
   dependency. Token and palette values live only in `biome-tokens`/`biome-css`.
4. **Parity with `biome-react` is enforced by specs** that mirror the React specs
   (behavior and a11y), not by a shared implementation (#23).

## Consequences

- **Easier:** Smart Library gets idiomatic Vue components (props, slots, emits,
  `v-model`) now, without a Stencil port of Biome first.
- **Harder:** Biome behavior exists twice (React and Vue) and can drift; every
  `biome-react` change needs a matching `biome-vue` change and spec.
- **Revisit:** if `biome-web-components` is ever built, `biome-vue` can become its
  generated wrapper, as a major release.

## Open questions

1. How `biome-vue` reuses the `@thijulio/primitives` styles that `biome-react`'s
   `Button`, `Tag` and `Card` delegate to, without duplicating them (#23).
