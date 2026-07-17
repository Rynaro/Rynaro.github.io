---
name: gilgamesh-gauge
description: Phase G (Gauge) mission-intake gate — verifies the mission-contract, decides KEEP vs REFUSE at generalist scale (specialist-fit, over-authority, underspecified), and instantiates the six-row capability-authority table. Use once per mission at the start of every GILGAMESH cycle, after the inbound envelope is verified. Do NOT use during Inventory/Lock/Grind/Attest.
metadata:
  methodology: Gilgamesh
  phase: G
---

# Gauge Skill — Gilgamesh (Phase G intake)

## When to use

Load during Phase G (Gauge). Runs once per mission, immediately after
`skills/verify-incoming.md` passes. Triage cost ≈ 1 step. Do not load during
Inventory, Lock, Grind, or Attest.

Gauge is the additive-proof gate: Gilgamesh only spends cycles on missions it can
plausibly win **and** that fit no specialist. Every misfit bounces cheaply, keeping the
fallthrough seat structurally non-negative to the orchestrator's session — and keeping
it from becoming a dumping ground (the identity-drift risk, R-032).

---

## Decision Tree (run in order — first failure exits)

### Step 1 — Validate the mission-contract

Validate the inbound payload against `schemas/mission-contract.v1.json`. It MUST carry
`{objective, scope(paths,mode), deliverables, evidence_required, stop_conditions,
authority(read/write/exec/network/secrets/deploy)}`.

- **Valid** → continue to Step 2.
- **Malformed / missing fields** → `REFUSE{SCHEMA_INVALID}`.

### Step 2 — Specialist-fit check (keep-or-kick at generalist scale)

Does the mission map **cleanly** to a roster specialist? Gilgamesh never outranks a
specialist and never enters Step-1 of dispatch (R-019) — it lives only in the
fallthrough branch.

| If the mission is… | REFUSE and suggest |
|---|---|
| a read-only discovery / scout | `atlas` |
| a plan / spec authoring campaign | `ramza` |
| a loop-native coding campaign (implement feature end-to-end) | `vivi` |
| a localized ≤2-file verifier-backed micro-edit | `kupo` |
| a root-cause / defect hunt | `vigil` |
| a decision record / trade-off adjudication | `forge` |
| a document / long-form artefact | `idg` |

- **Clean specialist fit** → `REFUSE{SPECIALIST_FIT, suggested_specialist: <name>}`.
- **Underspecified / ambiguous target** → `REFUSE{UNDERSPECIFIED}` (the orchestrator
  emits a `clarification_request`).
- **Actionable and fits no specialist** → continue to Step 3.

### Step 3 — Instantiate the capability-authority table

Instantiate `schemas/capability-authority.v1.json` from the contract's `authority`
grant. Six rows × two columns (default / escalation):

| Row | Default | Escalation ceiling |
|---|---|---|
| read | scoped repo + tool output | broaden `scope.paths` (approved) |
| write | sandbox only | none — PROPOSE-only is constitutional |
| exec | named oracle commands in sandbox | more oracle commands (approved, sandboxed) |
| network | none | proxied read via broker (approved) |
| secrets | none | broker-issued, single-use, mission-scoped |
| deploy | none | **never-grantable** |

- If the mission requires authority **above the ceiling** — most importantly **deploy**,
  or a secret the table cannot broker — `REFUSE{OVER_AUTHORITY}`.
- Otherwise freeze the instantiated table into `TaskState.authority` and **KEEP**.

---

## Output format

Emit exactly one of:

```
KEEP{authority: <instantiated capability-authority table>}
```
```
REFUSE{code: "<SCHEMA_INVALID|SPECIALIST_FIT|UNDERSPECIFIED|OVER_AUTHORITY|NOT_ROUTER|NO_ORACLE>", suggested_specialist: "<name|null>", note: "<one sentence for the orchestrator>"}
```

On KEEP, control passes to Phase I (Inventory). No other state from Gauge enters
Inventory except the frozen authority table; Gauge is a one-shot gate.

---

## Notes

- **Triage cost ≈ 1 step.** Gauge must be cheap; do not invoke atlas-aci here — gather
  happens in Inventory.
- **Structural, not verbal.** KEEP iff the contract validates, fits no specialist, and
  stays within the grantable ceiling. "It looks doable" is not a KEEP predicate.
- **Specialist-preferring by construction.** When in doubt between KEEP and
  `SPECIALIST_FIT`, prefer the specialist — the orchestrator can always re-route back.
- **Deploy is a wall, not a slope.** No mission, no escalation, no operator override
  reachable from within Gilgamesh grants deploy. Route it upward if it is truly needed.
- **REFUSE is cheap and correct.** A fast REFUSE with a suggested specialist is more
  valuable than a slow, out-of-scope grind.

---

*Gauge Skill — Gilgamesh Phase G intake, refusal, and authority instantiation*
