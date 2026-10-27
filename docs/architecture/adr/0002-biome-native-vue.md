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
5. **`biome-vue` writes no CSS of its own; it compiles the same files as `biome-react`**
   (open question 1). Each SFC points `<style module src>` at
   `@thijulio/primitives`' `*.module.css` (where `biome-react` delegates) and at
   `biome-react`'s own skin `*.module.css`, by repo-relative path, the way Stencil's
   `styleUrls` does in ADR-0001. Vite inlines them into `dist/index.css` with their own
   hashes, so the published package needs neither React package at runtime. The
   `implicitDependencies` on `primitives` and `biome-react` keep the Nx cache,
   `nx affected` and release bumps following those files.

## Consequences

- **Easier:** Smart Library gets idiomatic Vue components (props, slots, emits,
  `v-model`) now, without a Stencil port of Biome first.
- **Harder:** Biome behavior exists twice (React and Vue) and can drift; every
  `biome-react` change needs a matching `biome-vue` change and spec. Styles cannot drift:
  a CSS change in `primitives` or `biome-react` rebuilds `biome-vue` and bumps it on
  the next release. Renaming a class in those files breaks the Vue template that names
  it, and the Vue specs and build catch that.
- **Measured (2026-10-27):** every component and variant was rendered by both packages
  (SSR, built `dist`) and compared in Chromium, in light and `[data-mode="dark"]`:
  67,752 computed properties per mode, plus every element's box and non-class
  attributes, all identical.
- **Revisit:** if `biome-web-components` is ever built, `biome-vue` can become its
  generated wrapper, as a major release.

## Open questions

1. ~~How `biome-vue` reuses the `@thijulio/primitives` styles that `biome-react`'s
   `Button`, `Tag` and `Card` delegate to, without duplicating them (#23).~~ Resolved:
   **the same files** (Decision 5). Considered and rejected: sourcing only the
   primitives' CSS and copying the Biome skins (would duplicate `biome-react`'s palette
   literals and let the skins drift), and publishing the primitives' CSS for import
   (changes `@thijulio/primitives`' published surface and makes a Vue package depend
   on a React one).

## Notes

- `TERMINAL_COLORS` in `biome-vue` is the canonical `var(--terminal-syntax-*)` map, not
  `biome-react`'s legacy hex literals: a new package has no consumers of those, and it
  keeps palette values in `biome-tokens` only.
