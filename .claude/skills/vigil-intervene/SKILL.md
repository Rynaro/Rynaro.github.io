---
name: vigil-intervene
description: Phase I (Intervene) — falsifies hypotheses via counterfactual replay. Designs minimal interventions for each root candidate; runs in sandbox; root cause is the candidate whose intervention flips failure→success. Hard cap 5 interventions. Use after `idg.md` identifies ≥1 ROOT_CANDIDATE, before emitting the root-cause report.
allowed-tools: apply_patch_sandboxed, revert_patch, run_test, inject_oracle, statistical_replay
metadata:
  methodology: VIGIL
  phase: I-intervene
---

# SKILL: Intervene — falsify hypotheses via counterfactual replay

## When to use

Load when `idg.md` schema-valid with ≥1 `ROOT_CANDIDATE`. Unload when one hypothesis survives (→ Learn) or budget exhausted (→ escalate).

---

## Contract

| Field | Value |
|-------|-------|
| LLM calls permitted | For designing minimal interventions and interpreting results |
| Tool budget | ≤30% of mission budget (hot phase) |
| Intervention cap | **5 hard maximum**. No exceptions. |
| Output | `intervention-log.md` — schema-valid per `schemas/intervention-log.v1.json` |
| Authority enforcement | Interventions run only in declared authority scope |

---

## The Counterfactual Principle

A candidate is the root cause if and only if **replacing its output with a correct value causes the failure to disappear**. This is the strongest causal proof available short of formal verification.

Research basis:

- **AgenTracer** (arXiv:2509.03312) — counterfactual replay as the minimum-cost causal proof; standalone LLM attribution accuracy is sub-10% without it
- **Lifecycle of Failures** (arXiv:2509.23735) — attribution accuracy 46.3% → 65.8% with counterfactual replay vs log-only
- **Delta Debugging** (Zeller, classical) — minimal interventions are the ground-truth technique for causality in deterministic systems

---

## Hypothesis Generation

Before any intervention runs, generate ≥3 competing hypotheses. The harness refuses to apply interventions with <3 active hypotheses.

For each `ROOT_CANDIDATE` from `idg.md`, generate at least one hypothesis. If you have <3 root candidates, generate multiple hypotheses per candidate (different mechanisms by which that candidate could cause the observed failure).

```yaml
hypotheses:
  - id: H-001
    candidate: N-003
    mechanism: |
      The UUID generation in RecordVote#build_ballot_token returns nil
      when the user's session lacks a secret key, producing the observed
      ballot.token = nil at assertion time.
    falsification_criterion: |
      If H-001 is true, supplying a valid UUID at N-003's output boundary
      will flip the failure to success.
    confidence_prior: medium
  - id: H-002
    candidate: N-004
    mechanism: |
      Session lookup at N-004 returns an incomplete session object missing
      the secret_key attribute; downstream UUID generation produces nil.
    falsification_criterion: |
      If H-002 is true, injecting a complete session object at N-004's
      output will flip the failure.
    confidence_prior: medium
  - id: H-003
    candidate: N-003
    mechanism: |
      The UUID library is misconfigured — not user session related; a
      recent dep upgrade changed the generation contract.
    falsification_criterion: |
      If H-003 is true, pinning the UUID library to the previous version
      will flip the failure.
    confidence_prior: low
```

**Plurality rule:** The hypotheses must be *mechanistically distinct*. "The UUID is nil" and "The token field is nil" are not distinct — they're different descriptions of the same observation. Distinct hypotheses predict different interventions.

---

## Intervention Design

For each hypothesis, design the **smallest possible change** that would falsify it. Each intervention fits one of four types:

### Type 1 — Code-change intervention

Apply a minimal diff at the candidate's location. The diff should address only the proposed mechanism, not improve surrounding code.

```
intervention_type: code_change
target: app/flows/record_vote.rb:56
diff: |
  -    token = generate_uuid(session)
  +    token = generate_uuid(session) || SecureRandom.uuid   # temporary oracle
scope: 1 file, 1 line
```

### Type 2 — Oracle injection

Replace a node's runtime output with a known-correct value, without changing code. Use this when the hypothesis concerns upstream correctness.

```
intervention_type: oracle_injection
target: N-004 (session lookup return)
oracle_value: <complete session object with secret_key populated>
mechanism: "Test helper monkeypatches SessionStore.find for this run"
```

### Type 3 — Input/state correction

Supply corrected input or initialize corrected state before running the failing invocation.

```
intervention_type: state_correction
target: "before-test state: ballot.token column"
correction: "Pre-populate ballot.token with valid UUID via DB fixture"
```

### Type 4 — Timing/concurrency fix

For `HEISENBUG` category: force ordering, add sync primitives, or freeze timing.

```
intervention_type: timing_fix
target: "ballot save + token generation"
correction: "Wrap in explicit transaction with serializable isolation"
```

**Minimum-intervention rule.** Across all types:

- Interventions affecting >3 files require explicit justification; harness flags for review
- Interventions that improve unrelated code fail the scope check
- Each intervention must be **hypothesis-specific** — you cannot apply one intervention and claim it falsifies two hypotheses, unless the hypotheses were mechanistically identical (in which case they shouldn't have been separate hypotheses)

---

## Running Interventions

### Deterministic mode

1. Apply intervention via sandbox adapter
2. Run reproduction command
3. Record result
4. Revert intervention — sandbox must return to clean state

Each intervention = 1 run. Result categories:

- **FLIPPED** — failure → success (or failure → different success); hypothesis survives
- **NO_CHANGE** — failure reproduces identically; hypothesis falsified
- **NEW_FAILURE** — different failure emerges; hypothesis falsified but reveals compound issue (log for Learn)
- **ERROR** — intervention itself failed to apply; does not count against budget, retry with fix

### Statistical mode

Inherited from Phase V if `DETERMINISM_VERDICT = flaky`. Each intervention runs 5× with the same setup.

```yaml
statistical_run:
  intervention_id: I-001
  runs: 5
  outcomes: [PASS, PASS, PASS, FAIL_MATCH, PASS]
  flip_ratio: 4/5
  verdict: FLIPPED   # ≥4/5 required
```

Verdict: **FLIPPED only if ≥4 of 5 runs pass**. 3/5 is not enough — the noise floor in failing-baseline runs must be distinguishable from the signal in intervention runs.

---

## Authority-Gated Execution

| Authority | Intervention Behavior |
|-----------|----------------------|
| `read-only` | Interventions are **described but not executed**. Output marks each as `simulated`. Downstream (APIVR-Δ or human) must validate. No `[ROOT-CAUSE]` emission possible — highest confidence is `[HYPOTHESIS-N]` with high-priority flag. |
| `sandbox` | Interventions execute in the pluggable sandbox adapter only. Working tree untouched. Counterfactual flips are real; `[ROOT-CAUSE]` emission permitted. |
| `write` | Sandbox-first always. If sandbox run flips, the surviving intervention may be emitted as `verified-patch.diff` for application to working branch. Application itself is still a downstream step — VIGIL emits the patch; it does not auto-apply to the working tree unless explicitly requested. |

---

## ISE Grade on the Root-Cause Report

`root-cause-report.envelope.json`'s optional `ise.assertion_grade` (ECL v2.0
§6.5) is **conditional on the authority row above**, not a fixed value —
VIGIL's primary deliverable has two authority-gated emission shapes, and the
grade must say which one actually happened:

- **`validated`** — authority ∈ `{sandbox, write}` **and** the survivor
  intervention's counterfactual result is `FLIPPED`. This is the case where
  ECL's spec-mandated-gate bar is met: I-4 (counterfactual-gated blame) ran
  for real, in an isolated sandbox, and the flip is recorded evidence — not a
  self-report.
- **`self-attested`** — authority = `read-only`. Interventions were
  *simulated*, not executed (see the table above); `[ROOT-CAUSE]` never
  fires, only `[HYPOTHESIS-N]` with a high-priority flag. No external gate
  ran, so the honest grade is VIGIL's own judgement, not `validated`.

There is no case where a `root-cause-report` ships with `unverified` — Phase
L never emits the report without at least a simulated or real intervention
result — and `human-reviewed` is reserved for an operator sign-off VIGIL
cannot claim on its own behalf.

`escalation-brief.envelope.json` is always `"self-attested"`: budget
exhaustion with no `FLIPPED` result (this section, above) is VIGIL's own
bounded-failure judgement, not an externally-gated pass — see § ECL
Escalation-Brief Envelope below.

Both envelope kinds set `ise.receiver_authorization:
{auto_route: true, auto_merge: false, auto_deploy: false}` — VIGIL findings
route automatically but never authorize a receiver to merge or deploy on
VIGIL's say-so alone.

---

## Budget Exhaustion — Escalation Protocol

If 5 interventions run without a FLIPPED result:

1. **Stop immediately.** Do not design a 6th intervention. Do not "one more try."
2. **Emit escalation brief** — `templates/escalation-brief.md` — including:
   - All 5 interventions with results
   - The current hypothesis log
   - The full IDG
   - What evidence would resolve the ambiguity
3. **Route to FORGE** (reasoner) by default — ambiguity in root cause is FORGE's domain. Alternative routing: human if the failure class is safety-critical.

**Rationale.** Unbounded self-correction degrades output quality (CorrectBench 2025). Five interventions, each minimal and each testing a distinct hypothesis, is enough to resolve most attributable failures. Missions that exceed this budget are genuinely ambiguous and need either broader reasoning (FORGE) or more evidence (re-scope and re-run VIGIL).

---

## Writing `intervention-log.md`

```yaml
mission_id: VIGIL-YYYYMMDD-NNN
upstream_idg: <ref>
hypotheses: [<as above>]
interventions:
  - id: I-001
    hypothesis_id: H-001
    intervention_type: oracle_injection
    target: "N-003 output"
    description: "Inject valid UUID directly"
    authority_used: sandbox
    runs:
      - mode: deterministic | statistical
        outcome: FLIPPED | NO_CHANGE | NEW_FAILURE | ERROR
        evidence: "<log excerpt ref>"
    verdict: FLIPPED
  - id: I-002
    ...
survivor:
  hypothesis_id: H-001
  intervention_id: I-001
  confidence: H                # H requires deterministic flip or ≥4/5 statistical; M one tier down
  verified_patch: <null | diff block>   # populated if authority ≥ sandbox
multi_flip_handling: null      # populated if >1 intervention flipped; records tie-break
compound_findings: []          # NEW_FAILURE results that revealed additional issues
budget:
  interventions_used: 2
  interventions_cap: 5
  exhausted: false
```

---

## Pitfalls

- **Confirmation-optimal interventions.** Designing an intervention that must succeed regardless of hypothesis truth. Guard: each intervention should have a plausible NO_CHANGE outcome; if not, re-design.
- **"Just one more hypothesis" after 5 interventions.** No. Escalate.
- **Applying an intervention that accidentally fixes a different issue.** If FLIPPED but the intervention scope exceeds the hypothesis, the flip is suspect — mark `[DISPUTED]` and run a narrower intervention.
- **Skipping revert between interventions.** Sandbox contamination destroys causality. Always revert to clean state.
- **Accepting 3/5 flip in statistical mode.** Not enough signal. Raise to 4/5 or decline the attribution.

---

## ECL Escalation-Brief Envelope

On budget exhaustion (5 interventions, no FLIPPED result), the escalation-brief payload is wrapped per `templates/escalation-brief.envelope.json` with `performative: "ESCALATE"` and `to.eidolon: "forge"`. The `assumptions[]` array MUST include `"trigger: budget-exhausted-no-flip"` (ECL §2.2.3). The `edge_origin` is `"roster"` — the `vigil → forge` lateral edge is declared in `roster/index.yaml`. `ise.assertion_grade` is always `"self-attested"` — see § ISE Grade on the Root-Cause Report above for the rule and rationale shared by both emitted envelope kinds.

See `skills/learn.md` § Envelope Emission for the full envelope construction procedure (SHA-256 computation, trace-event append, `thread_id` resolution).

---

*VIGIL Phase I (Intervene) — 5 counterfactuals, minimal each, falsification-optimal*
