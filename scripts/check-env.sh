#!/usr/bin/env bash

set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_common.sh"

section "Required commands"
require_command node
require_command pnpm
require_command git
require_command rustc
require_command cargo

run node -v
run pnpm -v
run git --version
run rustc --version
run cargo --version

section "Platform checks"
case "$(uname -s)" in
  Darwin)
    if command -v xcode-select >/dev/null 2>&1; then
      run xcode-select -p
    else
      fail "xcode-select is required for macOS desktop builds"
    fi
    ;;
  Linux)
    if command -v pkg-config >/dev/null 2>&1; then
      run pkg-config --version
    else
      fail "pkg-config is required for Linux desktop builds"
    fi
    ;;
  *)
    printf 'warning: platform-specific desktop prerequisites are not checked for %s\n' "$(uname -s)"
    ;;
esac
