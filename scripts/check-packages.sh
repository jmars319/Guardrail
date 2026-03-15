#!/usr/bin/env bash

set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_common.sh"

section "Checking required workspace manifests"
cd "$REPO_ROOT"

node <<'EOF'
const fs = require("node:fs");
const path = require("node:path");

const expected = [
  "apps/webapp",
  "apps/desktopapp",
  "apps/mobileapp",
  "packages/shared-types",
  "packages/domain",
  "packages/api-contracts",
  "packages/validation",
  "packages/privacy",
  "packages/ui",
  "packages/config",
  "packages/policy",
  "packages/runtime-contracts",
  "packages/provider-config",
  "packages/secrets"
];

const missing = expected.filter((dir) => {
  const manifestPath = path.join(process.cwd(), dir, "package.json");
  return !fs.existsSync(manifestPath);
});

if (missing.length > 0) {
  console.error("missing package manifests:");
  for (const entry of missing) {
    console.error(`- ${entry}/package.json`);
  }
  process.exit(1);
}

console.log(`checked ${expected.length} workspace manifests`);
EOF

section "Checking pnpm workspace resolution"
run pnpm list -r --depth -1 >/dev/null
