#!/usr/bin/env bash

set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_common.sh"

section "Verifying desktop app"
cd "$REPO_ROOT"
run pnpm --filter @guardrail/desktopapp lint
run pnpm --filter @guardrail/desktopapp typecheck
run pnpm --filter @guardrail/desktopapp build
