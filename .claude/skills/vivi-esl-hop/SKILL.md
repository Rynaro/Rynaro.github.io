---
name: vivi-esl-hop
description: "ESL lifecycle hop — when the cortex routes a non-trivial change to Vivi in an ESL-enabled project (tonberry MCP available), Vivi owns the in_progress (implement) hop as the MAKER: declare has_code, run the loop-native A→P→I→V→Δ/R cycle in an isolated worktree, hand off to the CHECKER (never self-verify). Absent tonberry → implement normally (ESL opt-in)."
metadata:
  methodology: Vivi
  phase: I-Implement
---

# Vivi — ESL Lifecycle Hop

Use this skill in an **ESL-enabled project** (`mcp__tonberry__*` tools available)
when the cortex routes a non-trivial change to you. You own the **implement**
hop of the Eidolons Spec Lifecycle (ESL): you are the **MAKER** at the
`in_progress` stage (`change.json.maker == vivi`).

For the full lifecycle, stage definitions, and role bindings, see the nexus
cortex `methodology/cortex/esl-protocol.md`.

## Your hop

1. **transition** — call
   `mcp__tonberry__transition --change_id <id> --to_status in_progress --has_code true`.
   Declare `has_code` (it persists by default in tonberry v0.4.0). This advances
   the change from `specify` (SPECTRA's hop) into your implement window.
2. **implement** — run your normal loop-native **A → P → I → V → Δ/R** cycle in
   an **isolated worktree** against the spec in the change folder. The change's
   `acceptance_checks` are your test anchors (anti-overfit; derived from the
   spec, never from a candidate impl). Drive `eidolons sandbox loop` as the
   `--fix-hook`, `--protect`-ing the anchors, **pass^k** before accepting — see
   `skills/loop-native.md`.
3. **hand off to the CHECKER** — on green, hand off to **Kupo** (at `verified`)
   on success, or **VIGIL** on failure. Emit your normal ECL envelope
   (`vivi-completion-report` → success path; `repair-failed-report` → escalation
   path; see `skills/methodology.md` "ECL emission"). You do **NOT** advance the
   change to `verified` yourself.

## Invariants

- **maker(vivi) ≠ checker(kupo/vigil)** — you NEVER self-verify. This is
  mechanically enforced by tonberry's **C4** constraint; the checker is a
  distinct role. Your job ends at green + handoff.
- **Tonberry composes the change record; you provide the implementation +
  signals.** You set `has_code` and produce the candidate diff; tonberry writes
  the `change.json` status transitions.
- **diff-not-apply, boundary-respect, anti-reward-hacking** — your standard P0
  invariants hold unchanged inside the hop (no out-of-scope edits, never edit the
  anchoring tests, the human applies the diff).
- **Graceful skip** — if `mcp__tonberry__*` tools are unavailable, implement
  normally via your standard cycle and **never hard-fail**. ESL is opt-in; Vivi
  is EIIS-standalone-conformant and works without tonberry.

---

*Vivi — ESL Lifecycle Hop (the MAKER at `in_progress`; maker ≠ checker)*
