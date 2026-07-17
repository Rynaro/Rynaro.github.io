---
name: forge-deliberation
description: Governs hypothesis generation, adversarial stress-testing, and multi-criteria scoring during the FORGE Reason phase. Use when the Reasoner enters Phase R to generate ≥3 distinct hypotheses, run Inversion/Boundary/Pre-Mortem/Dependency stress tests, score on a 5-dimension weighted rubric, and execute multi-pass deliberation. Do not use when Self-Consistency Mode (G2/TRANCE) is active — load forge-self-consistency instead.
metadata:
  methodology: FORGE
  phase: R
---

# Deliberation Methodology

Loaded during the Reason phase. Governs how the Reasoner generates, tests, and scores competing hypotheses.

## When to use

Load this skill at the start of Phase R (Reason) for standard single-trace deliberation. Use it to generate ≥3 genuinely distinct hypotheses, stress-test each with the four adversarial checks (Inversion, Boundary, Pre-Mortem, Dependency), score on the 5-dimension rubric (Evidence Alignment 30%, Constraint Satisfaction 25%, Risk Profile 20%, Reversibility 15%, Second-Order Clarity 10%), and execute 1–3 passes as set by the depth score from Phase F. Do not use when Self-Consistency Mode (G2/TRANCE) fires — load `forge-self-consistency` instead.

---

## Hypothesis Generation

### The 3-Hypothesis Minimum

Generate ≥3 genuinely distinct hypotheses. "Distinct" means they lead to different actions, not just different phrasings of the same recommendation.

**Quality test**: If removing one hypothesis doesn't change the deliberation outcome, it was a strawman. Replace it.

### Generation Strategies by Decision Type

| Decision Type | How to Generate Hypotheses |
|---------------|---------------------------|
| `TRADE-OFF` | One hypothesis per viable option. Include "do nothing" or "defer" if applicable. |
| `FEASIBILITY` | H1: Feasible as specified. H2: Feasible with modifications (name them). H3: Not feasible (name the blocking constraint). |
| `ROOT-CAUSE` | One hypothesis per plausible causal chain. Each must name the initiating event, the propagation path, and why other safeguards didn't catch it. |
| `CONFLICT-RESOLUTION` | One hypothesis per stakeholder position, plus a synthesis position that partially satisfies all. |
| `CONSTRAINT-SATISFACTION` | H1: Satisfy all constraints (name the solution shape). H2: Relax soft constraint S1 (name what improves). H3: Relax soft constraint S2 (name what improves). |
| `RISK-ASSESSMENT` | One hypothesis per risk cluster. Group related failure modes rather than listing them atomically. |

### Hypothesis Structure

Each hypothesis follows this format:

```markdown
### Hypothesis H-N: [Name]

**Position**: [One sentence: what this hypothesis asserts]

**Requires to be true**:
- [Condition 1]
- [Condition 2]

**Evidence supporting**:
- [E-ID]: [How it supports] (reliability: H/M/L)

**Evidence opposing**:
- [E-ID]: [How it opposes] (reliability: H/M/L)

**Second-order effects**:
- [Effect 1: consequence the requester may not have considered]
- [Effect 2]

**Falsification test**: This hypothesis is wrong if [specific observable condition].
```

---

## Stress-Testing Protocol

For each hypothesis, run these adversarial checks:

### 1. Inversion Test
> "If the opposite of this hypothesis were true, what evidence would I expect to see? Do I see it?"

If you see evidence consistent with the inversion and cannot explain it away, reduce confidence.

### 2. Boundary Condition Test
> "Under what extreme but realistic conditions does this hypothesis break?"

Name the conditions explicitly. If the hypothesis only works in a narrow band of conditions, that's a risk.

### 3. Pre-Mortem Test
> "Assume we acted on this hypothesis and it failed. What was the most likely cause of failure?"

The answer is a `[RISK]` marker in the final verdict.

### 4. Dependency Test
> "What external factors must remain stable for this hypothesis to hold?"

Each dependency that could change is a `[REVERSAL-CONDITION]`.

---

## Scoring Rubric

Score each hypothesis on 5 dimensions. Each dimension is 1–5.

| Dimension | 1 | 3 | 5 | Weight |
|-----------|---|---|---|--------|
| **Evidence Alignment** | Contradicted by high-reliability evidence | Mixed or partial support | Strongly supported by multiple H-reliability sources | 30% |
| **Constraint Satisfaction** | Violates ≥1 hard constraint | Satisfies hard, violates soft | Satisfies all hard and soft constraints | 25% |
| **Risk Profile** | High-probability, high-impact failure modes | Moderate risks with known mitigations | Low residual risk after mitigations | 20% |
| **Reversibility** | Irreversible; high sunk cost if wrong | Partially reversible with effort | Easily reversible; low switching cost | 15% |
| **Second-Order Clarity** | Unpredictable downstream effects | Some known, some uncertain | Well-understood consequences | 10% |

**Composite score** = Σ(dimension_score × weight)

### Scoring Rules

1. **Score before comparing.** Score each hypothesis independently, then compare. Do not anchor on the first hypothesis scored.
2. **Evidence-gated scoring.** If you cannot justify a score with specific evidence, score 3 (neutral) and flag with `[GAP]`.
3. **Tied scores.** If the top two hypotheses score within 0.3 of each other, the verdict must acknowledge genuine ambiguity rather than forcing a winner.
4. **Sensitivity check.** After scoring, ask: "If I changed any single dimension score by ±1, would the winner change?" If yes, the verdict is sensitive and confidence should be reduced.

---

## Reasoning Patterns for Specific Decision Types

### Trade-Off Reasoning

Build a decision matrix:

```markdown
| Criterion (weight) | Option A | Option B | Option C |
|---------------------|----------|----------|----------|
| Performance (30%) | 4 — meets p99 target | 3 — marginal | 5 — exceeds |
| Operational cost (25%) | 2 — new infra required | 4 — fits existing | 3 — moderate change |
| Team familiarity (20%) | 5 — known stack | 2 — learning curve | 3 — partial overlap |
| Reversibility (15%) | 3 — moderate | 4 — easy rollback | 2 — schema migration |
| Ecosystem maturity (10%) | 4 — stable | 5 — dominant | 2 — early stage |
| **Weighted total** | **3.35** | **3.35** | **3.30** |
```

When scores are close, shift to qualitative tiebreakers: which option has fewer `[ASSUMPTION]` markers? Which has clearer `[REVERSAL-CONDITION]`s?

### Root-Cause Reasoning

Build a causal chain for each hypothesis:

```
[Trigger Event] → [Propagation Step 1] → [Propagation Step 2] → [Observed Failure]
     ↑                    ↑                      ↑
 Evidence: E-3        Evidence: E-1           Evidence: E-5
```

Eliminate hypotheses whose causal chains have gaps (no evidence for a propagation step) unless the gap is explicitly marked and the chain is otherwise the strongest.

### Feasibility Reasoning

For each hypothesis, walk the constraint list:

```markdown
| Constraint | Status | Evidence | Notes |
|-----------|--------|----------|-------|
| C1: p99 < 200ms | ✅ PASS | E-2: benchmark shows 140ms | Margin: 30% |
| C2: No new spend | ⚠️ CONDITIONAL | E-4: requires Redis, ~$200/mo | Soft constraint — flagged |
| C3: PostgreSQL 14 | ✅ PASS | E-1: schema compatible | Verified |
```

Feasibility = all hard constraints pass. Conditional feasibility = hard pass, soft fail.

---

## Multi-Pass Deliberation

When deliberation depth is Standard (2 passes) or Deep (3 passes):

**Pass 1**: Generate hypotheses, score, select top 2.
**Pass 2**: Expand top 2. For each, enumerate implementation implications, edge cases, and failure modes not visible in Pass 1. Re-score.
**Pass 3** (Deep only): Red-team the leading hypothesis. Actively construct the strongest possible argument against it. If the argument holds, the verdict must acknowledge it as a live risk.

### Convergence Check Between Passes

If the winning hypothesis changes between passes, this is a signal of genuine ambiguity. The verdict's confidence score should decrease by 10–15 points.

If the winning hypothesis is the same across all passes, confidence increases by 5–10 points.

---

## Plan Checkpoints (CRYSTALIUM execution layer)

During multi-pass deliberation, FORGE checkpoints each reasoning branch to the
CRYSTALIUM execution layer. This makes the deliberation history auditable and
recoverable — if context is exhausted mid-deliberation, a `plan_replan` call
records which alternative was selected and why.

### Checkpoint at each pass boundary

After scoring is complete for a pass, record the deliberation state:

```
mcp__crystalium__plan_checkpoint(
  plan_id  = <decision-id, e.g. "forge-<thread_id>-pass<N>">,
  state    = {
    pass:         <pass number>,
    scope:        <framed question>,
    top_hypotheses: [{ id, name, score }],
    gaps:         [<active GAP markers>]
  },
  step     = "pass<N>-scored",
  metadata = { depth: <simple|standard|deep>, project: <cwd-project> }
)
```

### Replan when a branch is revised

If the winning hypothesis changes between passes (or a REFORGE revises the leading
alternative), record the branching decision before continuing:

```
mcp__crystalium__plan_replan(
  plan_id            = <same plan_id as prior checkpoint>,
  from_checkpoint_id = <checkpoint_id returned by prior plan_checkpoint>,
  new_plan           = {
    selected_hypothesis: <id and name>,
    supersedes_id:       <id of demoted hypothesis>,
    reason:              <why the branch changed>
  }
)
```

The old checkpoint is preserved (bi-temporal); the replan creates a new version.
This produces an auditable deliberation trace: which alternatives were live at each
pass, and which branch was promoted and why.

**Graceful skip:** if `mcp__crystalium__*` tools are unavailable (CRYSTALIUM not
installed), proceed without checkpoints — never hard-fail. Deliberation continues
normally without execution-layer recording.

---

## Anti-Patterns in Reasoning

| Anti-Pattern | Signal | Remedy |
|-------------|--------|--------|
| **Anchoring** | First hypothesis is always the winner | Score all before comparing; randomize evaluation order mentally |
| **False dichotomy** | Only 2 options considered | Force a third: "What if we did neither? What if we did both?" |
| **Survivorship reasoning** | "X worked for Company Y" | Ask: "How many companies tried X and failed? Would we know?" |
| **Complexity bias** | More sophisticated option scores higher by default | Add "simplest viable option" as a mandatory hypothesis |
| **Sunk cost reasoning** | Prior investment influences scoring | Score based on forward-looking costs only; mark prior investment as context, not evidence |
| **Premature convergence** | Decided after one pass on a deep problem | Check deliberation depth; enforce required passes |

---

*Reasoner — Deliberation Skill*
