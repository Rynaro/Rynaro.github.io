---
name: vigil-verify
description: Phase V (Verify) — establishes a reproducible failure. Deterministic-first; on two failed deterministic attempts, switches to statistical replay with confidence bands. No attribution begins without this phase passing. Use when starting any VIGIL mission, on mission intake, before any isolation or intervention work.
allowed-tools: run_test, run_command, read_env, capture_trace, set_seed
metadata:
  methodology: VIGIL
  phase: V
---

# SKILL: Verify — establish reproducible failure

## When to use

Load at the start of every VIGIL mission. Unload when `reproduction.md` is schema-valid and `DETERMINISM_VERDICT ≠ intermittent`.

> **Memory pre-flight:** `recall` MUST have fired in Phase V (see `agent.md`
> §"Memory pre-flight") before any reproduction work begins. If it hasn't —
> e.g. this skill was loaded directly — call it now:
>
> ```
> mcp__crystalium__recall(
>   scope  = { project: <cwd-project>, agent_class_visibility: "vigil" },
>   query  = <failure signature — error class, key frames, command>,
>   k      = 5,
>   layers = ["semantic", "episodic", "procedural"]
> )
> ```
>
> Prioritize **procedural** hits (prior isolation techniques for this error
> class) and **semantic** hits (known root-cause categories matching the
> signature). Fold relevant results into hypothesis generation before
> Step 1. If `mcp__crystalium__*` tools are unavailable, proceed without
> memory — never hard-fail.

---

## Contract

| Field | Value |
|-------|-------|
| LLM calls permitted | Yes, for classifying failure signature and reading trace output |
| Tool budget | ≤15% of mission budget |
| Output | `reproduction.md` — schema-valid per `schemas/reproduction.v1.json` |
| Failure mode | `DETERMINISM_VERDICT = intermittent` → halt, emit `[GAP]`, escalate |

---

## Inbound Envelope Verification (Escalation Entry)

When VIGIL is invoked on the **escalation entry** mode (APIVR-Δ → VIGIL), run this verification BEFORE the deterministic-first protocol below. This implements ECL §6.2.2 and VIGIL I-11.

### Trigger

If the upstream artifact path `P` has a sibling `${P%.*}.envelope.json`, verification is mandatory. If no sidecar exists (non-ECL APIVR-Δ caller), skip this section and proceed to Step 1 below.

### Step V-E1 — Schema shape

Validate the envelope JSON against `schemas/ecl/envelope.v2.json` (or `envelope.v1.json` for a v1.x sidecar received during the ECL §7.3 compatibility window — select the vendored file matching the received `envelope_version`).

Check that the envelope parses as valid JSON and all required fields are present: `envelope_version`, `message_id`, `thread_id`, `parent_id`, `from`, `to`, `performative`, `objective`, `artifact`, `integrity`, `trace`. On failure: failure code `SCHEMA_INVALID`.

### Step V-E2 — Contract match

Cross-check fields against `schemas/ecl/contracts/apivr-to-vigil.yaml`:

- `from.eidolon` MUST equal `"apivr"` and `to.eidolon` MUST equal `"vigil"`. On failure: `UNDECLARED_EDGE`.
- `performative` MUST be one of `ESCALATE`, `REQUEST`, `ACKNOWLEDGE`. On failure: `PERFORMATIVE_NOT_ALLOWED`.
- `artifact.kind` MUST equal `"repair-failed-report"`. On failure: `ARTIFACT_KIND_NOT_ALLOWED`.

### Step V-E3 — Integrity check

Recompute the SHA-256 digest of the payload file bytes and compare against `envelope.integrity.value`:

```sh
computed=$(shasum -a 256 "$payload_path" | awk '{print $1}')
declared=$(grep -o '"value":"[^"]*"' "$envelope_path" | head -1 | cut -d'"' -f4)
# [ "$computed" = "$declared" ] || failure code: INTEGRITY_MISMATCH
```

### Step V-E4 — Trace event

Append one JSONL line to `.eidolons/.trace/<thread_id>.jsonl` (relative to consumer project root; create directory if absent):

**On success:**
```jsonl
{"ts":"<RFC3339>","event":"verify_pass","message_id":"<uuid>","thread_id":"<uuid>","from":"apivr@<version>","to":"vigil@<version>","performative":"<performative>","integrity_method":"sha256"}
```

**On failure:**
```jsonl
{"ts":"<RFC3339>","event":"verify_fail","message_id":"<uuid>","thread_id":"<uuid>","from":"apivr@<version>","to":"vigil@<version>","performative":"<performative>","integrity_method":"sha256","verify_failure_code":"<CODE>"}
```

If the envelope is invalid JSON, use `thread_id: "unknown"` and `message_id: "unknown"` as fallback values.

### Step V-E5 — On verify_fail: halt

On any verification failure:

1. Emit a `[GAP]` finding: `[GAP] Inbound envelope verification failed: <FAILURE_CODE>. The upstream repair-failed-report.envelope.json did not pass ECL §6.2.2 verification. Mission halted.`
2. Halt the mission — do NOT proceed to the deterministic-first protocol.
3. Route to human (or back to APIVR-Δ if the failure is `INTEGRITY_MISMATCH` — the report may have been tampered or corrupted in transit).

---

## The Deterministic-First Protocol

### Step 1 — Normalize the failure signature

Extract from upstream artifact (or bug report):

- **Test/command** — exact invocation that exhibits the failure
- **Error class** — categorical (`TEST_ASSERTION`, `RUNTIME_ERROR`, `BUILD_ERROR`, `TYPE_ERROR`, `LINT_VIOLATION`)
- **Key stack frames** — top 3–5 frames, normalized (strip absolute paths, line numbers preserved)
- **Observable symptom** — the specific assertion/error message

If upstream provided an APIVR-Δ `repair-failed-report.md`, copy these fields directly. Do not re-derive.

### Step 2 — First deterministic attempt

Set controlled conditions:

```
seed: <recorded_or_default>
env: <pinned per lockfile / container spec>
fs: <isolated working copy from commit SHA>
time: <frozen if test is time-sensitive>
```

Run the failing invocation. Record:
- Exit code
- stdout/stderr tail (last 200 lines)
- Comparison of observed signature to upstream signature

**Result categories:**
- `FAIL_MATCH` — fails with the same signature as upstream → proceed to Step 3
- `FAIL_DIFFERENT` — fails but with different signature → record as `[DISPUTED]`, use observed signature, proceed to Step 3
- `PASS` — did not fail → proceed to Step 3 with suspicion of flakiness

### Step 3 — Second deterministic attempt

Re-run with identical conditions. Compare to Step 2.

**Verdict matrix:**

| Step 2 | Step 3 | Verdict | Action |
|--------|--------|---------|--------|
| FAIL_MATCH | FAIL_MATCH | `stable` | Proceed to Isolate |
| FAIL_MATCH | FAIL_DIFFERENT | `flaky` | Switch to statistical |
| FAIL_MATCH | PASS | `flaky` | Switch to statistical |
| FAIL_DIFFERENT | FAIL_MATCH | `flaky` | Switch to statistical |
| FAIL_DIFFERENT | FAIL_DIFFERENT (same sig) | `stable` | Note signature drift, proceed |
| PASS | FAIL_* | `flaky` | Switch to statistical |
| PASS | PASS | `not_reproduced` | Halt — emit `[GAP]`, escalate |

---

## Statistical Mode

Triggered by `flaky` verdict. Protocol:

1. Run the failing invocation **5 times** under identical deterministic conditions.
2. Record pass/fail and observed signature for each.
3. Compute failure rate and 95% confidence interval (Wilson score interval for small N).
4. Classify:
   - **Consistent flake** — ≥3/5 fail with same signature → `DETERMINISM_VERDICT = flaky`, `[FLAKE]` marker set, proceed to Isolate. Subsequent counterfactual interventions must also use 5-run statistical evaluation.
   - **Inconsistent flake** — <3/5 fail, or signatures vary widely → `DETERMINISM_VERDICT = intermittent`, halt, escalate to FORGE or human. VIGIL cannot reliably attribute under this condition.

### Confidence band recording

For every statistical-mode decision:

```yaml
statistical_evidence:
  runs: 5
  failures: 4
  failure_rate: 0.80
  ci_95: [0.37, 0.99]
  signature_consistency: 1.0   # fraction of failures with matching signature
  verdict: flaky
```

Downstream phases inherit `statistical` mode — every intervention in Phase I will be evaluated across 5 runs, with flip requiring ≥4/5 successes.

---

## Writing `reproduction.md`

Schema-required fields:

```yaml
mission_id: VIGIL-YYYYMMDD-NNN
upstream_artifact: <pointer | null>
authority: read-only | sandbox | write
failure_signature:
  command: "<exact invocation>"
  error_class: LOGIC_ERROR | REGRESSION | BUILD_ERROR | TYPE_ERROR | LINT_VIOLATION | RUNTIME_ERROR | INTEGRATION_ERROR | ENVIRONMENT_ERROR | HEISENBUG | COMPOUND | SPEC_DEFECT
  assertion: "<observable symptom>"
  stack_top: [<frame>, <frame>, <frame>]
reproduction_mode: deterministic | statistical
reproduction_evidence:
  - attempt: 1
    result: FAIL_MATCH
    signature_match: true
    stderr_tail: <200-line excerpt ref>
  - attempt: 2
    result: FAIL_MATCH
    signature_match: true
    stderr_tail: <excerpt ref>
determinism_verdict: stable | flaky | intermittent | not_reproduced
statistical_evidence: <null | object>   # only populated in statistical mode
markers:
  - FLAKE   # only if flaky
  - GAP     # only if evidence missing
```

---

## Common pitfalls

- **Assuming the upstream signature is correct.** Re-verify. APIVR-Δ's Reflect phase may have already attempted fixes that altered the failure shape.
- **Running against the wrong commit.** Always pin to the SHA that the upstream artifact referenced.
- **Ignoring env drift.** A failure that reproduces locally but not in CI (or vice versa) is itself a finding — document the env delta.
- **Jumping to statistical mode too early.** Two deterministic attempts minimum. One inconsistent result is not enough to declare flakiness.
- **Accepting `PASS → PASS` as "fixed already."** If the upstream failure is real and your runs all pass, something about your reproduction setup is wrong. Escalate with `[GAP]`.

---

*VIGIL Phase V — the gate through which all other phases must pass*
