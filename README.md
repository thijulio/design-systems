# @thijulio design systems

Two independent brand design systems in one Nx monorepo, published as private
npm packages on **GitHub Packages**:

- **Biome Modernism** — `@thijulio/biome-{tokens,css,react}` (personal / website)
- **Exodus** — `@thijulio/exodus-{tokens,css,react}` (professional / work)

📚 **Live catalog:** https://thijulio.github.io/design-systems/

Each system ships three layers: **tokens** (CSS custom properties + typed JS
objects), **css** (a single reset + base + tokens stylesheet), and **react**
(components as CSS Modules referencing the tokens — Tailwind-free).

> Building or maintaining this repo? Read **[AGENTS.md](./AGENTS.md)** — the full
> architecture, conventions, and gotchas.

## Consuming the packages

The `@thijulio` scope lives on GitHub Packages, so a consuming project needs an
`.npmrc` pointing the scope at that registry, plus a GitHub token with the
`read:packages` scope:

```ini
# .npmrc (in the consuming project)
@thijulio:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Then install and use:

```sh
npm install @thijulio/exodus-react @thijulio/exodus-css
```

```tsx
// once, at your app root — sets up tokens (incl. theme overlays), reset + base
import '@thijulio/exodus-css/exodus.css';

import { Button, StatusBadge } from '@thijulio/exodus-react';

export function Example() {
  return (
    <div data-theme="clay">
      <Button variant="primary">Save</Button>
      <StatusBadge state="adopted" />
    </div>
  );
}
```

- **Themes:** set `data-mode="dark"` (Biome) or `data-theme="sage|clay|harbor"`
  (Exodus) on any ancestor element to switch.
- **Tokens only / React Native:** import `@thijulio/<brand>-tokens` for the typed
  token objects, or `@thijulio/<brand>-tokens/tokens.css` for just the vars.
- **Tailwind consumers:** the DS stays Tailwind-free, but a Tailwind app can read
  the CSS vars directly — `class="bg-[var(--accent)]"` — or map them into the
  Tailwind theme (`theme.extend.colors.accent = 'var(--accent)'`).

## Publishing (maintainer)

Versioning/changelog/tags are driven by Conventional Commits via `nx release`:

```sh
npx nx release --dry-run      # preview version bumps + changelog
npx nx release                # version, changelog, tag
NODE_AUTH_TOKEN=<pat> npx nx release publish   # publish to GitHub Packages
```

Publishing needs a token with **`write:packages`**. Only the six brand packages
publish; `core` (build tooling) and `docs` (Storybook) stay private.

## Common tasks

```sh
npx nx run-many -t build test lint typecheck   # everything
npx nx storybook docs --port 6006              # run the catalog locally
npx nx build-storybook docs                    # static build → apps/docs/storybook-static
```

See **[AGENTS.md](./AGENTS.md)** for the full guide.
