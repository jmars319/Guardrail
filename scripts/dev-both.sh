#!/usr/bin/env bash

set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_common.sh"

section "Starting desktop and web surfaces"
cd "$REPO_ROOT"
run pnpm -r --parallel --filter @guardrail/desktopapp --filter @guardrail/webapp run dev
