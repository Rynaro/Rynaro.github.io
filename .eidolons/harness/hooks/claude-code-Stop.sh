#!/usr/bin/env bash
# Eidolons telemetry shim — claude-code Stop
# ZERO LOGIC: cat stdin → exec telemetry capture. No parsing. No decisions.
# FAIL-OPEN: any error → exit 0.
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
_input="$(cat 2>/dev/null)" || exit 0
[[ -n "$_input" ]] || exit 0
"$_bin" telemetry capture --hook STOP_claude-code --stdin <<< "$_input" 2>/dev/null || exit 0
