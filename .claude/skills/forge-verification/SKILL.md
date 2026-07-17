---
name: forge-verification
description: Governs logic verification, evidence coverage, confidence calibration, and the REFORGE protocol during the FORGE Gate phase. Use when the Reasoner enters Phase G to check logical soundness (fallacy scan), verify evidence coverage, assess decision completeness, calibrate the 4-factor confidence score, and decide pass/emit or trigger a single REFORGE revision pass.
metadata:
  methodology: FORGE
  phase: G
---

# Verification Methodology

Loaded during the Gate phase. Governs how the Reasoner validates its own reasoning before emitting a verdict.

## When to use

Load this skill at the start of Phase G (Gate). Use it to walk the inference chain backward from the verdict for structural defects, build a claim-level evidence coverage matrix, check the decision completeness checklist, derive the 4-factor confidence score (Evidence Quality, Logical Coherence, Constraint Coverage, Sensitivity Analysis), and execute exactly one REFORGE revision pass if the gate fails. Also use it for the Emit phase to build the ECL envelope and persist the verdict via CRYSTALIUM ingest + session_end. Do not use for hypothesis generation (Phase R) or problem decomposition (Phase F).

---

## Gate Dimensions

### 1. Logical Soundness

Check the reasoning chain for structural defects:

| Fallacy | Detection Pattern | Remedy |
|---------|-------------------|--------|
| **Circular reasoning** | Conclusion appears (rephrased) in premises | Trace the inference chain: does each step add new information? |
| **False dichotomy** | Only 2 options presented when more exist | Verify hypothesis count ≥ 3; check for suppressed alternatives |
| **Hasty generalization** | Conclusion from a single example or narrow evidence | Count distinct evidence sources supporting the conclusion |
| **Appeal to authority** | "X is best because [vendor/expert] says so" | Evidence must be functional (why it's best), not reputational |
| **Composition fallacy** | "Parts are X, therefore whole is X" | Check whether the property transfers to the aggregate |
| **Affirming the consequent** | "If A then B; B is true; therefore A" | Verify the causal direction; check for alternative causes |
| **Survivorship bias** | Only successful cases cited | Ask: "What about the cases where this approach failed?" |
| **Ambiguity shift** | Key term used with different meanings in premises vs conclusion | Verify term definitions are stable throughout |

### Process

Walk the inference chain backward from the verdict:

```
[VERDICT] ← supported by [Conclusion] ← derived from [Reasoning Step N]
    ← derived from [Reasoning Step N-1] ← ... ← grounded in [Evidence E-ID]
```

At each step, verify:
1. Does the step follow from the previous step? (validity)
2. Is the previous step actually true? (soundness)
3. Are there hidden premises? Mark as `[ASSUMPTION]`.

**Pass condition**: No fallacies found. All steps valid and sound (or assumptions explicitly marked).

### 2. Evidence Coverage

Build a coverage matrix:

```markdown
| Claim in Verdict | Supporting Evidence | Reliability | Gaps |
|-----------------|-------------------|-------------|------|
| "Redis outperforms Memcached for our use case" | E-2: benchmark data | H | None |
| "Migration can be completed in 2 sprints" | E-5: team velocity | M | [GAP] No similar migration precedent |
| "Operational cost increase is ~$200/mo" | [ASSUMPTION] — based on current pricing | L | [GAP] No formal quote obtained |
```

**Pass condition**: Every factual claim has ≥1 evidence anchor. All L-reliability evidence claims carry `[ASSUMPTION]`. All gaps carry `[GAP]`.

### 3. Decision Completeness

Verify the verdict answers the framed question:

| Checklist Item | Pass/Fail |
|---------------|-----------|
| Verdict directly answers the question stated in Frame | |
| All hard constraints addressed with explicit pass/fail | |
| At least 3 alternatives evaluated | |
| Rejected alternatives have stated reasons | |
| Confidence score present with factor breakdown | |
| ≥1 `[REVERSAL-CONDITION]` stated | |
| Handoff recommendations present | |
| Requester can act on this without follow-up clarification | |

**Pass condition**: All items pass.

---

## Confidence Calibration Protocol

Confidence is not a feeling. It's a structured assessment across four factors:

### Factor 1: Evidence Quality (25%)

| Score | Criteria |
|-------|---------|
| 0–25 | Mostly L-reliability evidence; multiple critical `[GAP]`s |
| 26–50 | Mix of M and L; some gaps in key areas |
| 51–75 | Mostly M-reliability; gaps exist but are non-critical |
| 76–100 | Primarily H-reliability; no critical gaps |

### Factor 2: Logical Coherence (25%)

| Score | Criteria |
|-------|---------|
| 0–25 | Fallacies detected; inference chain broken |
| 26–50 | No fallacies, but multiple `[ASSUMPTION]` markers in critical path |
| 51–75 | Sound reasoning; assumptions present but non-critical |
| 76–100 | Air-tight reasoning; minimal assumptions, all well-justified |

### Factor 3: Constraint Coverage (25%)

| Score | Criteria |
|-------|---------|
| 0–25 | Hard constraints not fully evaluated |
| 26–50 | Hard constraints pass, but soft constraint coverage incomplete |
| 51–75 | All constraints evaluated; some soft constraint trade-offs unresolved |
| 76–100 | All constraints evaluated with explicit pass/fail and evidence |

### Factor 4: Sensitivity Analysis (25%)

| Score | Criteria |
|-------|---------|
| 0–25 | Verdict changes with ±1 on multiple scoring dimensions |
| 26–50 | Verdict is sensitive to 1–2 key assumptions |
| 51–75 | Verdict is robust to most perturbations; 1 identified sensitivity |
| 76–100 | Verdict is robust across all reasonable perturbations |

### Composite Confidence

```
Confidence = (EQ × 0.25) + (LC × 0.25) + (CC × 0.25) + (SA × 0.25)
```

Report both the composite and the individual factors. A high composite with one very low factor is a red flag — call it out.

---

## REFORGE Protocol

When the Gate fails, execute exactly one revision pass:

1. **Identify the specific failures** — which dimension(s) failed and why
2. **Target only the failures** — do not re-reason the entire deliberation
3. **Mark what changed** — annotate revisions so the requester can see what was fixed

### What REFORGE may do:
- Add missing evidence anchors
- Add `[ASSUMPTION]` or `[GAP]` markers to under-supported claims
- Refine confidence score based on newly identified weaknesses
- Add a missing alternative or reversal condition

### What REFORGE may NOT do:
- Change the winning hypothesis (if the gate revealed the winner should change, the reasoning was fundamentally flawed — emit with a low confidence and explicit flag)
- Generate new evidence (the Reasoner doesn't retrieve)
- Expand scope beyond the framed question

After REFORGE, emit regardless. Flag remaining issues explicitly. The requester needs a verdict, even an imperfect one, more than they need infinite deliberation.

---

## Envelope Construction Checklist (ECL v2.0, v1.3.0+)

When the deliberation was triggered by an incoming `reasoning-request` envelope,
the Emit phase MUST produce both the body file and a sidecar envelope. Run this
checklist before emitting:

1. **Compute sha256** of the `reasoning-report.md` body bytes (lowercase hex, 64 chars).
2. **Inherit `thread_id`** from the inbound `reasoning-request` envelope — carry it unchanged into the outbound envelope.
3. **Set `parent_id`** to the inbound request's `message_id` (the UUID from the request envelope, not the thread_id).
4. **Populate `context_delta.tokens_used`** — heuristic `chars / 4` is acceptable per ECL §4.2 when exact token counts are unavailable.
5. **Mirror confidence** — set `envelope.confidence` to the composite confidence score from the 4-factor calibration (Evidence quality, Logical coherence, Constraint coverage, Sensitivity analysis), normalised to 0–1.
6. **Select performative**: `PROPOSE` (default), `CRITIQUE` (REFORGE-reframe path where the question itself is being challenged), `INFORM` (no-action finding — all options equivalent within constraints).
7. **Append `emit` trace event** to `.eidolons/.trace/<thread_id>.jsonl` per ECL §5.
8. Validate the sidecar against `schemas/ecl-envelope.v2.json` before writing.
9. **Set the `ise` block** — `assertion_grade: "self-attested"` (ECL v2.0 §6.5; FORGE's Gate is a self-review pass, not an externally spec-mandated check, so `self-attested` is the honest grade — only a distinct checker per `skills/checker-handoff.md` earns `validated`), `provenance.methodology_version` (`forge-<version>`), and `receiver_authorization` (`auto_route: true`, `auto_merge: false`, `auto_deploy: false`).
10. **Check the checker-handoff gate** — load `skills/checker-handoff.md` and compare the recommended action against its irreversibility trigger table. A match sets the body's `requires_checker` flag to `true`; no match leaves it at the default `false`.

The envelope template is at `schemas/reasoning-report.envelope.json`.

---

## Provenance Block

Every emitted verdict includes:

```markdown
## Provenance

- **Decision type**: [type from Frame]
- **Deliberation depth**: [simple/standard/deep] — [N passes executed]
- **Evidence sources**: [count] ([H-count] high, [M-count] medium, [L-count] low reliability)
- **Hypotheses evaluated**: [count]
- **Confidence**: [score]% (Evidence: [X]%, Logic: [X]%, Constraints: [X]%, Sensitivity: [X]%)
- **Gate result**: [PASS / REFORGED — list of fixes]
- **Markers**: [count] ASSUMPTION, [count] GAP, [count] RISK, [count] REVERSAL-CONDITION
```

---

## CRYSTALIUM Memory Persistence (Emit phase)

After the envelope sidecar is validated (checklist above) and before handing off,
persist the reasoning-report to CRYSTALIUM:

### Step 1 — Ingest the ECL envelope

```
mcp__crystalium__ingest(
  envelope = <the validated reasoning-report.envelope.json contents>,
  payload  = <reasoning-report.md contents>
)
```

This records the verdict at T1 with full ECL provenance (`from.eidolon=forge`
drives tier derivation; `integrity.value` is stored as `provenance.content_hash`).
Prior verdicts become retrievable by FORGE's Frame-phase `recall` in future sessions.

### Step 2 — Direct episodic notes (optional)

For notable observations from the deliberation not captured in the verdict body
(e.g. a recurring constraint pattern, a second-order effect worth tracking):

```
mcp__crystalium__commit(
  layer      = "episodic",
  payload    = <observation>,
  provenance = { author_agent: "forge", decision_type: <type>, project: <cwd-project> }
)
```

`author_agent` MUST be `"forge"` on every direct commit.

### Step 3 — Session end

After ingest (and any optional commits) complete, call:

```
mcp__crystalium__session_end()
```

This triggers Dream consolidation asynchronously. Call it once per deliberation
completion — not once per pass.

**Graceful skip:** if `mcp__crystalium__*` tools are unavailable (CRYSTALIUM not
installed), skip all three steps and proceed with the handoff normally. Never
hard-fail on absent CRYSTALIUM tools. FORGE is EIIS-standalone-conformant.

---

*Reasoner — Verification Skill*
