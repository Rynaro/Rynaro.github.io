---
name: kupo-esl-hop
description: ESL lifecycle hop — when the cortex routes a verification to Kupo in an ESL-enabled project (tonberry MCP available), Kupo is the CHECKER (maker≠checker, mechanically enforced) and owns the verified transition. Use when a change with acceptance_checks is routed for verification and a mcp__tonberry__* tool surface exists. Absent tonberry → run your normal verify (ESL opt-in); never hard-fail.
metadata:
  methodology: Kupo
  phase: cross-cutting
---

# ESL Lifecycle Hop — Kupo (the CHECKER)

## When to use

Load this skill in an **ESL-enabled project** (`mcp__tonberry__*` tools available)
when the cortex routes a **verification** to you. You are the **CHECKER**, distinct
from the maker — `maker ≠ checker` is **mechanically enforced** (tonberry `verify`
check C4). You own the **verified** transition of the Eidolons Spec Lifecycle (ESL).

For the full lifecycle, stage definitions, and role bindings, see the nexus cortex
`methodology/cortex/esl-protocol.md`.

## Your hop

You did **not** make this change — you check it. Run your normal external-verify
discipline against the change's declared `acceptance_checks`, then drive the
conformance gate and the transition:

1. **verify externally** — load `skills/keep-or-kick.md` (triage the change is in
   scope to check) and `skills/patch-verify.md` (run the NAMED external verifiers
   against the change's `acceptance_checks` in a scratch copy). One green external
   signal per check, never self-critique.
2. **conformance gate** — call
   `mcp__tonberry__verify <change-dir> --mode <enforcement from the lock>`.
   It runs the 6 mechanical checks **C1–C6** (incl. **C4** maker≠checker, which
   cross-checks `verify.envelope.json`'s `from.eidolon != change.json.maker`).
3. **compose the verify envelope** — `from.eidolon = kupo`. This **MUST differ**
   from `change.json.maker` (else C4 fails by construction). Reuse your normal ECL
   `PROPOSE` composition (see `skills/patch-verify.md` "ECL emission").
4. **on pass** → call
   `mcp__tonberry__transition --change_id <id> --to_status verified`, then PROPOSE
   `verify_pass`.
5. **on fail** → **ESCALATE** with the last failure output. Do **not** edit the
   change to make it pass — the checker cannot make (you are not the maker).

## Invariants

- **You MUST NOT have been the maker.** `change.json.maker` must differ from `kupo`;
  if Kupo authored this change, REFUSE the checker role and ESCALATE — maker≠checker
  is mechanically enforced (C4), not a courtesy.
- **Checker cannot make.** On a failing check you ESCALATE; you never patch the
  change to flip it green. Editing-to-pass is exactly the maker≠checker violation
  the gate exists to stop.
- **External-only verify.** Correctness is a NAMED external verifier against the
  declared `acceptance_checks` — never self-critique, never LLM-judge (your P0).
- **Tonberry composes state; you provide the verdict.** You supply the green
  external signals and the verify envelope (`from.eidolon = kupo`); tonberry runs
  C1–C6 and writes the `verified` status.
- **Graceful skip** — if `mcp__tonberry__*` tools are unavailable, run your normal
  verify and **never hard-fail**. ESL is opt-in; Kupo is EIIS-standalone-conformant
  and works without tonberry.

## Looking ahead — ECL 2.1 verification attestation (Draft, not emitted)

ECL 2.1 (`spec/ecl-2.1.md`, Status: Draft — adoption-gated, not yet the
governing Published spec) introduces an OPTIONAL `ise.verification`
sub-block (§6.5.8) that names the verify-attestation seam: who re-checked an
artefact, from a fresh context, with what transcript access. ESL 1.1's **C8**
check (advisory, SHOULD-level) already reads this shape today, ahead of ECL
ratifying it (ESL 1.1 §5.4's documented forward-reference caveat) — a
`verify.envelope.json` whose `ise.verification` is `{fresh_context: true,
checker: "kupo", transcript_access: "artifact-only"}` and whose `checker`
differs from `change.json.maker` satisfies C8 for the checker hop this skill
owns.

**Once ECL 2.1 is cut to Published** (the gate: ≥3 shipped Eidolons emitting
the `ise` block — recorded in `spec/ecl-2.0.md` §6.5.5), the verify envelope
Kupo composes in step 3 above will carry that same `ise.verification`
sub-block: `fresh_context: true` (Kupo checks from a session that did not see
the maker's generating transcript — exactly what maker≠checker already
guarantees structurally), `checker: "kupo"`, `transcript_access:
"artifact-only"` (Kupo reads only the emitted change artefact, never the
maker's transcript). **This is documentation of a pending shape, not current
emission** — `ECL_VERSION` stays `2.0` until 2.1 is cut (§7.3 of the draft),
and this skill does not emit `ise.verification` today. When 2.1 publishes,
wire the field into step 3's envelope composition and re-point this note at
the shipped spec section.

---

*ESL Lifecycle Hop — Kupo (the CHECKER, maker≠checker mechanically enforced)*
