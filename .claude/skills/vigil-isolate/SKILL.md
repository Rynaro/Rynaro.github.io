---
name: vigil-isolate
description: Phase I (Isolate) — narrows the fault surface to ≤8 candidate nodes via delta-debugging-style reduction. Preserves failure throughout reduction; records ruled-out evidence. Use after `reproduction.md` is stable and `DETERMINISM_VERDICT ≠ intermittent`, before the Graph phase.
allowed-tools: git_bisect, git_log, view_file, search_symbol, search_text, run_test, dep_graph_query
metadata:
  methodology: VIGIL
  phase: I
---

# SKILL: Isolate — narrow the fault surface

## When to use

Load when `reproduction.md` is schema-valid and stable. Unload when `fault-surface.md` has ≤8 candidates with evidence anchors.

> **Memory check:** if `recall` fired in Phase V, its results are already in
> context — consult them when building the initial suspect set. Procedural
> memories from prior missions on similar error classes can shortcut Source 2
> (recent churn) and Source 3 (scope bounds) below. If `mcp__crystalium__*`
> tools are unavailable, proceed without memory — never hard-fail.

---

## Contract

| Field | Value |
|-------|-------|
| LLM calls permitted | For classifying candidates and reading source |
| Tool budget | ≤25% of mission budget |
| Output | `fault-surface.md` — schema-valid per `schemas/fault-surface.v1.json` |
| Hard cap | ≤8 candidates. If more survive reduction, narrow scope; if fewer than 1 survives, escalate. |

---

## The Suspect Set — Where to Look First

Build the initial suspect set from three deterministic sources. Do not enumerate the entire codebase.

### Source 1 — Stack trace closure

Every file referenced in the failing stack trace (from `reproduction.md`) is a suspect. For each frame:

- The file itself → suspect
- Files it imports → secondary suspects if the failure is a `RUNTIME_ERROR` or `INTEGRATION_ERROR`
- Call-graph ancestors (who calls this) → tertiary suspects for `LOGIC_ERROR`

### Source 2 — Recent churn

For the commit at which the failure reproduces:

```
git log --since="30 days ago" --oneline --name-only
```

Cross-reference churn with Source 1. Files that are **both** in the stack trace AND recently modified are the highest-priority suspects.

For `REGRESSION` category: add `git bisect` to identify the introducing commit. Files touched by that commit become top suspects.

### Source 3 — Scope bounds from upstream

If upstream artifact (APIVR-Δ `repair-failed-report.md`, spec, or scout-report from ATLAS) declared a scope, respect it. Candidates outside the declared scope require explicit justification (e.g., "symptom traces cross the boundary because of [evidence]").

---

## Reduction Techniques (Category-Specific)

### `REGRESSION` — use git bisect

Bisect between last known good commit and current. Each iteration:

1. Check out midpoint
2. Run reproduction command
3. Record `PASS` or `FAIL_MATCH`
4. Narrow

Terminates at the introducing commit. The diff of that commit is the highest-priority candidate set.

### `LOGIC_ERROR`, `TYPE_ERROR`, `RUNTIME_ERROR` — use dependency walk

Starting from the failing assertion's location:

1. Identify all variables/functions read in the failing code path
2. For each, identify its origin (where it's assigned, returned from, passed in)
3. Walk backward until you hit a boundary — user input, IO, constant, or unmodified upstream code
4. Each node in this walk is a candidate

### `INTEGRATION_ERROR` — use contract comparison

The failure is at a component boundary. Candidates are:

- The producer's output schema/contract (actual vs declared)
- The consumer's input expectations (actual vs declared)
- Any serialization layer between them

### `BUILD_ERROR`, `LINT_VIOLATION` — direct diagnosis

The tooling has already identified the file:line. The "isolation" is trivial. Proceed to Graph with the tooling-reported location as the single candidate.

### `HEISENBUG` — use timing/state differential

With statistical-mode reproduction, run 5× with increased logging. Compare state at key checkpoints across runs:

- What differs between failing and passing runs?
- Are there race windows? Shared state mutations? External clock/random dependencies?

Candidates are the loci where observable state diverges between passing and failing runs.

### `COMPOUND` — accept >1 root candidate

Compound failures have multiple independent roots. Do not force reduction below 2 candidates. Mark them for the Graph phase to confirm independence.

### `SPEC_DEFECT` — validate test intent

Does the test assert the correct thing? Compare test expectation to:

- The spec (if available — from SPECTRA handoff or issue tracker)
- Other tests covering the same behavior
- Recent spec changes

If the test is wrong, the "fix" routes to SPECTRA, not APIVR-Δ.

---

## Ruled-Out Trail — First-Class Evidence

For every candidate you **remove** from the suspect set, record why. This is not noise — it's the most important output of Phase I.

Required ruled-out records:

```yaml
ruled_out:
  - candidate: "app/flows/auth.rb:120-180"
    reason: "Not in stack trace; not modified in last 90 days; called from unrelated path."
    evidence_source: "git log + stack trace"
  - candidate: "lib/utils/clock.rb:*"
    reason: "Failing test uses frozen time via test helper; clock utility not reached."
    evidence_source: "test_helper.rb:12; dep_graph_query(callers_of: Clock.now)"
```

Minimum: 3 ruled-out entries per mission. Missions with fewer suggest lazy reduction; harness flags for review.

---

## Writing `fault-surface.md`

```yaml
mission_id: VIGIL-YYYYMMDD-NNN
upstream_reproduction: <ref>
suspect_set_sources:
  - stack_trace_closure
  - recent_churn
  - scope_bounds
candidates:
  - id: C-001
    path: "app/flows/vote_casting/record_vote.rb"
    lines: "42-78"
    kind: code            # code | test | config | schema | data | env
    suspicion_rank: 1     # 1 = highest
    rationale: "Top of failing stack; modified 3 days ago in commit abc123; writes the asserted-against column"
  - id: C-002
    path: "app/policies/voting_authorizer.rb"
    lines: "12-40"
    kind: code
    suspicion_rank: 2
    rationale: "Delegate target of C-001; recently modified; appears in stack frame 2"
reduction_trail:
  - step: "Stack trace closure produced 17 suspects"
  - step: "Churn filter reduced to 8"
  - step: "Scope bounds (auth module only) reduced to 5"
  - step: "Dependency walk confirmed 2 additional candidates outside initial stack"
ruled_out:
  - <as above, minimum 3 entries>
scope_bounds:
  include: ["app/flows/**", "app/policies/**"]
  exclude: ["spec/**", "lib/legacy/**"]
```

---

## Anti-patterns

- **Reading entire files.** Windowed reads only, after narrowing by symbol or graph query.
- **Inferring candidates.** Every candidate needs a path:lines anchor and a traceable reason.
- **Cascading reduction too aggressively.** If you're down to 0 candidates, you reduced wrong — escalate.
- **Chasing a candidate because it "looks suspicious."** Anchor the suspicion in stack trace, churn, or dep graph. Vibes are not evidence.
- **Skipping ruled-out records.** The next VIGIL mission on related code will thank you.

---

*VIGIL Phase I — reduction with evidence, ≤8 candidates to Graph*
