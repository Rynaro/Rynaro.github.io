---
name: kupo-keep-or-kick
description: Phase K triage gate that decides whether Kupo will attempt a delegated micro-task or refuse cheaply. Use when a delegation arrives and Kupo must decide KEEP vs REFUSE/ESCALATE; runs once per delegation at the start of every KUPO cycle. Do NOT use during Phase U/P/O.
metadata:
  methodology: Kupo
  phase: K
---

# Keep-or-Kick Skill — Kupo (Phase K triage)

## When to use

Load during Phase K (triage). Runs once per delegation. Triage cost ≈ 1 step.
Do not load during Phase U, P, or O.

Loaded during Phase K. Runs once per delegation. Triage cost ≈ 1 step.

Phase K is the additive-proof gate: Kupo only spends cycles on tasks it can
plausibly win. Every task that fails triage bounces cheaply, making Kupo
structurally non-negative to the delegating planner's session.

---

## Decision Tree (run in order — first failure exits)

### Step 1 — Localization check

Does the task require changes to **≤ 2 files** that form **one coherent change**?

- **Yes** → continue to Step 2.
- **No** (cross-cutting, > 2 files, or multiple unrelated concerns) →
  `REFUSE{SCOPE_TOO_BROAD}` or `ESCALATE{to: apivr}` for a cross-cutting
  refactor, or `ESCALATE{to: vivi}` for a loop-native coding campaign.

One coherent change means: changing file A causes file B to change as a direct
mechanical consequence (e.g., rename a symbol + update one call site), not a
coincidental co-location.

### Step 2 — Named-verifier predicate (structural KEEP gate)

Can you name a **concrete external verifier** that will declare pass/fail on the
outcome? The verifier must be one of: test runner, typecheck, linter, compiler,
diff, schema validator.

"I think it looks right" is not a verifier. "The TypeScript compiler will exit 0"
is a verifier.

- **Yes, verifier named** → record it as `verifier` for Phase O. Continue to Step 3.
- **No nameable verifier** → `REFUSE{NO_EXTERNAL_VERIFIER}`.

### Step 3 — Scope-class match

Does the task fall into a KEEP class from the §3 taxonomy?

**KEEP classes (pass → continue):**

| Class | Key signal |
|---|---|
| rename / symbol-move with compiler confirm | `git grep` shows bounded occurrences |
| import / path fix | broken import path, test as verifier |
| lockfile / dep-pin bump | version string change, build as verifier |
| config-key edit versus schema | add / change one config key, schema validate |
| lint / format autofix apply | pre-computed lint fix, linter exit-0 |
| mechanical fixture update | fixture output changed, diff or test as verifier |
| one-line failing-assertion fix | obvious off-by-one or stale expected value |
| template boilerplate | fill a template slot, diff as verifier |
| bounded grep-replace | scoped string substitution, test suite as verifier |

**REFUSE / ESCALATE classes (fail → exit):**

| Class | Routing |
|---|---|
| Open-ended reasoning, design, or planning | `REFUSE{NOT_EXECUTOR_ROLE}` |
| Cross-cutting refactor (> 2 files) | `REFUSE` or `ESCALATE{to: apivr}` |
| Ambiguous spec or unclear target | `REFUSE{AMBIGUOUS_SPEC}` — clarify upstream |
| Loop-native coding campaign | `ESCALATE{to: vivi}` or `ESCALATE{to: apivr}` |
| No nameable external verifier | `REFUSE{NO_EXTERNAL_VERIFIER}` (Step 2 already catches) |

If none of the KEEP classes match and no REFUSE class applies, treat as
`REFUSE{SCOPE_CLASS_UNKNOWN}` and surface the ambiguity to the delegating parent.

### Step 4 — Economic gate

Is the **expected pass-rate > ~0.20**? The threshold is approximate: haiku→opus
cost ratio implies Kupo must succeed on roughly 1 in 5 delegations to break even.

Ask: is the task clearly mechanical (high confidence → proceed) or speculative
(low confidence → refuse)?

- **High confidence** (pass-rate clearly > 0.20) → `KEEP{verifier: <named>}`.
- **Borderline** (unsure) → default `REFUSE{PASS_RATE_UNCERTAIN}` and return the
  task to the delegating parent with a note.
- **Low confidence** (pass-rate clearly ≤ 0.20) → `REFUSE{PASS_RATE_LOW}`.

---

## Output format

Emit exactly one of:

```
KEEP{verifier: "<verifier command or class>"}
```
```
REFUSE{code: "<REFUSE_CODE>", note: "<one sentence for the parent>"}
```
```
ESCALATE{to: "<vivi|apivr|spectra|orchestrator>", code: "<ESCALATE_CODE>", note: "<one sentence>"}
```

The output of Phase K is the `verifier` field carried forward into Phase O.
No other state from K enters Phase U; K is a one-shot gate.

---

## Notes

- **Triage cost = ~1 step.** K must be cheap; if K itself is expensive, the
  additive-proof breaks. Do not invoke atlas-aci during K — gather happens in U.
- **Structural, not verbal.** KEEP iff a verifier can be named; escalation
  triggers are structural (files > 2, loop-native pattern) not introspective.
- **Loop-native campaigns always ESCALATE.** If the task description mentions
  "iterative", "implement feature X end-to-end", "write the whole module", or
  similar — it's a campaign, not a micro-task. Escalate immediately.
- **REFUSE is cheap and correct.** The parent can always re-delegate to a heavier
  Eidolon. A fast REFUSE is more valuable than a slow failure.

---

*Keep-or-Kick Skill — Kupo Phase K triage*
