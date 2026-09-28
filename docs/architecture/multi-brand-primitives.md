# Multi-brand primitives

The workspace can add brands without copying common UI implementations.
Each brand owns its source tokens and CSS bundle. Shared React components in
`@thijulio/primitives` consume semantic `--ds-*` CSS variables and never import
a brand package. Biome, Exodus, and Faune all implement this web contract.

## Current adoption

| Brand  | Shared implementation                        | Brand-owned composition                               |
| ------ | -------------------------------------------- | ----------------------------------------------------- |
| Biome  | Button, Tag, Card root                       | Editorial Card content/arcs, ModeToggle, TerminalHero |
| Exodus | Button, Card, Badge, Avatar, Input, Textarea | Existing non-migrated components                      |
| Faune  | Direct consumption of all primitives         | Domain-specific pieces belong in the consuming site   |

Existing Biome and Exodus import paths, props, defaults, and consumer styles
remain supported. Their wrappers adapt brand choices rather than reimplement
the common control behavior. Biome's optional Button `href` is handled by the
shared implementation; disabled links still render a disabled button.
Exodus Input and Textarea now expose `aria-invalid` for `invalid`, while an
explicit consumer `aria-invalid` value takes precedence.

## Compatibility skins

Legacy wrappers define local semantic and optional component variables from
native brand tokens. The primitives provide the actual CSS properties. This
avoids stronger selectors that would override consumer classes and avoids
depending on whether the shared or brand stylesheet loads last.

Optional `--ds-button-*`, `--ds-input-*`, `--ds-tag-*`, and `--ds-card-*`
variables preserve legacy geometry and states without expanding the required
global contract. Exodus Card retains its earlier 18/20 padding fallbacks when
new padding tokens are absent. Avatar retains native tone and size adaptation.

Storybook compatibility stories remove global `--ds-*` declarations to exercise
the pre-contract token surface, assert known legacy metrics and colors, and
check consumer class overrides. This is a targeted compatibility regression
test with shared styles deliberately loaded last, not a reliance on import order.
It is not byte-for-byte certification of every historical published artifact.
Raw shared-component stories also exercise the new contract independently of
the wrappers, including Biome light/dark and Exodus Sage/Clay/Harbor.

Biome aliases status colors to its own palette rather than borrowing another
brand's tones. Its shared inverse text uses the raised bone color for the
terracotta danger control's normal-state contrast. Contract completeness does
not certify accessibility for every possible component/state combination;
browser accessibility tests enforce the demonstrated compositions.

The semantic aliases are a web CSS contract. Native/Dart consumers should use
their brand's native token schema: resolving native theme objects does not
automatically re-resolve aliased semantic snapshots.

Theme overlays must re-emit aliases whose source tokens change. CSS variables
resolve references where they are declared, before inheritance: aliases only on
`:root` would keep the page theme inside a differently themed subtree. Biome's
dark overlay and all Exodus accent overlays rebind their affected aliases;
browser stories verify nested dark, Harbor, and Sage scopes.

## Adding another brand

1. Create its tokens and CSS packages and map source tokens to `--ds-*`.
2. Register its CSS bundle in Storybook and add the brand to
   `apps/docs/verify-contract.mjs`.
3. Demonstrate shared components, states, and interactions in Storybook.
4. Run token builds, the contract verifier, browser tests, and the Nx matrix.

The verifier checks every required variable used by primitives CSS or
JavaScript in all three token outputs. Optional component variables retain
shared defaults when absent. Load one brand's root-level CSS per page; multiple
brands require scoped token CSS or separate frames because names overlap.

## Release boundary

A source merge does not publish npm packages or update external consumers.
Faune and primitives use a scoped disk version fallback until their first
version tags exist; existing projects still require their version tags.
Both Biome and Exodus React allow Nx to update the primitives dependency range
when versioning. The normal release dry run validates this mixed release group.
