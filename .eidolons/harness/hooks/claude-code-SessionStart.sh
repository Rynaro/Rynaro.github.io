#!/usr/bin/env bash
# Eidolons harness shim — SessionStart
# FAIL-OPEN: any error → exit 0, no stdout output.
# Stdout IS the hook context payload — only write when routing succeeds.
set -euo pipefail

_eidolons_bin() {
  if command -v eidolons >/dev/null 2>&1; then
    echo "eidolons"
  elif [[ -x "${EIDOLONS_HOME:-$HOME/.eidolons}/nexus/cli/eidolons" ]]; then
    echo "${EIDOLONS_HOME:-$HOME/.eidolons}/nexus/cli/eidolons"
  else
    return 1
  fi
}

_bin="$(_eidolons_bin 2>/dev/null)" || exit 0
"$_bin" run --hook claude-code --session-start 2>/dev/null || exit 0
