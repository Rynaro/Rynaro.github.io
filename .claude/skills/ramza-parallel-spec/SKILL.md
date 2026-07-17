---
name: ramza-parallel-spec
description: "TRANCE-only G3 evaluator-optimizer mode: fan out 2-4 perspective-diverse clean-context candidate specs, score with a bias-hardened evaluator anchored on ramza-score, judge-merge into ONE spec, terminate at confidence ≥85% or hard cap 3 iterations. Read-only; never the default — runs ONLY when the cortex authorizes TRANCE."
metadata:
  methodology: RAMZA
  phase: TRANCE
---

# RAMZA — Parallel Spec Mode (G3 evaluator-optimizer)

This mode **wraps** the standard RS→S→P→E→C→T→R→A cycle — it does NOT replace it.
It operationalizes the G3 TRANCE form named in the nexus trance-matrix ("Generator +
evaluator + termination gate; cap 3 iterations").

## Activation — TRANCE-GATED (never default)

**This mode is TRANCE-gated. Do NOT fan out candidate specs at standard tier; run
the single-pass RS→S→P→E→C→T→R→A cycle instead.**

Activate ONLY when the cortex authorizes TRANCE — i.e. BOTH complexity AND stakes
flags hold: complexity 10–12 (per `ramza-score --rubric complexity`) STRATEGIC/CHANGE
specs, multi-service architecture, or high-rework-risk system design. At standard
tier, fall back to the normal cycle.

## Read-vs-write safety

RAMZA is READ-ONLY in every phase (`DESIGN-RATIONALE.md` D2), so the parallel
generator branches are the explicitly-SAFE parallel-READ case — **NO worktree
isolation is required** (R1-01). This is distinct from Vivi/APIVR-Δ's
parallel-WRITE, which does need worktree isolation.

## The cycle: GENERATE → EVALUATE → JUDGE-MERGE → TERMINATE

### 1. GENERATE (perspective-diverse fan-out)

Fan out **2-4 clean-context generator branches** (default 3, hard cap 4). Each
branch receives the SAME Scope + Pattern context but a DIFFERENT assigned
perspective, producing a full candidate draft spec:

- one **conservative** (low-risk, proven)
- one **pattern-leveraging** (maximize reuse of existing conventions)
- one **innovative** (novel approach)
- optionally one **risk-minimizing** (blast-radius-first)

Perspective diversity is **deliberate**, not naive N-identical sampling — quality
dominates raw diversity, so cap at 3-4 high-quality branches, never spawn N clones
(R3-04, R3-06; cost-ceiling C1 max 5 → capped at 4 here because spec generation is
expensive). Use **clean-context subagents** so branches cannot self-condition on each
other's trajectory (R1-03).

### 2. EVALUATE (bias-hardened scoring)

A single evaluator scores each candidate through the tool — never hand-computed:

```
echo '{"alignment":9,"correctness":8,"maintainability":7,"performance":7,"simplicity":6,"risk":7,"innovation":5}' \
  | ramza-score --rubric explore --state <state> --label "<candidate-perspective>"
```

The 7-dimension weighted rubric (Alignment 25% + Correctness 20% +
Maintainability 15% + Performance 15% + Simplicity 10% + Risk 10% + Innovation
5%, see `docs/methodology/scoring.md`) is arithmetic done by `ramza-score`, not
the evaluator — the evaluator's job is producing honest per-dimension inputs
while applying EXPLICIT LLM-as-judge bias mitigations (R3-09):

- **Strip authoring-branch identity/label** from each candidate before scoring
  (counters self-preference / identity bias).
- **Randomize / rotate candidate presentation order** across the comparison
  (counters position bias).
- **Length-normalize** — judge on rubric-dimension content, not verbosity
  (counters verbosity bias).
- **Anchor on deterministic checks** — prefer `ramza-lint` / `ramza-ears-lint`
  and the dependency/constraint layers already in the Test (T) phase as the
  trust anchor over pure LLM judgment.

Record the per-candidate `ramza-score` results (each call appends to the state
file's `gates[]` and the calibration log) and the bias mitigations applied, so
the evaluation is auditable in the final spec.

### 3. JUDGE-MERGE (mandatory aggregation)

Synthesize ONE spec by taking the **highest-scoring approach per dimension**:

- Record which candidate won each dimension and why, via `[DECISION]` markers
  (per-dimension provenance table).
- Carry every rejected candidate's rationale into the **Rejected Alternatives**
  section (a full-tier-required section, see `docs/methodology/tiers.md`) —
  never silently discard a losing branch.

The result is one synthesized dual-format spec (Markdown + YAML/JSON) that
still passes through the normal Assemble exit gates — `ramza-freeze`, then
`ramza-verify-emit` before any envelope is emitted. Downstream sees exactly one
spec + one validated ECL envelope, identical to the standard cycle. The
parallel mode is invisible at the hand-off boundary.

### 4. TERMINATE (bounded)

Stop when the merged-spec confidence **≥85%** (`ramza-score --rubric
confidence` at the Assemble gate) OR the iteration count reaches the **hard cap
of 3** — whichever comes first. The cap is inviolable (inherited unchanged from
SPECTRA, `DESIGN-RATIONALE.md` D2; the nexus trance-matrix R4 refusal gate). On
non-convergence, emit a `[GAP]`/`[BLOCKED]` gap report and escalate to the
human — **do not loop past the cap**.

## Hard constraints (P0)

1. TRANCE-only — never the default; standard tier runs the single-pass cycle.
2. READ-ONLY; no worktree isolation needed (read-only ⇒ safe parallel).
3. Cap branches at 4 (default 3); cap iterations at 3.
4. Evaluator MUST apply identity-strip + order-rotate + length-normalize +
   deterministic-anchor and record them auditably; scoring arithmetic always
   runs through `ramza-score`, never hand-computed.
5. JUDGE-MERGE produces ONE spec with per-dimension `[DECISION]` provenance,
   and still passes through `ramza-freeze` + `ramza-verify-emit` before
   emission.
6. Non-convergence → `[GAP]` escalation, never an unbounded loop.

See `docs/methodology/SPEC.md` "## Parallel spec mode (TRANCE-gated)" for the
full methodology section and `DESIGN-RATIONALE.md` for the succession's
research basis.

---

*RAMZA — Parallel Spec Mode (TRANCE / G3)*
