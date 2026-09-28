# Multi-brand primitives

The workspace can add brands without copying the implementation of common UI
components. Each brand owns its source tokens and CSS bundle. Shared React
components in `@thijulio/primitives` consume semantic `--ds-*` CSS variables;
they never import a brand package.

Faune and Exodus both implement the contract. Storybook renders the same shared
Button and Card under both brands, and exercises the Button under Exodus Sage,
Clay, and Harbor. The `docs:verify-contract` target checks that every required
variable used by primitives CSS or JavaScript exists in both token outputs. The CSS bundle for
one brand must be loaded for its components; a page using multiple brands must
scope or isolate their root-level token CSS because variable names overlap.

Exodus `Card` now delegates to the shared Card while retaining its existing
import path and props. Its brand-specific spacing and border details are
optional `--ds-card-*` overrides in Exodus tokens. Its compatibility skin also
maps the legacy Exodus variables locally, so an existing `0.0.2` stylesheet
does not require an immediate upgrade. The old 18/20 padding survives through
numeric fallbacks when the newer padding tokens are absent. Other published Exodus and
Biome React components remain available; migrating them requires an explicit
API and visual comparison. New common components should be implemented once in
primitives, while genuinely brand-specific components stay in their brand
package.

To add a brand, create its tokens and CSS packages, map the `--ds-*` variables
used by primitives, add the brand to the contract verifier and Storybook brand
CSS registry, and show at least one shared component in Storybook. Then run the
token build, contract check, Storybook browser tests, and the workspace Nx
matrix. A source merge does not publish npm packages or change consumers.

The new Faune and primitives projects use a disk fallback only until their
first version tags exist. Existing projects continue resolving versions from
tags. Changelog generation can start from the first commit for an untagged
project; existing version resolution still fails if its required tags are missing.
Exodus React allows Nx to update its primitives dependency range when
primitives is released; the normal release dry run validates the mixed group.
