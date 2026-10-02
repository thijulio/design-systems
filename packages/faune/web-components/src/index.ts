// Faune's Web Components: the shared `tj-*` elements, skinned by
// @thijulio/faune-css through the inherited `--ds-*` contract (ADR-0001).
// Faune-only elements will live here as `faune-*`. The shared elements are a
// peer dependency: custom element tags are global per page, so an app must
// resolve exactly one copy of @thijulio/primitives-web-components. Framework
// adapters register each element they use; without one, call the
// `defineCustomElementTj*()` helpers once at startup.
export * from '@thijulio/primitives-web-components';
