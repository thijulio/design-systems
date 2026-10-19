#!/usr/bin/env bash
# SessionStart hook for Claude Code cloud sessions (claude.ai/code). Local runs exit at once.
#
# Split of responsibilities (https://code.claude.com/docs/en/cloud-environments):
# - The environment's *setup script* (claude.ai UI, runs as root, cached in the VM snapshot)
#   provisions the machine: Node 24 into /opt/node24 (the image ships 20/21/22 only) and
#   Chromium's apt dependencies (`playwright install-deps chromium`).
# - This hook does the project part on every startup/resume, and is cheap when nothing changed:
#   1. puts the `.nvmrc` Node major first on PATH (also for Claude's later shells, via
#      CLAUDE_ENV_FILE);
#   2. `npm ci` from the lockfile, skipped while package-lock.json + Node version are unchanged
#      (a stale node_modules is the failure mode we've actually hit);
#   3. `playwright install chromium` for the *locked* Playwright version (a no-op when present).
#      Needed by `nx test-storybook docs` and Playwright-driven visual reviews.
#
# Network: the Playwright CDN (cdn.playwright.dev, playwright.download.prss.microsoft.com) and
# nodejs.org are NOT on the default "Trusted" allowlist; the environment needs "Custom" with
# them added. No registry token is needed to install: every lockfile entry resolves from
# registry.npmjs.org. NODE_AUTH_TOKEN (.npmrc, npm.pkg.github.com) is only for publishing.
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

# 1. Node from .nvmrc
node_major() { node -p 'process.versions.node.split(".")[0]' 2>/dev/null; }
if [ "$(node_major)" != "$want_major" ] && [ -x "/opt/node$want_major/bin/node" ]; then
  export PATH="/opt/node$want_major/bin:$PATH"
  if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
    echo "export PATH=\"/opt/node$want_major/bin:\$PATH\"" >>"$CLAUDE_ENV_FILE"
  fi
fi
[ "$(node_major)" = "$want_major" ] ||
  fail "Node $want_major not found (have $(node -v 2>/dev/null || echo none)); the setup script should install it into /opt/node$want_major"

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

echo "cloud-session-start: Node $(node -v), $deps, Playwright chromium ready."
