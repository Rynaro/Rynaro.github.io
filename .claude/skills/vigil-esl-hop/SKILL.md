---
name: vigil-esl-hop
description: "ESL lifecycle hop — in an ESL-enabled project (tonberry MCP available), VIGIL owns the FAILURE PATH: on a verify_fail or spec-vs-impl drift, transition the change back to the maker (in_progress) and emit an ESCALATE envelope carrying root-cause attribution. You are the failure-path checker, distinct from the maker (maker ≠ checker). Absent tonberry → run the normal V→I→G→I→L cycle (ESL opt-in)."
metadata:
  methodology: VIGIL
  phase: post-L
---

# VIGIL — ESL Lifecycle Hop (Failure Path)

Use this skill in an **ESL-enabled project** (`mcp__tonberry__*` tools available)
when a verify **FAILS** or the implementation **diverges from the spec** (your
root-cause domain). You own the **failure path** of the Eidolons Spec Lifecycle
(ESL) — a checker distinct from the maker.

For the full lifecycle, stage definitions, and role bindings, see the nexus
cortex `methodology/cortex/esl-protocol.md`.

## Your hop

1. **On `verify_fail`** — call
   `mcp__tonberry__transition --change_id <id> --to_status in_progress` to route
   the change back to the **maker**, then emit an `ESCALATE` envelope carrying
   your root-cause attribution (`[ROOT-CAUSE]` + evidence anchor from the V→I→G→I→L
   cycle). The maker re-implements against your finding, not against the symptom.
2. **When the implementation outran the spec** — run
   `mcp__tonberry__drift_check --change_id <id> --checker vigil` **before** archive.
   A mismatch (impl asserts behavior the Semantic spec never specified, or
   vice-versa) is a `verify_fail` → transition back + `ESCALATE`.
3. **You are the failure-path checker** — a distinct identity from the maker.
   Your verify/drift envelopes carry `from.eidolon = vigil`, never the maker's
   identity.

## Invariants

- **maker ≠ checker** — VIGIL is the checker on the failure path; the change's
  `maker` (e.g. Vivi) is always a distinct identity. Self-verified changes
  violate the ESL C4 gate.
- **Tonberry composes artifacts; you supply signals.** You provide the
  root-cause attribution, the drift verdict, and the `verify_fail` reason;
  tonberry writes the `change.json` transition and records enforcement.
- **Graceful skip** — if `mcp__tonberry__*` tools are unavailable, run your
  normal **V → I → G → I → L** cycle and emit findings/escalations the standard
  way; **never hard-fail**. ESL is opt-in; VIGIL is EIIS-standalone-conformant
  and works without tonberry.

## Pending: ECL 2.1 verification-attestation (not yet implemented)

ECL v2.1 (Draft, adoption-gated — `spec/ecl-2.1.md` §6.5.8) defines an
OPTIONAL `ise.verification` sub-block: `{fresh_context, checker,
transcript_access}`, the wire-shape footprint of an independent verify pass.
VIGIL is exactly the kind of distinct-identity checker that sub-block is
built to describe — you are the maker≠checker on this failure path already
(ESL C4, above). Once ECL 2.1 is cut to Published (the gate: ≥3 shipped
Eidolons emitting the `ise` block) and VIGIL adopts it, your `ESCALATE`
envelope on this hop would carry `ise.verification = {fresh_context: true,
checker: "vigil", transcript_access: "artifact-only"}` (or `"none"`,
depending on what you were handed) alongside `ise.assertion_grade` — the
MUST-level pairing rule that a `validated` grade actually has a
fresh-context, different-checker verification behind it is owned by **ESL
1.1 C8**, not ECL (ECL only shape-checks the sub-block, per §6.5.8.3).

**This is documented as pending, not emitted.** ECL 2.1 is Draft; `ECL_VERSION`
stays `2.0` and VIGIL's emitted envelopes do not carry `ise.verification` yet.
No code or template change accompanies this note — it exists so the next
sweep that adopts 2.1 has the mapping already worked out.

---

*VIGIL — ESL Lifecycle Hop (failure path)*
