# Design System Hardening Implementation Plan

> **For agentic workers:** Use `superpowers:executing-plans` to implement this plan task by task. Steps use checkboxes for tracking. Start with the first PR and finish its review before advancing to dependent work.

**Goal:** Make Biome and Exodus consistent in token usage, protect their rendered behavior in CI, and provide trustworthy consumption documentation.

**Architecture:** Preserve the independent brand packages and shared build-only core. Establish browser and screenshot checks before migrating component styling. Keep Storybook as the public catalog and GitHub Packages as the distribution channel.

**Tech Stack:** Node 24, npm workspaces and committed `package-lock.json`, Nx 23.0.1, TypeScript 5.9.3, React, CSS Modules, Style Dictionary, Storybook 10, Vitest and Playwright.

**Spec:** This plan makes the September 13 conversation handover executable. The scope and acceptance contract are recorded below; repository `AGENTS.md` remains authoritative. The earlier Smart Library D1 investigation is separate and does not authorize or require these hardening releases.

**Status:** The deterministic Storybook, accessibility and interaction portion of PR 1 is
implemented locally and under final validation. Screenshot baselines are deferred to a
separate, CI-native follow-up. No commit, PR creation, merge, publication or deployment has
been performed for this plan.

## Global constraints

- Work only in Design Systems on feature branches using the `thijulio/` prefix. Never commit to `main`.
- Keep Biome and Exodus independent; `packages/core` contains build tooling, never shared design tokens.
- Keep Node 24, TypeScript 5.9.x, npm and the committed lockfile. No package-manager migration or unrelated upgrade.
- Preserve legacy token `value` syntax, references, flat alias/ramp keys and verbatim CSS output.
- Shipped component styling uses CSS Modules and token variables. Dynamic custom properties may carry consumer input.
- Preserve appearance during token extraction. Any accessibility correction that changes appearance must have its own documented before/after evidence.
- Public exports are compatibility contracts, including `Tok`, `TokProps` and `TERMINAL_COLORS`.
- Do not create an Exodus dark theme or change the meaning of Biome's Explorer/Recruiter `ModeToggle`.
- Run project checks through repository-local Nx. Build brand packages before rendering Storybook.
- The requested deliverable is this action plan. Implementation and PR publication are subsequent work; merge and package release require owner direction.

## 1. Evidence and corrections to the handover

Rechecked on September 13, 2026 in this worktree at `1abadc48e8fb91da765289fb8a558ae89ea8f81b`:

| Finding                                     | Evidence and practical meaning                                                                                                                                                                                           |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| This worktree loads Nx successfully         | Node 24.18.0; Nx, `@nx/vite` and `@nx/storybook` 23.0.1; TypeScript 5.9.3. `nx show project docs --json` resolves the catalog targets. The earlier failure in the development checkout is not a confirmed source defect. |
| 20 principal components                     | Five Biome and fifteen Exodus exports, counting `Textarea` separately from `Input`. Nineteen folders was not a component count. Biome also exports the `Tok` helper.                                                     |
| Literal colors exist                        | Eight component CSS modules were identified in the preceding source audit, plus Biome `TerminalHero.tsx`. Refresh this inventory during implementation; it is not a percentage of token coverage.                        |
| Numeric values need classification          | The earlier scan found fifteen CSS modules containing numeric layout/type declarations. It also matched valid local geometry and zero values; it does not establish fifteen defective components.                        |
| Browser tests exist but are not a CI gate   | `apps/docs/package.json` exposes `test-storybook`; CI requests `lint test build typecheck`, not that target. Six story files contain explicit `play` functions.                                                          |
| Accessibility is advisory                   | `apps/docs/.storybook/preview.tsx` sets `a11y.test` to `todo`. This does not prove specific violations, nor that the catalog is accessible.                                                                              |
| Storybook cache inputs need attention       | Resolved `build-storybook` uses `production` and `^production`, while `production` excludes stories and `.storybook`. Verify and correct cache invalidation for catalog inputs.                                          |
| Consumer snippets are incomplete            | `README.md` and `apps/docs/src/Introduction.mdx` omit the React package stylesheet in their application examples. Both brand CSS and component CSS must be imported.                                                     |
| Deployment age is not proof of visual drift | Earlier live verification identified Pages commit `1695bd5`. Compare its actual catalog/package changes with the reviewed commit before declaring the site stale.                                                        |

These are source/configuration findings. No full browser, contrast, screen-reader or visual certification was performed during this planning turn.

## 2. Delivery sequence

Use three implementation PRs. Fold this plan into the first PR rather than creating a planning-only PR.

| Order | Branch / proposed title                                                                                     | Deliverable                                                                                                | Dependency                    |
| ----- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------- |
| 1     | `thijulio/storybook-quality-gates` — `test: enforce storybook browser and visual checks`                    | Reliable story builds, theme/viewport coverage, accessibility enforcement and initial screenshot baselines | Reproducible local setup      |
| 2     | `thijulio/design-token-consistency` — `refactor: centralize component design decisions in tokens`           | Color extraction, classified numeric values, token validation and a regression guard                       | PR 1 baselines and CI         |
| 3     | `thijulio/design-system-consumption-docs` — `docs: complete design system consumption and release guidance` | Complete catalog guidance, tested package-consumer examples and build identity                             | Final PR 2 API/token contract |

Recommended visual tooling: repository-owned Playwright screenshots, using the existing browser dependency. No additional hosted service is necessary for this initial scope. Reconsider Chromatic only if baseline review and artifact maintenance become costly.

Planning estimate: 5–8 focused working days plus review. Contrast or keyboard defects uncovered by the first PR may expand the work; record those findings before changing the estimate. These are estimates, not execution commitments.

## 3. Preparation — baseline and reproducibility

**Files:** inspect `AGENTS.md`, `.nvmrc`, `package.json`, `package-lock.json`, `nx.json`, `apps/docs/package.json`, `.storybook/*`, brand manifests and both CI workflows.

- [ ] Record branch, commit and existing modifications; preserve user files. Use this isolated worktree if still suitable, and create the first implementation branch without modifying the separate development checkout.
- [ ] Load Node 24 and use `npm ci` when dependency restoration is required. Do not run pnpm or regenerate its files.
- [ ] Query resolved Nx targets for `docs`, `biome-react` and `exodus-react`; verify versions against the committed lockfile.
- [ ] Run the baseline commands below and retain uncached output for the initial comparison. Classify setup errors separately from source failures.
- [ ] Inventory public exports, stories and supported themes, including the `Tok` helper. Record baseline failures with story IDs and screenshots.

```sh
export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"
nvm use 24
npx nx show project docs --json
npx nx run-many -t build test lint typecheck
npx nx build-storybook docs
npx nx test-storybook docs
```

Provision Chromium using the installed Playwright version if it is missing. Do not treat a missing browser binary as a component defect.

**Exit:** a reproducible baseline, exact failing stories if any, and no unexplained setup failure.

## 4. PR 1 — Storybook quality gates

### Task 1.1 — Make catalog builds and tests deterministic

**Modify:** `apps/docs/package.json`, `nx.json`, `apps/docs/vitest.config.ts`, `.github/workflows/ci.yml`.

- [ ] Give catalog build and browser-test targets explicit dependencies on the brand builds they consume. Ensure a clean checkout can run them without a previous manual build.
- [ ] Define catalog-specific cache inputs including story files, MDX, `.storybook/*.tsx`, test configuration and dependency outputs. Keep component production inputs narrow.
- [ ] Verify cache invalidation by changing only a disposable story label, rebuilding, and confirming the built output changes; repeat for a preview configuration change. Restore only the probe edits afterward.
- [ ] Add a bounded CI job/step that installs Chromium, builds Storybook and runs `test-storybook` on PRs. Retain concurrency cancellation and add a timeout and failure artifacts.
- [ ] Initially run the full catalog matrix because it is small. If later optimizing affected projects, prove that brand-token-only and preview-only changes still trigger the checks.

**Exit:** stories/configuration cannot silently reuse stale output; browser tests actually run in CI.

### Task 1.2 — Enforce accessibility and observable interactions

**Modify:** `apps/docs/.storybook/preview.tsx`, `apps/docs/src/biome/*.stories.tsx`, `apps/docs/src/exodus/*.stories.tsx`, and only component/spec files implicated by reproduced defects.

- [ ] Run the existing a11y audit per theme and record violations before enabling enforcement.
- [ ] Set the global contract to `a11y: { test: 'error' }` and resolve failures. A temporary story exception must identify its rule, reason, owner and exit criterion; critical/serious findings on supported states block completion.
- [ ] Add explicit theme cases: Biome light/dark; Exodus sage/clay/harbor. A toolbar control alone does not cause CI to test every setting.
- [ ] Test Button callbacks and disabled behavior; labeled Input/Select/Textarea/Checkbox interaction; Tabs and ModeToggle keyboard behavior; Toast dismissal; and accessible names for icon controls.
- [ ] For an actual component bug, reproduce it with a behavior test before the smallest correction. Verify tab order, visible focus and error-description associations in the browser.
- [ ] Exercise reduced-motion settings and manually inspect keyboard behavior. Include a manual screen-reader smoke check where available; mark it unverified if unavailable.

Example interaction contract for a callback story:

```tsx
args: { children: 'Save', onClick: fn() },
play: async ({ args, canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
  await expect(args.onClick).toHaveBeenCalledTimes(1);
},
```

Use `fn`, `within`, `userEvent` and `expect` from the installed `storybook/test` API. Add separate disabled and keyboard cases; clicking once is not complete accessibility coverage.

**Exit:** theme matrix passes browser tests; a seeded accessibility violation in a disposable story fails the same CI command.

### Task 1.3 — Capture reviewable screenshot baselines

**Create:** `apps/docs/playwright.config.ts`, `apps/docs/tests/visual.spec.ts`, `apps/docs/tests/visual-cases.ts`, `apps/docs/tests/__screenshots__/`.
**Modify:** `apps/docs/package.json`, `.github/workflows/ci.yml`, `.gitignore` for transient reports only.

- [ ] Register an Nx `visual-test` target that serves the built Storybook locally, runs Playwright and closes the server after completion. Use the built `index.json` to resolve real story IDs.
- [ ] Cover all twenty principal components with default states; add disabled, invalid, selected and dismissible states where supported. Include both Biome modes and all Exodus accents.
- [ ] Cover 390px and 1280px viewports. Check horizontal overflow separately from screenshots and inspect focus without clipping.
- [ ] Stabilize screenshots with a pinned browser/OS, fixed viewport and deterministic fonts. Use reviewed test-only local font assets or a controlled font fixture; fail if fonts are unavailable rather than accepting a fallback silently.
- [ ] Disable animation for screenshot capture and ensure delayed terminal content is visible. Keep reduced-motion behavior tests separate.
- [ ] Generate reference images in the same Linux environment used by CI and review them before committing. Do not mix macOS and Linux screenshots as equivalent baselines.
- [ ] Upload expected/actual/diff images on failure. Prove a deliberate temporary color change creates a diff; never automatically update expected images in CI.

Example assertion inside a loaded, stabilized story:

```ts
await expect(page.locator('#storybook-root')).toHaveScreenshot(
  `${storyId}-${theme}-${viewportWidth}.png`,
  { animations: 'disabled' },
);
```

**Exit:** reviewed baselines exist before token changes. Pre-existing poor appearance or accessibility is recorded and corrected explicitly rather than approved as a permanent baseline.

## 5. PR 2 — Token consistency and prevention

### Task 2.1 — Build a token decision inventory

**Create:** `docs/token-policy.md`.
**Inspect:** all production brand CSS modules, JSX style values, SVG fills/strokes and token JSON.

- [ ] Classify each literal as an existing-token match, a missing reusable role, a deliberate component constant or a consumer-provided value.
- [ ] Count findings by declaration and category, excluding tests, documentation examples, zero values and layout geometry. Do not publish a token-coverage percentage without defining its denominator.
- [ ] Preserve exact values when mapping to existing tokens. Do not round a 14px gap to 16px just to fit the existing scale.
- [ ] Use component tokens for a stable role that has no exact existing match; avoid manufacturing one global token for every number.
- [ ] Record a mapping from each changed declaration to its token and theme behavior. Fixed dark terminal artwork may need dedicated tokens rather than the page surface roles.

**Exit:** reviewed value-preserving mapping and explicit exceptions.

### Task 2.2 — Extract color and repeated visual decisions

**Modify:** `packages/biome/tokens/src/tokens/{semantic,spacing,typography,motion}.json`, relevant dark overlays, `packages/exodus/tokens/src/tokens/{color,spacing,typography}.json`, and implicated components.
**Create when needed:** `packages/biome/tokens/src/tokens/components.json`, `packages/exodus/tokens/src/tokens/components.json`.

Initial color targets:

- Biome `Card/Card.module.css`, `TerminalHero/TerminalHero.module.css`, `TerminalHero/TerminalHero.tsx`.
- Exodus `{Button,Card,Checkbox,EmptyState,Input,Toast}/*.module.css`.

- [ ] Migrate surfaces, foregrounds, borders, gradients, shadows and syntax/decorative colors, including literals inside JSX and SVG.
- [ ] Reuse exact existing spacing/type/radius/motion values; extract remaining repeated component roles from the mapping.
- [ ] For expressive Card foregrounds, test both modes before deciding whether an alias should follow `--on-brand`. Any existing contrast defect needs a separately identified accessibility correction.
- [ ] Preserve `Tok.c` accepting a CSS color string. Keep `TERMINAL_COLORS` compatible: generate any legacy literal export from canonical token data, or propose a documented API migration before changing observable values to `var(...)` strings. Internal defaults should use token references.
- [ ] Extend each brand's `verify.mjs` to verify new tokens, aliases and emitted declarations. Test for missing/cyclic references and invalid overlay output; no schema migration.
- [ ] Run all affected package checks and compare against PR 1 images. Explain every intended pixel change; reject unexplained differences.

**Exit:** brand styling comes from canonical design decisions; token extraction introduces no silent API or visual break.

### Task 2.3 — Add a scoped token guard

**Create:** `tools/token-guard/check.mjs`, `tools/token-guard/check.spec.mjs`, `tools/token-guard/exceptions.json`.
**Modify:** both React package manifests to register `token-check` and `token-check-test` Nx targets; `.github/workflows/ci.yml` to run them.

Contract: `check.mjs <brand-source-root>` emits file/line diagnostics and exits nonzero for a forbidden authored color. Export a pure `scanSource({ path, text })` function for fixture tests. Use syntax-aware CSS/TS parsing; reuse pinned dependencies where suitable and declare any new direct tool dependency explicitly.

- [ ] Test literal hex, rgb/rgba, hsl/hsla, modern color functions and named colors in CSS declarations, JSX style values and SVG attributes.
- [ ] Accept token references, `currentColor`, `transparent`, SVG `none`, consumer-provided values and recorded generated compatibility exports.
- [ ] Exclude selectors, IDs, links, comments, test fixtures and documentation prose. A hex-looking string alone is insufficient evidence of an authored color.
- [ ] Require exceptions to name an exact file/role, reason and removal condition. Reject stale exceptions; avoid broad file or directory exclusions.
- [ ] Ensure a seeded violation fails CI and the migrated production source passes.

Fixture examples: `.x { color: #fff }` and `<circle fill="#fff" />` must fail; `.x { color: var(--text-strong) }` and `<a href="#fff" />` must pass.

**Exit:** new authored literal colors cannot enter shipped component styles unnoticed. Numeric geometry remains a review decision with documented policy.

## 6. PR 3 — Consumer documentation and publication identity

### Task 3.1 — Make installation instructions executable

**Modify:** `README.md`, `apps/docs/src/Introduction.mdx`, package READMEs and story `argTypes`.
**Create:** `docs/consumption.md`, `tools/consumer-smoke/run.mjs`, `tools/consumer-smoke/template/`.

- [ ] Correct application examples for both brands. Preserve CSS order:

```tsx
import '@thijulio/biome-css/biome.css';
import '@thijulio/biome-react/styles.css';
import { Button, Card } from '@thijulio/biome-react';
```

- [ ] Document equivalent Exodus imports, registry authentication using environment references, theme attributes and the ModeToggle meaning.
- [ ] Register `consumer-smoke` under `docs` as an Nx target. Pack built candidate CSS/React packages into temporary consumers outside npm workspaces; install tarballs without source aliases or sibling symlinks.
- [ ] Typecheck and build a React/Vite consumer per brand; assert rendered Card/Button styles, theme changes, focus and callbacks. Verify only one React runtime is installed. Use exact tool versions from the reviewed lockfile.
- [ ] Document separately that candidate tarball checks prove packaging, while authenticated published-version downloads prove registry delivery. Repeat the latter only after an approved package release.

**Exit:** every documented import path works in a clean consumer and required styles render.

### Task 3.2 — Document component decisions and token roles

**Modify:** `apps/docs/src/{biome,exodus}/*.stories.tsx`, both Foundations files.
**Create:** `apps/docs/src/Consumption.mdx`, `apps/docs/src/Contribution.mdx`, and brand component MDX pages where prose exceeds story descriptions.

- [ ] For each principal component, document purpose, when to use/avoid it, props/defaults, relevant states, keyboard behavior, accessibility responsibilities, responsiveness and theme behavior.
- [ ] Add form composition examples showing label, helper text and error associations. Document focus and dismiss behavior with the existing stories as live examples.
- [ ] List token names, semantic purpose, current resolved value, mode differences and usage examples. Generate values from token outputs instead of maintaining duplicate swatch palettes.
- [ ] Document contribution criteria, component status, backwards compatibility, deprecation and release procedure. Keep one clear entry point for installation.
- [ ] Verify navigation and brand prefixes; prose pages should not accidentally load overlapping root variables from both brands.

**Exit:** users can select, style and compose the components from the public catalog without needing the original conversation.

### Task 3.3 — Expose build identity and verify deployment

**Create:** `tools/storybook/build-info.mjs`, `apps/docs/src/BuildInfo.tsx`.
**Modify:** docs manifest/build inputs, `apps/docs/src/Introduction.mdx`, `.github/workflows/storybook-pages.yml`, `.gitignore` for generated metadata.

- [ ] Generate the source SHA, build timestamp and six package manifest versions at build time. Display these in a small catalog metadata panel with repository/release links.
- [ ] Include SHA and package versions in cache identity or generate metadata after cached build restoration so an old artifact cannot claim a new commit. Local builds must be labeled local.
- [ ] Display manifest versions as catalog build versions; do not claim unpublished candidates are registry releases.
- [ ] Following an owner-directed merge, verify Pages workflow success, served metadata, a story from each brand and CSS/font assets. HTTP 200 alone is insufficient.

**Exit:** a catalog visitor can identify its source and package versions; the verified deployed SHA matches the workflow artifact.

## 7. Validation and completion gates

| Gate | Required evidence                                                                               |
| ---- | ----------------------------------------------------------------------------------------------- |
| Q1   | Fresh npm install, aligned runtime/toolchain and resolved Nx targets                            |
| Q2   | `npx nx format:check` and `npx nx run-many -t build test lint typecheck` pass                   |
| Q3   | `npx nx build-storybook docs` and `npx nx test-storybook docs` pass across explicit theme cases |
| Q4   | `npx nx run docs:visual-test` passes against reviewed Linux baselines at 390px and 1280px       |
| Q5   | New token guard and its fixture tests pass; seeded authored-color violation fails               |
| Q6   | Candidate package consumers typecheck, build and render expected styles without source links    |
| Q7   | Consumer docs, token decision policy and build identity cover their agreed contracts            |
| Q8   | PR CI, review decision, merge, package release and Pages deployment are reported separately     |

New target names above are planned interfaces, not claims that those targets already exist. Each PR must register the targets it advertises and verify the resolved Nx configuration.

After each PR, record exact source commit, changed files, checks, review outcome and outstanding findings. Attach screenshots and runtime reports to the PR/CI artifacts rather than committing private logs.

## 8. Release, rollback and deferred work

- Merge only at the owner's direction. For PR 2 or a shared component fix in PR 1, review the established Release workflow dry run after merge before authorizing publication.
- Inspect every package the release proposes to change. Both brands may be intentionally affected by this program; stop for a scope decision only if unrelated pending work is included.
- Docs/test-only changes do not inherently require an npm release. Keep Pages deployment and npm publication separate.
- After an approved release, download the immutable packages and repeat the consumer checks. Updating Smart Library, Website or PMP belongs to their own work.
- Revert a faulty source change through Git history. Never overwrite an existing registry version. Review screenshot changes during reverts; do not suppress checks to obtain a pass.
- Defer DTCG export, Figma integration, a custom domain, new components, new framework packages and broad token schema changes. Reconsider them when a concrete consumer need justifies a separate proposal.

## 9. Definition of done and next action

The hardening effort is complete when Q1–Q7 have evidence, Q8 states are explicit, supported themes pass the enforced checks, exceptions are accounted for, and the public catalog accurately describes its build. A release is required only for approved package delivery and is not implied by local completion.

Next implementation action: begin PR 1 preparation, capture the existing accessibility/visual state, then establish deterministic Storybook and screenshot checks. Do not begin token extraction until baseline images are available for comparison.

## References

- Repository `AGENTS.md`, `nx.json`, docs configuration and public package entry points.
- [Storybook accessibility testing](https://storybook.js.org/docs/writing-tests/accessibility-testing)
- [Storybook component testing](https://storybook.js.org/docs/writing-tests)
- [Storybook documentation](https://storybook.js.org/docs/writing-docs)
- [Storybook visual testing handbook](https://storybook.js.org/tutorials/visual-testing-handbook)

The external references were consulted in the preceding benchmark. Recheck installed-version API details before implementation.
