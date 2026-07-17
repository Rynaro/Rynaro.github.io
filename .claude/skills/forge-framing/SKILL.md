---
name: forge-framing
description: Governs problem decomposition and constraint extraction during the FORGE Frame phase. Use when the Reasoner enters Phase F to extract the core decision, classify its type, map hard/soft constraints, set deliberation depth, and declare success criteria before any hypothesis work begins.
metadata:
  methodology: FORGE
  phase: F
---

# Framing Methodology

Loaded during the Frame phase. Governs how the Reasoner decomposes problems into tractable decision structures.

## When to use

Load this skill at the start of Phase F (Frame). Use it to extract the core decision question, classify the decision type (`TRADE-OFF`, `FEASIBILITY`, `ROOT-CAUSE`, `CONFLICT-RESOLUTION`, `CONSTRAINT-SATISFACTION`, `RISK-ASSESSMENT`), map all hard and soft constraints, set the deliberation depth score (1–9), and write the success criteria checklist. Do not proceed to Phase O (Observe) until all five steps are complete. Do not use for the Reason, Gate, or Emit phases.

---

## Memory pre-flight (Frame — mission intake)

Before any decomposition work begins, call CRYSTALIUM recall to surface prior
verdicts, known constraints, and recurring deliberation patterns for this project:

```
mcp__crystalium__recall(
  scope    = { project: <cwd-project>, agent_class_visibility: "forge" },
  query    = <the decision question being framed>,
  k        = 5,
  layers   = ["semantic", "episodic", "procedural"]
)
```

Fold relevant hits (prior verdicts on related decisions, reversal conditions that
have already fired, recurring constraint patterns) into the evidence inventory
before Step 1 below. Prior deliberation outputs surface at T1 episodic, making
prior FORGE verdicts directly reusable.

**Graceful skip:** if `mcp__crystalium__*` tools are unavailable (CRYSTALIUM not
installed), proceed without memory — never hard-fail. FORGE is EIIS-standalone-
conformant and works without CRYSTALIUM.

See `agent.md` §"Memory pre-flight" for the always-loaded note. See `SPEC.md §9`
for the full memory protocol summary.

---

## Problem Decomposition Protocol

### Step 1: Extract the Core Decision

Strip away narrative to find the atomic question. Apply the **Specificity Test**:

> If two competent engineers could interpret this question differently and produce contradictory verdicts, the framing is insufficiently specific.

Transform vague questions into precise ones:

| Vague | Specific |
|-------|----------|
| "Should we use microservices?" | "Given our team of 4, a monolith at 50K LOC, and 3 independent deployment cadences, does decomposing services X, Y, Z reduce deployment risk enough to justify the operational overhead?" |
| "Is this architecture scalable?" | "Can this architecture handle 10x current load (defined as N req/s) within the existing infrastructure budget of $M/month, without exceeding p99 latency of Xms?" |
| "What caused this outage?" | "Which component in the request path between ingress and database was the first to degrade, and what trigger pushed it past its failure threshold?" |

### Step 2: Classify the Decision Type

Each type activates different reasoning patterns in the Deliberation phase:

| Type | Core Question Shape | Reasoning Pattern |
|------|-------------------|-------------------|
| `TRADE-OFF` | "X vs Y given constraints C" | Multi-criteria scoring with explicit weights |
| `FEASIBILITY` | "Can X be achieved under constraints C?" | Constraint enumeration → bottleneck identification → existence proof or counterexample |
| `ROOT-CAUSE` | "Why did X happen?" | Causal chain reconstruction → elimination of confounders |
| `CONFLICT-RESOLUTION` | "Agents/stakeholders disagree on X" | Position extraction → shared-ground identification → arbitration |
| `CONSTRAINT-SATISFACTION` | "Find solution satisfying C1, C2, ... Cn" | Constraint graph → feasibility region → optimization within region |
| `RISK-ASSESSMENT` | "What can go wrong with X?" | Failure mode enumeration → likelihood × impact scoring → mitigation mapping |

### Step 3: Map Constraints

Build the constraint table. Every constraint has a source and a hardness level:

```markdown
| ID | Constraint | Hard/Soft | Source | Risk if Violated |
|----|-----------|-----------|--------|-----------------|
| C1 | p99 latency < 200ms | Hard | SLA contract | Service credit penalties |
| C2 | No new infrastructure spend | Soft | Q3 budget guidance | Deferral to Q4 |
| C3 | Must work with PostgreSQL 14 | Hard | Ops team mandate | Migration blocked |
```

**Hard constraints** eliminate options. **Soft constraints** influence scoring but don't eliminate.

### Step 4: Set Deliberation Depth

Score the problem on three dimensions (1–3 each):

| Dimension | 1 (Simple) | 2 (Standard) | 3 (Deep) |
|-----------|-----------|--------------|----------|
| **Ambiguity** | Clear right answer exists | 2–3 viable paths | Many viable paths, unclear winner |
| **Reversibility** | Easy to undo | Moderate cost to reverse | Irreversible or very costly |
| **Blast radius** | Single component | Multiple components | System-wide or organizational |

Total 3–4 → Simple (1 reasoning pass). Total 5–7 → Standard (2 passes). Total 8–9 → Deep (3 passes, extended token budget).

### Step 5: Declare Success Criteria

Before reasoning begins, write down what "done" looks like:

```markdown
## Success Criteria
- [ ] The verdict answers: [restate the specific question]
- [ ] All hard constraints addressed with pass/fail
- [ ] At least 3 alternatives evaluated with rejection reasons
- [ ] Reversal conditions stated
- [ ] Confidence score defensible
- [ ] Requester can act without further clarification
```

---

## Evidence Inventory Protocol

Catalog every piece of provided context before reasoning:

```markdown
## Evidence Inventory

| ID | Source | Type | Relevance | Reliability |
|----|--------|------|-----------|-------------|
| E1 | ATLAS scout-report.md | Scout report | Direct | H — evidence-anchored |
| E2 | User-provided benchmark data | Performance data | Direct | M — methodology unstated |
| E3 | Team Slack discussion | Stakeholder position | Contextual | L — informal, may be outdated |
| E4 | SPECTRA spec v2 | Planning artifact | Direct | H — verified through SPECTRA gates |
```

**Reliability tiers:**
- **H (High)** — Evidence-anchored artifacts, verified test results, official documentation
- **M (Medium)** — Reasonable but unverified: benchmarks without methodology, expert opinions, dated documentation
- **L (Low)** — Informal, secondhand, or potentially outdated sources

Claims built on L-reliability evidence must carry `[ASSUMPTION]` markers.

---

## Anti-Patterns in Framing

| Anti-Pattern | Signal | Remedy |
|-------------|--------|--------|
| **Binary framing** | "Should we do X or not?" | Expand to ≥3 options: do X, do Y, do nothing, do X-lite |
| **Solution-first framing** | Question presupposes the answer | Re-frame around the problem, not the solution |
| **Scope creep during framing** | Sub-questions multiply beyond the original ask | Constrain to the declared question; log expansions as follow-up verdicts |
| **Missing stakeholders** | Constraints exist that nobody stated | Ask: "Who else is affected? What would they say?" |
| **Phantom constraints** | Assumed constraints that nobody actually mandated | Verify every constraint has a named source |

---

*Reasoner — Framing Skill*
