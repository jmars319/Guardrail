#!/usr/bin/env bash

set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_common.sh"

section "Running repository checks"
cd "$REPO_ROOT"
run bash "$REPO_ROOT/scripts/check-env.sh"
run bash "$REPO_ROOT/scripts/check-packages.sh"
run pnpm lint
run pnpm typecheck
run bash "$REPO_ROOT/scripts/verify-web.sh"
run bash "$REPO_ROOT/scripts/verify-desktop.sh"
run bash "$REPO_ROOT/scripts/verify-mobile.sh"
