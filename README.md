# @thijulio design systems

Three brand design systems in one Nx monorepo, with common React components
implemented once in `@thijulio/primitives` and skinned through semantic tokens:

- **Biome Modernism** — `@thijulio/biome-{tokens,css,react}` (personal / website)
- **Exodus** — `@thijulio/exodus-{tokens,css,react}` (professional / work)
- **Faune** — `@thijulio/faune-{tokens,css}` + shared primitives (Maison Féline)

The six Biome/Exodus packages are published privately on **GitHub Packages** at
`0.0.2`. Faune and primitives need their first package release; a source merge
and a Storybook deployment do not publish packages.

📚 **Live catalog:** https://thijulio.github.io/design-systems/

The brand layers are **tokens** (CSS custom properties + typed JS
objects), **css** (a single reset + base + tokens stylesheet), and **react**
(CSS Modules referencing tokens — Tailwind-free). Biome and Exodus retain
their public React imports while common implementations delegate to primitives.
See the [adoption matrix](docs/architecture/multi-brand-primitives.md).

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

Publishing needs a token with **`write:packages`**. The nine brand/primitives
packages are release targets; `core` and `docs` stay private. Use the normal
release dry run for the mixed existing/new package group; see AGENTS.md.

## Common tasks

```sh
npx nx run-many -t build test lint typecheck   # everything
npx nx storybook docs --port 6006              # run the catalog locally
npx nx build-storybook docs                    # static build → apps/docs/storybook-static
```

See **[AGENTS.md](./AGENTS.md)** for the full guide.
