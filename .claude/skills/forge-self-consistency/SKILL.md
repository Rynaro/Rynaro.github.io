---
name: forge-self-consistency
description: Governs N perspective-diverse, mutually-blind reasoning traces with structural-agreement judge-merge for gated high-stakes FORGE decisions (G2/TRANCE). Use instead of forge-deliberation when Deep depth AND a stakes flag both hold (Framing score 8–9 with irreversible/system-wide blast radius), or on explicit opt-in. Do NOT use for standard-tier decisions — self-consistency is never the default.
metadata:
  methodology: FORGE
  phase: R-variant
---

# Self-Consistency Mode

Loaded **instead of** `skills/deliberation.md` when a G2 / TRANCE self-consistency
escalation fires. Governs how the Reasoner runs **N perspective-diverse,
mutually-blind reasoning traces** over a frozen Frame+Observe inventory and
merges them on **structural agreement**, not on verbalized confidence.

## When to use

Load this skill **instead of** `forge-deliberation` when BOTH a complexity flag AND a stakes flag hold: Deep depth (Framing Step-4 total 8–9) with an irreversible or system-wide blast radius. Also loads on explicit opt-in ("run self-consistency", "G2", "N=5 on this"). Use N=3 for standard high-stakes runs and N=5 for the worst-case quadrant (irreversible AND system-wide). Do not enter this mode for standard-depth decisions; do not combine with `forge-deliberation` in the same Reason phase.

This mode is **gated, never default** (see "Gate" below). Standard-tier FORGE
stays single-trace (`skills/deliberation.md`, 1–3 passes). Self-consistency is
the TRANCE form the trance-matrix grants FORGE: *"N=3 (or N=5 high-stakes)
sampled traces with majority-vote / judge-merge (G2)"* — operationalized here.

---

## Gate — when this mode fires (and when it must not)

Self-consistency fires ONLY when **both** a complexity flag and a stakes flag
hold, OR on explicit opt-in, OR when the roster declares a weak-host degraded
mode (see item 3 below):

1. **Deep depth** — Framing Step-4 total 8–9 (high Ambiguity AND Irreversibility
   OR system-wide Blast radius). A Deep score on its own is necessary but the
   stakes flag (irreversible / system-wide) must also be live. This is the
   trance-matrix C6 auto-trigger requirement: a complexity flag AND a stakes flag.
2. **Explicit opt-in** — the user or the parent orchestrator names the mode
   ("run self-consistency", "G2", "N=5 on this").
3. **Weak or undeclared host** — the roster declares FORGE
   `degraded_mode: sample-select` (`roster/routing.yaml`, routing-1.1): on a
   weak or undeclared host this mode REPLACES single-trace self-red-teaming
   (the Pass-3 Deep red-team in `skills/deliberation.md`) rather than only
   gating on Deep + stakes — the roster data itself is the trigger, because
   sampling+selection is more reliable than unbounded single-trace
   self-correction on a weak host.

If none of the above hold, **do not enter this mode** — run standard single-trace FORGE.
Forcing G2 universally violates the opt-in contract (FORGE is never a mandatory
critique gate). This mode adds *parallelism*, not a fresh budget: it composes
with — does not extend — the existing 3-pass / 1-REFORGE cap.

**No tool access is gained at TRANCE.** FORGE is reasoning-only at every tier.
The independent-verifier hook below is a *handoff recommendation*, not an
executed call.

---

## Step 1 — Freeze the shared inventory (fan-out precondition)

Before fan-out, the Frame and Observe outputs are **frozen**: the decision
question, decision type, constraint table, success criteria, and the evidence
inventory (with H/M/L reliability tiers). Every trace reasons from this **same**
frozen inventory. Traces differ in *reasoning stance*, never in the evidence
they are given — a trace that invents new evidence is invalid and is discarded.

Pick N:

| N | When |
|---|------|
| **N=3** | Standard high-stakes (Deep depth + stakes flag). |
| **N=5** | Irreversible AND system-wide blast radius (the worst-case quadrant). |

N is **fixed before fan-out** and bounded — exactly N traces, **no re-sampling
beyond N**. If the merge is below floor, you emit `[DISPUTED]`; you do not draw
more traces.

---

## Step 2 — Fan-out: N perspective-diverse, mutually-blind traces

Diversity is across **reasoning stance**, not model (FORGE has no model control;
intra-model sample diversity already beats naive cross-model debate). Each trace
is assigned a distinct adversarial lens from this fixed persona table, in order,
until N is reached:

| # | Persona | Lens — the question this trace asks first |
|---|---------|-------------------------------------------|
| 1 | **Evidence-maximizing** | Which hypothesis is best supported by the H-reliability evidence, weighing alignment above all? |
| 2 | **Pre-mortem / failure-first** | Assume each hypothesis was chosen and failed — which fails *least catastrophically*? |
| 3 | **Constraint-relaxation** | If exactly one soft constraint could be relaxed, which hypothesis becomes clearly best, and is that relaxation acceptable? |
| 4 | **Inversion / steelman-the-rejected** | Build the strongest case for the hypothesis the obvious reading rejects — does it survive? |
| 5 | **Simplest-viable-default** | What is the lowest-complexity, most-reversible option that still satisfies all hard constraints? |

For N=3 use personas 1–3. For N=5 use 1–5.

**Mutual blindness is mandatory.** No trace may read another trace's verdict,
score, or selected hypothesis before the merge. This prevents self-conditioning
(a trace anchoring on an earlier trace's answer collapses the diversity the mode
exists to create — the lazy-agent failure).

Two equivalent execution forms:

- **Parent-dispatched subagents (mechanically stronger).** The orchestrator
  dispatches N clean-context FORGE subagents, each given the frozen inventory
  plus one persona, with no shared scratchpad. Independence is enforced by
  separate contexts. Prefer this form when available.
- **Sequential-blind in one context (fallback).** Emit N reasoning passes one
  after another, each opening from the frozen inventory under its assigned
  persona, and **do not reference any prior pass's verdict** while reasoning the
  current one. Only the merge step (Step 3) may read all N.

Each trace produces the standard hypothesis-level work (≥3 hypotheses, the four
stress tests, a selected hypothesis, and any `[RISK]` / `[REVERSAL-CONDITION]`
markers it surfaces). A trace MAY state a per-trace confidence, but that number
is **not** used by the merge.

---

## Step 3 — Aggregation: structural-agreement judge-merge

The merge is a **single deterministic tally**, not another round of
deliberation. There is exactly **one** merge pass — no merge loop.

1. **Tally hypothesis selection.** For each trace, record which hypothesis it
   selected. Identify the **modal hypothesis** (the one selected by the most
   traces).
2. **Compute the structural-agreement score:**

   ```
   structural_agreement = (traces selecting the modal hypothesis) / N
   ```

3. **Cross-reference recurring markers.** Collect every `[REVERSAL-CONDITION]`
   and `[RISK]` that **≥2 traces surfaced independently**. Independently-recurring
   reversal conditions are **high-trust signals** — they were found by
   differently-biased reasoners, so they are unlikely to be persona artefacts.
4. **Decide against the 60% consensus floor** (trance-matrix FORGE consensus
   floor):

   | structural_agreement | Result |
   |----------------------|--------|
   | **≥ 60%** | **PASS** — emit one merged `[VERDICT]` on the modal hypothesis. |
   | **< 60%** | **FAIL** — emit `[DISPUTED]` (see Step 4). |

**Merged confidence anchors on structural agreement, NOT on averaged verbalized
confidence.** The merged verdict's confidence IS the `structural_agreement`
score (optionally tightened upward only by the count of independently-recurring
reversal conditions). Do **not** average the per-trace confidence numbers:
verbalized confidence is systematically overconfident and a poor diagnostic of
correctness, so it is excluded from the trust anchor. The mechanical signal —
*how many independently-biased traces converged* — is the calibrated one.

A PASS verdict lists: the modal hypothesis, the structural-agreement score as
its confidence, and the convergent (`≥2`-trace) reversal conditions as the
verdict's `[REVERSAL-CONDITION]` set.

---

## Step 4 — Disagreement: `[DISPUTED]` below the floor

If `structural_agreement < 60%`, **never force-merge** into a single winner.
Emit a `[DISPUTED]` verdict that:

- enumerates the **live positions** (each hypothesis that ≥1 trace selected,
  with which persona(s) backed it),
- states a **reduced confidence** equal to the structural-agreement score,
- lists which reversal conditions recurred and which were trace-local, and
- routes a handoff: **→ human** (genuine judgment split) or, if a tiebreak is
  feasible, **→ independent verifier** (see Step 5).

This mirrors the single-trace tied-score rule: when the top positions are
genuinely close, the verdict acknowledges ambiguity rather than manufacturing a
winner.

---

## Step 5 — Independent-verifier hook (opt-in ceiling-breaker)

Self-consistency on a single reasoner saturates around a known accuracy ceiling;
the lever that pushes past it is an **independent / cross-model verifier**.
FORGE is tool-less (P0) and cannot dispatch a second model itself, so this is a
**documented handoff, not an executed call**:

- **When to offer it.** A near-floor PASS (structural_agreement just above 60%),
  a `[DISPUTED]` FAIL on a high-stakes/irreversible decision, or explicit opt-in.
- **What to emit.** An `[ACTION]` / handoff recommending that the parent
  orchestrator (or nexus `eidolons run`) re-derive the verdict via an
  **independent FORGE instance or a cross-model verifier**, seeded with the
  **same frozen inventory** but **not** shown this run's merged verdict. Name it
  explicitly as `→ independent-verifier` in the handoff section.
- **What NOT to do.** Do not call a tool. Do not start a debate loop between
  traces. The verifier is a separate, blind re-derivation orchestrated outside
  FORGE — that independence is exactly what makes it a ceiling-breaker.

---

## Bounds & honesty

- **Exactly N traces, one merge pass.** No re-sampling, no merge loop. Composes
  with the 3-pass / 1-REFORGE cap; does not extend it.
- **Diversity is tuned, not naive.** Fixed adversarial personas are the *tuned*
  form of multi-trace reasoning; naive same-prompt sampling or unbounded debate
  is excluded (see `DESIGN-RATIONALE.md §9`).
- **Confidence is structural.** It reflects cross-trace agreement, never an
  averaged self-grade. This is a methodology-layer estimate, not a benchmarked
  accuracy figure.

---

*Reasoner — Self-Consistency Skill*
