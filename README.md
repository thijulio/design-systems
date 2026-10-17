# @thijulio design systems

Three brand design systems in one Nx monorepo, with common React components
implemented once in `@thijulio/primitives` and skinned through semantic tokens:

- **Biome Modernism** — `@thijulio/biome-{tokens,css,react}` (personal / website)
- **Exodus** — `@thijulio/exodus-{tokens,css,react}` (professional / work)
- **Faune** — `@thijulio/faune-{tokens,css}` + shared primitives (Maison Féline)

The nine brand/primitives packages are published privately on **GitHub
Packages**; each one's current version is its `<pkg>@<version>` git tag.
Neither a merge nor a Storybook deployment publishes: releases are dispatched
by hand (see **Publishing** below).

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

Releases run through the **Release** workflow, on dispatch only. Pick the
version and the packages explicitly, and dry-run first (`dry_run` defaults to
`true`):

```sh
gh workflow run release.yml -f version=0.1.0 -f projects=primitives,exodus-react
gh workflow run release.yml -f version=0.1.0 -f projects=primitives,exodus-react -f dry_run=false
```

An empty `version` derives the bumps from Conventional Commits; an empty
`projects` releases every package. The nine brand/primitives packages are
release targets; `core` and `docs` stay private. See AGENTS.md for the gate
the workflow runs and its ordering guarantees.

## Common tasks

```sh
npx nx run-many -t build test lint typecheck   # everything
npx nx storybook docs --port 6006              # run the catalog locally
npx nx build-storybook docs                    # static build → apps/docs/storybook-static
```

See **[AGENTS.md](./AGENTS.md)** for the full guide.
