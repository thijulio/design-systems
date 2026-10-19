#!/usr/bin/env bash
# SessionStart hook for Claude Code cloud sessions (claude.ai/code). Local runs exit at once.
#
# Split of responsibilities (https://code.claude.com/docs/en/cloud-environments):
# - The environment's *setup script* (claude.ai UI, runs as root, cached in the VM snapshot)
#   provisions the machine: Node 24 into /opt/node24 (the image ships 20/21/22 only), plus
#   Chromium and its apt dependencies (`npx -y playwright@<locked> install --with-deps
#   chromium`) into $PLAYWRIGHT_BROWSERS_PATH (/opt/pw-browsers, not ~/.cache/ms-playwright).
# - This hook does the project part on every startup/resume, and is cheap when nothing changed:
#   1. puts the `.nvmrc` Node major (nvm, else /opt) first on PATH, also for Claude's later
#      shells via CLAUDE_ENV_FILE;
#   2. `npm ci` from the lockfile, skipped while package-lock.json + Node version are unchanged
#      (a stale node_modules is the failure mode we've actually hit);
#   3. `playwright install chromium` for the *locked* Playwright version: a no-op while the
#      setup script's pin matches the lockfile, a download once a Playwright bump outruns it.
#      Needed by `nx test-storybook docs` and Playwright-driven visual reviews.
#   4. a local `main` (created, or fast-forwarded): Nx's base for `nx format:check` in
#      .husky/pre-commit and `nx affected`. Cloud clones carry only the session branch, so
#      without it every commit logs `fatal: ambiguous argument 'main'` and checks all files.
#
# Network: the Playwright CDN (cdn.playwright.dev, playwright.download.prss.microsoft.com) and
# nodejs.org are NOT among the default package-manager domains; the environment uses "Limited"
# network access with "Allow package managers" on and those three hosts added. No registry
# token is needed to install: every lockfile entry resolves from registry.npmjs.org.
# NODE_AUTH_TOKEN (.npmrc, npm.pkg.github.com) is only for publishing.
#
# Stdout is added to Claude's context, so it stays a few lines; tool output goes to a log.
# Failures are reported (with the log path) rather than aborting the session.
set -uo pipefail

[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0

cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel)}" || exit 0

log="${TMPDIR:-/tmp}/claude-cloud-session-start.log"
: >"$log"
want_major="$(tr -dc '0-9' <.nvmrc)"

fail() {
  echo "cloud-session-start: $1 — see $log. Fix the environment before running Nx tasks."
  tail -n 20 "$log"
  exit 0
}

# 1. Node from .nvmrc: nvm when present (the repo's convention, AGENTS.md), else the setup
#    script's /opt/node<major>. Whichever bin dir wins is persisted for Claude's later shells.
node_major() { node -p 'process.versions.node.split(".")[0]' 2>/dev/null; }
if [ "$(node_major)" != "$want_major" ]; then
  node_bin=""
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [ -s "$NVM_DIR/nvm.sh" ]; then
    # shellcheck disable=SC1091
    . "$NVM_DIR/nvm.sh" >>"$log" 2>&1
    nvm_node="$(nvm which "$want_major" 2>>"$log")" && node_bin="$(dirname "$nvm_node")"
  fi
  if [ -z "$node_bin" ] && [ -x "/opt/node$want_major/bin/node" ]; then
    node_bin="/opt/node$want_major/bin"
  fi
  if [ -n "$node_bin" ]; then
    export PATH="$node_bin:$PATH"
    if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
      echo "export PATH=\"$node_bin:\$PATH\"" >>"$CLAUDE_ENV_FILE"
    fi
  fi
fi
[ "$(node_major)" = "$want_major" ] ||
  fail "Node $want_major not found via nvm or /opt/node$want_major (have $(node -v 2>/dev/null || echo none))"

# 2. Dependencies, keyed on the lockfile and Node version
stamp="node_modules/.cloud-session-start"
key="$(node -e 'const h = require("crypto").createHash("sha256");
h.update(require("fs").readFileSync("package-lock.json")).update(process.version);
process.stdout.write(h.digest("hex"))')"
if [ -f "$stamp" ] && [ "$(cat "$stamp")" = "$key" ]; then
  deps="node_modules up to date"
else
  npm ci --no-audit --no-fund >>"$log" 2>&1 || fail "npm ci failed"
  echo "$key" >"$stamp"
  deps="npm ci done"
fi

# 3. Chromium for the locked Playwright (revision must match playwright-core)
node_modules/.bin/playwright install chromium >>"$log" 2>&1 || fail "playwright install chromium failed"

# 4. Nx's base branch. Best effort: an offline fetch, or `main` checked out (git refuses to
#    fetch into it), still leaves a usable session.
if git fetch -q origin main:main >>"$log" 2>&1 ||
  git rev-parse -q --verify refs/heads/main >/dev/null; then
  base="local main ready"
else
  base="no local main (git fetch failed, see $log)"
fi

echo "cloud-session-start: Node $(node -v), $deps, Playwright chromium ready, $base."
