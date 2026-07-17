---
name: vivi-methodology
description: "Full Vivi cycle reference — A(nalyze) → P(lan) → I(mplement) → V(erify) → Δ(Delta)/R(eflect). Use when the task is a non-trivial feature implementation in a brownfield codebase and you need the complete methodology reference: complexity routing, evidence-grounded planning rules, test-anchoring requirements, and failure-escalation thresholds."
metadata:
  methodology: Vivi
---

# Vivi Methodology

Feature implementation through evidence-grounded planning, test-anchored development, and structured self-improvement in brownfield codebases.

---

## A — ANALYZE Phase

### Step 1: Memory Recall

**CRYSTALIUM path** (when `mcp__crystalium__*` available):

```
mcp__crystalium__recall(
  scope  = { project: <cwd-project>, agent_class_visibility: "vivi" },
  query  = <task goal + domain + module area>,
  k      = 8,
  layers = ["semantic", "episodic", "procedural"]
)
```

`episodic` surfaces past task outcomes; `semantic` surfaces failure root causes
and architectural decisions; `procedural` surfaces verified reusable skills.
Fold relevant hits into mission context (≤ 1-2K tokens summarized).

**Standalone path** (when CRYSTALIUM absent): query `agents/memories/` for past
tasks in the same module, known reusable assets, and previous failure patterns.

Score matches by: path proximity → recency → outcome quality. Budget: ≤ 20 entries.

See `agents/skills/memory-management.md` for the full routing decision and protocol.

### Step 2: Repo Map Generation
Before reading any file in detail, generate a structural overview:

```
1. List directory tree for the target domain (2-3 levels deep)
2. Identify key files by convention:
   - Models/entities: app/models/DOMAIN/
   - Controllers/handlers: app/controllers/ or equivalent
   - Tests: spec/ or test/ mirroring source structure
   - Configuration: config/, .env patterns
3. For each key file, extract:
   - Public interface (method signatures, exported functions)
   - Dependencies (imports, includes, requires)
   - Test coverage existence (yes/no)
4. Rank by reference frequency: files imported by many others = high leverage
```

Output: Compressed structural summary (~50-100 lines). This is your navigation map.

### Step 3: Requirements Decomposition
State explicitly:
- **Goal**: What problem does this solve? One sentence.
- **Scope IN**: Files, modules, features being changed
- **Scope OUT**: What is explicitly NOT being changed (boundaries)
- **Acceptance criteria**: Observable, testable conditions for "done"

### Step 4: Asset Discovery (MANDATORY)

Search the codebase BEFORE planning. Discover what already exists.

| Asset Type | Search Pattern | Purpose |
|------------|---------------|---------|
| Domain models | `app/models/DOMAIN/` | Business logic, state machines |
| Repositories | `app/models/DOMAIN/repository.*` | Data access patterns |
| Services | `app/services/DOMAIN/` | Orchestration, business rules |
| View components | `app/components/DOMAIN/` | UI building blocks |
| Query objects | `app/models/DOMAIN/queries/` | Complex data retrieval |
| Workers/Jobs | `app/jobs/`, `app/workers/` | Async processing |
| Serializers | `app/serializers/` | API response shaping |
| Shared utilities | `lib/`, `app/lib/` | Cross-cutting helpers |
| Config/Constants | `config/`, `app/constants/` | Feature flags, settings |
| Test factories | `spec/factories/`, `test/factories/` | Test data patterns |

For EACH discovered asset, record:

| Field | Values |
|-------|--------|
| Location | file:line |
| Purpose | One-line description |
| Relevance | HIGH / MED / LOW |
| Quality | Has tests? Recent changes? Known issues? |
| Verdict | USE / EXTEND / WRAP / AVOID |
| Rationale | Why this verdict (one sentence) |

### Step 5: Collision Mapping
Identify risk zones:
- Files to **modify** (existing, may break things)
- Files to **create** (new, may collide with in-flight work)
- **High-risk zones**: Low test coverage, heavily imported, recently changed by others
- **Integration points**: Where new code touches existing code

**Phase output**: Discovery Report (use `agents/templates/discovery-report.md`)

---

## P — PLAN Phase

### Step 1: Test Anchor Generation

BEFORE designing any solution, write the test expectations:

```
For each acceptance criterion:
  1. Describe the test case in plain language
  2. Specify: input state → action → expected outcome
  3. Identify what existing test patterns to follow
  4. Note which test helpers/factories already exist
```

These test anchors become the source of truth for implementation correctness. Implementation is done when these tests pass.

**ANTI-OVERFIT rule (mandatory).** Test anchors derive from the **acceptance
criteria + EXISTING test patterns** in the codebase — never reverse-engineered
from a candidate implementation. Writing tests *after* (or to fit) the code you
intend to write reproduces the field's named failure: agents over-fit
implementations to tests they authored in hindsight (DESIGN-RATIONALE Decision 3;
SWE-bench-style contamination/overfitting). If you cannot state an anchor from
the acceptance criteria alone, the criterion is under-specified — clarify it,
do not invent an implementation-shaped test.

**CAPTURE-LIVE-FIRST gate (mandatory).** When the task parses external CLI
stdout/stderr, or consumes a serde-renamed / IPC payload, **stage the verbatim
live capture as the fixture BEFORE writing the parser.** Fabricated fixtures
pass 10/10 tests vacuously while every assumption about the real output is
wrong. Capture one real sample (or a one-line dump of the live payload) first;
that capture is the anchor.

**RED-GATE rule (mandatory — Stage 2).** For a fix/repair task, the reproduction
test anchor MUST be verified to **FAIL on the unmodified base tree** before any
implementation begins. The substrate enforces this mechanically: pass
`--require-red` to `eidolons sandbox loop` — a reproduction that already passes
is **VACUOUS** (`final=vacuous-reproduction`) and cannot anchor a fix. The
evidence is decisive: patching is near-solved when the repro test is *right*;
repro-test validity — not patch generation — is the bottleneck (TDFlow: 88.8%
vs 49% with verified repro tests). On a vacuous verdict, return to THIS step
and re-derive the anchor from the acceptance criteria — do NOT burn loop
attempts against a test that cannot fail.

### Step 2: Strategy Generation (Tree-of-Thoughts)

Generate 3-5 genuinely different strategies. Requirements:
- At least ONE strategy maximizes use of discovered internal assets
- At least ONE strategy is the conservative/minimal-change approach
- NO strawmen — every strategy must be plausibly the best choice
- Each strategy must differ in at least one of: architecture, coupling, scope, or risk profile

For each strategy, document:
- **Approach**: 2-3 sentence description
- **Files touched**: List with change type (modify/create)
- **Assets used**: Which discovered assets and how
- **Test impact**: New tests needed, existing tests affected
- **Risk profile**: What could go wrong

### Step 3: Strategy Scoring

Score each strategy on four dimensions (1-3 scale):

| Dimension | 1 (Poor) | 2 (Acceptable) | 3 (Good) |
|-----------|----------|-----------------|----------|
| **Risk** | High blast radius, low coverage in affected areas | Moderate, some coverage gaps | Low blast radius, good coverage |
| **Effort** | 3+ days, multi-team coordination | 1-2 days, single team | < 1 day, contained changes |
| **Alignment** | Ignores internal assets, creates parallel paths | Partial internal asset reuse | Full Internal First compliance |
| **Maintainability** | Adds technical debt, unclear ownership | Neutral to codebase health | Improves patterns, reduces duplication |

**Total: 4-12** (higher = better)

### Step 4: Deep Evaluation of Top 2

Expand the top 2 scoring strategies with:
- Detailed step-by-step implementation plan
- Specific file changes with pseudocode
- Dependency chain (what must be done first)
- Abort conditions (what would make this strategy fail)
- Blockers and unknowns

Re-score after deep evaluation. Hidden issues often emerge here.

### Step 5: Selection with Justification

Document:
- **Selected strategy**: Name + final score + one-paragraph justification
- **Runner-up**: Name + score + why it was rejected
- **Confidence level**: HIGH / MED / LOW
- **Abort conditions**: Specific signals that mean "stop and re-plan"
- **Boundaries**: Files/systems explicitly out of scope for this implementation

**Phase output**: Execution Plan (use `agents/templates/execution-plan.md`)

### Memory: Plan Checkpoint (CRYSTALIUM)

After the Execution Plan is produced, call (if CRYSTALIUM available):

```
mcp__crystalium__plan_checkpoint(
  plan_id  = <task-slug + date>,
  state    = <full execution plan snapshot>,
  step     = "initial",
  metadata = { author_agent: "vivi", task_title: <title> }
)
```

Store the returned `checkpoint_id` in working context. If the plan is revised
mid-cycle (the abort rules below fire), call `plan_replan` before re-entering
Plan:

```
mcp__crystalium__plan_replan(
  plan_id            = <plan_id>,
  from_checkpoint_id = <checkpoint_id>,
  new_plan           = { diff: <what changed and why>, supersedes_id: <checkpoint_id> }
)
```

**Graceful skip:** if CRYSTALIUM unavailable, skip these calls silently.

### ECL emit on FORGE consultation

If Plan-phase reasoning calls for a FORGE consultation (adversarial reasoning, trade-off arbitration), emit a `reasoning-request.envelope.json` next to the question artefact (template at `templates/reasoning-request.envelope.json`). Required: `to.eidolon=forge`, `performative=REQUEST`, `artifact.kind=reasoning-request`. Body validates against `schemas/_base-profile.v1.json`. `ise.assertion_grade="self-attested"` (ECL v2.0 §6.5.2; this envelope precedes any loop-native verification — see `skills/loop-native.md` §6 for the grade rationale). Skip the envelope when `ECL_VERSION` is absent.

---

## I — IMPLEMENT Phase

### Memory: Skill Reuse (CRYSTALIUM)

Before building, if the A-ANALYZE recall surfaced a procedural entry for this
task type, invoke it (if CRYSTALIUM available):

```
mcp__crystalium__skill_invoke(
  skill_id = <procedural entry id from recall>,
  context  = <current task context>
)
```

Use the result to short-circuit re-derivation. After verifying a new reusable
pattern, commit it:

```
mcp__crystalium__commit(
  layer   = "procedural",   # "semantic" if unverified
  payload = <pattern: name, location, purpose, usage_hint, quality>,
  provenance = { author_agent: "vivi" }
)
```

**Graceful skip:** if CRYSTALIUM unavailable, skip these calls silently.

### Execution Priority

Follow this order strictly:

1. **USE** — Assets marked USE AS-IS. Wire them in directly.
2. **EXTEND** — Assets marked EXTEND. Add methods/features to existing code.
3. **WRAP** — Assets marked WRAP. Create adapter layer for legacy interfaces.
4. **CREATE** — New code only when Discovery confirmed no suitable internal alternative.

### Architect/Editor Separation

For Complex-tier tasks, separate reasoning from editing:

```
ARCHITECT PASS (reasoning):
  - Describe WHAT needs to change and WHY
  - Specify the interface contracts between components
  - Define the data flow through the change

EDITOR PASS (implementation):
  - Translate architect output into actual code edits
  - Follow existing code style and conventions exactly
  - Produce minimal, targeted diffs (not rewrites)
```

### Implementation Rules

- Write tests for new functionality FIRST (test-anchored from Plan phase)
- One logical change per commit. Each commit should pass linter + existing tests.
- If you discover an asset not found in Analyze, STOP and update the Discovery Report.
- If implementation reveals the plan is wrong, STOP and return to Plan phase.
- Track progress with structured task list:

```
## Task Progress
- [x] TASK-1: Create factory method for Widget — DONE
- [ ] TASK-2: Extend WidgetRepository with #find_active — IN PROGRESS
- [ ] TASK-3: Add WidgetComponent for list view — BLOCKED (needs TASK-2)
- [ ] TASK-4: Wire controller action — PENDING
```

### Targeted Test Execution

Run tests incrementally, not all at once:
1. Run the SINGLE most relevant test after each change
2. Fix that failure before moving to the next change
3. Run the broader test suite only after all individual tests pass
4. This prevents the overcorrection cascade (fixing one thing, breaking another)

### ECL emit on Implement-phase exit

On phase exit, emit `vivi-completion-report.envelope.json` next to the completion artefact (template at `templates/vivi-completion-report.envelope.json`). Required: `to.eidolon=idg`, `performative=PROPOSE`, `artifact.kind=vivi-completion-report`, `integrity.method=sha256` matching the payload bytes. Profile schema: `schemas/vivi-completion-report-profile.v1.json` (required keys: `files_changed_count`, `tests_run`, `tests_passed`). `ise.assertion_grade="validated"` (ECL v2.0 §6.5.2) — justified because this envelope is only reachable after the V-phase closed loop passed **pass^k** against the regression + anchoring tests (`skills/loop-native.md` §4, §6); that is the spec-mandated verification gate the `validated` grade requires, not a self-report. Skip when `ECL_VERSION` is absent.

After the envelope is produced and verified (V-VERIFY phase), ingest it into
CRYSTALIUM (if available):

```
mcp__crystalium__ingest(
  envelope = <vivi-completion-report.envelope.json contents>,
  payload  = <completion report contents>
)
```

**Graceful skip:** if CRYSTALIUM unavailable, skip silently.

---

## V — VERIFY Phase (loop-native)

Vivi does **not** "run the checks once and decide." It **drives the closed loop**
`eidolons sandbox loop` (see `skills/loop-native.md`) and acts as its
`--fix-hook`: the loop runs the verification, and on failure re-invokes Vivi's
repair step (R, below) in **fresh context**, bounded, until green or capped. This
is the core of the loop-native cycle and the reason Vivi supersedes its
predecessor — which ran V once and handed the running back.

### Configure the loop
- `--tests`, or split `--regression`/`--reproduction`: the success command(s).
  Success = the Plan-phase **test-anchors** plus the existing suite, with
  **regression-first, then the new acceptance test** (passing only the new test
  FAILS — anti-reward-hacking).
- `--protect <glob>`: the anchoring tests; the fix-hook MUST NOT edit them
  (a mutation aborts → VIGIL).
- `--k <n>`: pass^k — a green that is non-deterministic across k re-runs is
  **flaky → BLOCKED**, not accepted.
- `--max-attempts N` + `--via <isolation>`: the bounded cap and the host sandbox
  (untrusted/LLM-authored code needs ≥ container isolation, R8-03).
- `--require-red`: mechanical red gate — the reproduction anchor must FAIL on
  the base tree before any fix attempt (P-phase RED-GATE rule, enforced).
- `--fanout N`: parallel-sample-and-select shape for standard-tier hosts (see
  Host-adaptive shape below) — N independent fresh-context candidates,
  externally selected; NO self-repair iteration.
- `--judge-hook <cmd>`: external diff-review judge over a surviving candidate
  (layered hack detection — the sealed holdout alone is insufficient).

### Verification checks (run by the loop each iteration)
| Check | Pass criteria |
|-------|---------------|
| Regression (full suite) | no new failures — **runs FIRST** |
| Test-anchors (new) | all pass |
| Linter | zero new violations |
| Coverage | no decrease in affected files |
| Build / Type check | clean |
| pass^k | green stable across k re-runs (else flaky → BLOCKED) |

### Decision
- Loop reaches green (regression + reproduction + pass^k) → it emits a
  **candidate diff** (diff-not-apply; the human applies) → proceed to **Δ**.
- Loop caps / flaky / `protected-tests-mutated` → proceed to **R** (already
  bounded); on the 3-same-category / cap threshold, escalate to VIGIL.

### Host-adaptive shape (Stage 2) — iterate vs fanout
The loop's gain belongs to an RL-trained / loop-competent host; on a weak host
**self-repair iteration is the wrong shape** — feeding failures back injects new
errors (RLEF; the self-repair literature). Vivi therefore picks the LOOP SHAPE
by host tier instead of falling off the loop entirely:

| Host tier | Shape | Invocation |
|-----------|-------|------------|
| thinking / loop-competent | **iterate** | `--max-attempts 3 --k 2 --require-red` |
| standard / weak | **fanout** | `--fanout 3 --max-attempts 1 --k 2 --require-red` |

In **fanout**, each candidate is an INDEPENDENT fresh-context, single-shot fix
generated from the same base tree + the same localized base-failure feedback;
the substrate selects the survivor externally (tests + pass^k + holdout +
judge). The weak-host model never judges its own retry — selection is external
by construction (R2E-Gym hybrid-verifier evidence: +8pp over either filter
alone; parallel sampling beats sequential self-repair on weak models).

### Host-contingency / graceful degradation
If no adequate isolation is available, or the substrate (`eidolons sandbox`) is
absent entirely, **degrade**: run the checks once, emit a diff for the human,
and recommend the conservative fallback (`eidolons add apivr`). Never run
untrusted code without `--via` or an explicit `--allow-unsafe-host`.

---

## R — REFLECT Phase (Failure Only) — fresh-context repair

R runs as the loop's `--fix-hook` on each failing iteration. Load skill:
`skills/failure-recovery.md`.

### Fresh-context per attempt (the decisive discipline)
**Each repair attempt starts from a CLEAN context**: the localized feedback
(`$EIDOLONS_SANDBOX_FEEDBACK` — failing test ids, assertion, `file:line` loci,
full log) + the original acceptance criteria + the current working tree — **NOT**
the accumulated "prior error + new hypothesis" transcript. Carrying the prior
trajectory re-creates self-conditioning (long-horizon execution failure is
dominated by models conditioning on their own prior errors). This is the single
biggest change from the predecessor's same-context retry, and it is why the loop
helps rather than degrades.

### Evidence Gate (MANDATORY)

**STOP** if you have no concrete artifact (the loop's localized feedback IS the
artifact: assertion + `file:line`). No artifacts = ESCALATE. Never guess at fixes.

### ECL emit on 3-failure escalation

When the 3-same-category threshold fires (the methodology counter is the
**authority**; the loop's `--max-attempts` is the substrate **ceiling** —
whichever trips first), wrap the escalation in a `repair-failed-report.envelope.json`
(template at `templates/repair-failed-report.envelope.json`). Required:
`to.eidolon=vigil`, `performative=ESCALATE`, `trust_level=high`,
`assumptions[0]="trigger: 3-failure-same-category"`. Profile schema:
`schemas/repair-failed-report-profile.v1.json` (keys `attempts>=3`,
`failure_category`, `last_test_command`). `ise.assertion_grade="self-attested"`
(ECL v2.0 §6.5.2) — the escalation is Vivi's own bounded-failure judgement, not
an externally-gated pass. Skip the sidecar when `ECL_VERSION` is
absent (the escalation still happens).

### Failure Protocol (fresh-context, localized)

See `skills/failure-recovery.md` for the full taxonomy. Quick reference:

| Iteration | Condition | Action |
|-----------|-----------|--------|
| Each | localized feedback present | Targeted fix to the reported loci, from **fresh context** |
| 2nd, same category | — | A genuinely different approach (the feedback drives it, not the prior narrative) |
| 3rd, same category | — | **ESCALATE** to VIGIL (cap reached) |
| Any | LOW confidence / no artifact | **ESCALATE** immediately |
| Any | fix would edit an anchoring test or exceed scope | **ABORT** (anti-reward-hacking) → escalate |

### Escalation Format

When escalating, provide:
```
## Escalation: [task description]

### What was attempted
1. [Approach 1]: [what happened]
2. [Approach 2]: [what happened]

### Evidence collected
- [error output, test results, etc.]

### My assessment
- Root cause hypothesis: [best guess with confidence]
- What I need: [specific help required]

### Suggested next steps for human
1. [concrete suggestion]
```

---

## Δ — DELTA Phase (Success Only)

After successful verification, evaluate the touched code for normalization opportunities.

### Candidate Scoring

```
Priority = (Severity + Frequency + Velocity) - Cost
```

Each factor scored 1-3. Threshold: **≥ 3 to suggest**.

| Factor | 1 | 2 | 3 |
|--------|---|---|---|
| Severity | Cosmetic | Moderate coupling | Architectural debt |
| Frequency | Seen once | Seen 2-3 times | Pattern across codebase |
| Velocity | Stable area | Moderate change rate | Active development area |
| Cost | Major refactor | Moderate effort | Quick improvement |

### Anti-Criteria (Reject if ANY match)

- First occurrence only → premature abstraction
- Dormant area (> 6 months since last meaningful change)
- High cost but affects ≤ 2 files
- "Might be useful someday" reasoning
- Would require changes outside current domain

### Output Format

```
## Delta Suggestions

### Δ-1: [Title]
- Pattern: [what was observed]
- Location: [file:line references]
- Score: Severity(X) + Frequency(X) + Velocity(X) - Cost(X) = [total]
- Suggestion: [specific improvement]
- Effort estimate: [hours/days]

Status: SUGGESTION ONLY — Do not implement
```

**CRITICAL**: Delta suggestions are OUTPUT ONLY. Never implement infrastructure suggestions. Log them to `agents/memories/delta-history.md` for future reference.

---

## Post-Task: Memory Update (Δ/R phase)

After every task (success or failure), update memory via the active path.
See `agents/skills/memory-management.md` for the full protocol.

**CRYSTALIUM path** (when available):

```
# Task outcome
mcp__crystalium__commit(layer="episodic", payload={task_title, domain, outcome,
  summary, key_decisions, lesson}, provenance={author_agent:"vivi"})

# Failure root causes (if any)
mcp__crystalium__commit(layer="semantic", payload={failure_category, context,
  root_cause, prevention, domain}, provenance={author_agent:"vivi"})

# New patterns (if discovered and verified)
mcp__crystalium__commit(layer="procedural", payload={pattern_name, location,
  purpose, usage_hint, quality:"verified"}, provenance={author_agent:"vivi"})

# End session
mcp__crystalium__session_end()   # triggers Dream consolidation
```

**Standalone path** (when CRYSTALIUM absent): write to `agents/memories/`
files per `skills/memory-management.md §Standalone Fallback`.

---

*Vivi Methodology — Flow-engineered, test-anchored, context-aware*
