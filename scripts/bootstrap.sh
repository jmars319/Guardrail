#!/usr/bin/env bash

set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_common.sh"

section "Checking local toolchain"
run bash "$REPO_ROOT/scripts/check-env.sh"

section "Installing workspace dependencies"
run pnpm install

section "Validating workspace manifests"
run bash "$REPO_ROOT/scripts/check-packages.sh"
