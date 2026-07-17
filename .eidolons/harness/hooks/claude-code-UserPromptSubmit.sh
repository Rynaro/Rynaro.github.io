#!/usr/bin/env bash
# Eidolons harness shim — UserPromptSubmit
# FAIL-OPEN: any error → exit 0, no stdout output.
# Stdout IS the hook context payload — only write when routing succeeds.
# R21: #16952 guard — skip kernel when prompt is a task-completion notification.
# (Claude bug: UserPromptSubmit also fires on Task/subagent completion; conservative
#  best-effort heuristic; fail-open: false-positive = one skipped inject, harmless.)
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
# Read stdin into a variable (hook passes event JSON on stdin).
_input="$(cat 2>/dev/null)" || exit 0
# Extract .prompt field; if jq absent or field missing, fall through to empty stdout.
if command -v jq >/dev/null 2>&1 && [[ -n "$_input" ]]; then
  _prompt="$(printf '%s' "$_input" | jq -r '.prompt // empty' 2>/dev/null)" || _prompt=""
else
  _prompt=""
fi
[[ -n "$_prompt" ]] || exit 0
# #16952 guard: skip kernel when the prompt is a task-completion notification.
case "$_prompt" in
  "Agent "*" completed"*) exit 0 ;;
  *"<task-notification>"*) exit 0 ;;
esac
"$_bin" run --hook claude-code --stdin <<< "$_input" 2>/dev/null || exit 0
